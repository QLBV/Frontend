"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useAuth } from "@/auth/authContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  CalendarIcon,
  Clock,
  User,
  Stethoscope,
  FileText,
  Heart,
  Loader2,
  Pill,
  Receipt,
} from "lucide-react"
import { toast } from "sonner"
import { getVisitById, type Visit } from "@/services/visit.service"
import AdminSidebar from "@/components/sidebar/admin"
import DoctorSidebar from "@/components/sidebar/doctor"
import ReceptionistSidebar from "@/components/sidebar/recep"
import PatientSidebar from "@/components/sidebar/patient"

export default function VisitDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [visit, setVisit] = useState<Visit | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchVisit = async () => {
      if (!id) return
      try {
        setIsLoading(true)
        const data = await getVisitById(Number(id))
        setVisit(data)
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "Không thể tải thông tin lần khám"
        )
        navigate(-1)
      } finally {
        setIsLoading(false)
      }
    }
    fetchVisit()
  }, [id, navigate])

  // Get sidebar component based on role
  const getSidebarComponent = () => {
    if (!user) return null
    const role = String(user.roleId || user.role || "").toLowerCase()

    switch (role) {
      case "admin":
      case "1":
        return AdminSidebar
      case "doctor":
      case "2":
        return DoctorSidebar
      case "receptionist":
      case "4":
        return ReceptionistSidebar
      case "patient":
      case "3":
      default:
        return PatientSidebar
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      IN_PROGRESS: { label: "Đang khám", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
      COMPLETED: { label: "Hoàn thành", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
      CANCELLED: { label: "Đã hủy", className: "bg-red-50 text-red-700 border-red-200" },
    }

    const statusInfo = statusMap[status] || {
      label: status,
      className: "bg-gray-50 text-gray-700 border-gray-200",
    }

    return (
      <Badge variant="outline" className={statusInfo.className}>
        {statusInfo.label}
      </Badge>
    )
  }

  const SidebarComponent = getSidebarComponent()
  const userName = user?.fullName || user?.email || ""

  if (!SidebarComponent) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (isLoading) {
    return (
      <SidebarComponent userName={userName}>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </SidebarComponent>
    )
  }

  if (!visit) {
    return (
      <SidebarComponent userName={userName}>
        <div className="text-center py-12">
          <p className="text-gray-500">Không tìm thấy thông tin lần khám</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Quay lại
          </Button>
        </div>
      </SidebarComponent>
    )
  }

  return (
    <SidebarComponent userName={userName}>
      <div className="space-y-6">
        <Button variant="ghost" className="mb-2 pl-0" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">Chi tiết lần khám</CardTitle>
                {getStatusBadge(visit.status)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Patient & Doctor Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <User className="h-4 w-4" />
                  <span>Bệnh nhân</span>
                </div>
                <p className="font-semibold">
                  {visit.patient?.fullName || "N/A"}
                </p>
                {visit.patient?.patientCode && (
                  <p className="text-sm text-gray-600">
                    Mã: {visit.patient.patientCode}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Stethoscope className="h-4 w-4" />
                  <span>Bác sĩ</span>
                </div>
                <p className="font-semibold">
                  {visit.doctor?.fullName || "N/A"}
                </p>
              </div>
            </div>

            {/* Visit Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CalendarIcon className="h-4 w-4" />
                  <span>Ngày khám</span>
                </div>
                <p className="font-semibold">
                  {new Date(visit.visitDate).toLocaleDateString("vi-VN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                {visit.appointment?.shift && (
                  <p className="text-sm text-gray-600">
                    Ca: {visit.appointment.shift.name} ({visit.appointment.shift.startTime} - {visit.appointment.shift.endTime})
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>Thời gian tạo</span>
                </div>
                <p className="font-semibold">
                  {new Date(visit.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>
            </div>

            {/* Symptoms */}
            {visit.symptoms && (
              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FileText className="h-4 w-4" />
                  <span>Triệu chứng</span>
                </div>
                <p className="text-sm">{visit.symptoms}</p>
              </div>
            )}

            {/* Diagnosis */}
            {visit.diagnosis && (
              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Stethoscope className="h-4 w-4" />
                  <span>Chẩn đoán</span>
                </div>
                <p className="text-sm font-semibold">{visit.diagnosis}</p>
              </div>
            )}

            {/* Notes */}
            {visit.notes && (
              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <FileText className="h-4 w-4" />
                  <span>Ghi chú</span>
                </div>
                <p className="text-sm">{visit.notes}</p>
              </div>
            )}

            {/* Vital Signs */}
            {visit.vitalSigns && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <Heart className="h-4 w-4" />
                  <span>Dấu hiệu sinh tồn</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {visit.vitalSigns.bloodPressure && (
                    <div>
                      <p className="text-xs text-gray-500">Huyết áp</p>
                      <p className="font-semibold">{visit.vitalSigns.bloodPressure}</p>
                    </div>
                  )}
                  {visit.vitalSigns.heartRate && (
                    <div>
                      <p className="text-xs text-gray-500">Nhịp tim</p>
                      <p className="font-semibold">{visit.vitalSigns.heartRate} bpm</p>
                    </div>
                  )}
                  {visit.vitalSigns.temperature && (
                    <div>
                      <p className="text-xs text-gray-500">Nhiệt độ</p>
                      <p className="font-semibold">{visit.vitalSigns.temperature}°C</p>
                    </div>
                  )}
                  {visit.vitalSigns.respiratoryRate && (
                    <div>
                      <p className="text-xs text-gray-500">Nhịp thở</p>
                      <p className="font-semibold">{visit.vitalSigns.respiratoryRate} /phút</p>
                    </div>
                  )}
                  {visit.vitalSigns.weight && (
                    <div>
                      <p className="text-xs text-gray-500">Cân nặng</p>
                      <p className="font-semibold">{visit.vitalSigns.weight} kg</p>
                    </div>
                  )}
                  {visit.vitalSigns.height && (
                    <div>
                      <p className="text-xs text-gray-500">Chiều cao</p>
                      <p className="font-semibold">{visit.vitalSigns.height} cm</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t">
              {visit.patientId && (
                <Button variant="outline" asChild>
                  <Link to={`/recep/patients/${visit.patientId}`}>
                    <User className="h-4 w-4 mr-2" />
                    Xem bệnh nhân
                  </Link>
                </Button>
              )}
              {/* Link to prescription if exists */}
              {visit.id && (
                <Button variant="outline" asChild>
                  <Link to={`/doctor/prescriptions?visitId=${visit.id}`}>
                    <Pill className="h-4 w-4 mr-2" />
                    Xem đơn thuốc
                  </Link>
                </Button>
              )}
              {/* Link to invoice if exists */}
              {visit.id && (
                <Button variant="outline" asChild>
                  <Link to={`/invoices?visitId=${visit.id}`}>
                    <Receipt className="h-4 w-4 mr-2" />
                    Xem hóa đơn
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarComponent>
  )
}
