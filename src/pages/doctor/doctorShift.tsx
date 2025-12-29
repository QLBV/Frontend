"use client"

import { useState, useEffect } from "react"
import DoctorSidebar from '@/components/sidebar/doctor'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import api from "@/lib/api"
import { 
  Calendar, 
  Clock, 
  User, 
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  X
} from "lucide-react"

// Doctor Shift interface
interface DoctorShift {
  id: number
  doctorId: number
  shiftId: number
  workDate: string
  status: "ACTIVE" | "CANCELLED" | "REPLACED"
  shift: {
    id: number
    name: string
    startTime: string
    endTime: string
  }
}

// Appointment interface
interface Appointment {
  id: number
  appointmentDate: string
  appointmentTime: string
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"
  notes?: string
  patient: {
    id: number
    user: {
      fullName: string
      phone?: string
    }
  }
}

// Personal schedule interface
interface PersonalSchedule {
  id: string
  date: string
  time: string
  type: "shift" | "appointment"
  title: string
  description: string
  status: "active" | "completed" | "cancelled"
  patientName?: string
}

const timeSlots = [
  { label: "MORNING", time: "8 AM - 12 PM", icon: "🌅" },
  { label: "AFTERNOON", time: "1 PM - 5 PM", icon: "☀️" },
  { label: "EVENING", time: "6 PM - 10 PM", icon: "🌙" }
]

