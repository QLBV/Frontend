"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  FileText, 
  Printer, 
  Edit, 
  Pill, 
  Heart, 
  Droplet, 
  Activity,
  ArrowUpDown,
  ArrowRight
} from "lucide-react"
import { toast } from "sonner"
import { getPatientById, getPatientMedicalHistory, type Patient, type Visit } from "@/services/patient.service"
import { PrescriptionService } from "@/services/prescription.service"
import PatientSidebar from "@/components/sidebar/patient"
import { useAuth } from "@/auth/authContext"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CurrentPrescriptionItem {
  id: number
  medicineName: string
  dosage: string
  frequency: string
  duration: string
  doctorName?: string
}

export default function MedicalHistoryPage() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [visits, setVisits] = useState<Visit[]>([])
  const [currentPrescriptions, setCurrentPrescriptions] = useState<CurrentPrescriptionItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [yearFilter, setYearFilter] = useState<string>("current")

  useEffect(() => {
    const fetchData = async () => {
      // Wait for auth to finish loading
      if (authLoading) {
        return
      }

      // Check if user is authenticated and has patientId
      if (!user) {
        setIsLoading(false)
        toast.error("Vui lòng đăng nhập để xem hồ sơ sức khỏe")
        navigate("/login")
        return
      }

      if (!user.patientId) {
        setIsLoading(false)
        // Don't show error if user just set up profile - redirect to setup instead
        if (window.location.pathname !== "/patient/setup") {
          toast.error("Không tìm thấy thông tin bệnh nhân. Vui lòng thiết lập hồ sơ bệnh nhân.")
          navigate("/patient/setup")
        }
        return
      }

      try {
        setIsLoading(true)
        
        // Fetch patient profile
        console.log("Fetching patient data for patientId:", user.patientId)
        const patientData = await getPatientById(user.patientId)
        console.log("Patient data received:", patientData)
        setPatient(patientData)

        // Fetch medical history (visits)
        const historyData = await getPatientMedicalHistory(user.patientId, 1, 100)
        setVisits(historyData.data || [])

        // Fetch prescriptions
        const prescriptionsResponse = await PrescriptionService.getPrescriptionsByPatient(user.patientId)
        if (prescriptionsResponse.success && prescriptionsResponse.data) {
          const allPrescriptions = Array.isArray(prescriptionsResponse.data) 
            ? prescriptionsResponse.data 
            : []
          
          // Filter for current/active prescriptions (DISPENSED or LOCKED status)
          const active = allPrescriptions.filter((p: any) => 
            p.status === "DISPENSED" || p.status === "LOCKED"
          )
          
          // Transform to CurrentPrescriptionItem format
          const transformed: CurrentPrescriptionItem[] = active.flatMap((prescription: any) => 
            (prescription.details || []).map((detail: any) => {
              // Format dosage from morning/noon/afternoon/evening
              const dosages = []
              if (detail.dosageMorning > 0) dosages.push(`${detail.dosageMorning} buổi sáng`)
              if (detail.dosageNoon > 0) dosages.push(`${detail.dosageNoon} buổi trưa`)
              if (detail.dosageAfternoon > 0) dosages.push(`${detail.dosageAfternoon} buổi chiều`)
              if (detail.dosageEvening > 0) dosages.push(`${detail.dosageEvening} buổi tối`)
              
              return {
                id: detail.id,
                medicineName: detail.medicineName || detail.medicine?.name || "Unknown",
                dosage: dosages.join(", ") || detail.instruction || "",
                frequency: detail.instruction || "",
                duration: `${detail.quantity} ${detail.unit || "viên"}`,
                doctorName: prescription.doctor?.fullName || prescription.doctor?.name
              }
            })
          )
          
          setCurrentPrescriptions(transformed.slice(0, 5)) // Show max 5
        }
      } catch (error: any) {
        console.error("Error fetching medical history:", error)
        const errorMessage = error?.response?.data?.message || error?.message || "Không thể tải hồ sơ sức khỏe"
        toast.error(errorMessage)
        
        // If patient not found, show specific message
        if (error?.response?.status === 404) {
          toast.error("Không tìm thấy thông tin bệnh nhân")
        } else if (error?.response?.status === 401) {
          toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.")
          navigate("/login")
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user?.patientId, authLoading, user, navigate])

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const calculateBMI = (height?: number, weight?: number) => {
    if (!height || !weight) return null
    const heightInMeters = height / 100
    return (weight / (heightInMeters * heightInMeters)).toFixed(1)
  }

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { label: "Thiếu cân", color: "text-blue-600" }
    if (bmi < 25) return { label: "Bình thường", color: "text-green-600" }
    if (bmi < 30) return { label: "Thừa cân", color: "text-yellow-600" }
    return { label: "Béo phì", color: "text-red-600" }
  }

  const filteredVisits = visits.filter((visit) => {
    if (yearFilter === "current") {
      const visitYear = new Date(visit.visitDate).getFullYear()
      return visitYear === new Date().getFullYear()
    }
    return true
  })

  return (
    <PatientSidebar 
      userName={user?.fullName || user?.email}
    >
      <div className="space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Hồ Sơ Sức Khỏe Của Tôi</h1>
              <p className="text-muted-foreground mt-1">
                Quản lý thông tin sức khỏe cá nhân và lịch sử điều trị.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-2" />
                In hồ sơ
              </Button>
              <Button onClick={() => navigate("/patient/update-health-info")}>
                <Edit className="h-4 w-4 mr-2" />
                Cập nhật thông tin
              </Button>
            </div>
          </div>

          {/* Patient Profile Summary */}
          <Card>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="flex items-start gap-6">
                  <Skeleton className="h-32 w-32 rounded-full" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ) : patient ? (
                <div className="flex items-start gap-6">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="h-32 w-32 rounded-full bg-primary flex items-center justify-center text-white text-4xl font-bold">
                      {patient.fullName.charAt(0).toUpperCase()}
                    </div>
                    {patient.avatar && (
                      <img 
                        src={patient.avatar} 
                        alt={patient.fullName}
                        className="h-32 w-32 rounded-full object-cover"
                      />
                    )}
                  </div>

                  {/* Patient Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold">{patient.fullName}</h2>
                      <Badge className="bg-green-100 text-green-700">Thành viên VIP</Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                      <div>
                        <span className="font-medium">Ngày sinh:</span>{" "}
                        {patient.dateOfBirth 
                          ? `${format(new Date(patient.dateOfBirth), "dd/MM/yyyy")} (${calculateAge(patient.dateOfBirth)} tuổi)`
                          : "Chưa cập nhật"}
                      </div>
                      <div>
                        <span className="font-medium">Giới tính:</span>{" "}
                        {patient.gender === "MALE" ? "Nam" : patient.gender === "FEMALE" ? "Nữ" : patient.gender || "Chưa cập nhật"}
                      </div>
                      <div>
                        <span className="font-medium">Địa chỉ:</span>{" "}
                        {patient.address || "Chưa cập nhật"}
                      </div>
                    </div>

                    {/* Health Metrics Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-500">Nhóm máu</span>
                            <Droplet className="h-5 w-5 text-red-500" />
                          </div>
                          <div className="text-2xl font-bold">
                            {patient.bloodType || "Chưa có"}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-500">Chiều cao</span>
                            <ArrowUpDown className="h-5 w-5 text-blue-500" />
                          </div>
                          <div className="text-2xl font-bold">
                            {patient.height ? `${patient.height} cm` : "Chưa có"}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-500">Cân nặng</span>
                            <Activity className="h-5 w-5 text-orange-500" />
                          </div>
                          <div className="text-2xl font-bold">
                            {patient.weight ? `${patient.weight} kg` : "Chưa có"}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-500">BMI</span>
                            <Activity className="h-5 w-5 text-purple-500" />
                          </div>
                          <div className="text-2xl font-bold">
                            {patient.height && patient.weight 
                              ? (() => {
                                  const bmi = parseFloat(calculateBMI(patient.height, patient.weight)!)
                                  const status = getBMIStatus(bmi)
                                  return (
                                    <span className={status.color}>
                                      {bmi} <span className="text-sm font-normal">({status.label})</span>
                                    </span>
                                  )
                                })()
                              : "Chưa có"}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Không thể tải thông tin bệnh nhân</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vital Signs Section */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Chỉ số sinh tồn</h3>
                <span className="text-sm text-gray-500">
                  Cập nhật: {format(new Date(), "dd/MM/yyyy")}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">Nhịp tim</span>
                      <Heart className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold mb-1">72 bpm</div>
                    <div className="text-sm text-green-600">Bình thường</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">Huyết áp</span>
                      <Droplet className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="text-2xl font-bold mb-1">125/85 mmHg</div>
                    <div className="text-sm text-yellow-600">Hơi cao</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">SpO2</span>
                      <Activity className="h-5 w-5 text-teal-500" />
                    </div>
                    <div className="text-2xl font-bold mb-1">98%</div>
                    <div className="text-sm text-green-600">Tốt</div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Current Prescriptions Section */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Pill className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-bold">Đơn thuốc đang dùng</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate("/patient/prescriptions")}
                >
                  Xem lịch sử đơn thuốc
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
              {isLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : currentPrescriptions.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>TÊN THUỐC</TableHead>
                        <TableHead>LIỀU DÙNG</TableHead>
                        <TableHead>THỜI GIAN</TableHead>
                        <TableHead>BÁC SĨ KÊ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentPrescriptions.map((prescription, index) => (
                        <TableRow key={prescription.id || index}>
                          <TableCell className="font-medium">
                            {prescription.medicineName}
                          </TableCell>
                          <TableCell>
                            {prescription.dosage || prescription.frequency}
                          </TableCell>
                          <TableCell>{prescription.duration}</TableCell>
                          <TableCell>
                            {prescription.doctorName || "Unknown"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Pill className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Bạn chưa có đơn thuốc đang dùng</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Medical Visit History Section */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-teal-500" />
                  <h3 className="text-lg font-bold">Lịch sử khám bệnh</h3>
                </div>
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Năm nay</SelectItem>
                    <SelectItem value="all">Tất cả</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {isLoading ? (
                <Skeleton className="h-48 w-full" />
              ) : filteredVisits.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>NGÀY KHÁM</TableHead>
                        <TableHead>CHUYÊN KHOA</TableHead>
                        <TableHead>CHẨN ĐOÁN</TableHead>
                        <TableHead>TRẠNG THÁI</TableHead>
                        <TableHead>THAO TÁC</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredVisits.map((visit) => (
                        <TableRow key={visit.id}>
                          <TableCell>
                            {format(new Date(visit.visitDate), "dd/MM/yyyy", { locale: vi })}
                          </TableCell>
                          <TableCell>
                            {visit.doctor?.fullName || "Unknown"}
                          </TableCell>
                          <TableCell>
                            {visit.diagnosis || "Chưa có chẩn đoán"}
                          </TableCell>
                          <TableCell>
                            <Badge className={
                              visit.status === "COMPLETED" 
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }>
                              {visit.status === "COMPLETED" ? "Hoàn thành" : visit.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => navigate(`/appointments/${visit.appointmentId}`)}
                            >
                              Chi tiết
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Chưa có lịch sử khám bệnh</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Medical History & Allergies Section */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4">Tiền sử & Dị ứng</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">BỆNH LÝ MÃN TÍNH</h4>
                  <div className="text-gray-600">
                    {patient?.chronicDiseases && patient.chronicDiseases.length > 0 
                      ? patient.chronicDiseases.map((disease: string, index: number) => (
                          <div key={index}>{disease}</div>
                        ))
                      : "Chưa có thông tin"}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">DỊ ỨNG</h4>
                  <div className="text-gray-600">
                    {patient?.allergies && patient.allergies.length > 0 
                      ? patient.allergies.map((allergy: string, index: number) => (
                          <div key={index}>{allergy}</div>
                        ))
                      : "Chưa có thông tin"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
    </PatientSidebar>
  )
}
