import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import DoctorSidebar from '@/components/sidebar/doctor'
import api from "@/lib/api"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  Plus,
  Search,

  Edit,
  Trash2,
  Loader2,
  Calendar,
  Pill,
  FileText,
  ChevronRight,

  X,
  BriefcaseMedical,
  CheckCircle2,
  Clock,
  Ban,
  Download,
  Info,
  UserCheck,
  Lock
} from "lucide-react"
import { cn } from "@/lib/utils"

// Interfaces
interface Medicine {
  medicineId: number
  name: string
  dosageMorning: number
  dosageNoon: number
  dosageAfternoon: number
  dosageEvening: number
  quantity: number
  days?: number
  instruction: string
  unit?: string
}

interface Prescription {
  id: number
  prescriptionCode?: string
  patientId: number
  patientName: string
  visitId: number
  status: "DRAFT" | "LOCKED" | "DISPENSED" | "CANCELLED"
  medicines: Medicine[]
  note: string
  createdAt: string
  updatedAt: string
  doctor?: {
    fullName: string
    specialty: string
  }
  patient?: {
    fullName: string
    dateOfBirth: string
    gender: string
    patientCode?: string
  }
  visit?: {
    diagnosis: string
  }
}

interface PaginationInfo {
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function PrescriptionManagementPage() {
  const navigate = useNavigate()
  
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [deleting, setDeleting] = useState<number | null>(null)
  const [lockConfirmationId, setLockConfirmationId] = useState<number | null>(null)
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [patientIdFilter, setPatientIdFilter] = useState<string>("")
  const [dateFilter, setDateFilter] = useState<string>("")
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10


  // Stats
  const [stats, setStats] = useState({
    total: 0,
    draft: 0,
    locked: 0,
    dispensed: 0,
    cancelled: 0
  })



  const fetchPrescriptions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params: any = {
        limit: 1000 // Construct client-side pagination by fetching all/many
      }
      
      if (statusFilter && statusFilter !== "ALL") {
        params.status = statusFilter
      }
      
      if (patientIdFilter) {
        params.patientId = parseInt(patientIdFilter)
      }

      if (dateFilter) {
        params.date = dateFilter
      }
      
      const response = await api.get('/prescriptions', { params })
      
      if (response.data.success) {
        const transformed: Prescription[] = response.data.data.map((p: any) => ({
          ...p,
          patientName: p.patient?.user?.fullName || p.patient?.fullName || 'N/A',
          patient: p.patient ? {
            ...p.patient,
            patientCode: p.patient.patientCode || null
          } : undefined,
          doctor: p.doctor ? {
            ...p.doctor,
            fullName: p.doctor.user?.fullName || p.doctor.fullName || 'N/A',
            specialty: typeof p.doctor.specialty === 'object' ? p.doctor.specialty?.name : p.doctor.specialty || 'N/A'
          } : undefined,
          medicines: p.details?.map((d: any) => ({
            medicineId: d.medicineId,
            name: d.medicineName || d.Medicine?.name || d.medicine?.name || 'Unknown',
            dosageMorning: d.dosageMorning || 0,
            dosageNoon: d.dosageNoon || 0,
            dosageAfternoon: d.dosageAfternoon || 0,
            dosageEvening: d.dosageEvening || 0,
            quantity: d.quantity || 0,
            days: d.days,
            instruction: d.instruction || '',
            unit: d.unit || d.Medicine?.unit || d.medicine?.unit || 'viên'
          })) || []
        }))
        
        setPrescriptions(transformed)
        setPrescriptions(transformed)

        // Generate simple stats from current view for demo/UI purposes
        // Ideally these come from a dedicated stats endpoint
        const allList = response.data.data || []
        setStats({
          total: response.data.pagination?.total || allList.length,
          draft: allList.filter((p: any) => p.status === 'DRAFT').length,
          locked: allList.filter((p: any) => p.status === 'LOCKED').length,
          dispensed: allList.filter((p: any) => p.status === 'DISPENSED').length,
          cancelled: allList.filter((p: any) => p.status === 'CANCELLED').length,
        })
      }
    } catch (err: any) {
      console.error('Error fetching prescriptions:', err)
      setError(err.response?.data?.message || 'Lỗi khi tải dữ liệu')
      toast.error('Không thể tải danh sách đơn thuốc')
    } finally {
      setLoading(false)
    }
  }, [statusFilter, patientIdFilter, dateFilter])

  // Fetch prescriptions when filters or pagination change
  useEffect(() => {
    fetchPrescriptions()
  }, [fetchPrescriptions])

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn hủy đơn thuốc này?')) return

    try {
      setDeleting(id)
      const response = await api.post(`/prescriptions/${id}/cancel`)
      if (response.data.success) {
        fetchPrescriptions()
        toast.success('Đã hủy đơn thuốc thành công')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi hủy đơn thuốc')
    } finally {
      setDeleting(null)
    }
  }

  const handleLock = (id: number) => {
    setLockConfirmationId(id)
  }

  const confirmLock = async () => {
    if (!lockConfirmationId) return

    try {
      const response = await api.post(`/prescriptions/${lockConfirmationId}/lock`)
      if (response.data.success) {
        fetchPrescriptions()
        toast.success('Đã khóa đơn thuốc thành công')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Lỗi khi khóa đơn thuốc')
    } finally {
      setLockConfirmationId(null)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'DRAFT': return { label: 'Bản nháp', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock }
      case 'LOCKED': return { label: 'Đã khóa', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 }
      case 'DISPENSED': return { label: 'Đã phát', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: Pill }
      case 'CANCELLED': return { label: 'Đã hủy', color: 'bg-red-50 text-red-700 border-red-200', icon: Ban }
      default: return { label: status, color: 'bg-slate-50 text-slate-700 border-slate-200', icon: FileText }
    }
  }

  // Search filtered results
  const filteredPrescriptions = prescriptions.filter(p => 
    searchTerm === "" || 
    p.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.prescriptionCode && p.prescriptionCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
    p.id.toString().includes(searchTerm)
  )

  // Calculate pagination
  const totalPages = Math.ceil(filteredPrescriptions.length / itemsPerPage)
  const paginatedPrescriptions = filteredPrescriptions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  
  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, patientIdFilter, dateFilter]);

  const downloadPDF = async (id: number) => {
    try {
      toast.loading('Đang chuẩn bị PDF...')
      const response = await api.get(`/prescriptions/${id}/pdf`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `prescription-${id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.dismiss()
      toast.success('Tải PDF thành công')
    } catch (err) {
      toast.dismiss()
      toast.error('Lỗi khi tải PDF')
    }
  }

  const handleViewDetails = (prescription: Prescription) => {
    setSelectedPrescription(prescription)
    setShowDetails(true)
  }

  const handleEdit = (id: number) => {
    navigate(`/doctor/prescriptions/${id}/edit`)
  }

  return (
    <DoctorSidebar>
      <div className="max-w-[1600px] mx-auto space-y-6 pb-10">
        
        {/* Simplified Modern Header */}
        <div className="bg-white rounded-[1.5rem] p-8 shadow-sm border border-slate-200/60 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full -mr-32 -mt-32 blur-3xl" />
          
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                <BriefcaseMedical className="w-7 h-7 text-white" />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quản lý Đơn thuốc</h1>
                <p className="text-slate-500 text-sm">
                  Theo dõi và quản lý hồ sơ đơn thuốc của bệnh nhân
                </p>
              </div>
            </div>
            
            <Button
              onClick={() => navigate("/doctor/medicalList")}
              className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-95 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span className="font-semibold">Tạo đơn thuốc</span>
            </Button>
          </div>
        </div>

        {/* Streamlined Stats Row - Clickable */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
           {[
             { label: "Tổng số đơn", val: stats.total, icon: FileText, color: "text-blue-600", bg: "bg-blue-50", filter: "ALL", border: "hover:border-blue-300" },
             { label: "Chờ phát", val: stats.locked, icon: Clock, color: "text-amber-600", bg: "bg-amber-50", filter: "LOCKED", border: "hover:border-amber-300" },
             { label: "Đã hoàn tất", val: stats.dispensed, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", filter: "DISPENSED", border: "hover:border-emerald-300" },
             { label: "Bản nháp", val: stats.draft, icon: Edit, color: "text-slate-600", bg: "bg-slate-50", filter: "DRAFT", border: "hover:border-slate-300" }
           ].map((stat, i) => (
             <div 
               key={i} 
               onClick={() => setStatusFilter(stat.filter)}
               className={cn(
                 "bg-white border border-slate-200/60 rounded-[1.25rem] p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group",
                 stat.border,
                 statusFilter === stat.filter ? "ring-2 ring-blue-500/20 border-blue-500" : ""
               )}
             >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider group-hover:text-slate-700 transition-colors">{stat.label}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{stat.val}</p>
                  </div>
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", stat.bg)}>
                    <stat.icon className={cn("w-5 h-5", stat.color)} />
                  </div>
                </div>
             </div>
           ))}
        </div>

        {/* Search & Filter Bar - More Compact */}
        <div className="bg-white rounded-[1.25rem] p-4 shadow-sm border border-slate-200/60 flex flex-col lg:flex-row items-center gap-4">
          <div className="relative flex-1 w-full lg:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Tìm bệnh nhân hoặc mã đơn thuốc..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-11 pl-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-blue-500 rounded-xl text-sm"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
             <Input
               type="date"
               value={dateFilter}
               onChange={(e) => setDateFilter(e.target.value)}
               className="h-11 w-40 bg-slate-50 border-slate-200 rounded-xl text-sm"
             />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-11 w-full lg:w-48 bg-slate-50 border-slate-200 rounded-xl text-sm">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                <SelectItem value="DRAFT">Bản nháp</SelectItem>
                <SelectItem value="LOCKED">Chờ phát thuốc</SelectItem>
                <SelectItem value="DISPENSED">Đã hoàn tất</SelectItem>
                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
              </SelectContent>
            </Select>

            {(searchTerm || statusFilter !== "ALL") && (
              <Button 
                variant="ghost" 
                onClick={() => {
                  setSearchTerm("")
                  setStatusFilter("ALL")
                  setDateFilter("")
                }}
                className="h-11 px-4 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 text-sm"
              >
                <X className="w-4 h-4 mr-2" />
                Xóa lọc
              </Button>
            )}
          </div>
        </div>

        {/* Content Area - Clean Modern Table */}
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3">
             <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
             <p className="text-sm font-medium text-slate-500">Đang tải dữ liệu...</p>
          </div>
        ) : filteredPrescriptions.length === 0 ? (
          <div className="bg-white rounded-[1.5rem] p-16 border border-slate-200/60 text-center space-y-4">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
               <Pill className="w-8 h-8" />
             </div>
             <div>
               <h3 className="text-lg font-bold text-slate-900">Không có dữ liệu</h3>
               <p className="text-sm text-slate-500">Mời bạn điều chỉnh bộ lọc hoặc tạo đơn mới</p>
             </div>
             

          </div>
        ) : (
          <div className="bg-white rounded-[1.25rem] border border-slate-200/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200/60">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Bệnh nhân</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Mã đơn / Ngày</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Thuốc chỉ định</th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedPrescriptions.map((p) => {
                    const config = getStatusConfig(p.status)
                    const StatusIcon = config.icon
                    return (
                      <tr 
                        key={p.id} 
                        className="group hover:bg-slate-50/80 transition-all cursor-pointer"
                        onClick={() => handleViewDetails(p)}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center text-xs font-bold text-blue-600 border border-blue-100">
                              {p.patientName.charAt(0)}
                            </div>
                            <div>
                               <p className="text-sm font-semibold text-slate-900">{p.patientName}</p>
                               <span className="text-[11px] text-slate-500 font-medium">{p.patient?.patientCode || `BN-${p.patientId}`}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                           <div className="space-y-0.5">
                              <p className="text-xs font-bold text-blue-600 font-mono tracking-tight">
                                 {p.prescriptionCode || `#DT-${p.id}`}
                              </p>
                              <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDate(p.createdAt)}
                              </p>
                           </div>
                        </td>

                        <td className="px-6 py-4">
                           <div className="flex flex-wrap gap-1">
                              {p.medicines.slice(0, 2).map((med, idx) => (
                                <span key={idx} className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-medium text-slate-600 border border-slate-200/50">
                                   {med.name}
                                </span>
                              ))}
                              {p.medicines.length > 2 && (
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-semibold">
                                   + {p.medicines.length - 2} thuốc khác
                                </span>
                              )}
                              {p.medicines.length === 0 && (
                                <span className="text-xs text-slate-400 italic font-medium">Chưa kê thuốc</span>
                              )}
                           </div>
                        </td>

                        <td className="px-6 py-4">
                           <div className="flex justify-center">
                              <div className={cn("px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 border shadow-sm", config.color)}>
                                <StatusIcon className="w-3 h-3" />
                                {config.label}
                              </div>
                           </div>
                        </td>

                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                           <div className="flex items-center justify-end gap-1">
                               <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => downloadPDF(p.id)}
                                  className="h-8 w-8 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                               >
                                  <Download className="w-4 h-4" />
                               </Button>
                               <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(p.id)}
                                  disabled={p.status !== "DRAFT"}
                                  className="h-8 w-8 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                               >
                                  <Edit className="w-4 h-4" />
                               </Button>
                               {p.status === "DRAFT" && (
                                 <Button
                                   variant="ghost"
                                   size="icon"
                                   onClick={() => handleLock(p.id)}
                                   title="Khóa đơn thuốc"
                                   className="h-8 w-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                 >
                                   <Lock className="w-4 h-4" />
                                 </Button>
                               )}
                               <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(p.id)}
                                  disabled={deleting === p.id || p.status === "LOCKED" || p.status === "DISPENSED"}
                                  className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {deleting === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                </Button>
                                <div className="w-[1px] h-4 bg-slate-200 mx-1" />
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                           </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            
             {/* Pagination Inside Card */}
               <div className="px-6 py-4 border-t bg-white flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                     Hiển thị <span className="text-slate-900">{paginatedPrescriptions.length}</span> trên <span className="text-slate-900">{filteredPrescriptions.length}</span> hóa đơn
                  </div>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          href="#" 
                          onClick={(e) => { e.preventDefault(); if(currentPage > 1) setCurrentPage(currentPage - 1) }}
                          className={cn("rounded-xl border-0 bg-slate-50 hover:bg-slate-100 text-slate-900 font-bold", currentPage === 1 && "pointer-events-none opacity-50")}
                        />
                      </PaginationItem>
                      <div className="flex items-center px-4 font-bold text-sm text-slate-700">
                          Trang {currentPage} / {totalPages || 1}
                      </div>
                      <PaginationItem>
                        <PaginationNext 
                          href="#" 
                          onClick={(e) => { e.preventDefault(); if(currentPage < totalPages) setCurrentPage(currentPage + 1) }}
                          className={cn("rounded-xl border-0 bg-slate-50 hover:bg-slate-100 text-slate-900 font-bold", currentPage === totalPages && "pointer-events-none opacity-50")}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
               </div>
          </div>
        )}


        {/* Simplified Details Modal */}
        {showDetails && selectedPrescription && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto">
            <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col rounded-2xl border-0 shadow-2xl bg-white">
              {/* Simple Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Pill className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Chi tiết đơn thuốc</h2>
                    <p className="text-blue-200 text-sm">{selectedPrescription.prescriptionCode || `#DT-${selectedPrescription.id}`}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold border",
                    getStatusConfig(selectedPrescription.status).color
                  )}>
                    {getStatusConfig(selectedPrescription.status).label}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowDetails(false)}
                    className="rounded-xl text-white/70 hover:text-white hover:bg-white/20 h-9 w-9"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <CardContent className="p-6 overflow-y-auto flex-1 space-y-6">
                {/* Patient & Visit Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mb-2">
                      <UserCheck className="w-4 h-4" />
                      Bệnh nhân
                    </div>
                    <p className="text-lg font-bold text-slate-900">{selectedPrescription.patientName}</p>
                    <div className="flex gap-4 mt-2 text-sm text-slate-600">
                      <span>
                        {selectedPrescription.patient?.dateOfBirth 
                          ? `${new Date().getFullYear() - new Date(selectedPrescription.patient.dateOfBirth).getFullYear()} tuổi`
                          : 'N/A'
                        }
                      </span>
                      <span>{selectedPrescription.patient?.gender === "MALE" ? "Nam" : "Nữ"}</span>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-center gap-2 text-blue-600 text-xs font-medium mb-2">
                      <FileText className="w-4 h-4" />
                      Chẩn đoán
                    </div>
                    <p className="text-slate-900 font-medium">
                      {selectedPrescription.visit?.diagnosis || 'Chưa cập nhật'}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      Ngày kê: {formatDate(selectedPrescription.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Medicines List */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-700">
                      Danh sách thuốc ({selectedPrescription.medicines.length})
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    {selectedPrescription.medicines.map((medicine, idx) => (
                      <div key={idx} className="p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-slate-900">
                              {idx + 1}. {medicine.name}
                            </h4>
                            <p className="text-sm text-blue-600 font-medium">
                              {medicine.quantity} {medicine.unit || "viên"}
                              {medicine.days && ` • ${medicine.days} ngày`}
                            </p>
                          </div>
                        </div>

                        {/* Dosage Grid - Simple */}
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { label: "Sáng", val: medicine.dosageMorning, bg: "bg-amber-50", text: "text-amber-700" },
                            { label: "Trưa", val: medicine.dosageNoon, bg: "bg-orange-50", text: "text-orange-700" },
                            { label: "Chiều", val: medicine.dosageAfternoon, bg: "bg-blue-50", text: "text-blue-700" },
                            { label: "Tối", val: medicine.dosageEvening, bg: "bg-indigo-50", text: "text-indigo-700" }
                          ].map((d, i) => (
                            <div key={i} className={cn("text-center p-2 rounded-lg", d.bg)}>
                              <p className="text-[10px] font-medium text-slate-500 uppercase">{d.label}</p>
                              <p className={cn("text-lg font-bold", d.text)}>{d.val}</p>
                            </div>
                          ))}
                        </div>

                        {medicine.instruction && (
                          <p className="mt-3 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                            📝 {medicine.instruction}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Doctor Info */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="text-right">
                    <p className="text-xs text-slate-500 mb-1">Bác sĩ kê đơn</p>
                    <p className="text-lg font-bold text-slate-900">
                      {selectedPrescription.doctor?.fullName || 'N/A'}
                    </p>
                    <p className="text-sm text-blue-600">
                      {selectedPrescription.doctor?.specialty || 'Chuyên khoa'}
                    </p>
                  </div>
                </div>
              </CardContent>

              {/* Footer Actions */}
              <div className="px-6 py-4 bg-slate-50 border-t flex gap-3 shrink-0">
                <Button
                  onClick={() => downloadPDF(selectedPrescription.id)}
                  className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Tải PDF
                </Button>
                <Button
                  onClick={() => { handleEdit(selectedPrescription.id); setShowDetails(false); }}
                  disabled={selectedPrescription.status !== "DRAFT"}
                  className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold disabled:opacity-50"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Chỉnh sửa
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDetails(false)}
                  className="h-11 px-6 rounded-xl font-semibold"
                >
                  Đóng
                </Button>
              </div>
            </Card>
          </div>
        )}

        <AlertDialog open={!!lockConfirmationId} onOpenChange={(open) => !open && setLockConfirmationId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Xác nhận khóa đơn thuốc</AlertDialogTitle>
              <AlertDialogDescription>
                Bạn có chắc chắn muốn khóa đơn thuốc này không? Hành động này không thể hoàn tác và đơn thuốc sẽ được chuyển sang trạng thái chờ phát.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Hủy bỏ</AlertDialogCancel>
              <AlertDialogAction onClick={confirmLock} className="bg-blue-600 hover:bg-blue-700">
                Khóa đơn thuốc
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DoctorSidebar>
  )
}
