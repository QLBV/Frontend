import React, { useState } from "react"
import { useParams, Link } from "react-router-dom"
import ReceptionistSidebar from '@/components/sidebar/recep'; // Import Sidebar
import {
  ArrowLeft,
  Activity,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  FileText,
  Heart,
  Droplet,
  Weight,
  Ruler,
  Edit,
  Pill,
  AlertCircle,
  User,
  Award as IdCard,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock patient data (Giữ nguyên data của bạn)
const patientData = {
  id: "1",
  name: "Nguyễn Văn A",
  medicalId: "MED001",
  age: 45,
  gender: "Male",
  dateOfBirth: "1980-05-15",
  phone: "+84 123 456 789",
  email: "nguyenvana@email.com",
  address: "123 Đường Lê Lợi, Quận 1, TP.HCM",
  bloodType: "O+",
  height: "175 cm",
  weight: "70 kg",
  emergencyContact: {
    name: "Nguyễn Thị B",
    relationship: "Spouse",
    phone: "+84 987 654 321",
  },
  status: "active",
  registrationDate: "2020-03-15",
  lastVisit: "2025-11-28",
  vitalSigns: {
    bloodPressure: "120/80",
    heartRate: "72 bpm",
    temperature: "36.5°C",
    respiratoryRate: "16/min",
  },
  allergies: ["Penicillin", "Peanuts"],
  chronicConditions: ["Hypertension", "Type 2 Diabetes"],
  currentMedications: [
    { name: "Metformin", dosage: "500mg", frequency: "Twice daily", startDate: "2023-01-15" },
    { name: "Lisinopril", dosage: "10mg", frequency: "Once daily", startDate: "2022-06-20" },
    { name: "Aspirin", dosage: "81mg", frequency: "Once daily", startDate: "2022-06-20" },
  ],
  appointments: [
    {
      id: "1",
      date: "2025-11-28",
      time: "10:00 AM",
      doctor: "BS. Nguyễn A",
      specialty: "Cardiology",
      status: "Completed",
      reason: "Regular checkup",
    },
    {
      id: "2",
      date: "2025-12-15",
      time: "2:00 PM",
      doctor: "BS. Trần B",
      specialty: "Endocrinology",
      status: "Scheduled",
      reason: "Diabetes management",
    },
    {
      id: "3",
      date: "2025-10-20",
      time: "11:30 AM",
      doctor: "BS. Lê C",
      specialty: "General Practice",
      status: "Completed",
      reason: "Annual physical",
    },
  ],
  medicalHistory: [
    {
      id: "1",
      date: "2023-01-15",
      diagnosis: "Type 2 Diabetes Mellitus",
      doctor: "BS. Trần B",
      notes: "Patient diagnosed with T2DM. Started on Metformin.",
    },
    {
      id: "2",
      date: "2022-06-20",
      diagnosis: "Essential Hypertension",
      doctor: "BS. Nguyễn A",
      notes: "Blood pressure consistently elevated. Started on Lisinopril.",
    },
    {
      id: "3",
      date: "2021-03-10",
      diagnosis: "Allergic Reaction",
      doctor: "BS. Lê C",
      notes: "Severe allergic reaction to Penicillin. Documented in medical record.",
    },
  ],
  labResults: [
    {
      id: "1",
      date: "2025-11-28",
      test: "Blood Glucose (Fasting)",
      result: "125 mg/dL",
      normalRange: "70-100 mg/dL",
      status: "High",
    },
    {
      id: "2",
      date: "2025-11-28",
      test: "HbA1c",
      result: "6.8%",
      normalRange: "< 5.7%",
      status: "High",
    },
    {
      id: "3",
      date: "2025-11-28",
      test: "Total Cholesterol",
      result: "180 mg/dL",
      normalRange: "< 200 mg/dL",
      status: "Normal",
    },
    {
      id: "4",
      date: "2025-11-28",
      test: "Blood Pressure",
      result: "120/80 mmHg",
      normalRange: "< 120/80 mmHg",
      status: "Normal",
    },
  ],
}

export default function RecepPatientDetail() {
  const { id } = useParams()
  // Trong thực tế, bạn sẽ dùng id này để fetch API lấy data đúng của bệnh nhân đó
  const [patient] = useState(patientData)

  return (
    // BỌC TRONG SIDEBAR
    <ReceptionistSidebar>
      <div className="space-y-6">
        
        {/* Back Button */}
        <div>
           <Button variant="ghost" className="mb-2 pl-0 hover:bg-transparent hover:text-blue-600" asChild>
            <Link to="/recep/patients">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Patient List
            </Link>
            </Button>
        </div>

        {/* Patient Header Card */}
        <Card className="border-0 shadow-xl shadow-slate-900/5 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                <div className="h-24 w-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-4xl shadow-xl">
                  {patient.name.charAt(0)}
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2">{patient.name}</h1>
                  <div className="flex items-center gap-4 text-blue-100">
                    <div className="flex items-center gap-2">
                      <IdCard className="h-4 w-4" />
                      <span>{patient.medicalId}</span>
                    </div>
                    <span>•</span>
                    <span>
                      {patient.age} years • {patient.gender}
                    </span>
                    <span>•</span>
                    <Badge variant="outline" className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                      {patient.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm text-blue-100">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {patient.phone}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {patient.email}
                    </div>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-4 divide-x bg-white">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                  <Droplet className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Blood Type</p>
                  <p className="text-lg font-bold text-slate-900">{patient.bloodType}</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Ruler className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Height</p>
                  <p className="text-lg font-bold text-slate-900">{patient.height}</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <Weight className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Weight</p>
                  <p className="text-lg font-bold text-slate-900">{patient.weight}</p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-full bg-violet-500/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Last Visit</p>
                  <p className="text-lg font-bold text-slate-900">{patient.lastVisit}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabbed Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white border shadow-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="medical-history">Medical History</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="lab-results">Lab Results</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Personal Information */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-600" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Date of Birth</p>
                    <p className="text-sm font-medium text-slate-900">{patient.dateOfBirth}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Address</p>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                      <p className="text-sm text-slate-900">{patient.address}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Registration Date</p>
                    <p className="text-sm font-medium text-slate-900">{patient.registrationDate}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Emergency Contact */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-red-50/50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    Emergency Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Name</p>
                    <p className="text-sm font-medium text-slate-900">{patient.emergencyContact.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Relationship</p>
                    <p className="text-sm text-slate-900">{patient.emergencyContact.relationship}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Phone</p>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <p className="text-sm font-medium text-slate-900">{patient.emergencyContact.phone}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vital Signs */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-emerald-50/50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-emerald-600" />
                    Latest Vital Signs
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-500">Blood Pressure</p>
                    <p className="text-sm font-medium text-slate-900">{patient.vitalSigns.bloodPressure}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-500">Heart Rate</p>
                    <p className="text-sm font-medium text-slate-900">{patient.vitalSigns.heartRate}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-500">Temperature</p>
                    <p className="text-sm font-medium text-slate-900">{patient.vitalSigns.temperature}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-500">Respiratory Rate</p>
                    <p className="text-sm font-medium text-slate-900">{patient.vitalSigns.respiratoryRate}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Allergies and Chronic Conditions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-orange-50/50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    Allergies
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-2">
                    {patient.allergies.map((allergy, index) => (
                      <Badge key={index} variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50/50 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                    Chronic Conditions
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-wrap gap-2">
                    {patient.chronicConditions.map((condition, index) => (
                      <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Appointments Tab */}
          <TabsContent value="appointments">
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle>Appointment History</CardTitle>
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-blue-700">
                    <Calendar className="h-4 w-4 mr-2" />
                    Book New Appointment
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {patient.appointments.map((appointment) => (
                    <div key={appointment.id} className="p-6 hover:bg-blue-50/30 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge
                              variant="outline"
                              className={
                                appointment.status === "Completed"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-blue-50 text-blue-700 border-blue-200"
                              }
                            >
                              {appointment.status}
                            </Badge>
                            <span className="text-sm font-semibold text-slate-900">{appointment.specialty}</span>
                          </div>
                          <p className="text-slate-600 mb-2">{appointment.reason}</p>
                          <div className="flex items-center gap-4 text-sm text-slate-500">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {appointment.date}
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {appointment.time}
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              {appointment.doctor}
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medical History Tab */}
          <TabsContent value="medical-history">
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50/50 border-b">
                <CardTitle>Medical History</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {patient.medicalHistory.map((record) => (
                    <div key={record.id} className="p-6 hover:bg-purple-50/30 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold text-slate-900">{record.diagnosis}</h3>
                            <span className="text-sm text-slate-500">{record.date}</span>
                          </div>
                          <p className="text-sm text-slate-600 mb-2">{record.notes}</p>
                          <p className="text-xs text-slate-500">Attending: {record.doctor}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medications Tab */}
          <TabsContent value="medications">
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-cyan-50/50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5 text-cyan-600" />
                  Current Medications
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {patient.currentMedications.map((medication, index) => (
                    <div key={index} className="p-6 hover:bg-cyan-50/30 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 mb-1">{medication.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            <span>Dosage: {medication.dosage}</span>
                            <span>•</span>
                            <span>{medication.frequency}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-2">Started: {medication.startDate}</p>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Lab Results Tab */}
          <TabsContent value="lab-results">
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-teal-50/50 border-b">
                <CardTitle>Latest Lab Results</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b">
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Test</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Result</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Normal Range</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Status</th>
                        <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patient.labResults.map((result) => (
                        <tr key={result.id} className="border-b hover:bg-teal-50/30 transition-colors">
                          <td className="py-4 px-6 font-medium text-slate-900">{result.test}</td>
                          <td className="py-4 px-6 text-slate-700">{result.result}</td>
                          <td className="py-4 px-6 text-slate-600 text-sm">{result.normalRange}</td>
                          <td className="py-4 px-6">
                            {result.status === "Normal" ? (
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                Normal
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                High
                              </Badge>
                            )}
                          </td>
                          <td className="py-4 px-6 text-slate-600 text-sm">{result.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ReceptionistSidebar>
  )
}