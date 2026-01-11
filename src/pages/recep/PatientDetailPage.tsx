import React, { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import ReceptionistSidebar from '@/components/sidebar/recep'; // Import Sidebar
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Heart,
  Droplet,
  Weight,
  Ruler,
  Edit,
  Pill,
  AlertCircle,
  User,
  Award as IdCard,
  Camera,
  Loader2,
  Filter,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
  getPatientById,
  uploadPatientAvatar,
  getPatientMedicalHistory,
  getPatientPrescriptions,
  type Patient,
  type Visit,
  type Prescription,
} from "@/services/patient.service"
import { InvoiceService, type Invoice, PaymentStatus } from "@/services/invoice.service"
import { Receipt } from "lucide-react"


export default function RecepPatientDetail() {
  const { id } = useParams()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [medicalHistory, setMedicalHistory] = useState<Visit[]>([])
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [isLoadingPrescriptions, setIsLoadingPrescriptions] = useState(false)
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [historyStartDate, setHistoryStartDate] = useState<string>("")
  const [historyEndDate, setHistoryEndDate] = useState<string>("")
  const [prescriptionStartDate, setPrescriptionStartDate] = useState<string>("")
  const [prescriptionEndDate, setPrescriptionEndDate] = useState<string>("")

  // Fetch patient data
  useEffect(() => {
    const fetchPatient = async () => {
      if (!id) return
      try {
        setIsLoading(true)
        const data = await getPatientById(Number(id))
        setPatient(data)
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "Không thể tải thông tin bệnh nhân"
        )
      } finally {
        setIsLoading(false)
      }
    }
    fetchPatient()
  }, [id])

  // Fetch medical history
  const fetchMedicalHistory = async () => {
    if (!id) return
    try {
      setIsLoadingHistory(true)
      const result = await getPatientMedicalHistory(Number(id))
      setMedicalHistory(result.data)
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể tải lịch sử khám bệnh"
      )
    } finally {
      setIsLoadingHistory(false)
    }
  }

  // Fetch prescriptions
  const fetchPrescriptions = async () => {
    if (!id) return
    try {
      setIsLoadingPrescriptions(true)
      const result = await getPatientPrescriptions(Number(id))
      setPrescriptions(result.data)
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể tải đơn thuốc"
      )
    } finally {
      setIsLoadingPrescriptions(false)
    }
  }

  // Fetch invoices
  const fetchInvoices = async () => {
    if (!id) return
    try {
      setIsLoadingInvoices(true)
      const result = await InvoiceService.getInvoicesByPatient(Number(id))
      if (result.success && result.data) {
        setInvoices(result.data)
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể tải hóa đơn"
      )
    } finally {
      setIsLoadingInvoices(false)
    }
  }

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !id) return

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file hình ảnh")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File quá lớn. Vui lòng chọn file nhỏ hơn 5MB")
      return
    }

    setIsUploadingAvatar(true)
    try {
      const result = await uploadPatientAvatar(Number(id), file)
      setPatient((prev) => (prev ? { ...prev, avatar: result.avatar } : null))
      toast.success("Upload avatar thành công!")
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể upload avatar"
      )
    } finally {
      setIsUploadingAvatar(false)
      e.target.value = ""
    }
  }

  // Calculate age from date of birth
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

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading) {
    return (
      <ReceptionistSidebar>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </ReceptionistSidebar>
    )
  }

  if (!patient) {
    return (
      <ReceptionistSidebar>
        <div className="text-center py-12">
          <p className="text-gray-500">Không tìm thấy thông tin bệnh nhân</p>
          <Button asChild className="mt-4">
            <Link to="/recep/patients">Quay lại danh sách</Link>
          </Button>
        </div>
      </ReceptionistSidebar>
    )
  }

  const age = patient.dateOfBirth ? calculateAge(patient.dateOfBirth) : 0
  const phoneProfile = patient.profiles?.find((p: any) => p.type === "phone")
  const emailProfile = patient.profiles?.find((p: any) => p.type === "email")
  const addressProfile = patient.profiles?.find((p: any) => p.type === "address")

  return (
    <ReceptionistSidebar>
      <div className="space-y-6">
        
        {/* Back Button */}
        <div>
           <Button variant="ghost" className="mb-2 pl-0 hover:bg-transparent hover:text-blue-600" asChild>
            <Link to="/recep/patients">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Patient List
            </Link>
            </Button>
        </div>

        {/* Patient Header Card */}
        <Card className="border-0 shadow-xl shadow-slate-900/5 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-white/30">
                    <AvatarImage
                      src={
                        patient.avatar
                          ? `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${patient.avatar}`
                          : undefined
                      }
                      alt={patient.fullName}
                    />
                    <AvatarFallback className="bg-white/20 text-white text-4xl font-bold">
                      {getInitials(patient.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 bg-white/90 hover:bg-white rounded-full p-2 cursor-pointer transition-colors"
                  >
                    <Camera className="h-4 w-4 text-blue-600" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                      disabled={isUploadingAvatar}
                    />
                  </label>
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">{patient.fullName}</h1>
                  <div className="flex items-center gap-4 text-blue-100">
                    <div className="flex items-center gap-2">
                      <IdCard className="h-4 w-4" />
                      <span>{patient.patientCode}</span>
                    </div>
                    <span>•</span>
                    <span>
                      {age} tuổi • {patient.gender === "MALE" ? "Nam" : patient.gender === "FEMALE" ? "Nữ" : "Khác"}
                    </span>
                    <span>•</span>
                    <Badge variant="outline" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                      {patient.isActive ? "Hoạt động" : "Không hoạt động"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm text-blue-100">
                    {phoneProfile && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {phoneProfile.value}
                      </div>
                    )}
                    {emailProfile && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {emailProfile.value}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
              >
                <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 divide-x bg-white">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                  <Droplet className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Nhóm máu</p>
                  <p className="text-lg font-bold text-slate-900">{patient.bloodType || "N/A"}</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Ruler className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Chiều cao</p>
                  <p className="text-lg font-bold text-slate-900">{patient.height ? `${patient.height} cm` : "N/A"}</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Weight className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Cân nặng</p>
                  <p className="text-lg font-bold text-slate-900">{patient.weight ? `${patient.weight} kg` : "N/A"}</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-violet-500/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Lần khám cuối</p>
                  <p className="text-lg font-bold text-slate-900">
                    {medicalHistory.length > 0
                      ? new Date(medicalHistory[0].visitDate).toLocaleDateString("vi-VN")
                      : "Chưa có"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabbed Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white border shadow-sm">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="appointments">Lịch hẹn</TabsTrigger>
            <TabsTrigger
              value="medical-history"
              onClick={fetchMedicalHistory}
            >
              Lịch sử khám
            </TabsTrigger>
            <TabsTrigger
              value="prescriptions"
              onClick={fetchPrescriptions}
            >
              Đơn thuốc
            </TabsTrigger>
            <TabsTrigger
              value="invoices"
              onClick={fetchInvoices}
            >
              Hóa đơn
            </TabsTrigger>
            <TabsTrigger value="medications">Thuốc đang dùng</TabsTrigger>
            <TabsTrigger value="lab-results">Kết quả xét nghiệm</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Personal Information */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Ngày sinh</p>
                    <p className="text-sm font-medium text-slate-900">
                      {patient.dateOfBirth
                        ? new Date(patient.dateOfBirth).toLocaleDateString("vi-VN")
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Địa chỉ</p>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                      <p className="text-sm text-slate-900">
                        {addressProfile?.value || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Ngày đăng ký</p>
                    <p className="text-sm font-medium text-slate-900">
                      {patient.createdAt
                        ? new Date(patient.createdAt).toLocaleDateString("vi-VN")
                        : "N/A"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-red-50/50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    Emergency Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Tên</p>
                    <p className="text-sm font-medium text-slate-900">
                      {patient.emergencyContactName || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Mối quan hệ</p>
                    <p className="text-sm text-slate-900">
                      {patient.emergencyContactRelationship || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Số điện thoại</p>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <p className="text-sm font-medium text-slate-900">
                        {patient.emergencyContactPhone || "N/A"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vital Signs */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-emerald-50/50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-emerald-600" />
                    Latest Vital Signs
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-500">Huyết áp</p>
                    <p className="text-sm font-medium text-slate-900">N/A</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-500">Nhịp tim</p>
                    <p className="text-sm font-medium text-slate-900">N/A</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-500">Nhiệt độ</p>
                    <p className="text-sm font-medium text-slate-900">N/A</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-500">Nhịp thở</p>
                    <p className="text-sm font-medium text-slate-900">N/A</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Allergies and Chronic Conditions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-orange-50/50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    Allergies
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-2">
                    {/* Allergies - will be fetched from patient data or visits */}
                    <p className="text-sm text-slate-500">Chưa có thông tin dị ứng</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50/50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    Chronic Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-2">
                    {/* Chronic conditions - will be fetched from patient data or visits */}
                    <p className="text-sm text-slate-500">Chưa có thông tin bệnh mạn tính</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments">
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle>Appointment History</CardTitle>
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-blue-700">
                    <Calendar className="h-4 w-4 mr-2" />
                    Book New Appointment
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {/* Appointments - will be fetched from appointments API */}
                  <div className="p-6 text-center text-gray-500">
                    <p>Chưa có lịch hẹn</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medical History Tab */}
          <TabsContent value="medical-history">
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50/50 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle>Lịch sử khám bệnh</CardTitle>
                  <div className="flex items-center gap-2">
                    <Input
                      type="date"
                      value={historyStartDate}
                      onChange={(e) => setHistoryStartDate(e.target.value)}
                      className="h-9 w-40 text-sm"
                      placeholder="Từ ngày"
                    />
                    <span className="text-slate-500">-</span>
                    <Input
                      type="date"
                      value={historyEndDate}
                      onChange={(e) => setHistoryEndDate(e.target.value)}
                      className="h-9 w-40 text-sm"
                      placeholder="Đến ngày"
                    />
                    {(historyStartDate || historyEndDate) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setHistoryStartDate("")
                          setHistoryEndDate("")
                        }}
                      >
                        Xóa bộ lọc
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isLoadingHistory ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : medicalHistory.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Chưa có lịch sử khám bệnh</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {medicalHistory
                      .filter((visit) => {
                        if (!historyStartDate && !historyEndDate) return true
                        const visitDate = new Date(visit.visitDate)
                        const start = historyStartDate ? new Date(historyStartDate) : null
                        const end = historyEndDate ? new Date(historyEndDate) : null
                        if (start && visitDate < start) return false
                        if (end) {
                          const endDate = new Date(end)
                          endDate.setHours(23, 59, 59, 999)
                          if (visitDate > endDate) return false
                        }
                        return true
                      })
                      .map((visit) => (
                      <div key={visit.id} className="p-6 hover:bg-purple-50/30 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                            <FileText className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold text-slate-900">
                                {visit.diagnosis || "Chưa có chẩn đoán"}
                              </h3>
                              <span className="text-sm text-slate-500">
                                {new Date(visit.visitDate).toLocaleDateString("vi-VN")}
                              </span>
                            </div>
                            {visit.symptoms && (
                              <p className="text-sm text-slate-600 mb-2">
                                <strong>Triệu chứng:</strong> {visit.symptoms}
                              </p>
                            )}
                            {visit.notes && (
                              <p className="text-sm text-slate-600 mb-2">
                                <strong>Ghi chú:</strong> {visit.notes}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2">
                              {visit.doctor && (
                                <p className="text-xs text-slate-500">
                                  Bác sĩ: {visit.doctor.fullName}
                                </p>
                              )}
                              <Badge
                                variant="outline"
                                className={
                                  visit.status === "COMPLETED"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-blue-50 text-blue-700 border-blue-200"
                                }
                              >
                                {visit.status === "COMPLETED" ? "Hoàn thành" : visit.status}
                              </Badge>
                            </div>
                            <div className="mt-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link to={`/visits/${visit.id}`}>Xem chi tiết</Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Prescriptions Tab */}
          <TabsContent value="prescriptions">
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-cyan-50/50 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Pill className="h-5 w-5 text-cyan-600" />
                    Đơn thuốc
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Input
                      type="date"
                      value={prescriptionStartDate}
                      onChange={(e) => setPrescriptionStartDate(e.target.value)}
                      className="h-9 w-40 text-sm"
                      placeholder="Từ ngày"
                    />
                    <span className="text-slate-500">-</span>
                    <Input
                      type="date"
                      value={prescriptionEndDate}
                      onChange={(e) => setPrescriptionEndDate(e.target.value)}
                      className="h-9 w-40 text-sm"
                      placeholder="Đến ngày"
                    />
                    {(prescriptionStartDate || prescriptionEndDate) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setPrescriptionStartDate("")
                          setPrescriptionEndDate("")
                        }}
                      >
                        Xóa bộ lọc
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isLoadingPrescriptions ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : prescriptions.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Pill className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Chưa có đơn thuốc</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {prescriptions
                      .filter((prescription) => {
                        if (!prescriptionStartDate && !prescriptionEndDate) return true
                        const prescriptionDate = new Date(prescription.createdAt)
                        const start = prescriptionStartDate ? new Date(prescriptionStartDate) : null
                        const end = prescriptionEndDate ? new Date(prescriptionEndDate) : null
                        if (start && prescriptionDate < start) return false
                        if (end) {
                          const endDate = new Date(end)
                          endDate.setHours(23, 59, 59, 999)
                          if (prescriptionDate > endDate) return false
                        }
                        return true
                      })
                      .map((prescription) => (
                      <div
                        key={prescription.id}
                        className="p-6 hover:bg-cyan-50/30 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-slate-900">
                                {prescription.prescriptionCode}
                              </h3>
                              <Badge
                                variant="outline"
                                className={
                                  prescription.status === "DISPENSED"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : prescription.status === "CANCELLED"
                                    ? "bg-red-50 text-red-700 border-red-200"
                                    : "bg-blue-50 text-blue-700 border-blue-200"
                                }
                              >
                                {prescription.status === "DISPENSED"
                                  ? "Đã phát thuốc"
                                  : prescription.status === "CANCELLED"
                                  ? "Đã hủy"
                                  : prescription.status === "PENDING"
                                  ? "Chờ phát thuốc"
                                  : prescription.status}
                              </Badge>
                            </div>
                            {prescription.doctor && (
                              <p className="text-sm text-slate-600 mb-1">
                                Bác sĩ: {prescription.doctor.fullName}
                              </p>
                            )}
                            {prescription.medicines && prescription.medicines.length > 0 && (
                              <p className="text-sm text-slate-600 mb-1">
                                Số loại thuốc: {prescription.medicines.length}
                              </p>
                            )}
                            <p className="text-xs text-slate-500 mt-2">
                              Ngày tạo:{" "}
                              {new Date(prescription.createdAt).toLocaleDateString("vi-VN")}
                            </p>
                            {prescription.notes && (
                              <p className="text-sm text-slate-600 mt-2">
                                <strong>Ghi chú:</strong> {prescription.notes}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/doctor/prescriptions/${prescription.id}`}>
                                Xem chi tiết
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices">
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-emerald-50/50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-emerald-600" />
                  Hóa đơn
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoadingInvoices ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : invoices.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Receipt className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Chưa có hóa đơn</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {invoices.map((invoice) => {
                      const getStatusBadge = (status: PaymentStatus) => {
                        const statusMap: Record<PaymentStatus, { label: string; className: string }> = {
                          UNPAID: { label: "Chưa thanh toán", className: "bg-red-50 text-red-700 border-red-200" },
                          PARTIALLY_PAID: { label: "Thanh toán một phần", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
                          PAID: { label: "Đã thanh toán", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
                        }
                        const statusInfo = statusMap[status] || { label: status, className: "bg-gray-50 text-gray-700 border-gray-200" }
                        return (
                          <Badge variant="outline" className={statusInfo.className}>
                            {statusInfo.label}
                          </Badge>
                        )
                      }
                      return (
                        <div
                          key={invoice.id}
                          className="p-6 hover:bg-emerald-50/30 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold text-slate-900">
                                  {invoice.invoiceCode}
                                </h3>
                                {getStatusBadge(invoice.paymentStatus)}
                              </div>
                              {invoice.doctor && (
                                <p className="text-sm text-slate-600 mb-1">
                                  Bác sĩ: {invoice.doctor.fullName}
                                </p>
                              )}
                              <p className="text-sm text-slate-600 mb-1">
                                Tổng tiền: {parseFloat(invoice.totalAmount.toString()).toLocaleString("vi-VN")} VND
                              </p>
                              {invoice.paymentStatus !== PaymentStatus.UNPAID && (
                                <p className="text-sm text-slate-600 mb-1">
                                  Đã thanh toán: {parseFloat(invoice.paidAmount.toString()).toLocaleString("vi-VN")} VND
                                </p>
                              )}
                              <p className="text-xs text-slate-500 mt-2">
                                Ngày tạo:{" "}
                                {new Date(invoice.createdAt).toLocaleDateString("vi-VN")}
                              </p>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link to={`/invoices/${invoice.id}`}>
                                  Xem chi tiết
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medications Tab */}
          <TabsContent value="medications">
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-cyan-50/50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5 text-cyan-600" />
                  Current Medications
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {/* Current medications - will be fetched from prescriptions */}
                  <div className="p-6 text-center text-gray-500">
                    <p>Chưa có thông tin thuốc đang dùng</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lab Results Tab */}
          <TabsContent value="lab-results">
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-teal-50/50 border-b">
                <CardTitle>Kết quả xét nghiệm</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <div className="p-6 text-center text-gray-500">
                    <p>Chưa có kết quả xét nghiệm</p>
                    <p className="text-xs mt-2">Kết quả xét nghiệm sẽ được hiển thị khi có dữ liệu</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ReceptionistSidebar>
  )
}