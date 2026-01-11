import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import DoctorSidebar from '@/components/sidebar/doctor'
import api from "@/lib/api"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
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
  AlertCircle,
  Filter,
  X
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
  status?: string
  medicines: Medicine[]
  note: string
  createdAt: string
  updatedAt: string
}

interface PaginationInfo {
  total: number
  page: number
  limit: number
  totalPages: number
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
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [patientIdFilter, setPatientIdFilter] = useState<string>("")
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0
  })

  // Fetch prescriptions when filters or pagination change
  useEffect(() => {
    fetchPrescriptions()
  }, [currentPage, pageSize, statusFilter, patientIdFilter])

  const fetchPrescriptions = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Build query parameters
      const params: any = {
        page: currentPage,
        limit: pageSize
      }
      
      if (statusFilter && statusFilter !== "ALL") {
        params.status = statusFilter
      }
      
      if (patientIdFilter) {
        params.patientId = parseInt(patientIdFilter)
      }
      
      // Fetch from API with filters
      const response = await api.get('/prescriptions', { params })
      
      if (response.data.success) {
        // Transform backend data to frontend format
        const transformedPrescriptions: Prescription[] = response.data.data.map((prescription: any) => ({
          id: prescription.id,
          patientId: prescription.patientId,
          patientName: prescription.patient?.user?.fullName || 'N/A',
          visitId: prescription.visitId,
          status: prescription.status,
          medicines: prescription.details?.map((detail: any) => ({
            medicineId: detail.medicineId,
            name: detail.Medicine?.name || detail.medicine?.name || 'Unknown',
            dosageMorning: detail.dosageMorning || 0,
            dosageNoon: detail.dosageNoon || 0,
            dosageAfternoon: detail.dosageAfternoon || 0,
            dosageEvening: detail.dosageEvening || 0,
            quantity: detail.quantity || 0,
            instruction: detail.instruction || ''
          })) || [],
          note: prescription.note || '',
          createdAt: prescription.createdAt,
          updatedAt: prescription.updatedAt
        }))
        
        setPrescriptions(transformedPrescriptions)
        
        // Update pagination info
        if (response.data.pagination) {
          setPagination(response.data.pagination)
        }
      } else {
        throw new Error(response.data.message || 'Failed to fetch prescriptions')
      }
    } catch (err: any) {
      console.error('Error fetching prescriptions:', err)
      const errorMessage = err.response?.data?.message || err.message || 'Lỗi khi tải dữ liệu'
      setError(errorMessage)
      toast.error(errorMessage)
      
      // Fallback to empty array instead of mock data
      setPrescriptions([])
    } finally {
      setLoading(false)
    }
  }

  // Filter prescriptions based on search (client-side for name/ID search)
  const filteredPrescriptions = prescriptions.filter(prescription =>
    searchTerm === "" || 
    prescription.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prescription.id.toString().includes(searchTerm) ||
    prescription.patientId.toString().includes(searchTerm)
  )
  
  // Reset filters
  const handleResetFilters = () => {
    setStatusFilter("ALL")
    setPatientIdFilter("")
    setSearchTerm("")
    setCurrentPage(1)
  }
  
  // Check if any filters are active
  const hasActiveFilters = statusFilter !== "ALL" || patientIdFilter !== "" || searchTerm !== ""

  // View prescription details
  const handleViewDetails = (prescription: Prescription) => {
    setSelectedPrescription(prescription)
    setShowDetails(true)
  }

  // Edit prescription
  const handleEdit = (prescriptionId: number) => {
    navigate(`/doctor/prescriptions/${prescriptionId}/edit`)
  }

  // Delete prescription (cancel via API)
  const handleDelete = async (prescriptionId: number) => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn thuốc này?')) {
      return
    }

    try {
      setDeleting(prescriptionId)
      setError(null)
      
      // Call API to cancel prescription
      const response = await api.post(`/prescriptions/${prescriptionId}/cancel`)
      
      if (response.data.success) {
        // Refresh prescriptions list after successful deletion
        fetchPrescriptions()
        toast.success('Đã hủy đơn thuốc thành công')
      } else {
        throw new Error(response.data.message || 'Không thể hủy đơn thuốc')
      }
    } catch (err: any) {
      console.error('Error deleting prescription:', err)
      const errorMessage = err.response?.data?.message || 'Lỗi khi hủy đơn thuốc'
      setError(errorMessage)
      toast.error(errorMessage)
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
  
  // Get status badge
  const getStatusBadge = (status?: string) => {
    if (!status) return null
    
    switch (status) {
      case 'DRAFT':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Nháp</Badge>
      case 'LOCKED':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Đã khóa</Badge>
      case 'DISPENSED':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Đã phát thuốc</Badge>
      case 'CANCELLED':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Đã hủy</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
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
            onClick={() => navigate("/doctor/medicalList")}
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

        {/* Filters and Search */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-600" />
                Bộ Lọc & Tìm Kiếm
              </CardTitle>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <X className="w-4 h-4 mr-1" />
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Input
                placeholder="Tìm kiếm theo tên bệnh nhân, ID đơn thuốc..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-300 focus:border-blue-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            
            {/* Filter Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Status Filter */}
              <div className="space-y-2">
                <Label htmlFor="status-filter" className="text-sm font-medium text-slate-700">
                  Trạng thái
                </Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status-filter" className="w-full">
                    <SelectValue placeholder="Tất cả trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                    <SelectItem value="DRAFT">Nháp</SelectItem>
                    <SelectItem value="LOCKED">Đã khóa</SelectItem>
                    <SelectItem value="DISPENSED">Đã phát thuốc</SelectItem>
                    <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Patient ID Filter */}
              <div className="space-y-2">
                <Label htmlFor="patient-id-filter" className="text-sm font-medium text-slate-700">
                  ID Bệnh nhân
                </Label>
                <Input
                  id="patient-id-filter"
                  type="number"
                  placeholder="Nhập ID bệnh nhân..."
                  value={patientIdFilter}
                  onChange={(e) => {
                    setPatientIdFilter(e.target.value)
                    setCurrentPage(1) // Reset to first page when filter changes
                  }}
                  className="border-gray-300 focus:border-blue-500"
                />
              </div>
              
              {/* Page Size Selector */}
              <div className="space-y-2">
                <Label htmlFor="page-size" className="text-sm font-medium text-slate-700">
                  Số lượng mỗi trang
                </Label>
                <Select 
                  value={pageSize.toString()} 
                  onValueChange={(value) => {
                    setPageSize(parseInt(value))
                    setCurrentPage(1) // Reset to first page when page size changes
                  }}
                >
                  <SelectTrigger id="page-size" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prescriptions List */}
        {filteredPrescriptions.length === 0 && !loading ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="p-12">
              <div className="text-center">
                <Pill className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-slate-600 font-medium">
                  {hasActiveFilters ? "Không tìm thấy đơn thuốc phù hợp" : "Chưa có đơn thuốc nào"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4">
              {filteredPrescriptions.map((prescription) => (
              <Card key={prescription.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between p-6">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-slate-900">
                              Đơn Thuốc #{prescription.id}
                            </h3>
                            {getStatusBadge(prescription.status)}
                          </div>
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
            
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-slate-600">
                      Hiển thị {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, pagination.total)} trong tổng số {pagination.total} đơn thuốc
                    </div>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              if (currentPage > 1) {
                                setCurrentPage(currentPage - 1)
                                window.scrollTo({ top: 0, behavior: 'smooth' })
                              }
                            }}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                        
                        {/* Page Numbers */}
                        {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                          let pageNum: number
                          if (pagination.totalPages <= 5) {
                            pageNum = i + 1
                          } else if (currentPage <= 3) {
                            pageNum = i + 1
                          } else if (currentPage >= pagination.totalPages - 2) {
                            pageNum = pagination.totalPages - 4 + i
                          } else {
                            pageNum = currentPage - 2 + i
                          }
                          
                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault()
                                  setCurrentPage(pageNum)
                                  window.scrollTo({ top: 0, behavior: 'smooth' })
                                }}
                                isActive={currentPage === pageNum}
                                className="cursor-pointer"
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          )
                        })}
                        
                        {pagination.totalPages > 5 && currentPage < pagination.totalPages - 2 && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                        
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault()
                              if (currentPage < pagination.totalPages) {
                                setCurrentPage(currentPage + 1)
                                window.scrollTo({ top: 0, behavior: 'smooth' })
                              }
                            }}
                            className={currentPage === pagination.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
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
