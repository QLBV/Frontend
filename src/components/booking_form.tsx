"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Clock, Search, User, CheckCircle2, Stethoscope, FileText, Mail, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { SpecialtyService, type Specialty, type Doctor } from "@/services/specialty.service"
import { ShiftService, type Shift, type DoctorWithShifts } from "@/services/shift.service"
import { createAppointment } from "@/services/appointment.service"
import { useAuth } from "@/auth/authContext"

export function BookingForm() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  
  // API Data States
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [doctorsWithShifts, setDoctorsWithShifts] = useState<DoctorWithShifts[]>([])
  const [isLoadingSpecialties, setIsLoadingSpecialties] = useState(false)
  const [isLoadingDoctorsByDate, setIsLoadingDoctorsByDate] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedDoctorShifts, setSelectedDoctorShifts] = useState<any[]>([])

  // Form States
  const [selectedSpecialty, setSelectedSpecialty] = useState<number | null>(null)
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null)
  const [selectedShift, setSelectedShift] = useState<number | null>(null)
  const [date, setDate] = useState<Date>()
  const [step, setStep] = useState(1)
  
  // Patient Info States
  const [patientName, setPatientName] = useState("")
  const [patientPhone, setPatientPhone] = useState("")
  const [patientEmail, setPatientEmail] = useState("")
  const [symptoms, setSymptoms] = useState("")
  
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Fetch specialties on mount
  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'booking_form.tsx:52',message:'Fetching specialties',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'C'})}).catch(()=>{});
        // #endregion

        setIsLoadingSpecialties(true)
        const data = await SpecialtyService.getSpecialties()
        setSpecialties(data)

        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'booking_form.tsx:59',message:'Specialties fetched',data:{count:data.length},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
      } catch (error: any) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'booking_form.tsx:64',message:'Error fetching specialties',data:{error:error.message},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'C'})}).catch(()=>{});
        // #endregion

        console.error("Error fetching specialties:", error)
        toast.error("Không thể tải danh sách chuyên khoa")
      } finally {
        setIsLoadingSpecialties(false)
      }
    }
    fetchSpecialties()
  }, [])

  // Fetch doctors by date when date and specialty are selected (NEW FLOW)
  useEffect(() => {
    const fetchDoctorsByDate = async () => {
      if (!date || !selectedSpecialty) {
        setDoctorsWithShifts([])
        return
      }

      try {
        setIsLoadingDoctorsByDate(true)
        const formattedDate = format(date, "yyyy-MM-dd")
        const data = await ShiftService.getDoctorsByDate(
          formattedDate,
          selectedSpecialty
        )
        setDoctorsWithShifts(data)

        // Reset selections
        setSelectedDoctor(null)
        setSelectedShift(null)
        setSelectedDoctorShifts([])
      } catch (error: any) {
        console.error("Error fetching doctors by date:", error)
        toast.error("Không thể tải danh sách bác sĩ cho ngày này")
        setDoctorsWithShifts([])
      } finally {
        setIsLoadingDoctorsByDate(false)
      }
    }

    fetchDoctorsByDate()
  }, [date, selectedSpecialty])

  // Shifts are now loaded from selectedDoctorShifts (no separate fetch needed)

  const handleDoctorClick = (doctorId: number) => {
    if (selectedDoctor === doctorId) {
      setSelectedDoctor(null)
      setSelectedShift(null)
      setSelectedDoctorShifts([])
    } else {
      setSelectedDoctor(doctorId)
      setSelectedShift(null)

      // Lấy shifts của doctor này
      const doctorData = doctorsWithShifts.find((d) => d.doctor.id === doctorId)
      if (doctorData) {
        setSelectedDoctorShifts(doctorData.shifts)
        setStep(4) // Move to shift selection
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'booking_form.tsx:176',message:'SUBMIT_CHECK_PATIENT_ID',data:{isAuthenticated,hasUser:!!user,patientId:user?.patientId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
    // #endregion

    // Check if user is authenticated and has patientId
    if (isAuthenticated && user) {
      if (!user.patientId) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'booking_form.tsx:183',message:'SUBMIT_REDIRECT_TO_SETUP',data:{reason:'no_patient_id'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
        // #endregion
        toast.error("Vui lòng thiết lập hồ sơ bệnh nhân trước khi đặt lịch")
        navigate("/patient/setup")
        return
      }
    }

    if (!selectedDoctor || !selectedShift || !date || !patientName || !patientPhone) {
      toast.error("Vui lòng điền đầy đủ thông tin")
      return
    }

    try {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'booking_form.tsx:152',message:'Creating appointment',data:{doctorId:selectedDoctor,shiftId:selectedShift,date:format(date,'yyyy-MM-dd')},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'C'})}).catch(()=>{});
      // #endregion

      setIsSubmitting(true)
      await createAppointment({
        doctorId: selectedDoctor,
        shiftId: selectedShift,
        date: format(date, "yyyy-MM-dd"),
        symptomInitial: symptoms || undefined,
      })

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'booking_form.tsx:163',message:'Appointment created successfully',data:{doctorId:selectedDoctor},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'C'})}).catch(()=>{});
      // #endregion

      toast.success("Đặt lịch hẹn thành công!")
      setIsSubmitted(true)
    } catch (error: any) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'booking_form.tsx:170',message:'Error creating appointment',data:{error:error.message,response:error.response?.data},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'C'})}).catch(()=>{});
      // #endregion

      console.error("Error creating appointment:", error)
      toast.error(error.response?.data?.message || "Không thể đặt lịch hẹn. Vui lòng thử lại.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-12 pb-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-4">Đặt lịch hẹn thành công!</h2>
          <p className="text-muted-foreground mb-8 text-lg">Lịch hẹn của bạn đã được đặt thành công.</p>
          <div className="bg-muted/50 rounded-lg p-6 mb-8 text-left max-w-md mx-auto">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Bác sĩ</p>
                    <p className="font-semibold">
                      {doctorsWithShifts.find((d) => d.doctor.id === selectedDoctor)?.doctor.user?.fullName || "N/A"}
                    </p>
                  </div>
              </div>
              <div className="flex items-start gap-3">
                <CalendarIcon className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Ngày</p>
                  <p className="font-semibold">{date && format(date, "PPP")}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Ca khám</p>
                    <p className="font-semibold">
                      {selectedDoctorShifts.find(s => s.shift.id === selectedShift)?.shift.name || "N/A"}
                      {selectedShift && selectedDoctorShifts.find(s => s.shift.id === selectedShift) && (
                        <span className="text-xs font-normal ml-2 opacity-75">
                          ({selectedDoctorShifts.find(s => s.shift.id === selectedShift)?.shift.startTime} - {selectedDoctorShifts.find(s => s.shift.id === selectedShift)?.shift.endTime})
                        </span>
                      )}
                    </p>
                </div>
              </div>
              
              {/* Chỉ hiện Email nếu người dùng có nhập */}
              {patientEmail && (
                <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-semibold">{patientEmail}</p>
                    </div>
                </div>
              )}
              
              {symptoms && (
                <div className="flex items-start gap-3 border-t border-border/50 pt-3 mt-3">
                    <FileText className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                    <p className="text-sm text-muted-foreground">Triệu chứng</p>
                    <p className="font-semibold text-sm">{symptoms}</p>
                    </div>
                </div>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Xác nhận đã được gửi đến số điện thoại: {patientPhone}
            {patientEmail && ` và email: ${patientEmail}`}.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/patient/dashboard">
              <Button variant="outline" size="lg">
                Về trang chủ
              </Button>
            </Link>
            <Link to="/patient/appointments">
              <Button size="lg">
                Xem lịch hẹn của tôi
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid md:grid-cols-3 gap-6">
        {/* Step 1: Select Specialty */}
        <Card className={cn("md:col-span-1", step < 1 && "opacity-60")}>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                1
              </div>
              <CardTitle>Chọn Chuyên Khoa</CardTitle>
            </div>
            <CardDescription>Chọn chuyên khoa bạn muốn khám</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingSpecialties ? (
              <div className="text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                <p className="text-sm text-muted-foreground mt-2">Đang tải chuyên khoa...</p>
              </div>
            ) : specialties.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>Không có chuyên khoa nào.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {specialties.map((specialty) => (
                  <button
                    key={specialty.id}
                    type="button"
                    onClick={() => {
                      setSelectedSpecialty(selectedSpecialty === specialty.id ? null : specialty.id)
                      setSelectedDoctor(null)
                      setDate(undefined)
                      setSelectedShift(null)
                      setDoctorsWithShifts([])
                      setStep(1)
                    }}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-lg border-2 transition-all hover:border-primary/50 text-left",
                      selectedSpecialty === specialty.id ? "border-primary bg-primary/5" : "border-border bg-card",
                    )}
                  >
                    <Stethoscope className="h-6 w-6 text-primary" />
                    <span className="text-sm font-medium">{specialty.name}</span>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 2: Select Date */}
        <Card className={cn("md:col-span-1", step < 2 && "opacity-60")}>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                2
              </div>
              <CardTitle>Chọn Ngày Khám</CardTitle>
            </div>
            <CardDescription>Chọn ngày bạn muốn đặt lịch</CardDescription>
          </CardHeader>
          <CardContent>
            <Label className="mb-3 block">Chọn Ngày</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                  disabled={!selectedSpecialty}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Chọn ngày"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => {
                    setDate(newDate)
                    setSelectedDoctor(null)
                    setSelectedShift(null)
                    if (newDate) setStep(3)
                  }}
                  disabled={(calendarDate) =>
                    calendarDate < new Date() ||
                    calendarDate < new Date("1900-01-01")
                  }
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {!selectedSpecialty && (
              <p className="text-sm text-muted-foreground mt-2">
                Vui lòng chọn chuyên khoa trước
              </p>
            )}
          </CardContent>
        </Card>

        {/* Step 3: Select Doctor */}
        <Card className={cn("md:col-span-2", step < 3 && "opacity-60")}>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                3
              </div>
              <CardTitle>Chọn Bác Sĩ</CardTitle>
            </div>
            <CardDescription>
              Bác sĩ có lịch làm việc ngày {date && format(date, "PPP")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!date ? (
              <div className="text-center py-8 text-muted-foreground">
                <Stethoscope className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Vui lòng chọn ngày khám trước</p>
              </div>
            ) : isLoadingDoctorsByDate ? (
              <div className="text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                <p className="text-sm text-muted-foreground mt-2">
                  Đang tải danh sách bác sĩ...
                </p>
              </div>
            ) : doctorsWithShifts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Stethoscope className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Không có bác sĩ nào làm việc trong ngày này.</p>
                <p className="text-sm mt-1">Vui lòng chọn ngày khác.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {doctorsWithShifts.map(({ doctor, shifts, shiftCount }) => (
                  <button
                    key={doctor.id}
                    type="button"
                    onClick={() => handleDoctorClick(doctor.id)}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-lg border-2 transition-all hover:border-primary/50 text-left",
                      selectedDoctor === doctor.id
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card"
                    )}
                  >
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                      <User className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">
                        {doctor.user?.fullName}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {doctor.specialty?.name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {shiftCount} ca làm việc trong ngày
                      </p>
                    </div>
                    {selectedDoctor === doctor.id && (
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 4: Select Shift */}
        <Card className={cn("md:col-span-1", step < 4 && "opacity-60")}>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                4
              </div>
              <CardTitle>Chọn Ca Khám</CardTitle>
            </div>
            <CardDescription>Ca làm việc của bác sĩ</CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedDoctor ? (
              <p className="text-sm text-muted-foreground">
                Vui lòng chọn bác sĩ trước
              </p>
            ) : selectedDoctorShifts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Bác sĩ không có ca trực
              </p>
            ) : (
              <div className="grid gap-2">
                {selectedDoctorShifts.map((shiftData) => (
                  <button
                    key={shiftData.doctorShiftId}
                    type="button"
                    onClick={() => {
                      setSelectedShift(shiftData.shift.id)
                      setStep(5)
                    }}
                    className={cn(
                      "p-3 rounded-lg border-2 text-sm font-medium transition-all text-left",
                      selectedShift === shiftData.shift.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card hover:border-primary/50"
                    )}
                  >
                    <div className="font-semibold">{shiftData.shift.name}</div>
                    <div className="text-xs opacity-90">
                      {shiftData.shift.startTime} - {shiftData.shift.endTime}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 5: Patient Information */}
        <Card className={cn("md:col-span-3", step < 5 && "opacity-60")}>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                5
              </div>
              <CardTitle>Patient Information</CardTitle>
            </div>
            <CardDescription>Provide your contact details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl">
              <div>
                <Label htmlFor="name" className="mb-2 block">
                  Full Name
                </Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  disabled={!selectedShift}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone" className="mb-2 block">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  disabled={!selectedShift}
                  required
                />
              </div>

              {/* Email - Optional */}
              <div className="md:col-span-2">
                <Label htmlFor="email" className="mb-2 block">
                  Email Address (Optional)
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address (optional)"
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  disabled={!selectedShift}
                />
              </div>
              
              {/* Symptoms - Optional */}
              <div className="md:col-span-2">
                <Label htmlFor="symptoms" className="mb-2 block">
                  Describe Symptoms (Optional)
                </Label>
                <Textarea
                  id="symptoms"
                  placeholder="Briefly describe your symptoms or reason for visit..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  disabled={!selectedShift}
                  className="min-h-[100px]"
                />
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <Button
                type="submit"
                size="lg"
                className="px-8"
                disabled={!selectedDoctor || !date || !selectedShift || !patientName || !patientPhone || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Confirm Appointment"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => {
                  setSelectedSpecialty(null)
                  setSelectedDoctor(null)
                  setDate(undefined)
                  setSelectedShift(null)
                  setDoctorsWithShifts([])
                  setSelectedDoctorShifts([])
                  setPatientName("")
                  setPatientPhone("")
                  setPatientEmail("")
                  setSymptoms("")
                  setStep(1)
                }}
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  )
}