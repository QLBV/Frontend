import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import DoctorSidebar from '@/components/sidebar/doctor'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  ArrowLeft, 
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Loader2,
  Calendar,
  User,
  Pill,
  FileText,
  ChevronRight,
  AlertCircle
} from "lucide-react"

interface Medicine {
  medicineId: number
  name: string
  dosageMorning: number
  dosageNoon: number
  dosageAfternoon: number
  dosageEvening: number
  quantity: number
  instruction: string
}

interface Prescription {
  id: number
  patientId: number
  patientName: string
  visitId: number
  medicines: Medicine[]
  note: string
  createdAt: string
  updatedAt: string
}

export default function QuanlyDonThuoc() {
  const navigate = useNavigate()
  
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<number | null>(null)

  // Fetch prescriptions on mount
  useEffect(() => {
    fetchPrescriptions()
  }, [])

  const fetchPrescriptions = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Mock data thay vì gọi API
      const mockPrescriptions: Prescription[] = [
        {
          id: 1,
          patientId: 1,
          patientName: "Nguyễn Văn A",
          visitId: 1,
          medicines: [
            {
              medicineId: 1,
              name: "Paracetamol 500mg",
              dosageMorning: 1,
              dosageNoon: 1,
              dosageAfternoon: 1,
              dosageEvening: 1,
              quantity: 20,
              instruction: "Uống sau ăn, ngày 3 lần"
            },
            {
              medicineId: 2,
              name: "Amoxicillin 250mg",
              dosageMorning: 1,
              dosageNoon: 0,
              dosageAfternoon: 1,
              dosageEvening: 0,
              quantity: 14,
              instruction: "Uống trước ăn 30 phút"
            }
          ],
          note: "Uống đủ nước, nghỉ ngơi nhiều",
          createdAt: "2024-12-27T08:30:00Z",
          updatedAt: "2024-12-27T08:30:00Z"
        },
        {
          id: 2,
          patientId: 2,
          patientName: "Trần Thị B",
          visitId: 2,
          medicines: [
            {
              medicineId: 3,
              name: "Ibuprofen 400mg",
              dosageMorning: 1,
              dosageNoon: 0,
              dosageAfternoon: 0,
              dosageEvening: 1,
              quantity: 10,
              instruction: "Uống khi đau"
            }
          ],
          note: "Tái khám sau 1 tuần",
          createdAt: "2024-12-26T14:15:00Z",
          updatedAt: "2024-12-26T14:15:00Z"
        },
        {
          id: 3,
          patientId: 3,
          patientName: "Lê Văn C",
          visitId: 3,
          medicines: [
            {
              medicineId: 4,
              name: "Vitamin C 1000mg",
              dosageMorning: 1,
              dosageNoon: 0,
              dosageAfternoon: 0,
              dosageEvening: 0,
              quantity: 30,
              instruction: "Uống sau bữa sáng"
            },
            {
              medicineId: 5,
              name: "Cetirizine 10mg",
              dosageMorning: 0,
              dosageNoon: 0,
              dosageAfternoon: 0,
              dosageEvening: 1,
              quantity: 7,
              instruction: "Uống trước khi ngủ"
            }
          ],
          note: "Tránh tiếp xúc với chất gây dị ứng",
          createdAt: "2024-12-25T10:45:00Z",
          updatedAt: "2024-12-25T10:45:00Z"
        }
      ]
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setPrescriptions(mockPrescriptions)
    } catch (err: any) {
      console.error('Error fetching prescriptions:', err)
      setError('Lỗi khi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  // Filter prescriptions based on search
  const filteredPrescriptions = prescriptions.filter(prescription =>
    prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.id.toString().includes(searchTerm) ||
    prescription.patientId.toString().includes(searchTerm)
  )

  // View prescription details
  const handleViewDetails = (prescription: Prescription) => {
    setSelectedPrescription(prescription)
    setShowDetails(true)
  }

  // Edit prescription
  const handleEdit = (prescriptionId: number) => {
    navigate(`/doctor/prescriptions/${prescriptionId}/edit`)
  }

  // Delete prescription
  const handleDelete = async (prescriptionId: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa đơn thuốc này?')) {
      return
    }

    try {
      setDeleting(prescriptionId)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Remove from local state
      setPrescriptions(prescriptions.filter(p => p.id !== prescriptionId))
      setError(null)
    } catch (err: any) {
      console.error('Error deleting prescription:', err)
      setError('Lỗi khi xóa đơn thuốc')
    } finally {
      setDeleting(null)
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Calculate total dosage
  const calculateTotalDosage = (medicine: Medicine) => {
    return medicine.dosageMorning + medicine.dosageNoon + medicine.dosageAfternoon + medicine.dosageEvening
  }

  if (loading) {
    return (
      <DoctorSidebar>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-slate-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      </DoctorSidebar>
    )
  }

  return (
    <DoctorSidebar>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/doctor/medicalList")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </Button>
            <h1 className="text-3xl font-bold text-slate-900">Quản Lý Đơn Thuốc</h1>
          </div>
          
          <Button
            onClick={() => navigate("/doctor/patients")}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Kê đơn mới
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Lỗi</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="relative">
              <Input
                placeholder="Tìm kiếm theo tên bệnh nhân, ID đơn thuốc..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-blue-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        {/* Prescriptions List */}
        {filteredPrescriptions.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12">
              <div className="text-center">
                <Pill className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-slate-600 font-medium">
                  {searchTerm ? "Không tìm thấy đơn thuốc phù hợp" : "Chưa có đơn thuốc nào"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredPrescriptions.map((prescription) => (
              <Card key={prescription.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between p-6">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">
                            Đơn Thuốc #{prescription.id}
                          </h3>
                          <p className="text-sm text-slate-600 mt-1 flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {prescription.patientName} (ID: {prescription.patientId})
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-600 flex items-center justify-end gap-2">
                            <Calendar className="w-4 h-4" />
                            {formatDate(prescription.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Medicines Summary */}
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-xs font-semibold text-slate-600 mb-2">
                          <Pill className="w-3 h-3 inline-block mr-1" />
                          Các loại thuốc ({prescription.medicines.length})
                        </p>
                        <div className="space-y-1">
                          {prescription.medicines.slice(0, 2).map((medicine, idx) => (
                            <p key={idx} className="text-sm text-slate-700">
                              {medicine.name} - {calculateTotalDosage(medicine)} viên
                            </p>
                          ))}
                          {prescription.medicines.length > 2 && (
                            <p className="text-sm text-slate-600 italic">
                              +{prescription.medicines.length - 2} loại khác
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Notes */}
                      {prescription.note && (
                        <p className="text-sm text-slate-600 flex items-start gap-2">
                          <FileText className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{prescription.note}</span>
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(prescription)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        title="Xem chi tiết"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(prescription.id)}
                        className="text-amber-600 hover:text-amber-800 hover:bg-amber-50"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(prescription.id)}
                        disabled={deleting === prescription.id}
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        title="Xóa"
                      >
                        {deleting === prescription.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>

                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Details Modal */}
        {showDetails && selectedPrescription && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Chi Tiết Đơn Thuốc #{selectedPrescription.id}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </Button>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Patient Info */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    Thông tin bệnh nhân
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-600">Họ tên</p>
                      <p className="font-medium text-slate-900">{selectedPrescription.patientName}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">ID bệnh nhân</p>
                      <p className="font-medium text-slate-900">#{selectedPrescription.patientId}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Ngày kê đơn</p>
                      <p className="font-medium text-slate-900">{formatDate(selectedPrescription.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Visit ID</p>
                      <p className="font-medium text-slate-900">#{selectedPrescription.visitId}</p>
                    </div>
                  </div>
                </div>

                {/* Medicines */}
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Pill className="w-4 h-4 text-blue-600" />
                    Danh sách thuốc ({selectedPrescription.medicines.length})
                  </h3>
                  <div className="space-y-3">
                    {selectedPrescription.medicines.map((medicine, idx) => (
                      <div key={idx} className="border border-gray-200 rounded-lg p-4">
                        <p className="font-semibold text-slate-900 mb-2">{medicine.name}</p>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-slate-600">Sáng</p>
                            <p className="font-medium">{medicine.dosageMorning} viên</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Trưa</p>
                            <p className="font-medium">{medicine.dosageNoon} viên</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Chiều</p>
                            <p className="font-medium">{medicine.dosageAfternoon} viên</p>
                          </div>
                          <div>
                            <p className="text-slate-600">Tối</p>
                            <p className="font-medium">{medicine.dosageEvening} viên</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-slate-600">Tổng số lượng</p>
                            <p className="font-medium text-blue-600">{calculateTotalDosage(medicine)} viên</p>
                          </div>
                        </div>
                        {medicine.instruction && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-sm text-slate-600">Hướng dẫn sử dụng</p>
                            <p className="text-sm text-slate-900">{medicine.instruction}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {selectedPrescription.note && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      Ghi chú
                    </h3>
                    <p className="text-slate-700">{selectedPrescription.note}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <Button
                    onClick={() => {
                      handleEdit(selectedPrescription.id)
                      setShowDetails(false)
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white flex-1"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Chỉnh sửa
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDetails(false)}
                    className="flex-1"
                  >
                    Đóng
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DoctorSidebar>
  )
}
