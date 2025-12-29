"use client"

import { useState } from "react"
import { CalendarIcon, Users, Clock, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import DoctorSidebar from "@/components/sidebar/doctor"

interface Appointment {
  id: string
  patientName: string
  time: string
  status: "arrived" | "examining" | "waiting"
}

const mockAppointments: Appointment[] = [
  { id: "1", patientName: "Nguyễn Văn A", time: "09:00", status: "arrived" },
  { id: "2", patientName: "Trần Thị B", time: "10:30", status: "examining" },
  { id: "3", patientName: "Lê Văn C", time: "14:00", status: "waiting" },
  { id: "4", patientName: "Phạm Thị D", time: "15:30", status: "waiting" },
]

export default function DoctorDashboardPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  const todayAppointments = 12
  const todayPatients = 8
  const patientChange = 15

  const getStatusBadge = (status: Appointment["status"]) => {
    const config = {
      arrived: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
      examining: "bg-blue-500/10 text-blue-700 border-blue-200",
      waiting: "bg-amber-500/10 text-amber-700 border-amber-200",
    }
    const labels = { arrived: "Đã đến", examining: "Đang khám", waiting: "Chờ khám" }
    return (
      <Badge variant="outline" className={config[status]}>
        {labels[status]}
      </Badge>
    )
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <DoctorSidebar children={undefined} />

      <div className="flex-1 ml-64">
        <div className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Doctor Dashboard</h1>
            <p className="text-slate-600">Lịch khám và bệnh nhân hôm nay</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">Lịch hẹn hôm nay</CardTitle>
                    <CalendarIcon className="h-5 w-5 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-slate-900">{todayAppointments}</div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-emerald-50/30">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">Bệnh nhân hôm nay</CardTitle>
                    <Users className="h-5 w-5 text-emerald-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-slate-900 mb-1">{todayPatients}</div>
                    <div className="text-sm text-emerald-600 font-medium">+{patientChange}% vs yesterday</div>
                  </CardContent>
                </Card>
              </div>

              {/* Appointments List */}
              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b">
                  <CardTitle className="text-2xl">Danh sách lịch hẹn</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50 border-b">
                          <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Bệnh nhân</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Giờ khám</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Trạng thái</th>
                          <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockAppointments.map((appointment, index) => (
                          <tr
                            key={appointment.id}
                            className={`border-b hover:bg-blue-50/30 transition-colors ${
                              index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                            }`}
                          >
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                                  {appointment.patientName.charAt(0)}
                                </div>
                                <span className="font-medium text-slate-900">{appointment.patientName}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-slate-400" />
                                {appointment.time}
                              </div>
                            </td>
                            <td className="py-4 px-6">{getStatusBadge(appointment.status)}</td>
                            <td className="py-4 px-6">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                Xem
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Calendar Sidebar */}
            <div>
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Lịch làm việc</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border-0" />
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-slate-900 mb-2">
                      Lịch hẹn ngày {date?.toLocaleDateString("vi-VN")}
                    </div>
                    <div className="text-xs text-slate-600">12 lịch hẹn</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
