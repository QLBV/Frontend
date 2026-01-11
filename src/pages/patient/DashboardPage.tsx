"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, FileText, Pill, Plus, Heart, ChevronRight } from "lucide-react"
import { useAuth } from "@/auth/authContext"
import { getMyAppointments, type Appointment } from "@/services/appointment.service"
import { getPatientById, getPatientMedicalHistory, type Visit } from "@/services/patient.service"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import PatientSidebar from "@/components/sidebar/patient"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

export default function PatientDashboardPage() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [patientCode, setPatientCode] = useState<string>("")
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null)
  const [latestVisit, setLatestVisit] = useState<Visit | null>(null)

  const statusLabel = (status?: string, displayStatus?: string) => {
    if (displayStatus) return displayStatus
    const map: Record<string, string> = {
      WAITING: "Chờ xác nhận",
      CHECKED_IN: "Chờ khám",
      IN_PROGRESS: "Đang khám",
      COMPLETED: "Hoàn thành",
      CANCELLED: "Đã hủy",
      NO_SHOW: "Vắng mặt",
    }
    return status ? (map[status] || status) : "Không xác định"
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.patientId) {
        setIsLoading(false)
        if (window.location.pathname !== "/patient/setup") {
          navigate("/patient/setup")
        }
        return
      }

      try {
        setIsLoading(true)

        // Fetch patient profile for patient code
        try {
          const patient = await getPatientById(user.patientId)
          setPatientCode(patient.patientCode || "")
        } catch (error: any) {
          console.error("Error fetching patient profile:", error)
        }

        // Fetch appointments
        const appointments = await getMyAppointments()

        const now = new Date()
        const upcoming = appointments
          .filter((apt) => {
            const dateOk = new Date(apt.date) >= now
            const isWaitingFlow = ["WAITING", "CHECKED_IN", "IN_PROGRESS"].includes(apt.status)
            return dateOk && isWaitingFlow
          })
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        const past = appointments
          .filter((apt) => new Date(apt.date) < now || apt.status === "COMPLETED")
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5)

        setRecentAppointments(past)
        setNextAppointment(upcoming.length > 0 ? upcoming[0] : null)

        // Fetch latest visit for vital signs
        try {
          const historyData = await getPatientMedicalHistory(user.patientId, 1, 1)
          if (historyData.data && historyData.data.length > 0) {
            setLatestVisit(historyData.data[0])
          }
        } catch (error: any) {
          console.error("Error fetching latest visit:", error)
          // Silent fail - vital signs will show "Chưa có dữ liệu"
        }
      } catch (error: any) {
        console.error("Error fetching dashboard data:", error)
        toast.error("Không thể tải dữ liệu dashboard")
      } finally {
        setIsLoading(false)
      }
    }

    if (!authLoading && user && user.patientId) {
      fetchData()
    }
  }, [user?.patientId, user, authLoading, navigate])

  const formatDate = (date: string) => {
    const d = new Date(date)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (d.toDateString() === today.toDateString()) {
      return "Hôm nay"
    } else if (d.toDateString() === tomorrow.toDateString()) {
      return "Ngày mai"
    } else {
      return format(d, "dd/MM/yyyy", { locale: vi })
    }
  }

  const formatTime = (startTime: string, endTime: string) => {
    return `${startTime.substring(0, 5)} - ${endTime.substring(0, 5)}`
  }

  return (
    <PatientSidebar 
      userName={user?.fullName || user?.email}
      patientCode={patientCode}
    >
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Xin chào, {user?.fullName || "Bệnh nhân"}
            </h1>
            <p className="text-gray-600 text-lg">
              Hôm nay bạn cảm thấy thế nào? Đừng quên kiểm tra lịch khám nhé.
            </p>
          </div>
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90"
            onClick={() => navigate("/patient/book-appointment")}
          >
            <Plus className="h-5 w-5 mr-2" />
            Đặt lịch khám mới
          </Button>
        </div>

        {/* Top Row Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Appointment Card */}
          <Card className="lg:col-span-2 bg-primary text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-sm font-medium text-primary-foreground/80 mb-1">Sắp tới</div>
                  {isLoading ? (
                    <Skeleton className="h-6 w-48 bg-white/20" />
                  ) : nextAppointment ? (
                    <>
                      <h3 className="text-2xl font-bold mb-2">
                        {nextAppointment.doctor?.user?.fullName || "Khám tổng quát"}
                      </h3>
                      <p className="text-primary-foreground/90 mb-1">
                        {nextAppointment.doctor?.user?.fullName || "BS. Unknown"} - Khoa Nội
                      </p>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{nextAppointment.shift ? formatTime(nextAppointment.shift.startTime, nextAppointment.shift.endTime) : ""}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{nextAppointment.date ? formatDate(nextAppointment.date) : ""}</span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Badge variant="secondary" className="bg-white/20 text-white border-0">
                          {statusLabel(nextAppointment.status, (nextAppointment as any).displayStatus)}
                        </Badge>
                      </div>
                    </>
                  ) : (
                    <div>
                      <h3 className="text-2xl font-bold mb-2">Chưa có lịch hẹn</h3>
                      <p className="text-primary-foreground/90">Bạn chưa có lịch hẹn sắp tới</p>
                    </div>
                  )}
                </div>
                <Calendar className="h-8 w-8 text-primary-foreground/50" />
              </div>
            </CardContent>
          </Card>

          {/* Health Metrics Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Chỉ số sức khỏe gần nhất</div>
                  {latestVisit?.visitDate ? (
                    <div className="text-xs text-gray-400">Cập nhật: {format(new Date(latestVisit.visitDate), "dd/MM/yyyy")}</div>
                  ) : (
                    <div className="text-xs text-gray-400">Chưa có dữ liệu</div>
                  )}
                </div>
                <Heart className="h-5 w-5 text-red-500" />
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Huyết áp (mmHg)</div>
                  {latestVisit?.vitalSigns?.bloodPressure ? (
                    <div className="text-2xl font-bold">{latestVisit.vitalSigns.bloodPressure}</div>
                  ) : (
                    <div className="text-sm text-gray-400">Chưa có dữ liệu</div>
                  )}
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Nhịp tim (BPM)</div>
                  {latestVisit?.vitalSigns?.heartRate ? (
                    <div className="text-2xl font-bold">{latestVisit.vitalSigns.heartRate}</div>
                  ) : (
                    <div className="text-sm text-gray-400">Chưa có dữ liệu</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Access Card */}
          <Card className="lg:col-span-3">
            <CardContent className="p-6">
              <div className="text-sm font-medium text-gray-500 mb-4">Truy cập nhanh</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => navigate("/patient/prescriptions")}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Pill className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold">Đơn thuốc của bạn</div>
                      <div className="text-sm text-gray-500">Xem lại các đơn thuốc đã kê</div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
                <button
                  onClick={() => navigate("/patient/medical-history")}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-semibold">Lịch sử khám</div>
                      <div className="text-sm text-gray-500">Kết quả xét nghiệm & chẩn đoán</div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Appointments and Right Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Appointments */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Lịch khám gần đây</h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate("/patient/appointments")}
              >
                Xem tất cả
              </Button>
            </div>
            
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : recentAppointments.length > 0 ? (
              <div className="space-y-4">
                {recentAppointments.map((apt) => (
                  <Card key={apt.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4 flex-1">
                          <div className="text-center min-w-[60px]">
                            <div className="text-sm font-bold text-gray-900">
                              {format(new Date(apt.date), "dd")}
                            </div>
                            <div className="text-xs text-gray-500">
                              {format(new Date(apt.date), "'Thg' M", { locale: vi })}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold mb-1">
                              {apt.doctor?.user?.fullName || "Khám bệnh"}
                            </div>
                            <div className="text-sm text-gray-600 mb-2">
                              {apt.doctor?.user?.fullName || "BS. Unknown"} - {apt.shift?.name || ""}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>{apt.shift ? formatTime(apt.shift.startTime, apt.shift.endTime) : ""}</span>
                              {apt.status === "COMPLETED" && (
                                <Pill className="h-4 w-4 text-green-600" />
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge className={(apt.status === "COMPLETED" ? "bg-green-100 text-green-700" : apt.status === "CHECKED_IN" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700")}>
                            {statusLabel(apt.status, (apt as any).displayStatus)}
                          </Badge>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/appointments/${apt.id}`)}
                          >
                            Chi tiết
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 font-medium mb-2">Chưa có lịch khám gần đây</p>
                  <p className="text-sm text-gray-500 mb-6">Lịch sử khám bệnh của bạn sẽ hiển thị ở đây.</p>
                  <Button onClick={() => navigate("/patient/book-appointment")}>
                    Đặt lịch khám mới
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar: Featured Services & Calendar */}
          <div className="space-y-6">
            {/* Featured Services */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold mb-3">Dịch vụ nổi bật</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Gói khám sức khỏe tổng quát nâng cao với ưu đãi 20% cho thành viên.
                </p>
                <div className="bg-gradient-to-br from-blue-500 to-teal-500 h-32 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-white font-semibold">Health Package</span>
                </div>
                <Button variant="outline" className="w-full" size="sm">
                  Xem chi tiết
                </Button>
              </CardContent>
            </Card>

            {/* Calendar */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold">{format(new Date(), "MMMM yyyy", { locale: vi })}</h3>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ChevronRight className="h-4 w-4 rotate-180" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {/* Simple calendar grid - can be enhanced with a proper calendar component */}
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((day) => (
                    <div key={day} className="font-semibold text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: 35 }, (_, i) => {
                    const date = i + 1
                    const isToday = date === new Date().getDate()
                    return (
                      <div
                        key={i}
                        className={`py-2 rounded ${
                          isToday ? "bg-red-500 text-white font-bold" : "text-gray-700"
                        }`}
                      >
                        {date <= 31 ? date : ""}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PatientSidebar>
  )
}
