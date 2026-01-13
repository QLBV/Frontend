"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useAuth } from "@/auth/authContext"
import { getPatientById, updatePatient, type Patient } from "@/services/patient.service"
import { Loader2, Heart, Ruler, Weight, Activity, X, Plus } from "lucide-react"
import PatientSidebar from "@/components/sidebar/patient"

export default function UpdateHealthInfoPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [patient, setPatient] = useState<Patient | null>(null)

  // Form states
  const [bloodType, setBloodType] = useState<string>("")
  const [height, setHeight] = useState<string>("")
  const [weight, setWeight] = useState<string>("")
  const [chronicDiseases, setChronicDiseases] = useState<string[]>([])
  const [allergies, setAllergies] = useState<string[]>([])
  const [newChronicDisease, setNewChronicDisease] = useState("")
  const [newAllergy, setNewAllergy] = useState("")

  // Calculate BMI
  const calculateBMI = (): number | null => {
    const h = parseFloat(height)
    const w = parseFloat(weight)
    if (h > 0 && w > 0) {
      const heightInMeters = h / 100
      return parseFloat((w / (heightInMeters * heightInMeters)).toFixed(2))
    }
    return null
  }

  const getBMICategory = (bmi: number): string => {
    if (bmi < 18.5) return "Thiếu cân"
    if (bmi < 25) return "Bình thường"
    if (bmi < 30) return "Thừa cân"
    return "Béo phì"
  }

  useEffect(() => {
    if (user?.patientId) {
      fetchPatientData()
    } else {
      toast.error("Không tìm thấy thông tin bệnh nhân")
      navigate("/patient/dashboard")
    }
  }, [user?.patientId])

  const fetchPatientData = async () => {
    try {
      setLoading(true)
      const patientData = await getPatientById(user!.patientId!)
      setPatient(patientData)
      
      // Set form values
      setBloodType(patientData.bloodType || "")
      setHeight(patientData.height?.toString() || "")
      setWeight(patientData.weight?.toString() || "")
      setChronicDiseases(patientData.chronicDiseases || [])
      setAllergies(patientData.allergies || [])
    } catch (error: any) {
      console.error("Error fetching patient data:", error)
      toast.error("Không thể tải thông tin bệnh nhân")
    } finally {
      setLoading(false)
    }
  }

  const handleAddChronicDisease = () => {
    if (newChronicDisease.trim() && !chronicDiseases.includes(newChronicDisease.trim())) {
      setChronicDiseases([...chronicDiseases, newChronicDisease.trim()])
      setNewChronicDisease("")
    }
  }

  const handleRemoveChronicDisease = (index: number) => {
    setChronicDiseases(chronicDiseases.filter((_, i) => i !== index))
  }

  const handleAddAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()])
      setNewAllergy("")
    }
  }

  const handleRemoveAllergy = (index: number) => {
    setAllergies(allergies.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      const updateData = {
        bloodType: bloodType || undefined,
        height: height ? parseFloat(height) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        chronicDiseases: chronicDiseases,
        allergies: allergies,
      }

      console.log("📤 Sending update request:", {
        patientId: user!.patientId!,
        data: updateData,
        chronicDiseases,
        allergies,
      })
      
      const result = await updatePatient(user!.patientId!, updateData)
      
      console.log("✅ Update response:", result)

      toast.success("Cập nhật thông tin sức khỏe thành công!")
      navigate("/patient/dashboard")
    } catch (error: any) {
      console.error("❌ Error updating patient:", error)
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      })
      toast.error(error.response?.data?.message || "Không thể cập nhật thông tin")
    } finally {
      setSaving(false)
    }
  }

  const bmi = calculateBMI()

  if (loading) {
    return (
      <PatientSidebar userName={user?.fullName || user?.email} patientCode={patient?.patientCode || ""}>
        <div className="p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600">Đang tải thông tin...</p>
          </div>
        </div>
      </PatientSidebar>
    )
  }

  return (
    <PatientSidebar userName={user?.fullName || user?.email} patientCode={patient?.patientCode || ""}>
      <div className="p-8 max-w-4xl mx-auto">
        {/* Premium Gradient Header */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-500 p-8 shadow-xl mb-8">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2 flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                    <Activity className="w-8 h-8 text-white" />
                  </div>
                  Cập Nhật Sức Khỏe
                </h1>
                <p className="text-blue-100 text-lg max-w-xl">
                  Cập nhật các chỉ số cơ thể, nhóm máu và thông tin y tế quan trọng khác để bác sĩ nắm bắt tình hình sức khỏe của bạn tốt hơn.
                </p>
              </div>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin sức khỏe</CardTitle>
            <CardDescription>
              Cập nhật nhóm máu, chiều cao, cân nặng, bệnh lý mãn tính và dị ứng
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Blood Type */}
            <div className="space-y-2">
              <Label htmlFor="bloodType" className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                Nhóm máu
              </Label>
              <Select value={bloodType} onValueChange={setBloodType}>
                <SelectTrigger id="bloodType">
                  <SelectValue placeholder="Chọn nhóm máu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                  <SelectItem value="AB">AB</SelectItem>
                  <SelectItem value="O">O</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Height and Weight */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height" className="flex items-center gap-2">
                  <Ruler className="h-4 w-4 text-blue-500" />
                  Chiều cao (cm)
                </Label>
                <Input
                  id="height"
                  type="number"
                  min="0"
                  max="300"
                  step="0.1"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="Ví dụ: 170"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight" className="flex items-center gap-2">
                  <Weight className="h-4 w-4 text-orange-500" />
                  Cân nặng (kg)
                </Label>
                <Input
                  id="weight"
                  type="number"
                  min="0"
                  max="500"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Ví dụ: 70"
                />
              </div>
            </div>

            {/* BMI Display */}
            {bmi && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <Label className="font-semibold text-blue-900">Chỉ số BMI</Label>
                </div>
                <div className="text-2xl font-bold text-blue-900 mb-1">{bmi}</div>
                <div className="text-sm text-blue-700">{getBMICategory(bmi)}</div>
              </div>
            )}

            {/* Chronic Diseases */}
            <div className="space-y-2">
              <Label>Bệnh lý mãn tính</Label>
              <div className="flex gap-2">
                <Input
                  value={newChronicDisease}
                  onChange={(e) => setNewChronicDisease(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddChronicDisease()
                    }
                  }}
                  placeholder="Nhập bệnh lý mãn tính"
                />
                <Button type="button" onClick={handleAddChronicDisease} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {chronicDiseases.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {chronicDiseases.map((disease, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                    >
                      {disease}
                      <button
                        type="button"
                        onClick={() => handleRemoveChronicDisease(index)}
                        className="hover:text-red-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Allergies */}
            <div className="space-y-2">
              <Label>Dị ứng</Label>
              <div className="flex gap-2">
                <Input
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddAllergy()
                    }
                  }}
                  placeholder="Nhập dị ứng"
                />
                <Button type="button" onClick={handleAddAllergy} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {allergies.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {allergies.map((allergy, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
                    >
                      {allergy}
                      <button
                        type="button"
                        onClick={() => handleRemoveAllergy(index)}
                        className="hover:text-yellow-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => navigate("/patient/dashboard")}>
                Hủy
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  "Lưu thông tin"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PatientSidebar>
  )
}
