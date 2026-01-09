import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import DoctorSidebar from '@/components/sidebar/doctor'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import api from "@/lib/api"
import { toast } from "sonner"
import { PrescriptionService } from '@/services/prescription.service'
import type { Prescription } from '@/types/prescription.types'
import { 
  ArrowLeft, 
  User, 
  Save,
  Plus,
  Trash2,
  Pill,
  FileText,
  Heart,
  Activity,
  Search,
  Loader2
} from "lucide-react"

// Interfaces
interface Medicine {
  id: number
  name: string
  category: string
  unit: string
  currentStock: number
  unitPrice: number
}

interface Medication {
  id: string
  medicineId: number | null
  name: string
  quantity: number
  dosageMorning: number
  dosageNoon: number
  dosageAfternoon: number
  dosageEvening: number
  instruction: string
}

export default function EditPrescriptionPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [prescription, setPrescription] = useState<Prescription | null>(null)
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // State cho danh sách thuốc
  const [medications, setMedications] = useState<Medication[]>([])
  
  // State cho ghi chú thêm
  const [additionalNotes, setAdditionalNotes] = useState("")
  
  // State cho tìm kiếm thuốc
  const [searchTerms, setSearchTerms] = useState<{[key: string]: string}>({})
  const [showSuggestions, setShowSuggestions] = useState<{[key: string]: boolean}>({})

  // Fetch prescription and medicines data on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError('ID đơn thuốc không hợp lệ')
        return
      }
      
      try {
        setLoading(true)
        setError(null)
        
        // Fetch medicines list
        const medicinesResponse = await api.get('/medicines')
        if (medicinesResponse.data.success) {
          setMedicines(medicinesResponse.data.data)
        }
        
        // Fetch prescription data
        const prescriptionResponse = await PrescriptionService.getPrescriptionById(parseInt(id))
        
        if (prescriptionResponse.success && prescriptionResponse.data) {
          const transformedPrescription = PrescriptionService.transformPrescriptionData(prescriptionResponse.data)
          setPrescription(transformedPrescription)
          
          // Load existing medications
          if (transformedPrescription.details && transformedPrescription.details.length > 0) {
            const loadedMedications: Medication[] = transformedPrescription.details.map((detail: any, index: number) => ({
              id: `existing-${detail.id || index}`,
              medicineId: detail.medicineId,
              name: detail.medicineName,
              quantity: detail.quantity,
              dosageMorning: detail.dosageMorning || 0,
              dosageNoon: detail.dosageNoon || 0,
              dosageAfternoon: detail.dosageAfternoon || 0,
              dosageEvening: detail.dosageEvening || 0,
              instruction: detail.instruction || ""
            }))
            setMedications(loadedMedications)
            // Initialize search terms
            const searchTermsMap: {[key: string]: string} = {}
            loadedMedications.forEach(med => {
              searchTermsMap[med.id] = med.name
            })
            setSearchTerms(searchTermsMap)
          } else {
            // If no details, start with empty medication
            setMedications([{
              id: "1",
              medicineId: null,
              name: "",
              quantity: 0,
              dosageMorning: 0,
              dosageNoon: 0,
              dosageAfternoon: 0,
              dosageEvening: 0,
              instruction: ""
            }])
          }
          
          // Load notes
          setAdditionalNotes(transformedPrescription.note || "")
          
        } else {
          setError('Không tìm thấy đơn thuốc')
        }
      } catch (err: any) {
        console.error('Error fetching data:', err)
        const errorMessage = err.response?.data?.message || 'Không thể tải dữ liệu'
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  // Lọc danh sách thuốc theo từ khóa tìm kiếm
  const getFilteredMedicines = (searchTerm: string) => {
    if (!searchTerm) return []
    return medicines.filter(medicine =>
      medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.category.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5)
  }

  // Chọn thuốc từ danh sách gợi ý
  const selectMedicine = (medicationId: string, medicine: Medicine) => {
    updateMedication(medicationId, 'name', medicine.name)
    updateMedication(medicationId, 'medicineId', medicine.id)
    setShowSuggestions(prev => ({ ...prev, [medicationId]: false }))
    setSearchTerms(prev => ({ ...prev, [medicationId]: medicine.name }))
  }

  // Thêm thuốc mới
  const addMedication = () => {
    const newMedication: Medication = {
      id: Date.now().toString(),
      medicineId: null,
      name: "",
      quantity: 0,
      dosageMorning: 0,
      dosageNoon: 0,
      dosageAfternoon: 0,
      dosageEvening: 0,
      instruction: ""
    }
    setMedications([...medications, newMedication])
  }

  // Xóa thuốc
  const removeMedication = (id: string) => {
    if (medications.length > 1) {
      setMedications(medications.filter(med => med.id !== id))
      setSearchTerms(prev => {
        const newTerms = { ...prev }
        delete newTerms[id]
        return newTerms
      })
    }
  }

  // Cập nhật thông tin thuốc
  const updateMedication = (id: string, field: keyof Medication, value: string | number | null) => {
    setMedications(medications.map(med => {
      if (med.id === id) {
        const updatedMed = { ...med, [field]: value }
        
        // Tự động tính tổng số lượng khi thay đổi dosage
        if (field === 'dosageMorning' || field === 'dosageNoon' || field === 'dosageAfternoon' || field === 'dosageEvening') {
          const morning = field === 'dosageMorning' ? (value as number) : med.dosageMorning
          const noon = field === 'dosageNoon' ? (value as number) : med.dosageNoon
          const afternoon = field === 'dosageAfternoon' ? (value as number) : med.dosageAfternoon
          const evening = field === 'dosageEvening' ? (value as number) : med.dosageEvening
          updatedMed.quantity = morning + noon + afternoon + evening
        }
        
        return updatedMed
      }
      return med
    }))
    
    // Cập nhật search term khi thay đổi tên thuốc
    if (field === 'name') {
      setSearchTerms(prev => ({ ...prev, [id]: value as string }))
    }
  }

  // Xử lý thay đổi input tìm kiếm thuốc
  const handleMedicineSearch = (medicationId: string, value: string) => {
    setSearchTerms(prev => ({ ...prev, [medicationId]: value }))
    setShowSuggestions(prev => ({ ...prev, [medicationId]: value.length > 0 }))
    updateMedication(medicationId, 'name', value)
    updateMedication(medicationId, 'medicineId', null)
  }

  // Lưu đơn thuốc (update)
  const handleSavePrescription = async () => {
    if (!prescription) return
    
    try {
      setSaving(true)
      setError(null)
      
      // Form validation
      const validMedications = medications.filter(med => med.medicineId && med.quantity > 0)
      
      if (validMedications.length === 0) {
        toast.error('Vui lòng thêm ít nhất một loại thuốc vào đơn')
        setError('Vui lòng thêm ít nhất một loại thuốc vào đơn')
        return
      }
      
      // Validate each medicine has at least one dosage > 0
      for (let i = 0; i < validMedications.length; i++) {
        const med = validMedications[i]
        const totalDosage = (med.dosageMorning || 0) + 
                           (med.dosageNoon || 0) + 
                           (med.dosageAfternoon || 0) + 
                           (med.dosageEvening || 0)
        
        if (totalDosage <= 0) {
          toast.error(`Thuốc "${med.name || 'thứ ' + (i + 1)}" phải có ít nhất một liều dùng lớn hơn 0`)
          setError(`Thuốc "${med.name || 'thứ ' + (i + 1)}" phải có ít nhất một liều dùng lớn hơn 0`)
          return
        }
        
        if (!med.medicineId) {
          toast.error(`Vui lòng chọn thuốc cho dòng thứ ${i + 1}`)
          setError(`Vui lòng chọn thuốc cho dòng thứ ${i + 1}`)
          return
        }
      }
      
      // Prepare prescription data for update
      const prescriptionData = {
        medicines: validMedications.map(med => ({
          medicineId: med.medicineId,
          quantity: med.quantity,
          dosageMorning: med.dosageMorning || 0,
          dosageNoon: med.dosageNoon || 0,
          dosageAfternoon: med.dosageAfternoon || 0,
          dosageEvening: med.dosageEvening || 0,
          instruction: med.instruction || "Uống theo chỉ dẫn của bác sĩ"
        })),
        note: additionalNotes
      }
      
      console.log('Updating prescription:', prescriptionData)
      
      // Update prescription via API
      try {
        const response = await PrescriptionService.updatePrescription(prescription.id, prescriptionData)
        
        if (response.success) {
          console.log('Prescription updated successfully:', response.data)
          toast.success('Cập nhật đơn thuốc thành công!')
          navigate(`/doctor/prescriptions/${prescription.id}`)
          return
        }
      } catch (apiError: any) {
        const errorMessage = apiError.response?.data?.message || 'Không thể cập nhật đơn thuốc'
        console.error('API error:', errorMessage)
        toast.error(errorMessage)
        setError(errorMessage)
        return
      }
      
    } catch (err: any) {
      console.error('Error updating prescription:', err)
      const errorMessage = err.response?.data?.message || 'Failed to update prescription'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DoctorSidebar>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-slate-600">Đang tải dữ liệu đơn thuốc...</p>
          </div>
        </div>
      </DoctorSidebar>
    )
  }

  if (error && !prescription) {
    return (
      <DoctorSidebar>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <Activity className="h-12 w-12 mx-auto mb-2" />
              <p className="text-lg font-medium">Lỗi tải dữ liệu</p>
              <p className="text-sm">{error}</p>
            </div>
            <Button onClick={() => navigate("/doctor/prescriptions")}>
              Quay lại danh sách đơn thuốc
            </Button>
          </div>
        </div>
      </DoctorSidebar>
    )
  }

  if (!prescription) {
    return null
  }

  // Check if prescription can be edited
  if (prescription.status !== 'DRAFT') {
    return (
      <DoctorSidebar>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-amber-500 mb-4">
              <Activity className="h-12 w-12 mx-auto mb-2" />
              <p className="text-lg font-medium">Không thể chỉnh sửa</p>
              <p className="text-sm">Đơn thuốc này đã được khóa và không thể chỉnh sửa.</p>
            </div>
            <Button onClick={() => navigate(`/doctor/prescriptions/${prescription.id}`)}>
              Xem chi tiết đơn thuốc
            </Button>
          </div>
        </div>
      </DoctorSidebar>
    )
  }

  return (
    <DoctorSidebar>
      <div className="space-y-6">
        
        {/* Back Button */}
        <div className="flex items-center gap-4 -ml-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/doctor/prescriptions/${prescription.id}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại chi tiết đơn thuốc
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        {/* Patient Info Header */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl">
                  {prescription.patient.fullName.charAt(0)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">{prescription.patient.fullName}</h1>
                  <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      ID: #{prescription.patientId}
                    </span>
                    <span>{calculateAge(prescription.patient.dateOfBirth)} tuổi</span>
                    <span>{prescription.patient.gender === "MALE" ? "Nam" : "Nữ"}</span>
                  </div>
                  <div className="mt-2 text-sm text-slate-600">
                    <div>SĐT: {prescription.patient.phoneNumber}</div>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-slate-600">Mã đơn: {prescription.prescriptionCode}</div>
                <div className="text-sm text-slate-600">Ngày tạo</div>
                <div className="font-semibold text-slate-900">{new Date(prescription.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Diagnosis Information */}
        {prescription.visit && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-600" />
                <CardTitle className="text-xl">Chẩn Đoán</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Diagnosis Details */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-600">Chẩn đoán chính</Label>
                    <div className="mt-1 p-3 bg-blue-50 rounded-lg">
                      <div className="font-semibold text-slate-900">{prescription.visit.diagnosis || "Chưa có chẩn đoán"}</div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-slate-600">Triệu chứng & Ghi chú</Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                      <div className="text-slate-900">{prescription.visit.symptoms || "Chưa có triệu chứng"}</div>
                    </div>
                  </div>
                </div>

                {/* Vital Signs */}
                {prescription.visit.vitalSigns && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="w-4 h-4 text-blue-600" />
                      <Label className="text-sm font-medium text-slate-600">Chỉ số sinh hiệu</Label>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-xs text-slate-600 mb-1">Huyết áp</div>
                        <div className="text-lg font-bold text-slate-900">{prescription.visit.vitalSigns.bloodPressure || "N/A"}</div>
                        <div className="text-xs text-slate-500">mmHg</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-xs text-slate-600 mb-1">Nhịp tim</div>
                        <div className="text-lg font-bold text-slate-900">{prescription.visit.vitalSigns.heartRate || "N/A"}</div>
                        <div className="text-xs text-slate-500">bpm</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-xs text-slate-600 mb-1">Nhiệt độ</div>
                        <div className="text-lg font-bold text-slate-900">{prescription.visit.vitalSigns.temperature || "N/A"}</div>
                        <div className="text-xs text-slate-500">°C</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-xs text-slate-600 mb-1">Cân nặng</div>
                        <div className="text-lg font-bold text-slate-900">{prescription.visit.vitalSigns.weight || "N/A"}</div>
                        <div className="text-xs text-slate-500">kg</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Prescription Form */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-xl">Chỉnh Sửa Đơn Thuốc</CardTitle>
            </div>
            <Button
              onClick={addMedication}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Thêm thuốc
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left p-3 font-semibold text-slate-700 w-12">STT</th>
                    <th className="text-left p-3 font-semibold text-slate-700">Tên thuốc</th>
                    <th className="text-left p-3 font-semibold text-slate-700 w-24">Tổng SL</th>
                    <th className="text-left p-3 font-semibold text-slate-700 w-20">Sáng</th>
                    <th className="text-left p-3 font-semibold text-slate-700 w-20">Trưa</th>
                    <th className="text-left p-3 font-semibold text-slate-700 w-20">Chiều</th>
                    <th className="text-left p-3 font-semibold text-slate-700 w-20">Tối</th>
                    <th className="text-left p-3 font-semibold text-slate-700">Ghi chú</th>
                    <th className="text-left p-3 font-semibold text-slate-700 w-16">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {medications.map((medication, index) => (
                    <tr key={medication.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3 text-center font-medium text-slate-600">
                        {index + 1}
                      </td>
                      <td className="p-3">
                        <div className="relative">
                          <div className="relative">
                            <Input
                              placeholder="Tìm kiếm thuốc..."
                              value={searchTerms[medication.id] || medication.name}
                              onChange={(e) => handleMedicineSearch(medication.id, e.target.value)}
                              onFocus={() => setShowSuggestions(prev => ({ ...prev, [medication.id]: (searchTerms[medication.id] || medication.name).length > 0 }))}
                              className="border-gray-300 focus:border-blue-500 pr-8"
                            />
                            <Search className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          </div>
                          
                          {/* Dropdown gợi ý thuốc */}
                          {showSuggestions[medication.id] && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                              {getFilteredMedicines(searchTerms[medication.id] || medication.name).map((medicine) => (
                                <div
                                  key={medicine.id}
                                  className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                  onClick={() => selectMedicine(medication.id, medicine)}
                                >
                                  <div className="font-medium text-slate-900">{medicine.name}</div>
                                  <div className="text-sm text-slate-600">{medicine.category} • {medicine.unit} • Stock: {medicine.currentStock}</div>
                                </div>
                              ))}
                              {getFilteredMedicines(searchTerms[medication.id] || medication.name).length === 0 && (
                                <div className="p-3 text-gray-500 text-center">
                                  Không tìm thấy thuốc phù hợp
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <Input
                          type="number"
                          placeholder="0"
                          value={medication.quantity || ""}
                          className="border-gray-300 bg-gray-50 text-center font-semibold text-blue-600"
                          readOnly
                          title="Tự động tính từ tổng các liều"
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={medication.dosageMorning || ""}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0
                            if (value >= 0) {
                              updateMedication(medication.id, 'dosageMorning', value)
                            }
                          }}
                          className="border-gray-300 focus:border-blue-500 text-center"
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={medication.dosageNoon || ""}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0
                            if (value >= 0) {
                              updateMedication(medication.id, 'dosageNoon', value)
                            }
                          }}
                          className="border-gray-300 focus:border-blue-500 text-center"
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={medication.dosageAfternoon || ""}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0
                            if (value >= 0) {
                              updateMedication(medication.id, 'dosageAfternoon', value)
                            }
                          }}
                          className="border-gray-300 focus:border-blue-500 text-center"
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={medication.dosageEvening || ""}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0
                            if (value >= 0) {
                              updateMedication(medication.id, 'dosageEvening', value)
                            }
                          }}
                          className="border-gray-300 focus:border-blue-500 text-center"
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          placeholder="Ghi chú..."
                          value={medication.instruction}
                          onChange={(e) => updateMedication(medication.id, 'instruction', e.target.value)}
                          className="border-gray-300 focus:border-blue-500"
                        />
                      </td>
                      <td className="p-3 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMedication(medication.id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          disabled={medications.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Additional Notes */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-xl">Ghi Chú Thêm</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Nhập ghi chú thêm về cách sử dụng thuốc, lưu ý đặc biệt..."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              rows={4}
              className="resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={500}
            />
            <div className="text-xs text-slate-500 mt-1">
              {additionalNotes.length}/500 ký tự
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end pb-6">
          <Button
            variant="outline"
            onClick={() => navigate(`/doctor/prescriptions/${prescription.id}`)}
            className="flex items-center gap-2"
          >
            Hủy
          </Button>
          
          <Button
            onClick={handleSavePrescription}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Lưu thay đổi
              </>
            )}
          </Button>
        </div>
      </div>
    </DoctorSidebar>
  )
}
