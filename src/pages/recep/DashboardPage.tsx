"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, Users, Clock, Activity, Phone, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "react-router-dom"
import { Calendar } from "@/components/ui/calendar"
import ReceptionistSidebar from "@/components/sidebar/recep"
import UpcomingAppointmentsWidget from "@/components/UpcomingAppointmentsWidget"
import { getAppointments } from "@/services/appointment.service"
import { format } from "date-fns"

export default function ReceptionistDashboardPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [todayAppointments, setTodayAppointments] = useState(0)
  const [todayPatients, setTodayPatients] = useState(0)
  const [patientChange, setPatientChange] = useState(0)
  const [selectedDateAppointments, setSelectedDateAppointments] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  useEffect(() => {
    if (date) {
      fetchAppointmentsForDate(date)
    }
  }, [date])

  const fetchDashboardStats = async () => {
    try {
      setLoading(true)
      const today = format(new Date(), "yyyy-MM-dd")
      const yesterday = format(new Date(Date.now() - 86400000), "yyyy-MM-dd")

      // Fetch today's appointments
      const todayAppts = await getAppointments({ date: today })
      const todayApptsCount = todayAppts.length
      const todayPatientsSet = new Set(todayAppts.map(apt => apt.patientId))
      const todayPatientsCount = todayPatientsSet.size

      // Fetch yesterday's appointments for comparison
      const yesterdayAppts = await getAppointments({ date: yesterday })
      const yesterdayPatientsSet = new Set(yesterdayAppts.map(apt => apt.patientId))
      const yesterdayPatientsCount = yesterdayPatientsSet.size

      // Calculate patient change percentage
      let change = 0
      if (yesterdayPatientsCount > 0) {
        change = ((todayPatientsCount - yesterdayPatientsCount) / yesterdayPatientsCount) * 100
      } else if (todayPatientsCount > 0) {
        change = 100 // 100% increase if yesterday had 0
      }

      setTodayAppointments(todayApptsCount)
      setTodayPatients(todayPatientsCount)
      setPatientChange(Math.round(change * 10) / 10) // Round to 1 decimal place
    } catch (error: any) {
      console.error("Error fetching dashboard stats:", error)
      setTodayAppointments(0)
      setTodayPatients(0)
      setPatientChange(0)
    } finally {
      setLoading(false)
    }
  }

  const fetchAppointmentsForDate = async (selectedDate: Date) => {
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd")
      const appointments = await getAppointments({ date: dateStr })
      setSelectedDateAppointments(appointments.length)
    } catch (error: any) {
      console.error("Error fetching appointments for date:", error)
      setSelectedDateAppointments(0)
    }
  }

  return (
    <ReceptionistSidebar>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
        <div className="container mx-auto px-6 py-8">
          
          {/* --- Page Title Section --- */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Receptionist Dashboard</h1>
            <p className="text-slate-600">Quản lý lịch hẹn và tiếp đón bệnh nhân</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* --- Left Column: Stats & Actions --- */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* --- Statistics Cards --- */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">Lịch hẹn hôm nay</CardTitle>
                    <CalendarIcon className="h-5 w-5 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        <span className="text-sm text-slate-500">Đang tải...</span>
                      </div>
                    ) : (
                      <div className="text-4xl font-bold text-slate-900">{todayAppointments}</div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-emerald-50/30">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-600">Bệnh nhân hôm nay</CardTitle>
                    <Users className="h-5 w-5 text-emerald-600" />
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                        <span className="text-sm text-slate-500">Đang tải...</span>
                      </div>
                    ) : (
                      <>
                        <div className="text-4xl font-bold text-slate-900 mb-1">{todayPatients}</div>
                        <div className={`text-sm font-medium ${patientChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                          {patientChange >= 0 ? '+' : ''}{patientChange}% vs yesterday
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* --- Upcoming Appointments Widget --- */}
              <UpcomingAppointmentsWidget limit={10} />

              {/* --- Quick Actions Grid --- */}
              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b">
                  <CardTitle className="text-2xl">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button className="h-20" asChild>
                      <Link to="/patient/book-appointment">
                        <CalendarIcon className="h-5 w-5 mr-2" />
                        Đặt lịch hẹn mới
                      </Link>
                    </Button>
                    <Button className="h-20 bg-transparent" variant="outline" asChild>
                      <Link to="/register-patient">
                        <Users className="h-5 w-5 mr-2" />
                        Đăng ký bệnh nhân
                      </Link>
                    </Button>
                    <Button className="h-20 bg-transparent" variant="outline" asChild>
                      <Link to="/manage-appointments">
                        <Clock className="h-5 w-5 mr-2" />
                        Quản lý lịch hẹn
                      </Link>
                    </Button>
                    <Button className="h-20 bg-transparent" variant="outline" asChild>
                      <Link to="/patients">
                        <Phone className="h-5 w-5 mr-2" />
                        Danh sách bệnh nhân
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* --- Right Column: Calendar --- */}
            <div>
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Lịch</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border-0" />
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-slate-900 mb-2">
                      Ngày {date?.toLocaleDateString("vi-VN")}
                    </div>
                    <div className="text-xs text-slate-600">{selectedDateAppointments} lịch hẹn</div>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </div>
    </ReceptionistSidebar>
  )
}