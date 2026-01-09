"use client"

import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import ReceptionistSidebar from "@/components/sidebar/recep"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
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
import { ArrowLeft, CalendarIcon, Loader2, CheckCircle2 } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  createOfflineAppointment,
  type CreateAppointmentData,
} from "@/services/appointment.service"
import api from "@/lib/api"

interface Doctor {
  id: number
  fullName: string
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

interface Patient {
  id: number
  fullName: string
  patientCode: string
  phone?: string
}

export default function OfflineAppointmentPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Form data
  const [patientId, setPatientId] = useState<number | null>(null)
  const [doctorId, setDoctorId] = useState<number | null>(null)
  const [shiftId, setShiftId] = useState<number | null>(null)
  const [date, setDate] = useState<Date>()
  const [symptomInitial, setSymptomInitial] = useState("")

  // Options
  const [patients, setPatients] = useState<Patient[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [isLoadingPatients, setIsLoadingPatients] = useState(false)
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false)
  const [isLoadingShifts, setIsLoadingShifts] = useState(false)

  // Fetch patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setIsLoadingPatients(true)
        const response = await api.get("/patients?limit=100")
        if (response.data.success) {
          setPatients(response.data.data || [])
        }
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "Không thể tải danh sách bệnh nhân"
        )
      } finally {
        setIsLoadingPatients(false)
      }
    }
    fetchPatients()
  }, [])

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
        toast.error(
          error.response?.data?.message || "Không thể tải danh sách bác sĩ"
        )
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
        toast.error(
          error.response?.data?.message || "Không thể tải danh sách ca trực"
        )
      } finally {
        setIsLoadingShifts(false)
      }
    }
    fetchShifts()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!patientId || !doctorId || !shiftId || !date) {
      toast.error("Vui lòng điền đầy đủ thông tin")
      return
    }

    setIsSubmitting(true)
    try {
      const appointmentData: CreateAppointmentData & { patientId: number } = {
        patientId,
        doctorId,
        shiftId,
        date: format(date, "yyyy-MM-dd"),
        symptomInitial: symptomInitial || undefined,
      }

      await createOfflineAppointment(appointmentData)
      setIsSuccess(true)
      toast.success("Đặt lịch hẹn thành công!")
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Không thể đặt lịch hẹn"
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <ReceptionistSidebar>
        <div className="space-y-6">
          <Button variant="ghost" className="mb-2 pl-0" asChild>
            <Link to="/recep/patients">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Link>
          </Button>

          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-12 pb-12 text-center">
              <div className="flex justify-center mb-6">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-primary" />
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-4">Đặt lịch hẹn thành công!</h2>
              <p className="text-muted-foreground mb-8 text-lg">
                Lịch hẹn đã được tạo thành công.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => navigate("/recep/patients")}>
                  Quay lại danh sách bệnh nhân
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsSuccess(false)
                    setPatientId(null)
                    setDoctorId(null)
                    setShiftId(null)
                    setDate(undefined)
                    setSymptomInitial("")
                  }}
                >
                  Đặt lịch mới
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
      <div className="space-y-6">
        <Button variant="ghost" className="mb-2 pl-0" asChild>
          <Link to="/recep/patients">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Link>
        </Button>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Đặt lịch hẹn offline</CardTitle>
            <CardDescription>
              Đặt lịch hẹn cho bệnh nhân tại quầy tiếp tân
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Patient Selection */}
              <div className="space-y-2">
                <Label htmlFor="patient">Chọn bệnh nhân *</Label>
                <Select
                  value={patientId?.toString() || ""}
                  onValueChange={(value) => setPatientId(Number(value))}
                  disabled={isLoadingPatients}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn bệnh nhân" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingPatients ? (
                      <div className="p-4 text-center">
                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                      </div>
                    ) : patients.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        Không có bệnh nhân
                      </div>
                    ) : (
                      patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id.toString()}>
                          {patient.patientCode} - {patient.fullName}
                          {patient.phone && ` (${patient.phone})`}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Doctor Selection */}
              <div className="space-y-2">
                <Label htmlFor="doctor">Chọn bác sĩ *</Label>
                <Select
                  value={doctorId?.toString() || ""}
                  onValueChange={(value) => {
                    setDoctorId(Number(value))
                    setShiftId(null) // Reset shift when doctor changes
                  }}
                  disabled={isLoadingDoctors}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn bác sĩ" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingDoctors ? (
                      <div className="p-4 text-center">
                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                      </div>
                    ) : doctors.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        Không có bác sĩ
                      </div>
                    ) : (
                      doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id.toString()}>
                          {doctor.fullName}
                          {doctor.specialty && ` - ${doctor.specialty.name}`}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Shift Selection */}
              <div className="space-y-2">
                <Label htmlFor="shift">Chọn ca trực *</Label>
                <Select
                  value={shiftId?.toString() || ""}
                  onValueChange={(value) => setShiftId(Number(value))}
                  disabled={isLoadingShifts || !doctorId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn ca trực" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingShifts ? (
                      <div className="p-4 text-center">
                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                      </div>
                    ) : shifts.length === 0 ? (
                      <div className="p-4 text-center text-sm text-gray-500">
                        Không có ca trực
                      </div>
                    ) : (
                      shifts.map((shift) => (
                        <SelectItem key={shift.id} value={shift.id.toString()}>
                          {shift.name} ({shift.startTime} - {shift.endTime})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {!doctorId && (
                  <p className="text-xs text-gray-500">
                    Vui lòng chọn bác sĩ trước
                  </p>
                )}
              </div>

              {/* Date Selection */}
              <div className="space-y-2">
                <Label>Chọn ngày *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Chọn ngày"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Symptoms */}
              <div className="space-y-2">
                <Label htmlFor="symptoms">Triệu chứng ban đầu (tùy chọn)</Label>
                <Textarea
                  id="symptoms"
                  placeholder="Mô tả triệu chứng ban đầu của bệnh nhân..."
                  value={symptomInitial}
                  onChange={(e) => setSymptomInitial(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={
                    isSubmitting ||
                    !patientId ||
                    !doctorId ||
                    !shiftId ||
                    !date
                  }
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    "Đặt lịch hẹn"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/recep/patients")}
                >
                  Hủy
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </ReceptionistSidebar>
  )
}
