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

// --- Interfaces & Data ---
interface MedicalAppointment {
  id: number
  patientId: number
  doctorId: number
  shiftId: number
  date: string
  slotNumber: number
  status: "WAITING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  bookingType: string
  bookedBy: string
  symptomInitial?: string
  Patient: {
    id: number
    fullName: string
    dateOfBirth: string
    gender: "MALE" | "FEMALE"
    phoneNumber: string
  }
  Doctor: {
    id: number
    fullName: string
  }
  Shift: {
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
  const [filterStatus, setFilterStatus] = useState<"all" | "WAITING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED">("all")
  const [appointments, setAppointments] = useState<MedicalAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Check if user is doctor
  useEffect(() => {
    if (authLoading) return // Wait for auth to load
    
    if (!user) {
      setError('Please login to access this page.')
      setLoading(false)
      return
    }
    
    if (user.roleId !== 2) { // 2 = DOCTOR
      setError('Access denied. This page is only for doctors and receptionists.')
      setLoading(false)
      return
    }
  }, [user, authLoading])

  // Fetch appointments from API
  useEffect(() => {
    if (authLoading || !user) return
    
    if (user.roleId !== 2) return // Not a doctor or receptionist

    const fetchAppointments = async () => {
      try {
        setLoading(true)
        
        // Mock data for testing
        const mockAppointments: MedicalAppointment[] = [
          {
            id: 1,
            patientId: 1,
            doctorId: 1,
            shiftId: 1,
            date: new Date().toISOString().split('T')[0],
            slotNumber: 1,
            status: "WAITING",
            bookingType: "ONLINE",
            bookedBy: "PATIENT",
            symptomInitial: "Đau đầu, chóng mặt, sốt nhẹ",
            Patient: {
              id: 1,
              fullName: "Nguyễn Văn A",
              dateOfBirth: "1990-05-15",
              gender: "MALE",
              phoneNumber: "0123456789"
            },
            Doctor: {
              id: 1,
              fullName: "BS. Trần Thị B"
            },
            Shift: {
              id: 1,
              name: "Ca sáng",
              startTime: "08:00",
              endTime: "12:00"
            }
          },
          {
            id: 2,
            patientId: 2,
            doctorId: 1,
            shiftId: 1,
            date: new Date().toISOString().split('T')[0],
            slotNumber: 2,
            status: "WAITING",
            bookingType: "OFFLINE",
            bookedBy: "RECEPTIONIST",
            symptomInitial: "Ho khan, đau họng",
            Patient: {
              id: 2,
              fullName: "Lê Thị C",
              dateOfBirth: "1985-08-22",
              gender: "FEMALE",
              phoneNumber: "0987654321"
            },
            Doctor: {
              id: 1,
              fullName: "BS. Trần Thị B"
            },
            Shift: {
              id: 1,
              name: "Ca sáng",
              startTime: "08:00",
              endTime: "12:00"
            }
          },
          {
            id: 3,
            patientId: 3,
            doctorId: 2,
            shiftId: 2,
            date: new Date().toISOString().split('T')[0],
            slotNumber: 1,
            status: "IN_PROGRESS",
            bookingType: "ONLINE",
            bookedBy: "PATIENT",
            symptomInitial: "Đau bụng, buồn nôn",
            Patient: {
              id: 3,
              fullName: "Phạm Văn D",
              dateOfBirth: "1992-12-10",
              gender: "MALE",
              phoneNumber: "0369852147"
            },
            Doctor: {
              id: 2,
              fullName: "BS. Hoàng Văn E"
            },
            Shift: {
              id: 2,
              name: "Ca chiều",
              startTime: "13:00",
              endTime: "17:00"
            }
          },
          {
            id: 4,
            patientId: 4,
            doctorId: 1,
            shiftId: 1,
            date: new Date().toISOString().split('T')[0],
            slotNumber: 3,
            status: "COMPLETED",
            bookingType: "ONLINE",
            bookedBy: "PATIENT",
            symptomInitial: "Khám tổng quát",
            Patient: {
              id: 4,
              fullName: "Vũ Thị F",
              dateOfBirth: "1988-03-18",
              gender: "FEMALE",
              phoneNumber: "0147258369"
            },
            Doctor: {
              id: 1,
              fullName: "BS. Trần Thị B"
            },
            Shift: {
              id: 1,
              name: "Ca sáng",
              startTime: "08:00",
              endTime: "12:00"
            }
          }
        ]
        
        // Try to get real data from API first
        const today = new Date().toISOString().split('T')[0]
        const response = await api.get(`/api/appointments?date=${today}`)

        if (response.data.success && response.data.data.length > 0) {
          // Use real data if available
          setAppointments(response.data.data)
          setError(null)
        } else {
          // Use mock data if no real appointments found
          setAppointments(mockAppointments)
          setError(null)
        }
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [user?.id, authLoading])

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.Patient.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.id.toString().includes(searchQuery) ||
      appointment.Shift.startTime.includes(searchQuery)

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
    console.log("Calling patient:", appointment.Patient.fullName)
    // Navigate to medical form for examination
    navigate(`/doctor/patients/${appointment.id}/examination`)
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
            {user?.roleId !== 2 ? (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">You need to be logged in as a doctor or receptionist to access this page.</p>
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
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Medical Appointments</h1>
          <p className="text-slate-600">Manage today's patient appointments and examinations</p>
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
                <CardTitle className="text-2xl text-slate-900">Today's Appointments</CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  Showing {filteredAppointments.length} of {totalAppointments} appointments
                  {totalAppointments === 0 && " (No appointments found for today)"}
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
                            <div
                              className={`h-12 w-12 rounded-full ${
                                appointment.Patient.gender === "MALE"
                                  ? "bg-gradient-to-br from-blue-500 to-blue-600"
                                  : "bg-gradient-to-br from-pink-500 to-pink-600"
                              } flex items-center justify-center text-white font-semibold shadow-md text-lg`}
                            >
                              {appointment.Patient.fullName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{appointment.Patient.fullName}</p>
                              <p className="text-sm text-slate-500">
                                {calculateAge(appointment.Patient.dateOfBirth)} tuổi • {appointment.Patient.gender === "MALE" ? "Nam" : "Nữ"}
                              </p>
                            </div>
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
                            <span className="text-sm font-medium">{appointment.Shift.startTime} - {appointment.Shift.endTime}</span>
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
                            {appointment.status !== "WAITING" && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              asChild 
                            >
                              <Link to={`/doctor/patients/${appointment.id}`}>
                                Chi tiết
                                <ChevronRight className="h-4 w-4 ml-1" />
                              </Link>
                            </Button>
                            )}
                            {appointment.status === "WAITING" && (
                              <Button 
                                size="sm" 
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleCallPatient(appointment)}
                              >
                                <Bell className="h-4 w-4 mr-1" />
                                Gọi khám
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