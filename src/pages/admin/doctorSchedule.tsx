"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import AdminSidebar from "@/components/sidebar/admin"
import ScheduleEventModal from "./modalChooseDay"
import api from "@/lib/api"
import { toast } from "sonner"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react"

/* ================= TYPES ================= */
interface Shift {
  id: number
  name: string
  startTime: string
  endTime: string
}

interface Doctor {
  id: number
  doctorCode: string
  user: {
    id: number
    fullName: string
    email: string
  }
  specialty: {
    id: number
    name: string
  }
}

interface DoctorShift {
  id: number
  doctorId: number
  shiftId: number
  workDate: string
  status: "ACTIVE" | "CANCELLED" | "REPLACED"
  doctor: Doctor
  shift: Shift
}

/* ================= MOCK DATA (REMOVED) ================= */
// Removed unused mock data

/* ================= PAGE ================= */
export default function DoctorSchedulePage() {
  const navigate = useNavigate()

  // States
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [previewLoading, setPreviewLoading] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)

  // Data states
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [doctorShifts, setDoctorShifts] = useState<DoctorShift[]>([])
  const [currentWeek, setCurrentWeek] = useState(new Date())

  const [filters, setFilters] = useState({
    consultations: true,
    onLeave: true,
  })
  // Fetch data from API
  const fetchDoctors = async () => {
    try {
      console.log('Fetching doctors...')
      const response = await api.get('/api/doctors')
      if (response.data.success) {
        setDoctors(response.data.data)
        console.log('Doctors loaded:', response.data.data.length)
      }
    } catch (err: any) {
      console.error('Error fetching doctors:', err)
      if (err.response?.status === 429) {
        toast.error('Quá nhiều request, vui lòng thử lại sau')
      }
    }
  }

  const fetchShifts = async () => {
    try {
      console.log('Fetching shifts...')
      const response = await api.get('/api/shifts')
      if (response.data.success) {
        setShifts(response.data.data)
        console.log('Shifts loaded:', response.data.data.length)
      } else {
        // Fallback shifts data
        setShifts([
          { id: 1, name: "MORNING", startTime: "08:00", endTime: "12:00" },
          { id: 2, name: "AFTERNOON", startTime: "13:00", endTime: "17:00" },
          { id: 3, name: "EVENING", startTime: "18:00", endTime: "22:00" }
        ])
      }
    } catch (err) {
      console.error('Error fetching shifts:', err)
      // Fallback shifts data
      setShifts([
        { id: 1, name: "MORNING", startTime: "08:00", endTime: "12:00" },
        { id: 2, name: "AFTERNOON", startTime: "13:00", endTime: "17:00" },
        { id: 3, name: "EVENING", startTime: "18:00", endTime: "22:00" }
      ])
    }
  }

  const fetchDoctorShifts = async () => {
    try {
      console.log('Fetching doctor shifts...')
      const response = await api.get('/api/doctor-shifts')
      
      if (response.data.success) {
        setDoctorShifts(response.data.data)
        console.log('Doctor shifts loaded:', response.data.data.length)
        return
      }
    } catch (err: any) {
      console.error('Error fetching doctor shifts:', err)
      // Use mock data as fallback
      const mockDoctorShifts = [
        {
          id: 1,
          doctorId: 1,
          shiftId: 1,
          workDate: new Date().toISOString().split('T')[0],
          status: "ACTIVE" as const,
          doctor: {
            id: 1,
            doctorCode: "DOC001",
            user: { 
              id: 1,
              fullName: "Dr. Nguyễn Văn A",
              email: "doctor1@example.com"
            },
            specialty: { 
              id: 1,
              name: "Tim mạch" 
            }
          },
          shift: {
            id: 1,
            name: "MORNING",
            startTime: "08:00",
            endTime: "12:00"
          }
        }
      ]
      
      setDoctorShifts(mockDoctorShifts)
      console.log('Using mock doctor shifts data: 1')
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        await Promise.all([
          fetchDoctors(),
          fetchShifts(),
          fetchDoctorShifts() // Fetch tất cả doctor shifts, không cần doctorId
        ])
      } catch (err) {
        setError('Không thể tải dữ liệu')
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, []) // Bỏ doctorId dependency vì giờ fetch tất cả

  // Helper functions for date calculations
  const getWeekDates = () => {
    const start = new Date(currentWeek)
    const day = start.getDay()
    const diff = start.getDate() - day + (day === 0 ? -6 : 1)
    start.setDate(diff)
    
    const dates = []
    for (let i = 0; i < 7; i++) { // Monday to Sunday (7 days)
      const date = new Date(start)
      date.setDate(start.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  /* ================= HELPERS ================= */
  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-purple-500",
      "bg-orange-500",
      "bg-green-500",
      "bg-red-500",
      "bg-indigo-500",
      "bg-pink-500",
      "bg-teal-500"
    ]
    const index = name.length % colors.length
    return colors[index]
  }

  const getAvatarInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Remove unused isEventVisible function

  const toggleFilter = (key: "consultations" | "onLeave") => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const toggleAll = () => {
    const all = filters.consultations && filters.onLeave
    setFilters({ consultations: !all, onLeave: !all })
  }

  const formatShiftTime = (shift: Shift) => {
    return `${shift.startTime} - ${shift.endTime}`
  }

  const getShiftIcon = (shiftName: string) => {
    switch (shiftName.toUpperCase()) {
      case 'MORNING': return '🌅'
      case 'AFTERNOON': return '☀️'
      case 'EVENING': return '🌙'
      default: return '⏰'
    }
  }

  /* ================= HANDLERS ================= */
  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor)
    setShowDatePicker(true)
  }

  const handleDeleteShift = async (doctorShiftId: number) => {
    try {
      // Step 1: Get preview of what will happen if we cancel this shift
      setPreviewLoading(true)
      const previewResponse = await api.get(`/api/doctor-shifts/${doctorShiftId}/reschedule-preview`)
      
      if (previewResponse.data.success) {
        const previewData = previewResponse.data.data
        
        // Show confirmation modal with preview information
        const confirmMessage = `
Hủy ca trực này sẽ ảnh hưởng đến ${previewData.affectedAppointments} lịch hẹn.

${previewData.hasReplacementDoctor 
  ? `✅ Đã tìm thấy bác sĩ thay thế cùng chuyên khoa.
📋 Tất cả lịch hẹn sẽ được tự động chuyển sang bác sĩ thay thế.` 
  : `⚠️ CẢNH BÁO: Không tìm thấy bác sĩ thay thế cùng chuyên khoa!
❌ ${previewData.affectedAppointments} lịch hẹn sẽ không thể tự động chuyển.`}

${previewData.warning ? `\n⚠️ ${previewData.warning}` : ''}

Bạn có chắc chắn muốn tiếp tục?`

        if (!confirm(confirmMessage)) {
          return
        }

        // Step 2: Ask for cancellation reason
        const cancelReason = prompt('Vui lòng nhập lý do hủy ca:')
        if (!cancelReason || cancelReason.trim() === '') {
          alert('Vui lòng cung cấp lý do hủy ca')
          return
        }

        // Step 3: Call the reschedule API
        setCancelLoading(true)
        const response = await api.post(`/api/doctor-shifts/${doctorShiftId}/cancel-and-reschedule`, {
          cancelReason: cancelReason.trim()
        })

        if (response.data.success) {
          const result = response.data.data
          
          // Update UI - remove the cancelled shift
          setDoctorShifts(prev => prev.filter(ds => ds.id !== doctorShiftId))
          
          // Show detailed success message
          let successMessage = `✅ Đã hủy ca trực thành công!\n\n`
          successMessage += `📊 Tổng số lịch hẹn xử lý: ${result.totalAppointments}\n`
          
          if (result.rescheduledCount > 0) {
            successMessage += `✅ Đã chuyển thành công: ${result.rescheduledCount} lịch hẹn\n`
          }
          
          if (result.failedCount > 0) {
            successMessage += `❌ Không thể chuyển: ${result.failedCount} lịch hẹn\n`
            successMessage += `💡 Các lịch hẹn này cần được xử lý thủ công.`
          }
          
          alert(successMessage)
          toast.success('Đã hủy ca trực và xử lý lịch hẹn thành công')
          
        } else {
          throw new Error(response.data.message || 'Không thể hủy ca trực')
        }
      } else {
        throw new Error(previewResponse.data.message || 'Không thể lấy thông tin preview')
      }
      
    } catch (err: any) {
      console.error('Cancel shift error:', err)
      let errorMessage = 'Hủy ca trực thất bại'
      
      if (err.response?.status === 404) {
        errorMessage = 'Không tìm thấy ca trực'
      } else if (err.response?.status === 400) {
        errorMessage = err.response.data.message || 'Dữ liệu không hợp lệ'
      } else if (err.response?.status === 500) {
        errorMessage = 'Lỗi hệ thống. Vui lòng thử lại sau'
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      }
      
      alert(`❌ ${errorMessage}`)
      toast.error(errorMessage)
    } finally {
      setPreviewLoading(false)
      setCancelLoading(false)
    }
  }

  const handleScheduleSuccess = (scheduleData?: {
    doctorId: number
    shiftId: number
    workDate: string
  }) => {
    // Thêm doctor shift mới vào UI
    if (scheduleData && selectedDoctor) {
      const selectedShift = shifts.find(s => s.id === scheduleData.shiftId)
      const newDoctorShift = {
        id: Date.now(), // fake ID
        doctorId: scheduleData.doctorId,
        shiftId: scheduleData.shiftId,
        workDate: scheduleData.workDate,
        status: 'ACTIVE' as const,
        doctor: selectedDoctor,
        shift: selectedShift || { id: 1, name: "MORNING", startTime: "08:00", endTime: "12:00" }
      }
      
      // Thêm vào danh sách hiện tại
      setDoctorShifts(prev => [...prev, newDoctorShift])
    }
    
    // Đóng modal và reset state
    setShowDatePicker(false)
    setSelectedDoctor(null)
    setSelectedDate("")
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(newWeek.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentWeek(newWeek)
  }

  const goToToday = () => {
    setCurrentWeek(new Date())
  }

  /* ================= RENDER ================= */
  if (loading) {
    return (
      <AdminSidebar>
        <div className="p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải lịch trực...</p>
          </div>
        </div>
      </AdminSidebar>
    )
  }

  if (error) {
    return (
      <AdminSidebar>
        <div className="p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Thử lại
            </Button>
          </div>
        </div>
      </AdminSidebar>
    )
  }

  const weekDates = getWeekDates()
  const weekStart = weekDates[0]
  const weekEnd = weekDates[6] // Changed from weekDates[4] to weekDates[6] for Sunday

  return (
    <AdminSidebar>
      <div className="p-8 max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate("/admin/doctors")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách
          </Button>

          <div className="flex justify-between items-center mt-4">
            <div>
              <h1 className="text-3xl font-bold">The Schedule</h1>
              <p className="text-gray-600 mt-2">
                Manage your shifts, appointments, and on-leave duties.
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowAddEvent(!showAddEvent)}>
                {showAddEvent ? "Cancel" : "+ Add Event"}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* ================= MAIN SCHEDULE ================= */}
          <div className="lg:col-span-3">
            <div className="flex items-center gap-3 mb-4">
              <Button variant="outline" size="sm" onClick={goToToday}>Today</Button>
              <Button variant="ghost" size="sm" onClick={() => navigateWeek('prev')}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-lg font-semibold">
                {weekStart.toLocaleDateString('vi-VN', { month: 'long', day: 'numeric' })} - {weekEnd.toLocaleDateString('vi-VN', { month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => navigateWeek('next')}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <Card>
              {/* ===== WEEK HEADER ===== */}
              <div className="grid grid-cols-8 border-b bg-white">
                <div className="p-4 border-r text-xs text-gray-500 uppercase">
                  Time
                </div>
                {weekDates.map((date, index) => {
                  const isToday = date.toDateString() === new Date().toDateString()
                  const dayName = date.toLocaleDateString('vi-VN', { weekday: 'short' }).toUpperCase()
                  const dayNumber = date.getDate()
                  
                  return (
                    <div
                      key={index}
                      className={`p-4 text-center border-r last:border-r-0 ${
                        isToday ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="text-xs text-gray-500 uppercase mb-1">
                        {dayName}
                      </div>
                      <div
                        className={`text-lg font-semibold mx-auto ${
                          isToday
                            ? "bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center"
                            : ""
                        }`}
                      >
                        {dayNumber}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* ===== TIME SLOTS ===== */}
              <CardContent className="p-0">
                {shifts.map((shift) => (
                  <div key={shift.id} className="grid grid-cols-8 border-b min-h-[160px]">
                    <div className="p-4 bg-gray-50 border-r text-center">
                      <div className="text-2xl">{getShiftIcon(shift.name)}</div>
                      <div className="font-medium">{shift.name}</div>
                      <div className="text-xs text-gray-500">{formatShiftTime(shift)}</div>
                    </div>

                    {weekDates.map((date, dayIndex) => {
                      const dateStr = date.toISOString().split('T')[0]
                      const shiftsForDay = doctorShifts.filter(ds => 
                        ds.shiftId === shift.id && 
                        ds.workDate === dateStr &&
                        ds.status === 'ACTIVE'
                      )
                      
                      return (
                        <div key={dayIndex} className="p-2 border-r">
                          {shiftsForDay.length > 0 ? (
                            shiftsForDay.map(doctorShift => (
                              <div
                                key={doctorShift.id}
                                className="p-2 mb-2 rounded-lg text-xs border-l-4 bg-blue-50 border-blue-500 relative group"
                              >
                                <div className="font-medium">Ca trực</div>
                                <div className="text-gray-600">{doctorShift.doctor?.user?.fullName || 'Unknown Doctor'}</div>
                                <div className="text-gray-500 text-xs">{doctorShift.doctor?.specialty?.name || 'Unknown Specialty'}</div>
                                
                                {/* Nút X để xóa - chỉ hiện khi showAddEvent = true */}
                                {showAddEvent && (
                                  <button
                                    onClick={() => handleDeleteShift(doctorShift.id)}
                                    disabled={previewLoading || cancelLoading}
                                    className={`absolute -top-1 -right-1 w-5 h-5 ${
                                      previewLoading || cancelLoading 
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : 'bg-red-500 hover:bg-red-600'
                                    } text-white rounded-full text-xs transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100`}
                                    title={previewLoading || cancelLoading ? "Đang xử lý..." : "Hủy ca trực"}
                                  >
                                    {previewLoading || cancelLoading ? (
                                      <div className="animate-spin w-3 h-3 border border-white border-t-transparent rounded-full"></div>
                                    ) : (
                                      '×'
                                    )}
                                  </button>
                                )}
                              </div>
                            ))
                          ) : null}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* ================= SIDEBAR ================= */}
          <div className="space-y-6">
            {!showAddEvent ? (
              <>
                {/* Mini Calendar */}
                <Card>
                  <CardHeader><CardTitle>
                    {currentWeek.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
                  </CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs">
                      {["CN","T2","T3","T4","T5","T6","T7"].map(d => (
                        <div key={d} className="text-gray-500">{d}</div>
                      ))}
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(d => {
                        const isToday = d === new Date().getDate() && 
                                       currentWeek.getMonth() === new Date().getMonth()
                        return (
                          <div
                            key={d}
                            className={`p-2 rounded cursor-pointer ${
                              isToday ? "bg-blue-600 text-white rounded-full" : "hover:bg-gray-100"
                            }`}
                          >
                            {d}
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Filters */}
                <Card>
                  <CardHeader className="flex justify-between">
                    <CardTitle>Calendars</CardTitle>
                    <Button variant="ghost" size="sm" onClick={toggleAll}>
                      {filters.consultations && filters.onLeave ? "Deselect All" : "Select All"}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={filters.consultations} onChange={() => toggleFilter("consultations")} />
                      Ca trực
                      <Badge>{doctorShifts.filter(ds => ds.status === 'ACTIVE').length}</Badge>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={filters.onLeave} onChange={() => toggleFilter("onLeave")} />
                      Nghỉ phép
                      <Badge>{doctorShifts.filter(ds => ds.status === 'CANCELLED').length}</Badge>
                    </label>
                  </CardContent>
                </Card>

                {/* Upcoming */}
                <Card>
                  <CardHeader><CardTitle>Lịch trực sắp tới</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    {doctorShifts.slice(0, 3).map(ds => (
                      <div key={ds.id} className="flex gap-3">
                        <User className="w-5 h-5 mt-1" />
                        <div>
                          <div className="font-medium">{ds.shift.name}</div>
                          <div className="text-sm text-gray-500">{ds.doctor.user.fullName}</div>
                          <div className="text-xs text-gray-400">{ds.workDate}</div>
                          <Badge variant="outline" className={ds.status === 'ACTIVE' ? 'border-green-500 text-green-600' : 'border-gray-500'}>
                            {ds.status === 'ACTIVE' ? 'Đang trực' : ds.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {doctorShifts.length === 0 && (
                      <p className="text-gray-500 text-sm">Chưa có lịch trực nào</p>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              /* Doctor list */
              <Card>
                <CardHeader><CardTitle>Chọn Bác Sĩ</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {doctors.map(d => (
                    <div
                      key={d.id}
                      onClick={() => handleDoctorSelect(d)}
                      className="flex gap-3 p-3 border rounded-lg hover:bg-blue-50 cursor-pointer"
                    >
                      <div className={`w-10 h-10 ${getAvatarColor(d.user.fullName)} rounded-full flex items-center justify-center text-white text-sm font-semibold`}>
                        {getAvatarInitials(d.user.fullName)}
                      </div>
                      <div>
                        <div className="font-medium">{d.user.fullName}</div>
                        <div className="text-sm text-gray-500">{d.specialty.name}</div>
                        <div className="text-xs text-gray-400">{d.doctorCode}</div>
                      </div>
                    </div>
                  ))}
                  {doctors.length === 0 && (
                    <p className="text-gray-500 text-sm">Không có bác sĩ nào</p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <ScheduleEventModal
        open={showDatePicker}
        doctor={selectedDoctor}
        selectedDate={selectedDate}
        shifts={shifts}
        onDateChange={setSelectedDate}
        onClose={() => {
          setShowDatePicker(false)
          setSelectedDoctor(null)
        }}
        onSuccess={handleScheduleSuccess}
        getAvatarColor={(name: string) => getAvatarColor(name)}
      />
    </AdminSidebar>
  )
}
