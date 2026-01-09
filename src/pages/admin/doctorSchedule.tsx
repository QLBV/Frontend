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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  User,
  XCircle,
  RotateCcw,
  Loader2,
  AlertTriangle,
  CheckCircle,
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
  const [restoreLoading, setRestoreLoading] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false)
  const [selectedShiftToCancel, setSelectedShiftToCancel] = useState<DoctorShift | null>(null)
  const [selectedShiftToRestore, setSelectedShiftToRestore] = useState<DoctorShift | null>(null)
  const [cancelReason, setCancelReason] = useState("")
  const [previewData, setPreviewData] = useState<any>(null)

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
      const response = await api.get('/doctors')
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
      const response = await api.get('/shifts')
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
      const response = await api.get('/doctor-shifts')
      
      if (response.data.success) {
        setDoctorShifts(response.data.data)
        console.log('Doctor shifts loaded:', response.data.data.length)
        return
      }
    } catch (err: any) {
      console.error('Error fetching doctor shifts:', err)
      setDoctorShifts([])
      toast.error('Không thể tải danh sách ca trực')
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

  const handleCancelShiftClick = async (doctorShift: DoctorShift) => {
    try {
      setPreviewLoading(true)
      setSelectedShiftToCancel(doctorShift)
      setCancelReason("")
      setPreviewData(null)
      
      const previewResponse = await api.get(`/doctor-shifts/${doctorShift.id}/reschedule-preview`)
      
      if (previewResponse.data.success) {
        setPreviewData(previewResponse.data.data)
        setCancelDialogOpen(true)
      } else {
        throw new Error(previewResponse.data.message || 'Không thể lấy thông tin preview')
      }
    } catch (err: any) {
      console.error('Error getting preview:', err)
      toast.error(err.response?.data?.message || 'Không thể lấy thông tin preview')
    } finally {
      setPreviewLoading(false)
    }
  }

  const handleCancelConfirm = async () => {
    if (!selectedShiftToCancel || !cancelReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy ca')
      return
    }

    try {
      setCancelLoading(true)
      const response = await api.post(`/doctor-shifts/${selectedShiftToCancel.id}/cancel-and-reschedule`, {
        cancelReason: cancelReason.trim()
      })

      if (response.data.success) {
        const result = response.data.data
        
        // Update UI - mark as cancelled instead of removing
        setDoctorShifts(prev => prev.map(ds => 
          ds.id === selectedShiftToCancel.id ? { ...ds, status: 'CANCELLED' as const } : ds
        ))
        
        // Show success message
        let successMsg = `Đã hủy ca trực thành công!`
        if (result.totalAppointments > 0) {
          successMsg += ` ${result.rescheduledCount || 0}/${result.totalAppointments} lịch hẹn đã được xử lý.`
        }
        toast.success(successMsg)
        
        setCancelDialogOpen(false)
        setSelectedShiftToCancel(null)
        setCancelReason("")
        setPreviewData(null)
      } else {
        throw new Error(response.data.message || 'Không thể hủy ca trực')
      }
    } catch (err: any) {
      console.error('Cancel shift error:', err)
      const errorMsg = err.response?.data?.message || 'Không thể hủy ca trực'
      toast.error(errorMsg)
    } finally {
      setCancelLoading(false)
    }
  }

  const handleRestoreShiftClick = (doctorShift: DoctorShift) => {
    setSelectedShiftToRestore(doctorShift)
    setRestoreDialogOpen(true)
  }

  const handleRestoreConfirm = async () => {
    if (!selectedShiftToRestore) return

    try {
      setRestoreLoading(true)
      const response = await api.post(`/doctor-shifts/${selectedShiftToRestore.id}/restore`)

      if (response.data.success) {
        // Update UI - mark as active
        setDoctorShifts(prev => prev.map(ds => 
          ds.id === selectedShiftToRestore.id ? { ...ds, status: 'ACTIVE' as const } : ds
        ))
        
        toast.success('Đã khôi phục ca trực thành công!')
        setRestoreDialogOpen(false)
        setSelectedShiftToRestore(null)
      } else {
        throw new Error(response.data.message || 'Không thể khôi phục ca trực')
      }
    } catch (err: any) {
      console.error('Restore shift error:', err)
      const errorMsg = err.response?.data?.message || 'Không thể khôi phục ca trực'
      toast.error(errorMsg)
    } finally {
      setRestoreLoading(false)
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
                        ds.workDate === dateStr
                      )
                      
                      const activeShifts = shiftsForDay.filter(ds => ds.status === 'ACTIVE')
                      const cancelledShifts = shiftsForDay.filter(ds => ds.status === 'CANCELLED')
                      
                      return (
                        <div key={dayIndex} className="p-2 border-r">
                          {/* Active shifts */}
                          {activeShifts.map(doctorShift => (
                            <div
                              key={doctorShift.id}
                              className="p-2 mb-2 rounded-lg text-xs border-l-4 bg-blue-50 border-blue-500 relative group"
                            >
                              <div className="font-medium">Ca trực</div>
                              <div className="text-gray-600">{doctorShift.doctor?.user?.fullName || 'Unknown Doctor'}</div>
                              <div className="text-gray-500 text-xs">{doctorShift.doctor?.specialty?.name || 'Unknown Specialty'}</div>
                              
                              {/* Cancel button - chỉ hiện khi showAddEvent = true */}
                              {showAddEvent && (
                                <button
                                  onClick={() => handleCancelShiftClick(doctorShift)}
                                  disabled={previewLoading || cancelLoading}
                                  className={`absolute -top-1 -right-1 w-5 h-5 ${
                                    previewLoading || cancelLoading 
                                      ? 'bg-gray-400 cursor-not-allowed' 
                                      : 'bg-red-500 hover:bg-red-600'
                                  } text-white rounded-full text-xs transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100`}
                                  title={previewLoading || cancelLoading ? "Đang xử lý..." : "Hủy ca trực"}
                                >
                                  {previewLoading || cancelLoading ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <XCircle className="w-3 h-3" />
                                  )}
                                </button>
                              )}
                            </div>
                          ))}
                          
                          {/* Cancelled shifts - hiển thị với style khác và có restore button */}
                          {cancelledShifts.map(doctorShift => (
                            <div
                              key={doctorShift.id}
                              className="p-2 mb-2 rounded-lg text-xs border-l-4 bg-gray-100 border-gray-400 relative group opacity-60"
                            >
                              <div className="font-medium line-through">Ca trực (Đã hủy)</div>
                              <div className="text-gray-500 line-through">{doctorShift.doctor?.user?.fullName || 'Unknown Doctor'}</div>
                              {showAddEvent && (
                                <button
                                  onClick={() => handleRestoreShiftClick(doctorShift)}
                                  disabled={restoreLoading}
                                  className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 hover:bg-green-600 text-white rounded-full text-xs transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100"
                                  title="Khôi phục ca trực"
                                >
                                  {restoreLoading ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <RotateCcw className="w-3 h-3" />
                                  )}
                                </button>
                              )}
                            </div>
                          ))}
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

      {/* Cancel Shift Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Xác nhận hủy ca trực</DialogTitle>
            <DialogDescription>
              Hủy ca trực cho bác sĩ {selectedShiftToCancel?.doctor?.user?.fullName}
            </DialogDescription>
          </DialogHeader>
          
          {previewData && (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border ${
                previewData.hasReplacementDoctor 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-amber-50 border-amber-200'
              }`}>
                <div className="flex items-start gap-3">
                  {previewData.hasReplacementDoctor ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold mb-2">
                      Sẽ ảnh hưởng đến {previewData.affectedAppointments} lịch hẹn
                    </p>
                    {previewData.hasReplacementDoctor ? (
                      <p className="text-sm text-green-700">
                        ✅ Đã tìm thấy bác sĩ thay thế cùng chuyên khoa. 
                        Tất cả lịch hẹn sẽ được tự động chuyển sang bác sĩ thay thế.
                      </p>
                    ) : (
                      <p className="text-sm text-amber-700">
                        ⚠️ CẢNH BÁO: Không tìm thấy bác sĩ thay thế cùng chuyên khoa! 
                        {previewData.affectedAppointments} lịch hẹn sẽ không thể tự động chuyển.
                      </p>
                    )}
                    {previewData.warning && (
                      <p className="text-sm text-amber-700 mt-2">⚠️ {previewData.warning}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="cancelReason">Lý do hủy ca *</Label>
            <Textarea
              id="cancelReason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Nhập lý do hủy ca trực..."
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCancelDialogOpen(false)
                setCancelReason("")
                setPreviewData(null)
              }}
              disabled={cancelLoading}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelConfirm}
              disabled={cancelLoading || !cancelReason.trim()}
            >
              {cancelLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Xác nhận hủy
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Shift Dialog */}
      <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận khôi phục ca trực</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn khôi phục ca trực cho bác sĩ{" "}
              <strong>{selectedShiftToRestore?.doctor?.user?.fullName}</strong>?
              <br />
              Ca trực: {selectedShiftToRestore?.shift?.name} -{" "}
              {new Date(selectedShiftToRestore?.workDate || "").toLocaleDateString("vi-VN")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRestoreDialogOpen(false)
                setSelectedShiftToRestore(null)
              }}
              disabled={restoreLoading}
            >
              Hủy
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleRestoreConfirm}
              disabled={restoreLoading}
            >
              {restoreLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Khôi phục
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
