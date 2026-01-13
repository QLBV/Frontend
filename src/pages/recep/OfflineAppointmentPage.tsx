"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import ReceptionistSidebar from "@/components/sidebar/recep"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { 
  ArrowLeft, 
  CalendarIcon, 
  Loader2, 
  CheckCircle2, 
  User, 
  CalendarDays,
  Stethoscope,
  FileText
} from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  createOfflineAppointment,
  type CreateAppointmentData,
} from "@/services/appointment.service"
import { createPatient } from "@/services/patient.service"
import api from "@/lib/api"

import { Input } from "@/components/ui/input"

interface Doctor {
  id: number
  user: {
    fullName: string
  }
  specialty?: {
    id: number
    name: string
  }
}

interface Shift {
  id: number
  name: string
  startTime: string
  endTime: string
}



export default function OfflineAppointmentPage() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [createdAppointment, setCreatedAppointment] = useState<any>(null)

  const [patientId, setPatientId] = useState<number | null>(null)
  const [doctorId, setDoctorId] = useState<number | null>(null)
  const [shiftId, setShiftId] = useState<number | null>(null)
  const [date, setDate] = useState<Date>()
  const [symptomInitial, setSymptomInitial] = useState("")

  // Options
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false)
  const [isLoadingShifts, setIsLoadingShifts] = useState(false)

  // Patient Form
  const [patientForm, setPatientForm] = useState({
    fullName: "",
    gender: "MALE" as "MALE" | "FEMALE" | "OTHER",
    dateOfBirth: "",
    phone: "",
    email: "",
    address: ""
  })

  // Fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setIsLoadingDoctors(true)
        const response = await api.get("/doctors")
        if (response.data.success) {
          setDoctors(response.data.data || [])
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Không thể tải danh sách bác sĩ")
      } finally {
        setIsLoadingDoctors(false)
      }
    }
    fetchDoctors()
  }, [])

  // Fetch shifts
  useEffect(() => {
    const fetchShifts = async () => {
      try {
        setIsLoadingShifts(true)
        const response = await api.get("/shifts")
        if (response.data.success) {
          setShifts(response.data.data || [])
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Không thể tải danh sách ca trực")
      } finally {
        setIsLoadingShifts(false)
      }
    }
    fetchShifts()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!doctorId || !shiftId || !date) {
      toast.error("Vui lòng chọn bác sĩ, ngày và ca khám")
      return
    }
    
    // Validate Patient Info
    if (!patientForm.fullName || !patientForm.dateOfBirth || !patientForm.phone) {
        toast.error("Vui lòng nhập họ tên, ngày sinh và số điện thoại bệnh nhân")
        return
    }

    setIsSubmitting(true)
    try {
      // 1. Create Patient
      const profiles: any[] = []
      if (patientForm.phone) profiles.push({ type: "phone", value: patientForm.phone })
      if (patientForm.email) profiles.push({ type: "email", value: patientForm.email })
      if (patientForm.address) profiles.push({ type: "address", value: patientForm.address })

      const newPatient = await createPatient({
        fullName: patientForm.fullName,
        gender: patientForm.gender,
        dateOfBirth: patientForm.dateOfBirth,
        cccd: "", // CCCD optional now
        profiles
      })

      if (!newPatient || !newPatient.id) {
          throw new Error("Không thể tạo hồ sơ bệnh nhân")
      }

      // 2. Create Appointment
      const appointmentData: CreateAppointmentData & { patientId: number } = {
        patientId: newPatient.id,
        doctorId,
        shiftId,
        date: format(date, "yyyy-MM-dd"),
        symptomInitial: symptomInitial || undefined,
      }
      const result = await createOfflineAppointment(appointmentData)
      setCreatedAppointment(result)
      setPatientId(newPatient.id) // For success screen
      setIsSuccess(true)
      toast.success("Đặt lịch hẹn và tạo hồ sơ thành công!")
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Đã có lỗi xảy ra")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <ReceptionistSidebar>
        <div className="min-h-[85vh] flex items-center justify-center p-6 bg-slate-50/30">
          <Card className="w-full max-w-lg border-0 shadow-2xl rounded-3xl overflow-hidden bg-white ring-1 ring-slate-100 animate-in fade-in zoom-in duration-500">
            <div className="bg-indigo-600 p-8 text-center text-white">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-1">Đặt lịch thành công</h2>
              <p className="text-indigo-100 font-medium text-sm opacity-90">Mã lịch hẹn: {createdAppointment?.appointmentCode}</p>
            </div>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm font-medium">
                <div className="space-y-1">
                  <p className="text-slate-400">Bệnh nhân</p>
                  <p className="text-slate-900 font-bold">{patientForm.fullName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400">Bác sĩ</p>
                  <p className="text-slate-900 font-bold">BS. {doctors.find(d => d.id === doctorId)?.user?.fullName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400">Thời gian</p>
                  <p className="text-slate-900 font-bold">{date && format(date, "dd/MM/yyyy")}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400">Ca khám</p>
                  <p className="text-indigo-600 font-bold">{shifts.find(s => s.id === shiftId)?.name}</p>
                </div>
              </div>

              {createdAppointment?.slotNumber && (
                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Số thứ tự</p>
                    <p className="text-2xl font-black text-indigo-600">#{createdAppointment.slotNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Dự kiến</p>
                    <p className="text-lg font-bold text-indigo-900">
                      {(() => {
                        const s = shifts.find(s => s.id === shiftId);
                        if (s) {
                          const [h, m] = s.startTime.split(':').map(Number);
                          const d = new Date();
                          d.setHours(h);
                          d.setMinutes(m + (createdAppointment.slotNumber - 1) * 10);
                          return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                        }
                        return "--:--";
                      })()}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2 pt-2">
                <Button className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold text-white shadow-lg" onClick={() => navigate("/recep/appointments")}>
                  Quản lý lịch hẹn
                </Button>
                <Button variant="ghost" className="w-full h-12 font-bold text-slate-500 hover:bg-slate-50" onClick={() => {
                  setIsSuccess(false)
                  setPatientId(null)
                  setDoctorId(null)
                  setShiftId(null)
                  setDate(undefined)
                  setSymptomInitial("")
                  setPatientForm({
                    fullName: "",
                    gender: "MALE",
                    dateOfBirth: "",
                    phone: "",
                    email: "",
                    address: ""
                  })
                }}>
                  Tiếp tục đặt lịch mới
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </ReceptionistSidebar>
    )
  }

  return (
    <ReceptionistSidebar>
      <div className="min-h-screen bg-slate-50/50 pb-12">
        <div className="container mx-auto px-6 py-8 max-w-[800px]">
          

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 ring-1 ring-white/50">
                  <CalendarDays className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Đặt lịch hẹn trực tiếp</h1>
                <p className="text-slate-500 text-sm font-medium">Nhập thông tin bệnh nhân để xếp lịch khám tại quầy</p>
              </div>
            </div>
            <Button variant="outline" className="rounded-xl border-slate-200 text-slate-600 font-bold" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
            </Button>
          </div>

          <Card className="border-0 shadow-sm rounded-2xl bg-white ring-1 ring-slate-200 overflow-hidden">
            <CardHeader className="px-8 py-6 border-b border-slate-50">
              <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-indigo-600" /> THÔNG TIN ĐĂNG KÝ
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Patient Selection */}
                  {/* Patient Info Form */}
                  <div className="space-y-4 md:col-span-2 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                        <User className="w-5 h-5 text-indigo-600" />
                        <h3 className="font-bold text-slate-700">THÔNG TIN BỆNH NHÂN</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5 is-required">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Họ và tên *</Label>
                            <Input 
                                value={patientForm.fullName} 
                                onChange={e => setPatientForm({...patientForm, fullName: e.target.value})} 
                                className="h-11 rounded-xl bg-white border-slate-200 focus:ring-2 focus:ring-indigo-100 font-medium" 
                                placeholder="VD: NGUYEN VAN A"
                            />
                        </div>
                         <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Số điện thoại *</Label>
                            <Input 
                                value={patientForm.phone} 
                                onChange={e => setPatientForm({...patientForm, phone: e.target.value})} 
                                className="h-11 rounded-xl bg-white border-slate-200 focus:ring-2 focus:ring-indigo-100 font-medium" 
                                placeholder="0xxx xxx xxx"
                            />
                        </div>
                         <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ngày sinh *</Label>
                            <Input 
                                type="date"
                                value={patientForm.dateOfBirth} 
                                onChange={e => setPatientForm({...patientForm, dateOfBirth: e.target.value})} 
                                className="h-11 rounded-xl bg-white border-slate-200 focus:ring-2 focus:ring-indigo-100 font-medium" 
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Giới tính *</Label>
                            <Select value={patientForm.gender} onValueChange={v => setPatientForm({...patientForm, gender: v as any})}>
                                <SelectTrigger className="h-11 rounded-xl bg-white border-slate-200 focus:ring-2 focus:ring-indigo-100 font-medium">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="MALE">Nam</SelectItem>
                                    <SelectItem value="FEMALE">Nữ</SelectItem>
                                    <SelectItem value="OTHER">Khác</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Email (Tùy chọn)</Label>
                            <Input 
                                value={patientForm.email} 
                                onChange={e => setPatientForm({...patientForm, email: e.target.value})} 
                                className="h-11 rounded-xl bg-white border-slate-200 focus:ring-2 focus:ring-indigo-100 font-medium" 
                                placeholder="example@mail.com"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Địa chỉ</Label>
                            <Input 
                                value={patientForm.address} 
                                onChange={e => setPatientForm({...patientForm, address: e.target.value})} 
                                className="h-11 rounded-xl bg-white border-slate-200 focus:ring-2 focus:ring-indigo-100 font-medium" 
                                placeholder="Nhập địa chỉ..."
                            />
                        </div>
                    </div>
                  </div>
                </div>



                  {/* Doctor & Date Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                             <Stethoscope className="w-5 h-5 text-indigo-600" />
                             <h3 className="font-bold text-slate-700">BÁC SĨ KHÁM</h3>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {doctors.map((doc) => (
                                <div 
                                    key={doc.id}
                                    onClick={() => setDoctorId(doc.id)}
                                    className={cn(
                                        "flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all",
                                        doctorId === doc.id 
                                            ? "bg-indigo-50 border-indigo-500 shadow-sm ring-1 ring-indigo-500" 
                                            : "bg-white border-slate-200 hover:border-indigo-200 hover:shadow-sm"
                                    )}
                                >
                                    <div className={cn("h-10 w-10 rounded-full flex items-center justify-center font-bold text-lg", doctorId === doc.id ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500")}>
                                        {doc.user?.fullName?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className={cn("font-bold text-sm", doctorId === doc.id ? "text-indigo-900" : "text-slate-900")}>{doc.user?.fullName}</p>
                                        <p className="text-xs text-slate-500">{doc.specialty?.name || "Bác sĩ đa khoa"}</p>
                                    </div>
                                    {doctorId === doc.id && <CheckCircle2 className="ml-auto w-5 h-5 text-indigo-600" />}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                             <CalendarIcon className="w-5 h-5 text-indigo-600" />
                             <h3 className="font-bold text-slate-700">THỜI GIAN KHÁM</h3>
                        </div>
                         <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ngày khám *</Label>
                            <div className="relative">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant={"outline"} className={cn("w-full h-11 justify-start text-left font-medium rounded-xl border-slate-200", !date && "text-muted-foreground")}>
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date ? format(date, "dd/MM/yyyy") : <span>Chọn ngày</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                                        <Calendar mode="single" selected={date} onSelect={setDate} disabled={(d) => d < new Date(new Date().setHours(0,0,0,0))} initialFocus />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                             <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ca khám *</Label>
                             <div className="grid grid-cols-2 gap-2">
                                {shifts.map((shift) => (
                                    <div
                                        key={shift.id}
                                        onClick={() => setShiftId(shift.id)}
                                        className={cn(
                                            "flex flex-col items-center justify-center p-3 rounded-xl border cursor-pointer transition-all text-center",
                                            shiftId === shift.id 
                                                ? "bg-indigo-50 border-indigo-500 text-indigo-700 font-bold ring-1 ring-indigo-500" 
                                                : "bg-white border-slate-200 text-slate-600 hover:border-indigo-200"
                                        )}
                                    >
                                        <span className="text-sm">{shift.name}</span>
                                        <span className="text-[10px] opacity-80">{shift.startTime.slice(0,5)} - {shift.endTime.slice(0,5)}</span>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>
                  </div>

                  {/* Symptoms */}
                  <div className="space-y-4 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                     <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-5 h-5 text-indigo-600" />
                        <h3 className="font-bold text-slate-700">LÝ DO KHÁM</h3>
                    </div>
                     <Textarea 
                        value={symptomInitial} 
                        onChange={(e) => setSymptomInitial(e.target.value)} 
                        className="min-h-[100px] rounded-xl border-slate-200 bg-white focus:ring-2 focus:ring-indigo-100 font-medium resize-none" 
                        placeholder="Mô tả triệu chứng ban đầu của bệnh nhân..." 
                    />
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-slate-50">
                  <Button type="button" variant="ghost" onClick={() => navigate(-1)} className="flex-1 h-12 rounded-xl font-bold text-slate-500">Hủy</Button>
                  <Button type="submit" disabled={isSubmitting || !doctorId || !shiftId || !date} className="flex-[2] h-12 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold text-white shadow-lg transition-all gap-2">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "XÁC NHẬN ĐẶT LỊCH"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </ReceptionistSidebar>
    )
}
