"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Clock, Search, User, CheckCircle2, Stethoscope, FileText, Mail } from "lucide-react"
import { cn } from "@/lib/utils"
import { Link } from "react-router-dom"

const specialties = [
  { id: "cardiology", name: "Cardiology", icon: "❤️" },
  { id: "orthopedics", name: "Orthopedics", icon: "🦴" },
  { id: "pediatrics", name: "Pediatrics", icon: "👶" },
  { id: "general", name: "General Medicine", icon: "🏥" },
]

const doctors = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialty: "cardiology",
    specialtyLabel: "Cardiology",
    image: "/female-doctor.png",
    experience: "15 years experience",
    availableSlots: {
      weekdays: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM"],
      weekends: ["10:00 AM", "11:00 AM"],
    },
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    specialty: "orthopedics",
    specialtyLabel: "Orthopedics",
    image: "/male-doctor.png",
    experience: "12 years experience",
    availableSlots: {
      weekdays: ["09:00 AM", "10:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"],
      weekends: ["09:00 AM", "10:00 AM"],
    },
  },
  {
    id: 3,
    name: "Dr. Emily Williams",
    specialty: "pediatrics",
    specialtyLabel: "Pediatrics",
    image: "/female-pediatrician.png",
    experience: "10 years experience",
    availableSlots: {
      weekdays: ["09:00 AM", "10:00 AM", "11:00 AM", "01:00 PM", "02:00 PM", "03:00 PM"],
      weekends: [],
    },
  },
  {
    id: 4,
    name: "Dr. James Martinez",
    specialty: "general",
    specialtyLabel: "General Medicine",
    image: "/male-doctor-smiling.jpg",
    experience: "18 years experience",
    availableSlots: {
      weekdays: ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"],
      weekends: ["09:00 AM", "10:00 AM", "11:00 AM"],
    },
  },
]

