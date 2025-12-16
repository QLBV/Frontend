"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Header } from "@/components/header"

// Mock Data (Synchronized with booking_form.tsx)
const initialAppointmentData = {
  upcoming: [
    {
      id: "1",
      date: "2025-12-20",
      time: "10:00 AM",
      doctor: {
        id: 1, // Matches Dr. Sarah Johnson in booking_form
        name: "Dr. Sarah Johnson",
        specialty: "Cardiology",
        image: "/female-doctor.png",
      },
      type: "In-person",
      location: "Room 203, Building A",
      reason: "Follow-up consultation",
      status: "Confirmed",
      notes: "Please arrive 15 minutes early for check-in",
    },
    {
      id: "3",
      date: "2026-01-05",
      time: "11:00 AM",
      doctor: {
        id: 2, // Matches Dr. Michael Chen in booking_form
        name: "Dr. Michael Chen",
        specialty: "Orthopedics",
        image: "/male-doctor.png",
      },
      type: "In-person",
      location: "Room 305, Building B",
      reason: "Knee pain evaluation",
      status: "Pending",
      notes: "Bring previous X-ray results if available",
    },
  ],
  past: [
    {
      id: "4",
      date: "2025-11-28",
      time: "10:00 AM",
      doctor: {
        id: 1, // Matches Dr. Sarah Johnson
        name: "Dr. Sarah Johnson",
        specialty: "Cardiology",
        image: "/female-doctor.png",
      },
      type: "In-person",
      location: "Room 203, Building A",
      reason: "Regular checkup",
      status: "Completed",
      diagnosis: "Blood pressure stable, continue current medication",
      prescription: "Lisinopril 10mg - Continue for 3 months",
      nextSteps: "Follow-up in 3 months",
    },
    {
      id: "5",
      date: "2025-10-20",
      time: "11:30 AM",
      doctor: {
        id: 3, // Matches Dr. Emily Williams
        name: "Dr. Emily Williams",
        specialty: "Pediatrics",
        image: "/female-pediatrician.png",
      },
      type: "In-person",
      location: "Room 101, Building A",
      reason: "Annual physical examination",
      status: "Completed",
      diagnosis: "Overall health good, minor vitamin D deficiency",
      prescription: "Vitamin D supplement 2000 IU daily",
      nextSteps: "Annual checkup in 12 months",
    },
    {
      id: "7",
      date: "2025-08-10",
      time: "9:00 AM",
      doctor: {
        id: 4, // Matches Dr. James Martinez
        name: "Dr. James Martinez",
        specialty: "General Medicine",
        image: "/male-doctor-smiling.jpg",
      },
      type: "In-person",
      location: "Room 203, Building A",
      reason: "Chest pain evaluation",
      status: "Cancelled",
      notes: "Cancelled by patient - rescheduled to later date",
    },
  ],
}

