import { useState, useEffect } from "react"
import { getMyAppointments, cancelAppointment as cancelAppointmentService, type Appointment } from "@/services/appointment.service"
import { toast } from "sonner"
import type { IAppointment } from "@/types/appointment"

interface AppointmentStats {
  total: number
  upcoming: number
  completed: number
  cancelled: number
}

export function usePatientAppointments() {
  const [appointments, setAppointments] = useState<{
    upcoming: IAppointment[]
    past: IAppointment[]
  }>({
    upcoming: [],
    past: []
  })
  const [stats, setStats] = useState<AppointmentStats>({
    total: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0
  })
  const [selectedAppointment, setSelectedAppointment] = useState<IAppointment | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Convert Appointment to IAppointment format
  const convertToIAppointment = (apt: Appointment): IAppointment => {
    const today = new Date()
    const appointmentDate = new Date(apt.date)
    const isPast = appointmentDate < today || ["COMPLETED", "CANCELLED", "NO_SHOW"].includes(apt.status)

    return {
      id: String(apt.id),
      date: apt.date,
      time: apt.shift?.startTime || "",
      doctor: {
        id: apt.doctorId,
        name: apt.doctor?.user?.fullName || "Unknown Doctor",
        specialty: apt.doctor?.specialty?.name || "General",
        image: apt.doctor?.user?.avatar || "/placeholder.svg"
      },
      type: apt.bookingType === "ONLINE" ? "Online" : "Offline",
      location: "Clinic",
      reason: apt.symptomInitial || "General checkup",
      status: apt.status === "WAITING" ? "Pending" : 
              apt.status === "CONFIRMED" ? "Confirmed" :
              apt.status === "CHECKED_IN" ? "Completed" :
              apt.status === "CANCELLED" ? "Cancelled" : "Pending",
      notes: undefined,
      diagnosis: undefined,
      prescription: undefined,
      nextSteps: undefined
    }
  }

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      setIsLoading(true)
      const data = await getMyAppointments()
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const upcoming: IAppointment[] = []
      const past: IAppointment[] = []

      data.forEach((apt) => {
        const converted = convertToIAppointment(apt)
        const appointmentDate = new Date(apt.date)
        appointmentDate.setHours(0, 0, 0, 0)

        if (appointmentDate >= today && converted.status !== "Cancelled" && converted.status !== "Completed") {
          upcoming.push(converted)
        } else {
          past.push(converted)
        }
      })

      // Sort upcoming by date ascending
      upcoming.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      
      // Sort past by date descending
      past.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      setAppointments({ upcoming, past })

      // Calculate stats
      const cancelled = data.filter(apt => apt.status === "CANCELLED").length
      const completed = past.filter(apt => apt.status === "Completed").length
      setStats({
        total: data.length,
        upcoming: upcoming.length,
        completed,
        cancelled
      })
    } catch (error: any) {
      console.error("Error fetching appointments:", error)
      toast.error("Không thể tải danh sách lịch hẹn")
    } finally {
      setIsLoading(false)
    }
  }

  // View appointment details
  const viewDetails = (apt: IAppointment) => {
    setSelectedAppointment(apt)
    setIsDetailOpen(true)
  }

  // Cancel appointment
  const cancelAppointment = async (appointmentId: string, reason: string) => {
    try {
      await cancelAppointmentService(Number(appointmentId))
      toast.success("Đã hủy lịch hẹn thành công")
      await fetchAppointments() // Refresh list
    } catch (error: any) {
      console.error("Error cancelling appointment:", error)
      toast.error(error.response?.data?.message || "Không thể hủy lịch hẹn")
    }
  }

  // Fetch on mount
  useEffect(() => {
    fetchAppointments()
  }, [])

  return {
    appointments,
    stats,
    selectedAppointment,
    isDetailOpen,
    setIsDetailOpen,
    viewDetails,
    cancelAppointment,
    isLoading,
    refetch: fetchAppointments
  }
}