export function BookingForm() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null)
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null)
  const [date, setDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [step, setStep] = useState(1)
  
  // Patient Info States
  const [patientName, setPatientName] = useState("")
  const [patientPhone, setPatientPhone] = useState("")
  const [patientEmail, setPatientEmail] = useState("")
  const [symptoms, setSymptoms] = useState("")
  
  const [isSubmitted, setIsSubmitted] = useState(false)

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSpecialty = !selectedSpecialty || doctor.specialty === selectedSpecialty
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doctor.specialtyLabel.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSpecialty && matchesSearch
  })

  const getAvailableTimeSlots = () => {
    if (!selectedDoctor || !date) return []

    const doctor = doctors.find((d) => d.id === selectedDoctor)
    if (!doctor) return []

    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    return isWeekend ? doctor.availableSlots.weekends : doctor.availableSlots.weekdays
  }

  const availableTimeSlots = getAvailableTimeSlots()

  const handleDoctorClick = (doctorId: number) => {
    if (selectedDoctor === doctorId) {
      setSelectedDoctor(null)
      setDate(undefined)
      setSelectedTime("")
      setStep(1)
    } else {
      setSelectedDoctor(doctorId)
      setSelectedTime("")
      setStep(2)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
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
          <h2 className="text-3xl font-bold text-foreground mb-4">Appointment Confirmed!</h2>
          <p className="text-muted-foreground mb-8 text-lg">Your appointment has been successfully scheduled.</p>
          <div className="bg-muted/50 rounded-lg p-6 mb-8 text-left max-w-md mx-auto">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Doctor</p>
                  <p className="font-semibold">{doctors.find((d) => d.id === selectedDoctor)?.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CalendarIcon className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-semibold">{date && format(date, "PPP")}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-semibold">{selectedTime}</p>
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
                    <p className="text-sm text-muted-foreground">Symptoms</p>
                    <p className="font-semibold text-sm">{symptoms}</p>
                    </div>
                </div>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            A confirmation has been sent to your phone number: {patientPhone}
            {patientEmail && ` and email: ${patientEmail}`}.
          </p>
          <Link to ="/">
            <Button size="lg">
             Go back 
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid md:grid-cols-3 gap-6">
        {/* Step 1: Select Specialty & Doctor */}
        <Card className={cn("md:col-span-2", step !== 1 && "opacity-60")}>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                1
              </div>
              <CardTitle>Select Specialty & Doctor</CardTitle>
            </div>
            <CardDescription>Choose your medical specialty and preferred doctor</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <Label className="mb-3 block">Medical Specialty</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {specialties.map((specialty) => (
                  <button
                    key={specialty.id}
                    type="button"
                    onClick={() => {
                      setSelectedSpecialty(selectedSpecialty === specialty.id ? null : specialty.id)
                      setSelectedDoctor(null)
                      setDate(undefined)
                      setSelectedTime("")
                    }}
                    className={cn(
                      "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all hover:border-primary/50",
                      selectedSpecialty === specialty.id ? "border-primary bg-primary/5" : "border-border bg-card",
                    )}
                  >
                    <span className="text-2xl">{specialty.icon}</span>
                    <span className="text-sm font-medium text-center">{specialty.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search by name or specialty..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="grid gap-4">
              {filteredDoctors.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Stethoscope className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No doctors found. Try adjusting your search or specialty filter.</p>
                </div>
              ) : (
                filteredDoctors.map((doctor) => (
                  <button
                    key={doctor.id}
                    type="button"
                    onClick={() => handleDoctorClick(doctor.id)}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-lg border-2 transition-all hover:border-primary/50 text-left",
                      selectedDoctor === doctor.id ? "border-primary bg-primary/5" : "border-border bg-card",
                    )}
                  >
                    <img
                      src={doctor.image || "/placeholder.svg"}
                      alt={doctor.name}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{doctor.name}</h3>
                      <p className="text-sm text-muted-foreground">{doctor.specialtyLabel}</p>
                      <p className="text-xs text-muted-foreground mt-1">{doctor.experience}</p>
                      <p className="text-xs text-primary mt-1 font-medium">
                        Available: Weekdays {doctor.availableSlots.weekdays.length} slots
                        {doctor.availableSlots.weekends.length > 0 &&
                          `, Weekends ${doctor.availableSlots.weekends.length} slots`}
                      </p>
                    </div>
                    {selectedDoctor === doctor.id && <CheckCircle2 className="h-6 w-6 text-primary" />}
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Select Date & Time */}
        <Card className={cn(step < 2 && "opacity-60")}>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                2
              </div>
              <CardTitle>Date & Time</CardTitle>
            </div>
            <CardDescription>Pick from available schedule</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="mb-3 block">Select Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                    disabled={!selectedDoctor}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => {
                      setDate(newDate)
                      setSelectedTime("")
                      if (newDate) setStep(3)
                    }}
                    disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label className="mb-3 block">
                Available Time Slots {date && `(${date.getDay() === 0 || date.getDay() === 6 ? "Weekend" : "Weekday"})`}
              </Label>
              {!date ? (
                <p className="text-sm text-muted-foreground">Please select a date first</p>
              ) : availableTimeSlots.length === 0 ? (
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-sm text-muted-foreground">No available slots on this day</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {availableTimeSlots.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={cn(
                        "p-3 rounded-lg border-2 text-sm font-medium transition-all",
                        selectedTime === time
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card hover:border-primary/50",
                      )}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Step 3: Patient Information */}
        <Card className={cn("md:col-span-3", step < 3 && "opacity-60")}>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                3
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
                  disabled={!selectedTime}
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
                  disabled={!selectedTime}
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
                  disabled={!selectedTime}
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
                  disabled={!selectedTime}
                  className="min-h-[100px]"
                />
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <Button
                type="submit"
                size="lg"
                className="px-8"
                // Đã xóa check !patientEmail để nó thành optional
                disabled={!selectedDoctor || !date || !selectedTime || !patientName || !patientPhone}
              >
                Confirm Appointment
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => {
                  setSelectedSpecialty(null)
                  setSelectedDoctor(null)
                  setDate(undefined)
                  setSelectedTime("")
                  setPatientName("")
                  setPatientPhone("")
                  setPatientEmail("") // Reset email
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