export default function PatientAppointmentsPage() {
  const navigate = useNavigate()
  
  // States
  const [data, setData] = useState(initialAppointmentData)
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  
  // Cancel Dialog States
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [appointmentToCancel, setAppointmentToCancel] = useState<string | null>(null)

  // Helpers
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed": return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "pending": return "bg-amber-50 text-amber-700 border-amber-200"
      case "completed": return "bg-blue-50 text-blue-700 border-blue-200"
      case "cancelled": return "bg-red-50 text-red-700 border-red-200"
      default: return "bg-slate-50 text-slate-700 border-slate-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed": return <CheckCircle className="h-4 w-4" />
      case "pending": return <AlertCircle className="h-4 w-4" />
      case "completed": return <CheckCircle className="h-4 w-4" />
      case "cancelled": return <XCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  // Handlers
  const initiateCancel = (id: string) => {
    setAppointmentToCancel(id)
    setIsCancelDialogOpen(true)
  }

  const confirmCancel = () => {
    if (appointmentToCancel) {
      setData(prev => ({
        ...prev,
        upcoming: prev.upcoming.filter(apt => apt.id !== appointmentToCancel)
      }))
      setIsCancelDialogOpen(false)
      setAppointmentToCancel(null)
    }
  }

  const handleBookFollowUp = (doctorId: number) => {
    // Navigate to booking page with pre-selected doctor ID
    navigate("/book-appointment", { state: { selectedDoctorId: doctorId } })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        
        {/* Navigation */}
        <Button variant="ghost" className="mb-6" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">My Appointments</h1>
          <p className="text-slate-600 text-lg">View and manage your healthcare appointments</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm mb-1">Upcoming</p>
                  <p className="text-4xl font-bold">{data.upcoming.length}</p>
                </div>
                <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Calendar className="h-7 w-7" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm mb-1">Completed</p>
                  <p className="text-4xl font-bold">
                    {data.past.filter((a) => a.status === "Completed").length}
                  </p>
                </div>
                <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <CheckCircle className="h-7 w-7" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm mb-1">Total Visits</p>
                  <p className="text-4xl font-bold">{data.past.length + data.upcoming.length}</p>
                </div>
                <div className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <FileText className="h-7 w-7" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="upcoming" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-white border shadow-sm">
              <TabsTrigger value="upcoming">Upcoming Appointments</TabsTrigger>
              <TabsTrigger value="past">Past Appointments</TabsTrigger>
            </TabsList>
            <Button className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg shadow-blue-500/25" asChild>
              <Link to="/book-appointment">
                <Calendar className="h-4 w-4 mr-2" />
                Book New Appointment
              </Link>
            </Button>
          </div>

          {/* Upcoming */}
          <TabsContent value="upcoming" className="space-y-4">
            {data.upcoming.length > 0 ? (
              data.upcoming.map((appointment) => (
                <Card key={appointment.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                      <div className="flex-shrink-0">
                        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center overflow-hidden">
                          <img
                            src={appointment.doctor.image || "/placeholder.svg"}
                            alt={appointment.doctor.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-1">{appointment.doctor.name}</h3>
                            <p className="text-sm text-slate-600">{appointment.doctor.specialty}</p>
                          </div>
                          <Badge variant="outline" className={getStatusColor(appointment.status)}>
                            {getStatusIcon(appointment.status)}
                            <span className="ml-1">{appointment.status}</span>
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-slate-600">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            <span className="text-sm">{appointment.date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <span className="text-sm">{appointment.time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <MapPin className="h-4 w-4 text-blue-600" />
                            <span className="text-sm">{appointment.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-600">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <span className="text-sm">{appointment.reason}</span>
                          </div>
                        </div>

                        {appointment.notes && (
                          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
                            <p className="text-sm text-blue-800">
                              <AlertCircle className="h-4 w-4 inline mr-2" />
                              {appointment.notes}
                            </p>
                          </div>
                        )}

                        <div className="flex items-center gap-3">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => setSelectedAppointment(appointment)}>
                                View Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Appointment Details</DialogTitle>
                                <DialogDescription>Complete information about your appointment</DialogDescription>
                              </DialogHeader>
                              {selectedAppointment && (
                                <div className="space-y-6">
                                  <div className="flex items-center gap-4">
                                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center overflow-hidden">
                                      <img
                                        src={selectedAppointment.doctor.image || "/placeholder.svg"}
                                        alt={selectedAppointment.doctor.name}
                                        className="h-full w-full object-cover"
                                      />
                                    </div>
                                    <div>
                                      <h3 className="text-lg font-bold text-slate-900">
                                        {selectedAppointment.doctor.name}
                                      </h3>
                                      <p className="text-sm text-slate-600">{selectedAppointment.doctor.specialty}</p>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-xs text-slate-500 mb-1">Date</p>
                                      <p className="text-sm font-medium">{selectedAppointment.date}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-slate-500 mb-1">Time</p>
                                      <p className="text-sm font-medium">{selectedAppointment.time}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-slate-500 mb-1">Type</p>
                                      <p className="text-sm font-medium">{selectedAppointment.type}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-slate-500 mb-1">Status</p>
                                      <Badge variant="outline" className={getStatusColor(selectedAppointment.status)}>
                                        {selectedAppointment.status}
                                      </Badge>
                                    </div>
                                    <div className="col-span-2">
                                      <p className="text-xs text-slate-500 mb-1">Location</p>
                                      <p className="text-sm font-medium">{selectedAppointment.location}</p>
                                    </div>
                                    <div className="col-span-2">
                                      <p className="text-xs text-slate-500 mb-1">Reason for Visit</p>
                                      <p className="text-sm font-medium">{selectedAppointment.reason}</p>
                                    </div>
                                    {selectedAppointment.notes && (
                                      <div className="col-span-2">
                                        <p className="text-xs text-slate-500 mb-1">Notes</p>
                                        <p className="text-sm text-slate-700">{selectedAppointment.notes}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600 hover:text-red-700 bg-transparent"
                            onClick={() => initiateCancel(appointment.id)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-lg border border-dashed">
                <p className="text-slate-500">No upcoming appointments found.</p>
                <Button variant="link" asChild className="mt-2">
                  <Link to="/book-appointment">Book a new appointment</Link>
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Past */}
          <TabsContent value="past" className="space-y-4">
            {data.past.map((appointment) => (
              <Card key={appointment.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="h-20 w-20 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
                        <img
                          src={appointment.doctor.image || "/placeholder.svg"}
                          alt={appointment.doctor.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 mb-1">{appointment.doctor.name}</h3>
                          <p className="text-sm text-slate-600">{appointment.doctor.specialty}</p>
                        </div>
                        <Badge variant="outline" className={getStatusColor(appointment.status)}>
                          {getStatusIcon(appointment.status)}
                          <span className="ml-1">{appointment.status}</span>
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Calendar className="h-4 w-4 text-slate-500" />
                          <span className="text-sm">{appointment.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Clock className="h-4 w-4 text-slate-500" />
                          <span className="text-sm">{appointment.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <MapPin className="h-4 w-4 text-slate-500" />
                          <span className="text-sm">{appointment.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <FileText className="h-4 w-4 text-slate-500" />
                          <span className="text-sm">{appointment.reason}</span>
                        </div>
                      </div>

                      {appointment.status === "Completed" && (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 mb-4 space-y-3">
                          <div>
                            <p className="text-xs text-emerald-700 font-semibold mb-1">Diagnosis</p>
                            <p className="text-sm text-slate-700">{appointment.diagnosis}</p>
                          </div>
                          {appointment.prescription && (
                            <div>
                              <p className="text-xs text-emerald-700 font-semibold mb-1">Prescription</p>
                              <p className="text-sm text-slate-700">{appointment.prescription}</p>
                            </div>
                          )}
                          {appointment.nextSteps && (
                            <div>
                              <p className="text-xs text-emerald-700 font-semibold mb-1">Next Steps</p>
                              <p className="text-sm text-slate-700">{appointment.nextSteps}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {appointment.status === "Cancelled" && appointment.notes && (
                        <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-4">
                          <p className="text-sm text-red-800">{appointment.notes}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setSelectedAppointment(appointment)}>
                              View Full Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Appointment Summary</DialogTitle>
                              <DialogDescription>Complete information about your past appointment</DialogDescription>
                            </DialogHeader>
                            {selectedAppointment && (
                              <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden">
                                    <img
                                      src={selectedAppointment.doctor.image || "/placeholder.svg"}
                                      alt={selectedAppointment.doctor.name}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                  <div>
                                    <h3 className="text-lg font-bold text-slate-900">
                                      {selectedAppointment.doctor.name}
                                    </h3>
                                    <p className="text-sm text-slate-600">{selectedAppointment.doctor.specialty}</p>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-xs text-slate-500 mb-1">Date</p>
                                    <p className="text-sm font-medium">{selectedAppointment.date}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-500 mb-1">Time</p>
                                    <p className="text-sm font-medium">{selectedAppointment.time}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-500 mb-1">Type</p>
                                    <p className="text-sm font-medium">{selectedAppointment.type}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-slate-500 mb-1">Status</p>
                                    <Badge variant="outline" className={getStatusColor(selectedAppointment.status)}>
                                      {selectedAppointment.status}
                                    </Badge>
                                  </div>
                                  <div className="col-span-2">
                                    <p className="text-xs text-slate-500 mb-1">Location</p>
                                    <p className="text-sm font-medium">{selectedAppointment.location}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <p className="text-xs text-slate-500 mb-1">Reason for Visit</p>
                                    <p className="text-sm font-medium">{selectedAppointment.reason}</p>
                                  </div>
                                </div>

                                {selectedAppointment.status === "Completed" && (
                                  <div className="border-t pt-4 space-y-4">
                                    <h4 className="font-semibold text-slate-900">Visit Summary</h4>
                                    <div>
                                      <p className="text-xs text-slate-500 mb-1">Diagnosis</p>
                                      <p className="text-sm text-slate-700">{selectedAppointment.diagnosis}</p>
                                    </div>
                                    {selectedAppointment.prescription && (
                                      <div>
                                        <p className="text-xs text-slate-500 mb-1">Prescription</p>
                                        <p className="text-sm text-slate-700">{selectedAppointment.prescription}</p>
                                      </div>
                                    )}
                                    {selectedAppointment.nextSteps && (
                                      <div>
                                        <p className="text-xs text-slate-500 mb-1">Next Steps</p>
                                        <p className="text-sm text-slate-700">{selectedAppointment.nextSteps}</p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        {appointment.status === "Completed" && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleBookFollowUp(appointment.doctor.id)}
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Book Follow-up
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* Cancel Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this appointment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              No, Keep It
            </Button>
            <Button variant="destructive" onClick={confirmCancel}>
              Yes, Cancel Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}