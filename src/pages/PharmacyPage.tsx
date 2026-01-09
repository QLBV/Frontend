"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "@/auth/authContext"
import {
  Activity,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  Package,
  Plus,
  ChevronRight,
  TrendingDown,
  Calendar,
  XCircle,
  Trash2,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import SidebarLayout from "@/components/sidebar_layout"
import AdminSidebar from "@/components/sidebar/admin"
import ReceptionistSidebar from "@/components/sidebar/recep"
import DoctorSidebar from "@/components/sidebar/doctor"
import { MedicineService, type Medicine, MedicineStatus, MedicineUnit } from "@/services/medicine.service"
import { format } from "date-fns"

const getUnitLabel = (unit: MedicineUnit): string => {
  const unitMap: Record<MedicineUnit, string> = {
    [MedicineUnit.VIEN]: "viên",
    [MedicineUnit.ML]: "ml",
    [MedicineUnit.HOP]: "hộp",
    [MedicineUnit.CHAI]: "chai",
    [MedicineUnit.TUYP]: "tuýp",
    [MedicineUnit.GOI]: "gói",
  }
  return unitMap[unit] || unit
}

const getMedicineStatus = (medicine: Medicine): "in-stock" | "low-stock" | "near-expiry" | "expired" => {
  if (medicine.status === MedicineStatus.EXPIRED) {
    return "expired"
  }
  
  const expiryDate = new Date(medicine.expiryDate)
  const today = new Date()
  const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysUntilExpiry < 0) {
    return "expired"
  }
  if (daysUntilExpiry <= 30) {
    return "near-expiry"
  }
  if (medicine.quantity <= medicine.minStockLevel) {
    return "low-stock"
  }
  return "in-stock"
}

