"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CalendarIcon, Clock, User, Loader2, ChevronRight } from "lucide-react"
import { getUpcomingAppointments, type Appointment } from "@/services/appointment.service"
import { format } from "date-fns"
import { toast } from "sonner"

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
      WAITING: { label: "Chờ khám", className: "bg-blue-50 text-blue-700 border-blue-200" },
      IN_PROGRESS: { label: "Đang khám", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
      COMPLETED: { label: "Hoàn thành", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
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

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Lịch hẹn sắp tới</CardTitle>
          {showViewAll && (
            <Button variant="ghost" size="sm" asChild>
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
          <div className="divide-y">
            {appointments.map((appointment) => (
              <Link
                key={appointment.id}
                to={`/appointments/${appointment.id}`}
                className="block p-4 hover:bg-blue-50/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusBadge(appointment.status)}
                    </div>
                    <p className="font-semibold text-slate-900 mb-1">
                      {appointment.patient?.fullName || "N/A"}
                    </p>
                    {appointment.patient?.patientCode && (
                      <p className="text-xs text-gray-500 mb-2">
                        Mã: {appointment.patient.patientCode}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        <span>
                          {new Date(appointment.date).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                      {appointment.shift && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {appointment.shift.startTime} - {appointment.shift.endTime}
                          </span>
                        </div>
                      )}
                      {appointment.doctor?.user && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span className="truncate">{appointment.doctor.user.fullName || "N/A"}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
