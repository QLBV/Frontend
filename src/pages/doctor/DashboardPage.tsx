"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { CalendarIcon, Users, Clock, Eye, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import DoctorSidebar from "@/components/sidebar/doctor"
import UpcomingAppointmentsWidget from "@/components/UpcomingAppointmentsWidget"
import api from "@/lib/api"
import { toast } from "sonner"

// --- Interfaces ---
interface Appointment {
  id: string
  patientName: string
  time: string
  status: "arrived" | "examining" | "waiting"
}

export default function DoctorDashboardPage() {
  const navigate = useNavigate()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [loading, setLoading] = useState(false)
  const [dashboardData, setDashboardData] = useState<any>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]
      
      // Fetch both appointments and visits for today
      const [appointmentsRes, visitsRes] = await Promise.all([
        api.get(`/appointments?date=${today}`),
        api.get(`/visits?startDate=${today}&endDate=${today}`)
      ])
      
      if (appointmentsRes.data.success && visitsRes.data.success) {
        const appointments = appointmentsRes.data.data || []
        const visits = visitsRes.data.data || []
        
        // Debug: Log visits data
        console.log("🔍 Doctor Dashboard - Visits:", visits.length, visits)
        console.log("🔍 Doctor Dashboard - Appointments:", appointments.length, appointments)
        
        // Combine appointments and visits
        // Visits are for patients who have checked in (status EXAMINING)
        // Appointments are for patients who haven't checked in yet (status WAITING, CHECKED_IN)
        const allPatients = [
          ...visits.map((visit: any) => {
            const visitDate = visit.checkInTime 
              ? new Date(visit.checkInTime).toISOString().split('T')[0] 
              : today
            return {
              id: visit.id,
              visitId: visit.id,
              appointmentId: visit.appointmentId,
              patientId: visit.patientId,
              patient: visit.patient,
              shift: visit.appointment?.shift || { startTime: 'N/A', endTime: 'N/A' },
              date: visitDate,
              status: visit.status === 'EXAMINING' ? 'CHECKED_IN' : visit.status,
              isVisit: true,
            }
          }),
          ...appointments
            .filter((apt: any) => apt.status === 'WAITING' || apt.status === 'CHECKED_IN')
            .filter((apt: any) => !visits.some((v: any) => v.appointmentId === apt.id))
            .map((apt: any) => ({
              ...apt,
              isVisit: false,
            }))
        ]
        
        console.log("🔍 Doctor Dashboard - All Patients:", allPatients.length, allPatients)
        
        const todayAppointmentsCount = allPatients.length
        const todayPatientsCount = new Set(allPatients.map((p: any) => p.patientId)).size
        const completedVisits = visits.filter((v: any) => v.status === 'COMPLETED').length
        const pendingAppointments = allPatients.filter((p: any) => 
          p.status === 'WAITING' || p.status === 'CHECKED_IN' || p.status === 'EXAMINING'
        ).length
        
        setDashboardData({
          stats: {
            todayAppointments: todayAppointmentsCount,
            todayPatients: todayPatientsCount,
            patientChange: 0, // Calculate from previous day if needed
            completedVisits,
            pendingAppointments,
          },
          appointments: allPatients.slice(0, 10), // Show first 10
        })
      } else {
        // Fallback to empty data
        setDashboardData({
          stats: {
            todayAppointments: 0,
            todayPatients: 0,
            patientChange: 0,
            completedVisits: 0,
            pendingAppointments: 0,
          },
          appointments: [],
        })
      }
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err)
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      })
      // Show error toast for debugging
      if (import.meta.env.DEV) {
        toast.error(`Error: ${err.response?.data?.message || err.message}`)
      }
      // Fallback to empty data
      setDashboardData({
        stats: {
          todayAppointments: 0,
          todayPatients: 0,
          patientChange: 0,
          completedVisits: 0,
          pendingAppointments: 0,
        },
        appointments: [],
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: Appointment["status"]) => {
    const config: Record<string, string> = {
      CHECKED_IN: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
      WAITING: "bg-amber-500/10 text-amber-700 border-amber-200",
      CANCELLED: "bg-red-500/10 text-red-700 border-red-200",
      NO_SHOW: "bg-gray-500/10 text-gray-700 border-gray-200",
    }
    const labels: Record<string, string> = {
      CHECKED_IN: "Đã đến",
      WAITING: "Chờ khám",
      CANCELLED: "Đã hủy",
      NO_SHOW: "Không đến",
    }

    return (
      <Badge variant="outline" className={config[status] || "bg-gray-500/10 text-gray-700 border-gray-200"}>
        {labels[status] || status}
      </Badge>
    )
  }

  const formatTime = (timeString: string) => {
    // Format "HH:mm:ss" to "HH:mm"
    return timeString.substring(0, 5)
  }

  const stats = dashboardData?.stats || {
    todayAppointments: 0,
    todayPatients: 0,
    patientChange: 0,
    completedVisits: 0,
    pendingAppointments: 0,
  }

  const appointments = dashboardData?.appointments || []

  if (loading) {
    return (
      <DoctorSidebar>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-slate-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      </DoctorSidebar>
    )
  }

  return (
    <DoctorSidebar>
      <div className="flex-1 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 min-h-full">
        <div className="container mx-auto px-6 py-8">

          {/* --- Header Section --- */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Doctor Dashboard</h1>
            <p className="text-slate-600">Lịch khám và bệnh nhân hôm nay</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* --- Left Column: Stats & List --- */}
            <div className="lg:col-span-2 space-y-6">

              {/* --- Stats Cards Section --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">Lịch hẹn hôm nay</CardTitle>
                    <CalendarIcon className="h-5 w-5 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-slate-900">{stats.todayAppointments}</div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-emerald-50/30">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">Bệnh nhân hôm nay</CardTitle>
                    <Users className="h-5 w-5 text-emerald-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-slate-900 mb-1">{stats.todayPatients}</div>
                    <div className={`text-sm font-medium ${stats.patientChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {stats.patientChange >= 0 ? '+' : ''}{stats.patientChange.toFixed(1)}% vs yesterday
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* --- Upcoming Appointments Widget --- */}
              <UpcomingAppointmentsWidget limit={10} />

              {/* --- Appointments List Section --- */}
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
                        {appointments.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-8 px-6 text-center text-slate-500">
                              Không có lịch hẹn sắp tới
                            </td>
                          </tr>
                        ) : (
                          appointments.map((appointment, index) => (
                            <tr
                              key={appointment.id}
                              className={`border-b hover:bg-blue-50/30 transition-colors ${
                                index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                              }`}
                            >
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                                    {appointment.patient?.fullName?.charAt(0) || 'N'}
                                  </div>
                                  <span className="font-medium text-slate-900">
                                    {appointment.patient?.fullName || 'N/A'}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-slate-400" />
                                  {appointment.shift ? formatTime(appointment.shift.startTime) : 'N/A'}
                                </div>
                              </td>
                              <td className="py-4 px-6">{getStatusBadge(appointment.status)}</td>
                              <td className="py-4 px-6">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    if (appointment.isVisit && appointment.visitId) {
                                      // Navigate to medical form with visit ID
                                      navigate(`/doctor/patients/${appointment.visitId}`)
                                    } else if (appointment.appointmentId) {
                                      // Navigate to medical form with appointment ID (for appointments that haven't been checked in yet)
                                      navigate(`/doctor/patients/${appointment.appointmentId}`)
                                    } else {
                                      // Navigate to appointment detail
                                      navigate(`/appointments/${appointment.id}`)
                                    }
                                  }}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  {appointment.isVisit ? 'Khám' : 'Xem'}
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* --- Right Column: Calendar Section --- */}
            <div className="space-y-6">
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Lịch làm việc</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border-0 flex justify-center"
                  />
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-slate-900 mb-2">
                      Lịch hẹn ngày {date?.toLocaleDateString("vi-VN")}
                    </div>
                    <div className="text-xs text-slate-600">
                      {appointments.filter(apt => apt.date === date?.toISOString().split('T')[0]).length} lịch hẹn
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </div>
    </DoctorSidebar>
  )
}