export default function PharmacyPage() {
  const { user } = useAuth()
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGroup, setSelectedGroup] = useState("Tất cả")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [medicineToDelete, setMedicineToDelete] = useState<Medicine | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    fetchMedicines()
  }, [])

  const fetchMedicines = async () => {
    try {
      setIsLoading(true)
      const response = await MedicineService.getMedicines({
        page: 1,
        limit: 1000, // Get all for now
      })
      if (response.medicines) {
        setMedicines(response.medicines)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tải danh sách thuốc")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = (medicine: Medicine) => {
    setMedicineToDelete(medicine)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!medicineToDelete) return
    
    try {
      setIsDeleting(true)
      await MedicineService.deleteMedicine(medicineToDelete.id)
      toast.success("Xóa thuốc thành công!")
      setDeleteDialogOpen(false)
      setMedicineToDelete(null)
      fetchMedicines()
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Không thể xóa thuốc"
      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusBadge = (status: "in-stock" | "low-stock" | "near-expiry" | "expired") => {
    const statusConfig = {
      "in-stock": {
        label: "Còn hàng",
        icon: Package,
        className: "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 border-emerald-200",
      },
      "low-stock": {
        label: "Sắp hết",
        icon: TrendingDown,
        className: "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border-amber-200",
      },
      "near-expiry": {
        label: "Sắp hết hạn",
        icon: Clock,
        className: "bg-orange-500/10 text-orange-700 hover:bg-orange-500/20 border-orange-200",
      },
      expired: {
        label: "Hết hạn",
        icon: XCircle,
        className: "bg-red-500/10 text-red-700 hover:bg-red-500/20 border-red-200",
      },
    }

    const config = statusConfig[status]
    const Icon = config.icon
    return (
      <Badge variant="outline" className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  const medicationGroups = ["Tất cả", ...Array.from(new Set(medicines.map(m => m.group)))]

  const filteredMedications = medicines.filter((med) => {
    const status = getMedicineStatus(med)
    const matchesSearch =
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.medicineCode.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGroup = selectedGroup === "Tất cả" || med.group === selectedGroup
    const matchesStatus = selectedStatus === "all" || status === selectedStatus
    return matchesSearch && matchesGroup && matchesStatus
  })

  const lowStockCount = medicines.filter((m) => getMedicineStatus(m) === "low-stock").length
  const nearExpiryCount = medicines.filter((m) => getMedicineStatus(m) === "near-expiry").length
  const expiredCount = medicines.filter((m) => getMedicineStatus(m) === "expired").length

  const isAdmin = user?.roleId === 1 || String(user?.role || "").toLowerCase() === "admin"

  const getSidebar = () => {
    if (!user) return null
    const role = String(user.roleId || user.role || "").toLowerCase()
    // roleId: 1=Admin, 2=Receptionist, 3=Patient, 4=Doctor (theo enum RoleCode)
    if (role === "admin" || role === "1") {
      return <AdminSidebar />
    }
    if (role === "doctor" || role === "4") {
      return <DoctorSidebar />
    }
    if (role === "receptionist" || role === "2") {
      return <ReceptionistSidebar />
    }
    return null
  }

  const sidebar = getSidebar()

  if (!sidebar) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <SidebarLayout userName={user?.fullName || user?.email}>
      {sidebar}
      <div className="space-y-6">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Kho thuốc</h1>
            <p className="text-slate-600">Quản lý thuốc và vật tư y tế</p>
          </div>
          {isAdmin && (
            <div className="flex gap-3">
              <Button
                size="lg"
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-50"
                asChild
              >
                <Link to="/admin/medicines/create">
                  <Plus className="h-5 w-5 mr-2" />
                  Tạo thuốc mới
                </Link>
              </Button>
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30"
                asChild
              >
                <Link to="/admin/pharmacy/import">
                  <Plus className="h-5 w-5 mr-2" />
                  Nhập thuốc
                </Link>
              </Button>
            </div>
          )}
        </div>

        {/* Warning Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg shadow-amber-500/5 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 bg-gradient-to-br from-white to-amber-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Thuốc sắp hết</CardTitle>
              <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-slate-900 mb-1">{lowStockCount}</div>
              <Button
                variant="ghost"
                size="sm"
                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 p-0 h-auto"
                onClick={() => setSelectedStatus("low-stock")}
              >
                Xem chi tiết
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg shadow-orange-500/5 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300 bg-gradient-to-br from-white to-orange-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Sắp hết hạn</CardTitle>
              <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-slate-900 mb-1">{nearExpiryCount}</div>
              <Button
                variant="ghost"
                size="sm"
                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 p-0 h-auto"
                onClick={() => setSelectedStatus("near-expiry")}
              >
                Xem chi tiết
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg shadow-red-500/5 hover:shadow-xl hover:shadow-red-500/10 transition-all duration-300 bg-gradient-to-br from-white to-red-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Đã hết hạn</CardTitle>
              <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-slate-900 mb-1">{expiredCount}</div>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 p-0 h-auto"
                onClick={() => setSelectedStatus("expired")}
              >
                Xem chi tiết
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="border-0 shadow-xl shadow-slate-900/5 mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    placeholder="Tìm kiếm theo tên thuốc hoặc số lô..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-11"
                  />
                </div>
              </div>

              {/* Group Filter */}
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-slate-400" />
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="h-11 px-4 rounded-md border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {medicationGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex gap-2">
                <Button
                  variant={selectedStatus === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStatus("all")}
                  className={selectedStatus === "all" ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  Tất cả
                </Button>
                <Button
                  variant={selectedStatus === "low-stock" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStatus("low-stock")}
                  className={selectedStatus === "low-stock" ? "bg-amber-600 hover:bg-amber-700" : ""}
                >
                  Sắp hết
                </Button>
                <Button
                  variant={selectedStatus === "near-expiry" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStatus("near-expiry")}
                  className={selectedStatus === "near-expiry" ? "bg-orange-600 hover:bg-orange-700" : ""}
                >
                  Gần hết hạn
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medication Table */}
        <Card className="border-0 shadow-xl shadow-slate-900/5 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b">
            <CardTitle className="text-2xl text-slate-900">Danh sách thuốc</CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              Hiển thị {filteredMedications.length} / {medicines.length} thuốc
            </p>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b">
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Mã thuốc</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Tên thuốc</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Nhóm thuốc</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Số lượng</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Giá bán</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Lãi suất</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Hạn dùng</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Trạng thái</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMedications.map((medication, index) => {
                      const status = getMedicineStatus(medication)
                      const profitMargin = medication.importPrice > 0
                        ? ((medication.salePrice - medication.importPrice) / medication.importPrice) * 100
                        : 0
                      
                      return (
                        <tr
                          key={medication.id}
                          className={`border-b hover:bg-blue-50/30 transition-colors ${
                            index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                          }`}
                        >
                          <td className="py-4 px-6">
                            <Badge variant="outline" className="font-mono">
                              {medication.medicineCode}
                            </Badge>
                          </td>
                          <td className="py-4 px-6">
                            <div>
                              <div className="font-medium text-slate-900">{medication.name}</div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-slate-700">{medication.group}</td>
                          <td className="py-4 px-6">
                            <span
                              className={`font-medium ${
                                medication.quantity <= medication.minStockLevel ? "text-amber-600" : "text-slate-900"
                              }`}
                            >
                              {medication.quantity} {getUnitLabel(medication.unit)}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div>
                              <div className="font-medium text-slate-900">
                                {medication.salePrice.toLocaleString("vi-VN")} VND
                              </div>
                              <div className="text-xs text-slate-500">
                                Giá vốn: {medication.importPrice.toLocaleString("vi-VN")} VND
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-emerald-600 font-medium">+{profitMargin.toFixed(2)}%</span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2 text-slate-700">
                              <Calendar className="h-4 w-4 text-slate-400" />
                              {format(new Date(medication.expiryDate), "dd/MM/yyyy")}
                            </div>
                          </td>
                          <td className="py-4 px-6">{getStatusBadge(status)}</td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                asChild
                              >
                                <Link to={`/pharmacy/${medication.id}`}>
                                  Chi tiết
                                  <ChevronRight className="h-4 w-4 ml-1" />
                                </Link>
                              </Button>
                              {isAdmin && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleDeleteClick(medication)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận xóa thuốc</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xóa thuốc <strong>{medicineToDelete?.name}</strong>? 
                Hành động này không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false)
                  setMedicineToDelete(null)
                }}
                disabled={isDeleting}
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Xóa
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SidebarLayout>
  )
}
