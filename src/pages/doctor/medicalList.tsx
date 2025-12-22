import { useState } from "react"
import { useNavigate } from "react-router-dom"
import DoctorSidebar from '@/components/sidebar/doctor'
import { Search, Phone, Calendar, ChevronRight, Activity, Filter, UserCheck, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"

// --- Interfaces & Data ---
interface MedicalAppointment {
  id: string
  patientName: string
  medicalCode: string
  appointmentTime: string
  status: "waiting" | "in-progress" | "completed" | "cancelled"
  patientAge: number
  patientGender: "Male" | "Female"
  appointmentType: "consultation" | "follow-up" | "emergency"
}

const appointments: MedicalAppointment[] = [
  { 
    id: "1", 
    patientName: "Nguyễn Văn A", 
    medicalCode: "MED001", 
    appointmentTime: "09:00", 
    status: "waiting",
    patientAge: 45,
    patientGender: "Male",
    appointmentType: "consultation"
  },
  { 
    id: "2", 
    patientName: "Trần Thị B", 
    medicalCode: "MED002", 
    appointmentTime: "09:30", 
    status: "in-progress",
    patientAge: 32,
    patientGender: "Female",
    appointmentType: "follow-up"
  },
  { 
    id: "3", 
    patientName: "Lê Văn C", 
    medicalCode: "MED003", 
    appointmentTime: "10:00", 
    status: "waiting",
    patientAge: 58,
    patientGender: "Male",
    appointmentType: "consultation"
  },
  { 
    id: "4", 
    patientName: "Phạm Thị D", 
    medicalCode: "MED004", 
    appointmentTime: "10:30", 
    status: "waiting",
    patientAge: 27,
    patientGender: "Female",
    appointmentType: "consultation"
  },
  { 
    id: "5", 
    patientName: "Hoàng Văn E", 
    medicalCode: "MED005", 
    appointmentTime: "11:00", 
    status: "waiting",
    patientAge: 41,
    patientGender: "Male",
    appointmentType: "emergency"
  },
  { 
    id: "6", 
    patientName: "Vũ Thị F", 
    medicalCode: "MED006", 
    appointmentTime: "11:30", 
    status: "cancelled",
    patientAge: 35,
    patientGender: "Female",
    appointmentType: "follow-up"
  },
]

export default function MedicalList() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "waiting" | "in-progress" | "completed" | "cancelled">("all")

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.medicalCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.appointmentTime.includes(searchQuery)

    const matchesStatus = filterStatus === "all" || appointment.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const waitingCount = appointments.filter((a) => a.status === "waiting").length
  const CancelCount = appointments.filter((a) => a.status === "cancelled").length
  const completedCount = appointments.filter((a) => a.status === "completed").length
  const totalAppointments = appointments.length

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "waiting":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "waiting":
        return "Chờ khám"
      case "in-progress":
        return "Đang khám"
      case "cancelled":
        return "Đã hủy"
      default:
        return status
    }
  }

  const handleCallPatient = (appointment: MedicalAppointment) => {
    console.log("Calling patient:", appointment.patientName)
    // Navigate to medical form for examination
    navigate(`/doctor/patients/${appointment.id}/examination`)
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

          <Card className="border-0 shadow-lg shadow-blue-500/5 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Cancelled</CardTitle>
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-slate-900 mb-1">{CancelCount}</div>
              <p className="text-xs text-slate-500">Currently examining</p>
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
                  placeholder="Search by patient name, medical code, or time..."
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
                  variant={filterStatus === "waiting" ? "default" : "outline"}
                  onClick={() => setFilterStatus("waiting")}
                  className={filterStatus === "waiting" ? "bg-yellow-600 hover:bg-yellow-700" : ""}
                >
                  Waiting
                </Button>
                <Button
                  variant={filterStatus === "in-progress" ? "default" : "outline"}
                  onClick={() => setFilterStatus("in-progress")}
                  className={filterStatus === "in-progress" ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  In Progress
                </Button>
                <Button
                  variant={filterStatus === "completed" ? "default" : "outline"}
                  onClick={() => setFilterStatus("completed")}
                  className={filterStatus === "completed" ? "bg-green-600 hover:bg-green-700" : ""}
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
                                appointment.patientGender === "Male"
                                  ? "bg-gradient-to-br from-blue-500 to-blue-600"
                                  : "bg-gradient-to-br from-pink-500 to-pink-600"
                              } flex items-center justify-center text-white font-semibold shadow-md text-lg`}
                            >
                              {appointment.patientName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{appointment.patientName}</p>
                              <p className="text-sm text-slate-500">
                                {appointment.patientAge} tuổi • {appointment.patientGender === "Male" ? "Nam" : "Nữ"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {appointment.medicalCode}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 text-slate-700">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <span className="text-sm font-medium">{appointment.appointmentTime}</span>
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
                            {appointment.status !== "waiting" && (
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
                            {appointment.status === "waiting" && (
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