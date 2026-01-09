import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import DoctorSidebar from '@/components/sidebar/doctor'
import { Search, Calendar, ChevronRight, Activity, Filter, UserCheck, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"
import api from "@/lib/api"
import { useAuth } from "@/auth/authContext"
import { toast } from "sonner"

// --- Interfaces & Data ---
interface MedicalAppointment {
  id: number
  visitId?: number
  patientId: number
  doctorId: number
  shiftId: number
  date: string
  slotNumber: number
  status: "WAITING" | "CHECKED_IN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  bookingType: string
  bookedBy: string
  symptomInitial?: string
  isVisit?: boolean
  // Backend returns lowercase aliases with nested user object
  patient?: {
    id: number
    dateOfBirth: string
    gender: "MALE" | "FEMALE"
    phoneNumber: string
    user?: {
      id: number
      fullName: string
      email: string
      avatar?: string
    }
    // Legacy: some APIs might return fullName directly
    fullName?: string
  }
  doctor?: {
    id: number
    user?: {
      id: number
      fullName: string
      email: string
      avatar?: string
    }
    fullName?: string
  }
  shift?: {
    id: number
    name: string
    startTime: string
    endTime: string
  }
  // Legacy uppercase (for backward compatibility with API responses)
  Patient?: {
    id: number
    dateOfBirth: string
    gender: "MALE" | "FEMALE"
    phoneNumber: string
    User?: {
      id: number
      fullName: string
      email: string
      avatar?: string
    }
    fullName?: string
  }
  Doctor?: {
    id: number
    User?: {
      id: number
      fullName: string
      email: string
      avatar?: string
    }
    fullName?: string
  }
  Shift?: {
    id: number
    name: string
    startTime: string
    endTime: string
  }
}

export default function MedicalList() {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "WAITING" | "CHECKED_IN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED">("all")
  const [appointments, setAppointments] = useState<MedicalAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [showAllDates, setShowAllDates] = useState(false)

  // Check if user is doctor or receptionist
  // roleId: 1=Admin, 2=Receptionist, 3=Patient, 4=Doctor (theo enum RoleCode)
  useEffect(() => {
    if (authLoading) return // Wait for auth to load
    
    if (!user) {
      setError('Please login to access this page.')
      setLoading(false)
      return
    }
    
    // Allow ADMIN (1), RECEPTIONIST (2), and DOCTOR (4)
    if (user.roleId !== 1 && user.roleId !== 2 && user.roleId !== 4) {
      setError('Access denied. This page is only for doctors, receptionists, and admins.')
      setLoading(false)
      return
    }
  }, [user, authLoading])

  // Fetch appointments from API
  const fetchAppointments = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Get current doctor's ID from auth context
        if (!user?.doctorId) {
          setError('Không tìm thấy thông tin bác sĩ. Vui lòng đăng nhập lại.')
          setLoading(false)
          return
        }
        
        const currentDoctorId = user.doctorId
        const dateToFetch = showAllDates ? undefined : selectedDate
        const today = new Date().toISOString().split('T')[0]
        
        console.log("🔍 MedicalList - Fetching data for doctor:", currentDoctorId, "date:", dateToFetch || "ALL", "showAllDates:", showAllDates)
        console.log("🔍 MedicalList - User info:", { 
          userId: user.id, 
          doctorId: user.doctorId, 
          roleId: user.roleId 
        })
        
        // Fetch both appointments and visits for current doctor
        let appointmentsRes, visitsRes
        
        // Build query string
        const appointmentsQuery = showAllDates 
          ? `/appointments?doctorId=${currentDoctorId}`
          : `/appointments?doctorId=${currentDoctorId}&date=${dateToFetch}`
        
        const visitsQuery = showAllDates
          ? `/visits?doctorId=${currentDoctorId}`
          : `/visits?doctorId=${currentDoctorId}&startDate=${dateToFetch}&endDate=${dateToFetch}`
        
        try {
          appointmentsRes = await api.get(appointmentsQuery)
          console.log("🔍 MedicalList - Appointments response:", appointmentsRes.data)
        } catch (apptErr: any) {
          console.error("❌ MedicalList - Error fetching appointments:", apptErr)
          console.error("❌ MedicalList - Appointments error details:", {
            message: apptErr.message,
            response: apptErr.response?.data,
            status: apptErr.response?.status,
            url: apptErr.config?.url,
          })
          appointmentsRes = { data: { success: false, data: [], message: apptErr.response?.data?.message || apptErr.message } }
        }
        
        try {
          visitsRes = await api.get(visitsQuery)
          console.log("🔍 MedicalList - Visits response:", visitsRes.data)
        } catch (visitErr: any) {
          console.error("❌ MedicalList - Error fetching visits:", visitErr)
          console.error("❌ MedicalList - Visits error details:", {
            message: visitErr.message,
            response: visitErr.response?.data,
            status: visitErr.response?.status,
            url: visitErr.config?.url,
          })
          visitsRes = { data: { success: false, data: [], message: visitErr.response?.data?.message || visitErr.message } }
        }

        if (appointmentsRes.data.success) {
          const appointmentsData = appointmentsRes.data.data || []
          const visitsData = visitsRes.data.success ? (visitsRes.data.data || []) : []
          
          console.log("🔍 MedicalList - Appointments count:", appointmentsData.length)
          console.log("🔍 MedicalList - Visits count:", visitsData.length)
          console.log("🔍 MedicalList - First appointment:", appointmentsData[0])
          console.log("🔍 MedicalList - First visit:", visitsData[0])
          
          // Combine appointments and visits
          // Convert visits to appointment-like format for display
          const visitAppointments = visitsData.map((visit: any) => {
            const appointment = visit.appointment || {}
            const patient = visit.patient || {}
            const patientUser = patient.user || {}
            
            return {
              id: visit.appointmentId || visit.id,
              visitId: visit.id,
              patientId: visit.patientId,
              doctorId: visit.doctorId,
              shiftId: appointment.shiftId,
              date: visit.checkInTime ? new Date(visit.checkInTime).toISOString().split('T')[0] : today,
              slotNumber: appointment.slotNumber || 0,
              status: visit.status === 'EXAMINING' ? 'IN_PROGRESS' : 
                     visit.status === 'COMPLETED' ? 'COMPLETED' : 'WAITING',
              bookingType: appointment.bookingType || 'OFFLINE',
              bookedBy: appointment.bookedBy || 'PATIENT',
              symptomInitial: appointment.symptomInitial,
              patient: {
                id: patient.id,
                dateOfBirth: patient.dateOfBirth,
                gender: patient.gender,
                phoneNumber: patient.phoneNumber,
                user: patientUser
              },
              shift: appointment.shift || visit.appointment?.shift,
              isVisit: true
            }
          })
          
          // Filter out appointments that already have visits
          const appointmentIdsWithVisits = new Set(visitsData.map((v: any) => v.appointmentId).filter(Boolean))
          const uniqueAppointments = appointmentsData
            .filter((apt: any) => !appointmentIdsWithVisits.has(apt.id))
            .map((apt: any) => ({ ...apt, isVisit: false }))
          
          // Combine all
          const allAppointments = [...uniqueAppointments, ...visitAppointments]
          
          console.log("🔍 MedicalList - Combined appointments count:", allAppointments.length)
          console.log("🔍 MedicalList - All appointments:", allAppointments)
          
          // Use combined data
          setAppointments(allAppointments)
          
          // Show info if no data
          if (allAppointments.length === 0) {
            console.warn("⚠️ MedicalList - No appointments or visits found for today")
            console.warn("⚠️ MedicalList - Check:", {
              doctorId: currentDoctorId,
              date: dateToFetch || "ALL",
              showAllDates: showAllDates,
              appointmentsCount: appointmentsData.length,
              visitsCount: visitsData.length,
              appointmentsQuery: appointmentsQuery,
              visitsQuery: visitsQuery,
            })
            // Don't set error, just show empty state
            setError(null)
          }
        } else {
          // API returned success: false
          console.warn("⚠️ MedicalList - Appointments API returned success: false")
          console.warn("⚠️ MedicalList - Response:", appointmentsRes.data)
          setAppointments([])
          setError(appointmentsRes.data.message || 'Failed to load appointments')
        }
      } catch (err: any) {
        // This catch should rarely be hit now since we catch individual API calls
        console.error("❌ MedicalList - Unexpected error:", err)
        console.error("❌ MedicalList - Error details:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          url: err.config?.url,
          stack: err.stack,
        })
        setAppointments([])
        const errorMessage = err.response?.data?.message || err.message || 'An error occurred while loading appointments'
        setError(errorMessage)
        // Show toast in development
        if (import.meta.env.DEV) {
          toast.error(`Error loading appointments: ${errorMessage}`)
        }
      } finally {
        setLoading(false)
      }
  }

  // Fetch on mount and when user changes
  useEffect(() => {
    if (authLoading || !user) return
    
    // Allow ADMIN (1), RECEPTIONIST (2), and DOCTOR (4)
    if (user.roleId !== 1 && user.roleId !== 2 && user.roleId !== 4) return

    fetchAppointments()
  }, [user?.id, user?.doctorId, authLoading])

  const filteredAppointments = appointments.filter((appointment) => {
    // Get patient name from nested user object
    const patientName = appointment.patient?.user?.fullName || 
                       appointment.Patient?.user?.fullName ||
                       appointment.patient?.fullName ||
                       appointment.Patient?.fullName ||
                       ""
    
    const matchesSearch =
      patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.id.toString().includes(searchQuery) ||
      appointment.shift?.startTime?.includes(searchQuery) ||
      appointment.Shift?.startTime?.includes(searchQuery)

    const matchesStatus = filterStatus === "all" || appointment.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const waitingCount = appointments.filter((a) => a.status === "WAITING").length
  const cancelledCount = appointments.filter((a) => a.status === "CANCELLED").length
  const completedCount = appointments.filter((a) => a.status === "COMPLETED").length
  const totalAppointments = appointments.length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "WAITING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "CHECKED_IN":
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200"
      case "CANCELLED":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "WAITING":
        return "Chờ khám"
      case "CHECKED_IN":
        return "Đã check-in"
      case "IN_PROGRESS":
        return "Đang khám"
      case "COMPLETED":
        return "Đã khám"
      case "CANCELLED":
        return "Đã hủy"
      default:
        return status
    }
  }

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

  const handleCallPatient = (appointment: MedicalAppointment) => {
    const patientName = appointment.patient?.user?.fullName || 
                       appointment.patient?.fullName || 
                       appointment.Patient?.user?.fullName ||
                       appointment.Patient?.fullName || 
                       "Unknown"
    console.log("🔍 Calling patient:", patientName, "appointment:", appointment)
    
    // Navigate to medical form for examination
    // Use visitId if it's a visit, otherwise use appointmentId
    const idToUse = appointment.isVisit && appointment.visitId 
      ? appointment.visitId 
      : appointment.id
    navigate(`/doctor/patients/${idToUse}`)
  }

  if (loading) {
    return (
      <DoctorSidebar>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading appointments...</p>
          </div>
        </div>
      </DoctorSidebar>
    )
  }

  if (error) {
    return (
      <DoctorSidebar>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <Activity className="h-12 w-12 mx-auto mb-2" />
              <p className="text-lg font-medium">Error loading appointments</p>
              <p className="text-sm">{error}</p>
            </div>
            {(user?.roleId !== 1 && user?.roleId !== 2 && user?.roleId !== 4) ? (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">You need to be logged in as a doctor, receptionist, or admin to access this page.</p>
                <Button onClick={() => navigate('/login')}>
                  Go to Login
                </Button>
              </div>
            ) : (
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            )}
          </div>
        </div>
      </DoctorSidebar>
    )
  }

  return (
    <DoctorSidebar>
      <div className="space-y-6">
        
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Medical Appointments</h1>
            <p className="text-slate-600">
              {showAllDates ? "All patient appointments and examinations" : `Manage ${selectedDate === new Date().toISOString().split('T')[0] ? "today's" : selectedDate} patient appointments and examinations`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value)
                setShowAllDates(false)
              }}
              className="w-40"
              disabled={showAllDates}
            />
            <Button
              variant={showAllDates ? "default" : "outline"}
              onClick={() => {
                setShowAllDates(!showAllDates)
                if (!showAllDates) {
                  setSelectedDate(new Date().toISOString().split('T')[0])
                }
              }}
            >
              {showAllDates ? "Show Today Only" : "Show All Dates"}
            </Button>
            <Button
              variant="outline"
              onClick={() => fetchAppointments()}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg shadow-blue-500/5 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Today</CardTitle>
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-slate-900 mb-1">{totalAppointments}</div>
              <p className="text-xs text-slate-500">Total appointments</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg shadow-yellow-500/5 hover:shadow-xl hover:shadow-yellow-500/10 transition-all duration-300 bg-gradient-to-br from-white to-yellow-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Waiting</CardTitle>
              <div className="h-10 w-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-slate-900 mb-1">{waitingCount}</div>
              <p className="text-xs text-slate-500">Patients waiting</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg shadow-red-500/5 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300 bg-gradient-to-br from-white to-red-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Cancelled</CardTitle>
              <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-slate-900 mb-1">{cancelledCount}</div>
              <p className="text-xs text-slate-500">Cancelled today</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg shadow-emerald-500/5 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 bg-gradient-to-br from-white to-emerald-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Completed</CardTitle>
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-slate-900 mb-1">{completedCount}</div>
              <p className="text-xs text-slate-500">Completed today</p>
            </CardContent>
          </Card>
        </div>
        {/* Search and Filter Section */}
        <Card className="border-0 shadow-xl shadow-slate-900/5">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search by patient name, appointment ID, or time..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === "all" ? "default" : "outline"}
                  onClick={() => setFilterStatus("all")}
                  className={filterStatus === "all" ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  All
                </Button>
                <Button
                  variant={filterStatus === "WAITING" ? "default" : "outline"}
                  onClick={() => setFilterStatus("WAITING")}
                  className={filterStatus === "WAITING" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
                >
                  Waiting
                </Button>
                <Button
                  variant={filterStatus === "CHECKED_IN" ? "default" : "outline"}
                  onClick={() => setFilterStatus("CHECKED_IN")}
                  className={filterStatus === "CHECKED_IN" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                >
                  Checked In
                </Button>
                <Button
                  variant={filterStatus === "IN_PROGRESS" ? "default" : "outline"}
                  onClick={() => setFilterStatus("IN_PROGRESS")}
                  className={filterStatus === "IN_PROGRESS" ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  In Progress
                </Button>
                <Button
                  variant={filterStatus === "COMPLETED" ? "default" : "outline"}
                  onClick={() => setFilterStatus("COMPLETED")}
                  className={filterStatus === "COMPLETED" ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  Completed
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments Table */}
        <Card className="border-0 shadow-xl shadow-slate-900/5 overflow-hidden bg-white">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-slate-900">
                  {showAllDates ? "All Appointments" : "Today's Appointments"}
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  Showing {filteredAppointments.length} of {totalAppointments} appointments
                  {totalAppointments === 0 && ` (No appointments found${showAllDates ? "" : " for " + selectedDate})`}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Tên bệnh nhân</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Mã khám</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Giờ khám</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-500">
                        <Search className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                        <p className="text-lg font-medium">No appointments found</p>
                        <p className="text-sm mt-2">
                          {totalAppointments === 0 
                            ? "No appointments scheduled for today" 
                            : "Try adjusting your search or filter criteria"
                          }
                        </p>
                        {import.meta.env.DEV && totalAppointments === 0 && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg text-left">
                            <p className="text-xs font-mono text-gray-600 mb-2">Debug Info:</p>
                            <p className="text-xs text-gray-500">Doctor ID: {user?.doctorId || 'N/A'}</p>
                            <p className="text-xs text-gray-500">Today: {new Date().toISOString().split('T')[0]}</p>
                            <p className="text-xs text-gray-500">Role: {user?.roleId || 'N/A'}</p>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="mt-2"
                              onClick={() => {
                                console.log("🔍 Manual refresh triggered")
                                fetchAppointments()
                              }}
                            >
                              Refresh Data
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map((appointment, index) => (
                      <tr
                        key={appointment.id}
                        className={`border-b hover:bg-blue-50/30 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                        }`}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            {(() => {
                              // Get patient data - API returns patient.user.fullName, not patient.fullName
                              const patient = appointment.patient || appointment.Patient
                              const patientUser = patient?.user || patient?.User
                              const patientName = patientUser?.fullName || patient?.fullName || "Unknown"
                              const patientGender = patient?.gender || "MALE"
                              const patientDateOfBirth = patient?.dateOfBirth || patient?.dateOfBirth
                              
                              if (!patient) {
                                console.warn("⚠️ No patient data for appointment:", appointment.id)
                                return <div className="text-slate-500">No patient data</div>
                              }
                              
                              return (
                                <>
                                  <div
                                    className={`h-12 w-12 rounded-full ${
                                      patientGender === "MALE"
                                        ? "bg-gradient-to-br from-blue-500 to-blue-600"
                                        : "bg-gradient-to-br from-pink-500 to-pink-600"
                                    } flex items-center justify-center text-white font-semibold shadow-md text-lg`}
                                  >
                                    {patientName.charAt(0).toUpperCase() || "?"}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-slate-900">{patientName}</p>
                                    <p className="text-sm text-slate-500">
                                      {patientDateOfBirth ? `${calculateAge(patientDateOfBirth)} tuổi` : ""} • {patientGender === "MALE" ? "Nam" : patientGender === "FEMALE" ? "Nữ" : ""}
                                    </p>
                                  </div>
                                </>
                              )
                            })()}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            #{appointment.id}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 text-slate-700">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <span className="text-sm font-medium">
                              {(() => {
                                const shift = appointment.shift || appointment.Shift
                                if (!shift) return "N/A"
                                return `${shift.startTime} - ${shift.endTime}`
                              })()}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge 
                            variant="outline" 
                            className={`${getStatusBadge(appointment.status)}`}
                          >
                            {getStatusText(appointment.status)}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            {/* Show "Chi tiết" for completed or cancelled appointments */}
                            {(appointment.status === "COMPLETED" || appointment.status === "CANCELLED") && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              asChild 
                            >
                              <Link to={`/doctor/patients/${appointment.isVisit && appointment.visitId ? appointment.visitId : appointment.id}`}>
                                Chi tiết
                                <ChevronRight className="h-4 w-4 ml-1" />
                              </Link>
                            </Button>
                            )}
                            {/* Show "Khám bệnh" for WAITING, CHECKED_IN, or IN_PROGRESS */}
                            {(appointment.status === "WAITING" || appointment.status === "CHECKED_IN" || appointment.status === "IN_PROGRESS") && (
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleCallPatient(appointment)}
                              >
                                <Bell className="h-4 w-4 mr-1" />
                                {appointment.status === "IN_PROGRESS" 
                                  ? "Tiếp tục khám" 
                                  : appointment.status === "CHECKED_IN"
                                  ? "Khám bệnh"
                                  : "Gọi khám"}
                              </Button>
                            )}
                          </div>
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
    </DoctorSidebar>
  )
}