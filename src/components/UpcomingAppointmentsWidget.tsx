"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Clock, User, Loader2, ChevronRight } from "lucide-react"
import { getUpcomingAppointments, type Appointment } from "@/services/appointment.service"

interface UpcomingAppointmentsWidgetProps {
  limit?: number
  showViewAll?: boolean
}

export default function UpcomingAppointmentsWidget({
  limit = 5,
  showViewAll = true,
}: UpcomingAppointmentsWidgetProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoading(true)
        const data = await getUpcomingAppointments(limit)
        setAppointments(data)
      } catch (error: any) {
        // Silent fail - don't show error toast for widget
        if (import.meta.env.DEV) {
          console.error("Failed to fetch upcoming appointments:", error)
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchAppointments()
  }, [limit])

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      WAITING: { label: "Chờ khám", className: "bg-blue-50 text-blue-600 border-blue-100/50" },
      CHECKED_IN: { label: "Đã đến", className: "bg-emerald-50 text-emerald-600 border-emerald-100/50" },
      IN_PROGRESS: { label: "Đang khám", className: "bg-purple-50 text-purple-600 border-purple-100/50" },
      COMPLETED: { label: "Hoàn tất", className: "bg-slate-50 text-slate-500 border-slate-100/50" },
    }

    const statusInfo = statusMap[status] || {
      label: status,
      className: "bg-gray-50 text-gray-500 border-gray-100/50",
    }

    return (
      <Badge variant="outline" className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border shadow-sm ${statusInfo.className}`}>
        {statusInfo.label}
      </Badge>
    )
  }

  return (
    <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white overflow-hidden rounded-3xl">
      <CardHeader className="pb-4 px-8 pt-7 border-b border-slate-50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-black flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-xl">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
            </div>
            Lịch hẹn sắp tới
          </CardTitle>
          {showViewAll && (
            <Button variant="ghost" size="sm" className="h-8 text-xs font-bold text-slate-400 hover:text-primary transition-colors" asChild>
              <Link to="/appointments">
                Xem tất cả
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Không có lịch hẹn sắp tới</p>
          </div>
        ) : (
          <div className="max-h-[350px] overflow-y-auto custom-scrollbar px-2">
            {appointments.map((appointment) => (
              <Link
                key={appointment.id}
                to={`/appointments/${appointment.id}`}
                className="block m-2 p-4 rounded-2xl hover:bg-slate-50/80 transition-all duration-300 border border-transparent hover:border-slate-100 hover:shadow-sm group relative"
              >
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        {getStatusBadge(appointment.status)}
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>

                <div className="space-y-3">
                    <div>
                        <p className="font-black text-slate-900 group-hover:text-primary transition-colors leading-tight">
                            {appointment.patient?.fullName || "Ẩn danh"}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                            Mã: {appointment.patient?.patientCode || "---"}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pb-1">
                        <div className="flex items-center gap-2 bg-slate-50/50 p-2 rounded-xl group-hover:bg-white transition-colors">
                            <Clock className="h-3 w-3 text-indigo-500" />
                            <span className="text-[11px] font-bold text-slate-600">
                                {appointment.shift?.startTime || "--:--"}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-50/50 p-2 rounded-xl group-hover:bg-white transition-colors">
                            <User className="h-3 w-3 text-emerald-500" />
                            <span className="text-[11px] font-bold text-slate-600 truncate">
                                {appointment.doctor?.user?.fullName?.split(' ').pop() || "BS Trực"}
                            </span>
                        </div>
                    </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