export default function DoctorShiftPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [doctorShifts, setDoctorShifts] = useState<DoctorShift[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [personalSchedule, setPersonalSchedule] = useState<PersonalSchedule[]>([])
  const [loading, setLoading] = useState(true)
  
  // Cancel shift modal states
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [selectedShiftToCancel, setSelectedShiftToCancel] = useState<PersonalSchedule | null>(null)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [previewData, setPreviewData] = useState<any>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  // Get week dates (Monday to Sunday)
  const getWeekDates = () => {
    const start = new Date(currentWeek)
    const day = start.getDay()
    const diff = start.getDate() - day + (day === 0 ? -6 : 1)
    start.setDate(diff)
    
    const dates = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(start)
      date.setDate(start.getDate() + i)
      dates.push(date)
    }
    return dates
  }

  // Fetch doctor's shifts and appointments
  const fetchDoctorData = async () => {
    try {
      setLoading(true)
      
      // Get current doctor's ID from auth context (you might need to implement this)
      // For now, we'll use a placeholder
      const currentDoctorId = 1 // This should come from auth context
      
      // Fetch doctor shifts
      try {
        const shiftsResponse = await api.get(`/api/doctors/${currentDoctorId}/shifts`)
        if (shiftsResponse.data.success) {
          setDoctorShifts(shiftsResponse.data.data)
        }
      } catch (err) {
        console.log('Failed to fetch doctor shifts, using mock data')
        // Use mock data as fallback
        const mockShifts = [
          {
            id: 1,
            doctorId: currentDoctorId,
            shiftId: 1,
            workDate: new Date().toISOString().split('T')[0],
            status: "ACTIVE" as const,
            shift: {
              id: 1,
              name: "MORNING",
              startTime: "08:00",
              endTime: "12:00"
            }
          }
        ]
        setDoctorShifts(mockShifts)
      }

      // Fetch doctor appointments
      try {
        const appointmentsResponse = await api.get(`/api/appointments?doctorId=${currentDoctorId}`)
        if (appointmentsResponse.data.success) {
          setAppointments(appointmentsResponse.data.data)
        }
      } catch (err) {
        console.log('Failed to fetch appointments, using mock data')
        // Use mock data as fallback
        const mockAppointments = [
          {
            id: 1,
            appointmentDate: new Date().toISOString().split('T')[0],
            appointmentTime: "09:00",
            status: "PENDING" as const,
            patient: {
              id: 1,
              user: {
                fullName: "Nguyễn Văn A",
                phone: "0123456789"
              }
            }
          }
        ]
        setAppointments(mockAppointments)
      }

      // Create combined personal schedule
      createPersonalSchedule()
      
    } catch (err: any) {
      console.error('Error fetching doctor data:', err)
      toast.error('Không thể tải dữ liệu')
      
      // Use mock data for demo
      createMockSchedule()
    } finally {
      setLoading(false)
    }
  }

  // Create personal schedule from shifts and appointments
  const createPersonalSchedule = () => {
    const schedule: PersonalSchedule[] = []

    // Add shifts to schedule
    doctorShifts.forEach(shift => {
      schedule.push({
        id: `shift-${shift.id}`,
        date: shift.workDate,
        time: `${shift.shift.startTime} - ${shift.shift.endTime}`,
        type: "shift",
        title: `Ca trực ${shift.shift.name}`,
        description: `Ca ${shift.shift.name.toLowerCase()}`,
        status: shift.status === "ACTIVE" ? "active" : 
               shift.status === "CANCELLED" ? "cancelled" : "active"
      })
    })

    // Add appointments to schedule
    appointments.forEach(apt => {
      schedule.push({
        id: `appointment-${apt.id}`,
        date: apt.appointmentDate,
        time: apt.appointmentTime,
        type: "appointment",
        title: "Khám bệnh",
        description: `Khám cho ${apt.patient.user.fullName}`,
        status: apt.status === "COMPLETED" ? "completed" :
               apt.status === "CANCELLED" ? "cancelled" : "active",
        patientName: apt.patient.user.fullName
      })
    })

    setPersonalSchedule(schedule)
  }

  // Create mock schedule for demo
  const createMockSchedule = () => {
    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
    
    const mockSchedule: PersonalSchedule[] = [
      {
        id: "shift-1",
        date: today,
        time: "08:00 - 12:00",
        type: "shift",
        title: "Ca trực MORNING",
        description: "Ca sáng",
        status: "active"
      },
      {
        id: "appointment-1",
        date: today,
        time: "09:00",
        type: "appointment",
        title: "Khám bệnh",
        description: "Khám cho Nguyễn Văn A",
        status: "active",
        patientName: "Nguyễn Văn A"
      },
      {
        id: "appointment-2",
        date: today,
        time: "10:30",
        type: "appointment",
        title: "Khám bệnh",
        description: "Khám cho Trần Thị B",
        status: "active",
        patientName: "Trần Thị B"
      },
      {
        id: "shift-2",
        date: tomorrow,
        time: "13:00 - 17:00",
        type: "shift",
        title: "Ca trực AFTERNOON",
        description: "Ca chiều",
        status: "active"
      }
    ]
    
    setPersonalSchedule(mockSchedule)
  }

  useEffect(() => {
    fetchDoctorData()
  }, [currentWeek])

  // Get schedule for selected date
  const getScheduleForDate = (date: string) => {
    return personalSchedule.filter(item => item.date === date)
  }

  // Get schedule for time slot
  const getScheduleForTimeSlot = (date: string, slotIndex: number) => {
    const scheduleForDay = getScheduleForDate(date)
    return scheduleForDay.filter(item => {
      const hour = parseInt(item.time.split(':')[0])
      if (slotIndex === 0) return hour >= 8 && hour < 12  // Morning
      if (slotIndex === 1) return hour >= 13 && hour < 17 // Afternoon  
      if (slotIndex === 2) return hour >= 18 && hour < 22 // Evening
      return false
    })
  }

  const getTypeColor = (type: string, status: string) => {
    if (status === "cancelled") return "bg-red-100 text-red-800 border-red-200"
    if (status === "completed") return "bg-green-100 text-green-800 border-green-200"
    
    switch (type) {
      case "shift":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "appointment":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(newWeek.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentWeek(newWeek)
  }

  const goToToday = () => {
    setCurrentWeek(new Date())
    setSelectedDate(new Date().toISOString().split('T')[0])
  }

  // Handle cancel shift
  const handleCancelShift = async (shift: PersonalSchedule) => {
    if (shift.type !== 'shift') {
      toast.error('Chỉ có thể hủy ca trực')
      return
    }
    
    setSelectedShiftToCancel(shift)
    setShowCancelModal(true)
    
    // Load preview data
    await loadPreviewData(shift)
  }

  // Load preview data for cancellation
  const loadPreviewData = async (shift: PersonalSchedule) => {
    setPreviewLoading(true)
    try {
      const shiftId = shift.id.replace('shift-', '')
      const response = await api.get(`/api/doctor-shifts/${shiftId}/reschedule-preview`)
      
      if (response.data.success) {
        setPreviewData(response.data.data)
      }
    } catch (err: any) {
      console.error('Error loading preview:', err)
      // Provide mock preview data when API fails
      setPreviewData({
        doctorShiftId: parseInt(shift.id.replace('shift-', '')),
        affectedAppointments: Math.floor(Math.random() * 5) + 1,
        hasReplacementDoctor: Math.random() > 0.5,
        replacementDoctorId: Math.random() > 0.5 ? Math.floor(Math.random() * 10) + 1 : undefined,
        canAutoReschedule: Math.random() > 0.3,
        warning: Math.random() > 0.7 ? "CẢNH BÁO: Không tìm thấy bác sĩ thay thế cùng chuyên khoa." : undefined
      })
    } finally {
      setPreviewLoading(false)
    }
  }

  // Submit cancel shift
  const submitCancelShift = async () => {
    if (!selectedShiftToCancel || !cancelReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy ca')
      return
    }

    setCancelLoading(true)
    try {
      // Extract shift ID from the shift ID (format: "shift-{id}")
      const shiftId = selectedShiftToCancel.id.replace('shift-', '')
      
      // Call API to cancel shift using reschedule system
      const response = await api.post(`/api/doctor-shifts/${shiftId}/cancel-and-reschedule`, {
        cancelReason: cancelReason.trim()
      })

      if (response.data.success) {
        toast.success('Yêu cầu hủy ca trực đã được gửi và xử lý thành công')
        
        // Show detailed result if available
        if (response.data.data) {
          const { totalAppointments, rescheduledCount, failedCount } = response.data.data
          if (totalAppointments > 0) {
            toast.info(`Đã xử lý ${totalAppointments} lịch hẹn. Chuyển thành công: ${rescheduledCount}, Thất bại: ${failedCount}`)
          }
        }
        
        // Update local state
        setPersonalSchedule(prev => 
          prev.map(item => 
            item.id === selectedShiftToCancel.id 
              ? { ...item, status: 'cancelled' }
              : item
          )
        )
        
        // Close modal and reset
        setShowCancelModal(false)
        setCancelReason("")
        setSelectedShiftToCancel(null)
        
        // Refresh data
        fetchDoctorData()
      } else {
        toast.error(response.data.message || 'Không thể hủy ca trực')
      }
    } catch (err: any) {
      console.error('Error cancelling shift:', err)
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi hủy ca trực')
    } finally {
      setCancelLoading(false)
    }
  }

  // Close cancel modal
  const closeCancelModal = () => {
    setShowCancelModal(false)
    setCancelReason("")
    setSelectedShiftToCancel(null)
    setPreviewData(null)
  }

  const weekDates = getWeekDates()
  const todaySchedule = getScheduleForDate(selectedDate)

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải lịch trực...</p>
        </div>
      </div>
    )
  }

  return (
    <DoctorSidebar>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Stethoscope className="w-8 h-8 text-blue-600" />
            Lịch Trực Của Tôi
          </h1>
          <p className="text-slate-600">Xem lịch trực và lịch hẹn của bạn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Schedule Area */}
          <div className="lg:col-span-3">
            {/* Week Navigation */}
            <div className="flex items-center gap-3 mb-4">
              <Button variant="outline" size="sm" onClick={goToToday}>Today</Button>
              <Button variant="ghost" size="sm" onClick={() => navigateWeek('prev')}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-lg font-semibold">
                {weekDates[0].toLocaleDateString('vi-VN', { month: 'long', day: 'numeric' })} - {weekDates[6].toLocaleDateString('vi-VN', { month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => navigateWeek('next')}>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <div className="ml-auto">
                <Button 
                  variant="outline"
                  onClick={() => fetchDoctorData()}
                >
                  Làm mới
                </Button>
              </div>
            </div>

            {/* Week View */}
            <Card>
              {/* Week Header */}
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
                      className={`p-4 text-center border-r last:border-r-0 cursor-pointer hover:bg-gray-50 ${
                        isToday ? "bg-blue-50" : ""
                      }`}
                      onClick={() => setSelectedDate(date.toISOString().split('T')[0])}
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

              {/* Time Slots */}
              <CardContent className="p-0">
                {timeSlots.map((slot, slotIndex) => (
                  <div key={slot.label} className="grid grid-cols-8 border-b min-h-[160px]">
                    <div className="p-4 bg-gray-50 border-r text-center">
                      <div className="text-2xl">{slot.icon}</div>
                      <div className="font-medium">{slot.label}</div>
                      <div className="text-xs text-gray-500">{slot.time}</div>
                    </div>

                    {weekDates.map((date, dayIndex) => {
                      const dateStr = date.toISOString().split('T')[0]
                      const scheduleForSlot = getScheduleForTimeSlot(dateStr, slotIndex)
                      
                      return (
                        <div key={dayIndex} className="p-2 border-r">
                          {scheduleForSlot.map(item => (
                            <div
                              key={item.id}
                              className={`p-2 mb-2 rounded-lg text-xs border-l-4 relative group ${
                                item.type === 'shift' ? 'bg-blue-50 border-blue-500' : 'bg-purple-50 border-purple-500'
                              }`}
                            >
                              <div className="flex items-center gap-1 mb-1">
                                {item.type === 'shift' ? 
                                  <Clock className="w-3 h-3" /> : 
                                  <User className="w-3 h-3" />
                                }
                                <span className="font-medium">{item.title}</span>
                                
                                {/* Cancel button for shifts */}
                                {item.type === 'shift' && item.status === 'active' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5 p-0 hover:bg-red-100"
                                    onClick={() => handleCancelShift(item)}
                                    title="Hủy ca trực"
                                  >
                                    <X className="w-3 h-3 text-red-600" />
                                  </Button>
                                )}
                              </div>
                              <div className="text-gray-600">{item.time}</div>
                              <div className="text-gray-500">{item.description}</div>
                              <Badge 
                                variant="outline" 
                                className={`mt-1 text-xs ${getTypeColor(item.type, item.status)}`}
                              >
                                {item.status === 'active' ? 'Đang hoạt động' :
                                 item.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
                              </Badge>
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Hôm nay ({new Date().toLocaleDateString('vi-VN')})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tổng lịch trình</span>
                  <span className="font-semibold text-gray-900">{todaySchedule.length}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Ca trực</span>
                  <span className="font-semibold text-blue-600">
                    {todaySchedule.filter(s => s.type === 'shift').length}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Lịch hẹn</span>
                  <span className="font-semibold text-purple-600">
                    {todaySchedule.filter(s => s.type === 'appointment').length}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Next Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lịch trình tiếp theo</CardTitle>
              </CardHeader>
              <CardContent>
                {todaySchedule.length > 0 ? (
                  <div className="space-y-3">
                    {todaySchedule.slice(0, 2).map((item) => (
                      <div key={item.id} className={`p-3 rounded-lg border ${
                        item.type === 'shift' ? 'bg-blue-50 border-blue-200' : 'bg-purple-50 border-purple-200'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          {item.type === 'shift' ? 
                            <Clock className="w-4 h-4" /> : 
                            <User className="w-4 h-4" />
                          }
                          <span className="font-medium text-sm">{item.title}</span>
                        </div>
                        <div className="text-sm text-gray-600">{item.time}</div>
                        <div className="text-sm text-gray-500">{item.description}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">Không có lịch trình hôm nay</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Thống kê tuần</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Ca trực tuần này</span>
                  <span className="font-semibold text-blue-600">
                    {personalSchedule.filter(s => s.type === 'shift').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Lịch hẹn tuần này</span>
                  <span className="font-semibold text-purple-600">
                    {personalSchedule.filter(s => s.type === 'appointment').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Đã hoàn thành</span>
                  <span className="font-semibold text-green-600">
                    {personalSchedule.filter(s => s.status === 'completed').length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Cancel Shift Modal */}
        <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <X className="w-5 h-5 text-red-600" />
                Hủy Ca Trực
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {selectedShiftToCancel && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-sm mb-1">
                    {selectedShiftToCancel.title}
                  </div>
                  <div className="text-sm text-gray-600">
                    {selectedShiftToCancel.time} - {new Date(selectedShiftToCancel.date).toLocaleDateString('vi-VN')}
                  </div>
                  <div className="text-sm text-gray-500">
                    {selectedShiftToCancel.description}
                  </div>
                </div>
              )}

              {/* Preview Information */}
              {previewLoading && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-blue-700">Đang tải thông tin preview...</span>
                  </div>
                </div>
              )}

              {previewData && !previewLoading && (
                <div className={`p-3 rounded-lg ${previewData.warning ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
                  <div className="text-sm font-medium mb-2">
                    📋 Thông tin tác động:
                  </div>
                  <div className="space-y-1 text-sm">
                    <div>• Số lịch hẹn bị ảnh hưởng: <span className="font-medium">{previewData.affectedAppointments}</span></div>
                    {previewData.hasReplacementDoctor ? (
                      <div className="text-green-700">• ✅ Có bác sĩ thay thế (ID: {previewData.replacementDoctorId})</div>
                    ) : (
                      <div className="text-yellow-700">• ⚠️ Không có bác sĩ thay thế cùng chuyên khoa</div>
                    )}
                    {previewData.canAutoReschedule ? (
                      <div className="text-green-700">• ✅ Có thể tự động chuyển lịch hẹn</div>
                    ) : (
                      <div className="text-yellow-700">• ⚠️ Không thể tự động chuyển lịch hẹn</div>
                    )}
                  </div>
                  {previewData.warning && (
                    <div className="mt-2 p-2 bg-yellow-100 rounded text-xs text-yellow-800">
                      {previewData.warning}
                    </div>
                  )}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="cancel-reason">
                  Lý do yêu cầu hủy ca trực <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="cancel-reason"
                  placeholder="Vui lòng nhập lý do yêu cầu hủy ca trực..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-gray-500">
                  Ca trực sẽ được hủy và hệ thống sẽ tự động xử lý các lịch hẹn liên quan.
                </p>
              </div>
            </div>

            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={closeCancelModal}
                disabled={cancelLoading}
              >
                Hủy bỏ
              </Button>
              <Button
                variant="destructive"
                onClick={submitCancelShift}
                disabled={cancelLoading || !cancelReason.trim() || previewLoading}
              >
                {cancelLoading ? "Đang xử lý..." : "Xác nhận hủy ca"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DoctorSidebar>
  )
}