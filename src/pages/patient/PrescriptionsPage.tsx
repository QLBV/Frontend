"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Pill, Calendar, User, ArrowLeft, FileText } from "lucide-react"
import { toast } from "sonner"
import { PrescriptionService } from "@/services/prescription.service"
import PatientSidebar from "@/components/sidebar/patient"
import { useAuth } from "@/auth/authContext"

interface Prescription {
  id: number
  prescriptionCode: string
  status: string
  createdAt: string
  patient?: {
    id: number
    fullName: string
  }
  visit?: {
    id: number
    date: string
  }
  doctor?: {
    id: number
    fullName: string
  }
}

export default function PrescriptionsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPrescriptions = async () => {
      if (!user?.patientId) {
        toast.error("Không tìm thấy thông tin bệnh nhân")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const response = await PrescriptionService.getPrescriptionsByPatient(user.patientId)
        
        if (response.success && response.data) {
          setPrescriptions(Array.isArray(response.data) ? response.data : [])
        }
      } catch (error: any) {
        console.error("Error fetching prescriptions:", error)
        toast.error(error.response?.data?.message || "Không thể tải danh sách đơn thuốc")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPrescriptions()
  }, [user?.patientId])

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      DRAFT: { label: "Nháp", className: "bg-gray-100 text-gray-700" },
      LOCKED: { label: "Đã khóa", className: "bg-blue-100 text-blue-700" },
      DISPENSED: { label: "Đã cấp phát", className: "bg-green-100 text-green-700" },
      CANCELLED: { label: "Đã hủy", className: "bg-red-100 text-red-700" },
    }

    const statusInfo = statusMap[status] || {
      label: status,
      className: "bg-gray-100 text-gray-700",
    }

    return (
      <Badge className={statusInfo.className}>
        {statusInfo.label}
      </Badge>
    )
  }

  return (
    <PatientSidebar 
      userName={user?.fullName || user?.email}
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Đơn thuốc của tôi</h1>
            <p className="text-muted-foreground mt-1">
              Xem và quản lý các đơn thuốc đã được kê
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : prescriptions.length > 0 ? (
          <div className="space-y-4">
            {prescriptions.map((prescription) => (
              <Card
                key={prescription.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/prescriptions/${prescription.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Pill className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">
                          Đơn thuốc #{prescription.prescriptionCode}
                        </h3>
                        {getStatusBadge(prescription.status)}
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        {prescription.doctor && (
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>Bác sĩ: {prescription.doctor.fullName}</span>
                          </div>
                        )}
                        {prescription.visit?.date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Ngày kê: {new Date(prescription.visit.date).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Tạo lúc: {new Date(prescription.createdAt).toLocaleString("vi-VN")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Xem chi tiết
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Pill className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Chưa có đơn thuốc</h3>
              <p className="text-muted-foreground mb-6">
                Các đơn thuốc được bác sĩ kê sẽ được hiển thị ở đây.
              </p>
              <Button onClick={() => navigate("/patient/appointments")}>
                Xem lịch hẹn của tôi
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </PatientSidebar>
  )
}
