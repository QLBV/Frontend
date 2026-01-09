"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  Search,
  Filter,
  AlertTriangle,
  Clock,
  Package,
  Plus,
  TrendingDown,
  Calendar,
  Loader2,
  Download,
  Upload,
  Eye,
  Edit,
  RefreshCw,
  CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import AdminSidebar from "@/components/sidebar/admin"
import { MedicineService, type Medicine, MedicineStatus, MedicineUnit } from "@/services/medicine.service"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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

const getStatusBadge = (status: "in-stock" | "low-stock" | "near-expiry" | "expired") => {
  switch (status) {
    case "expired":
      return <Badge variant="destructive">Hết hạn</Badge>
    case "near-expiry":
      return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Sắp hết hạn</Badge>
    case "low-stock":
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Sắp hết</Badge>
    default:
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Còn hàng</Badge>
  }
}

const getDaysUntilExpiry = (expiryDate: string): number => {
  const expiry = new Date(expiryDate)
  const today = new Date()
  const diffTime = expiry.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export default function InventoryPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [lowStockMedicines, setLowStockMedicines] = useState<Medicine[]>([])
  const [expiringMedicines, setExpiringMedicines] = useState<Medicine[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGroup, setSelectedGroup] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [groups, setGroups] = useState<string[]>([])
  const [isAutoMarking, setIsAutoMarking] = useState(false)
  const [isAutoMarkDialogOpen, setIsAutoMarkDialogOpen] = useState(false)

  useEffect(() => {
    fetchMedicines()
    fetchAlerts()
  }, [])

  const fetchMedicines = async () => {
    try {
      setIsLoading(true)
      const response = await MedicineService.getMedicines({
        page: 1,
        limit: 1000,
      })
      if (response.medicines) {
        setMedicines(response.medicines)
        // Extract unique groups
        const uniqueGroups = Array.from(new Set(response.medicines.map(m => m.group))).sort()
        setGroups(uniqueGroups)
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        toast.error(error.response?.data?.message || "Không thể tải danh sách thuốc")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAlerts = async () => {
    try {
      setIsLoadingAlerts(true)
      const [lowStockResponse, expiringResponse] = await Promise.all([
        MedicineService.getLowStockMedicines({ page: 1, limit: 10 }),
        MedicineService.getExpiringMedicines({ page: 1, limit: 10 }),
      ])
      
      if (lowStockResponse.medicines) {
        setLowStockMedicines(lowStockResponse.medicines)
      }
      if (expiringResponse.medicines) {
        setExpiringMedicines(expiringResponse.medicines)
      }
    } catch (error: any) {
      if (error.response?.status !== 429) {
        toast.error(error.response?.data?.message || "Không thể tải cảnh báo thuốc")
      }
    } finally {
      setIsLoadingAlerts(false)
    }
  }

  // Filter medicines
  const filteredMedicines = medicines.filter((medicine) => {
    const matchesSearch = 
      medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medicine.medicineCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medicine.group.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesGroup = selectedGroup === "all" || medicine.group === selectedGroup
    
    const status = getMedicineStatus(medicine)
    const matchesStatus = 
      selectedStatus === "all" ||
      (selectedStatus === "low-stock" && status === "low-stock") ||
      (selectedStatus === "near-expiry" && status === "near-expiry") ||
      (selectedStatus === "expired" && status === "expired") ||
      (selectedStatus === "in-stock" && status === "in-stock")
    
    return matchesSearch && matchesGroup && matchesStatus
  })

  const handleAutoMarkExpired = async () => {
    try {
      setIsAutoMarking(true)
      const result = await MedicineService.autoMarkExpired()
      toast.success(`Đã đánh dấu ${result.count} thuốc hết hạn!`)
      setIsAutoMarkDialogOpen(false)
      await fetchMedicines()
      await fetchAlerts()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể đánh dấu thuốc hết hạn")
    } finally {
      setIsAutoMarking(false)
    }
  }

  const lowStockCount = lowStockMedicines.length
  const expiringCount = expiringMedicines.length
  const totalMedicines = medicines.length
  const inStockCount = medicines.filter(m => getMedicineStatus(m) === "in-stock").length
  const expiredCount = medicines.filter(m => getMedicineStatus(m) === "expired").length

  return (
    <AdminSidebar>
      <div className="container mx-auto px-6 py-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 min-h-full">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Quản lý Kho Thuốc</h1>
              <p className="text-slate-600">Tổng quan và quản lý tồn kho thuốc</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setIsAutoMarkDialogOpen(true)}
                className="border-orange-200 hover:bg-orange-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Tự động đánh dấu hết hạn
              </Button>
              <Button asChild variant="outline">
                <Link to="/admin/medicines/imports">
                  <Upload className="h-4 w-4 mr-2" />
                  Lịch sử nhập
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/admin/medicines/exports">
                  <Download className="h-4 w-4 mr-2" />
                  Lịch sử xuất
                </Link>
              </Button>
              <Button asChild>
                <Link to="/admin/medicines/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm thuốc mới
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Alert Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Tổng số thuốc</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{totalMedicines}</div>
              <p className="text-sm text-slate-500 mt-1">Loại thuốc trong kho</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Còn hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{inStockCount}</div>
              <p className="text-sm text-slate-500 mt-1">Thuốc đủ tồn kho</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-yellow-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Sắp hết</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{lowStockCount}</div>
              <p className="text-sm text-slate-500 mt-1">Thuốc dưới mức tối thiểu</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-orange-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Sắp hết hạn</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{expiringCount}</div>
              <p className="text-sm text-slate-500 mt-1">Thuốc hết hạn trong 30 ngày</p>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock & Expiring Alerts */}
        {(lowStockCount > 0 || expiringCount > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {lowStockCount > 0 && (
              <Card className="border-0 shadow-lg border-l-4 border-l-yellow-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-700">
                    <AlertTriangle className="h-5 w-5" />
                    Cảnh báo: Thuốc sắp hết
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingAlerts ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-yellow-600" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {lowStockMedicines.slice(0, 5).map((medicine) => (
                        <div key={medicine.id} className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                          <div>
                            <p className="font-medium text-sm">{medicine.name}</p>
                            <p className="text-xs text-slate-500">
                              Còn: {medicine.quantity} {getUnitLabel(medicine.unit)} / Tối thiểu: {medicine.minStockLevel} {getUnitLabel(medicine.unit)}
                            </p>
                          </div>
                          <Link to={`/pharmacy/${medicine.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      ))}
                      {lowStockCount > 5 && (
                        <p className="text-xs text-slate-500 text-center pt-2">
                          Và {lowStockCount - 5} thuốc khác...
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {expiringCount > 0 && (
              <Card className="border-0 shadow-lg border-l-4 border-l-orange-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-700">
                    <Clock className="h-5 w-5" />
                    Cảnh báo: Thuốc sắp hết hạn
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingAlerts ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-orange-600" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {expiringMedicines.slice(0, 5).map((medicine) => {
                        const daysLeft = getDaysUntilExpiry(medicine.expiryDate)
                        return (
                          <div key={medicine.id} className="flex items-center justify-between p-2 bg-orange-50 rounded">
                            <div>
                              <p className="font-medium text-sm">{medicine.name}</p>
                              <p className="text-xs text-slate-500">
                                Hết hạn: {format(new Date(medicine.expiryDate), "dd/MM/yyyy", { locale: vi })} ({daysLeft} ngày)
                              </p>
                            </div>
                            <Link to={`/pharmacy/${medicine.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        )
                      })}
                      {expiringCount > 5 && (
                        <p className="text-xs text-slate-500 text-center pt-2">
                          Và {expiringCount - 5} thuốc khác...
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Filters and Search */}
        <Card className="mb-6 border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Tìm kiếm theo tên, mã, nhóm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn nhóm thuốc" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả nhóm</SelectItem>
                  {groups.map((group) => (
                    <SelectItem key={group} value={group}>
                      {group}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="in-stock">Còn hàng</SelectItem>
                  <SelectItem value="low-stock">Sắp hết</SelectItem>
                  <SelectItem value="near-expiry">Sắp hết hạn</SelectItem>
                  <SelectItem value="expired">Hết hạn</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Medicine List */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Danh sách thuốc ({filteredMedicines.length})</span>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchMedicines}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Package className="h-4 w-4" />
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : filteredMedicines.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Không tìm thấy thuốc nào</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 text-sm font-semibold text-slate-700">Mã</th>
                      <th className="text-left p-3 text-sm font-semibold text-slate-700">Tên thuốc</th>
                      <th className="text-left p-3 text-sm font-semibold text-slate-700">Nhóm</th>
                      <th className="text-left p-3 text-sm font-semibold text-slate-700">Số lượng</th>
                      <th className="text-left p-3 text-sm font-semibold text-slate-700">Giá nhập</th>
                      <th className="text-left p-3 text-sm font-semibold text-slate-700">Giá bán</th>
                      <th className="text-left p-3 text-sm font-semibold text-slate-700">Hết hạn</th>
                      <th className="text-left p-3 text-sm font-semibold text-slate-700">Trạng thái</th>
                      <th className="text-right p-3 text-sm font-semibold text-slate-700">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMedicines.map((medicine) => {
                      const status = getMedicineStatus(medicine)
                      const daysLeft = getDaysUntilExpiry(medicine.expiryDate)
                      return (
                        <tr key={medicine.id} className="border-b hover:bg-slate-50 transition-colors">
                          <td className="p-3">
                            <span className="font-mono text-sm text-slate-600">{medicine.medicineCode}</span>
                          </td>
                          <td className="p-3">
                            <div>
                              <p className="font-medium text-slate-900">{medicine.name}</p>
                              {medicine.manufacturer && (
                                <p className="text-xs text-slate-500">{medicine.manufacturer}</p>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline">{medicine.group}</Badge>
                          </td>
                          <td className="p-3">
                            <div>
                              <span className="font-medium">
                                {medicine.quantity} {getUnitLabel(medicine.unit)}
                              </span>
                              <p className="text-xs text-slate-500">
                                Tối thiểu: {medicine.minStockLevel} {getUnitLabel(medicine.unit)}
                              </p>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className="text-slate-700">
                              {medicine.importPrice.toLocaleString()} VND
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="font-medium text-slate-900">
                              {medicine.salePrice.toLocaleString()} VND
                            </span>
                          </td>
                          <td className="p-3">
                            <div>
                              <span className="text-sm">
                                {format(new Date(medicine.expiryDate), "dd/MM/yyyy", { locale: vi })}
                              </span>
                              {daysLeft <= 30 && daysLeft >= 0 && (
                                <p className="text-xs text-orange-600">
                                  Còn {daysLeft} ngày
                                </p>
                              )}
                              {daysLeft < 0 && (
                                <p className="text-xs text-red-600">Đã hết hạn</p>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            {getStatusBadge(status)}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-end gap-2">
                              <Link to={`/pharmacy/${medicine.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link to={`/admin/medicines/${medicine.id}/edit`}>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
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

        {/* Auto-Mark Expired Dialog */}
        <Dialog open={isAutoMarkDialogOpen} onOpenChange={setIsAutoMarkDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tự động đánh dấu thuốc hết hạn</DialogTitle>
              <DialogDescription>
                Hệ thống sẽ tự động đánh dấu tất cả thuốc đã hết hạn dựa trên ngày hết hạn (expiryDate).
                Thao tác này sẽ cập nhật trạng thái của thuốc thành "Hết hạn" (EXPIRED).
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-900 mb-1">
                      Lưu ý quan trọng
                    </p>
                    <ul className="text-sm text-orange-800 space-y-1 list-disc list-inside">
                      <li>Thao tác này sẽ quét toàn bộ danh sách thuốc</li>
                      <li>Chỉ đánh dấu những thuốc có expiryDate đã qua ngày hiện tại</li>
                      <li>Không thể hoàn tác sau khi thực hiện</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAutoMarkDialogOpen(false)}
                disabled={isAutoMarking}
              >
                Hủy
              </Button>
              <Button
                onClick={handleAutoMarkExpired}
                disabled={isAutoMarking}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isAutoMarking ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Xác nhận đánh dấu
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminSidebar>
  )
}
