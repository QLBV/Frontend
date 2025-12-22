import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import DoctorSidebar from '@/components/sidebar/doctor'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  User, 
  Calendar,
  Activity,
  Thermometer,
  Heart,
  Weight,
  Stethoscope,
  FileText,
  Save,
  Pill,
  History,
  FlaskConical
} from "lucide-react"

// Mock patient data
const patientData = {
  id: "1",
  name: "Nguyễn Văn A",
  patientId: "#45281",
  age: 45,
  gender: "Male",
  visitDate: "Oct 24, 2023",
  avatar: "N",
  declaredSysptom: "mệt mỏi, khó thở (tăng khi nằm), đánh trống ngực/rối loạn nhịp, đau tức ngực, sốt không rõ nguyên nhân, sưng phù mắt cá chân/bàn chân, và sụt cân bất thường"
}

// Vital signs data - now editable
const initialVitalSigns = {
  bloodPressure: "120/80",
  heartRate: "72",
  temperature: "38.2",
  weight: "75",
}

export default function FormMedical() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  // Form states
  const [symptoms, setSymptoms] = useState("")
  const [observations, setObservations] = useState("")
  const [diagnosis, setDiagnosis] = useState("")
  const [severity, setSeverity] = useState("Mild")
  const [privateRemarks, setPrivateRemarks] = useState("")
  
  // Vital signs states
  const [vitalSigns, setVitalSigns] = useState(initialVitalSigns)
  
  const updateVitalSign = (field: string, value: string) => {
    setVitalSigns(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveExamination = () => {
    const examinationData = {
      patientId: id,
      symptoms,
      observations,
      diagnosis,
      severity,
      privateRemarks,
      vitalSigns,
      timestamp: new Date().toISOString()
    }
    
    console.log("Saving examination:", examinationData)
    // API call to save examination
    
    // Navigate back to patient list
    navigate("/doctor/patients")
  }

  const handleAddPrescription = () => {
    // Navigate to prescription form
    navigate(`/doctor/patients/${id}/prescription`)
  }

  const handleCancel = () => {
    navigate("/doctor/patients")
  }

  return (
    <DoctorSidebar>
      <div className="space-y-6">
        
        {/* Back Button */}
        <div className="flex items-center gap-4 -ml-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/doctor/patients")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Patient List
          </Button>
        </div>

        {/* Patient Header */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                  {patientData.avatar}
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">{patientData.name}</h1>
                  <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      ID: {patientData.patientId}
                    </span>
                    <span>{patientData.age} Years</span>
                    <span>{patientData.gender}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-slate-600">Visit Date</div>
                <div className="font-semibold text-slate-900">{patientData.visitDate}</div>
                <div className="flex items-center gap-4 mt-2">
                  <Button variant="outline" size="sm">
                    <History className="w-4 h-4 mr-1" />
                    History
                  </Button>
                  <Button variant="outline" size="sm">
                    <FlaskConical className="w-4 h-4 mr-1" />
                    Labs
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Main Form */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Vital Signs */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-xl">Vital Signs</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-slate-600 mb-1">Blood Pressure</div>
                    <Input
                      value={vitalSigns.bloodPressure}
                      onChange={(e) => updateVitalSign('bloodPressure', e.target.value)}
                      className="text-center text-lg font-bold border-0 bg-transparent p-0 h-auto"
                      placeholder="120/80"
                    />
                    <div className="text-xs text-slate-500">mmHg</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-slate-600 mb-1">Heart Rate</div>
                    <Input
                      value={vitalSigns.heartRate}
                      onChange={(e) => updateVitalSign('heartRate', e.target.value)}
                      className="text-center text-lg font-bold border-0 bg-transparent p-0 h-auto"
                      placeholder="72"
                    />
                    <div className="text-xs text-slate-500">bpm</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-sm text-slate-600 mb-1">Temperature</div>
                    <Input
                      value={vitalSigns.temperature}
                      onChange={(e) => updateVitalSign('temperature', e.target.value)}
                      className="text-center text-lg font-bold border-0 bg-transparent p-0 h-auto"
                      placeholder="98.6"
                    />
                    <div className="text-xs text-slate-500">°C</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-sm text-slate-600 mb-1">Weight</div>
                    <Input
                      value={vitalSigns.weight}
                      onChange={(e) => updateVitalSign('weight', e.target.value)}
                      className="text-center text-lg font-bold border-0 bg-transparent p-0 h-auto"
                      placeholder="75"
                    />
                    <div className="text-xs text-slate-500">kg</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Declared Symptoms */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-xl">Declared Symptoms</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-slate-600">Patient Reported Symptoms</Label>
                  <Textarea
                    placeholder="Describe symptoms as reported by the patient..."
                    value={patientData.declaredSysptom}
                    rows={6}
                    readOnly
                    className="mt-2 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Doctor's Observations */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-xl">Doctor's Observations</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-slate-600">Detailed Clinical Notes</Label>
                  <Textarea
                    placeholder="Enter detailed observations, physical examination findings, and clinical notes..."
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    rows={8}
                    className="mt-2 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="text-xs text-slate-500 mt-1">
                    {observations.length}/2000 characters
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Diagnosis & Actions */}
          <div className="space-y-6">
            
            {/* Diagnosis */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-xl">Diagnosis</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-slate-600">Primary Diagnosis (ICD-10)</Label>
                  <div className="relative mt-2">
                    <Input
                      placeholder="Search condition..."
                      value={diagnosis}
                      onChange={(e) => setDiagnosis(e.target.value)}
                      className="pr-10"
                    />
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-slate-600">Severity</Label>
                  <select 
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Mild">Mild</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Severe">Severe</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-slate-600">Private Remarks</Label>
                  <Textarea
                    placeholder="Internal notes..."
                    value={privateRemarks}
                    onChange={(e) => setPrivateRemarks(e.target.value)}
                    rows={4}
                    className="mt-2 resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleSaveExamination}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Examination
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                  onClick={handleAddPrescription}
                >
                  <Pill className="w-4 h-4 mr-2" />
                  Add Prescription
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="w-full text-slate-600 hover:text-slate-900"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DoctorSidebar>
  )
}