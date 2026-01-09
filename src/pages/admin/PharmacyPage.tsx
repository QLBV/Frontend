"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
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
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import AdminSidebar from "@/components/sidebar/admin"
import api from "@/lib/api"
import { toast } from "sonner"

interface Medication {
  id: number
  medicineCode: string
  name: string
  group: string
  quantity: number
  unit: string
  salePrice: number
  importPrice: number // costPrice
  minStockLevel: number
  expiryDate: string
  status: "ACTIVE" | "EXPIRED" | "REMOVED"
}

// Map status từ backend sang frontend logic
const getFrontendStatus = (med: Medication) => {
    const today = new Date();
    const expiry = new Date(med.expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0 || med.status === "EXPIRED") return "expired";
    if (diffDays <= 30) return "near-expiry";
    if (med.quantity <= med.minStockLevel) return "low-stock";
    return "in-stock";
};

const medicationGroups = ["Tất cả", "Kháng sinh", "Giảm đau - Hạ sốt", "Vitamin", "Tim mạch", "Tiêu hóa", "Hô hấp", "Dị ứng"];

export default function PharmacyPage() {
  const [medications, setMedications] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGroup, setSelectedGroup] = useState("Tất cả")
  const [selectedStatus, setSelectedStatus] = useState("all") // all, low-stock, near-expiry, expired

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/medicines"); // API lấy tất cả thuốc
      if (response.data.success) {
        setMedications(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch medicines:", error);
      toast.error("Không thể tải danh sách thuốc");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      "in-stock": {
        label: "Còn hàng",
        icon: Package,
        className: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
      },
      "low-stock": {
        label: "Sắp hết",
        icon: TrendingDown,
        className: "bg-amber-500/10 text-amber-700 border-amber-200",
      },
      "near-expiry": {
        label: "Sắp hết hạn",
        icon: Clock,
        className: "bg-orange-500/10 text-orange-700 border-orange-200",
      },
      "expired": {
        label: "Hết hạn",
        icon: XCircle,
        className: "bg-red-500/10 text-red-700 border-red-200",
      },
    }

    const config = statusConfig[status] || statusConfig["in-stock"];
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  // Filter Logic
  const filteredMedications = medications.filter((med) => {
    const status = getFrontendStatus(med);
    
    const matchesSearch =
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.medicineCode.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesGroup = selectedGroup === "Tất cả" || med.group === selectedGroup;
    
    let matchesStatus = true;
    if (selectedStatus !== "all") {
        matchesStatus = status === selectedStatus;
    }

    return matchesSearch && matchesGroup && matchesStatus;
  });

  // Stats calculation
  const lowStockCount = medications.filter(m => getFrontendStatus(m) === "low-stock").length;
  const nearExpiryCount = medications.filter(m => getFrontendStatus(m) === "near-expiry").length;
  const expiredCount = medications.filter(m => getFrontendStatus(m) === "expired").length;

  return (
    <AdminSidebar>
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Kho thuốc</h1>
            <p className="text-slate-500">Quản lý thuốc và vật tư y tế</p>
          </div>
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"
            asChild
          >
            <Link to="/admin/pharmacy/import">
              <Plus className="h-5 w-5 mr-2" />
              Nhập thuốc mới
            </Link>
          </Button>
        </div>

        {/* Warning Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-md bg-gradient-to-br from-white to-amber-50/30 cursor-pointer hover:shadow-lg transition-all" onClick={() => setSelectedStatus("low-stock")}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Thuốc sắp hết</CardTitle>
              <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-slate-900 mb-1">{lowStockCount}</div>
              <div className="text-xs text-amber-600 flex items-center">
                Xem chi tiết <ChevronRight className="h-3 w-3 ml-1" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-white to-orange-50/30 cursor-pointer hover:shadow-lg transition-all" onClick={() => setSelectedStatus("near-expiry")}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Sắp hết hạn (30 ngày)</CardTitle>
              <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-slate-900 mb-1">{nearExpiryCount}</div>
              <div className="text-xs text-orange-600 flex items-center">
                Xem chi tiết <ChevronRight className="h-3 w-3 ml-1" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-white to-red-50/30 cursor-pointer hover:shadow-lg transition-all" onClick={() => setSelectedStatus("expired")}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Đã hết hạn</CardTitle>
              <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-slate-900 mb-1">{expiredCount}</div>
              <div className="text-xs text-red-600 flex items-center">
                Xem chi tiết <ChevronRight className="h-3 w-3 ml-1" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Tìm kiếm theo tên thuốc hoặc mã thuốc..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-slate-400" />
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {medicationGroups.map((group) => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <Button
                  variant={selectedStatus === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStatus("all")}
                  className={selectedStatus === "all" ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  Tất cả
                </Button>
                {/* Các nút filter nhanh khác đã tích hợp vào Card ở trên */}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Medication Table */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="bg-slate-50 border-b py-4">
            <CardTitle className="text-lg">Danh sách thuốc</CardTitle>
            <p className="text-sm text-slate-500">
              Hiển thị {filteredMedications.length} / {medications.length} thuốc
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white border-b text-xs uppercase text-slate-500 font-semibold tracking-wider">
                    <th className="text-left py-3 px-6">Tên thuốc / Mã</th>
                    <th className="text-left py-3 px-6">Nhóm</th>
                    <th className="text-left py-3 px-6">Tồn kho</th>
                    <th className="text-left py-3 px-6">Giá bán</th>
                    <th className="text-center py-3 px-6">Lãi suất</th>
                    <th className="text-left py-3 px-6">Hạn dùng</th>
                    <th className="text-center py-3 px-6">Trạng thái</th>
                    <th className="text-center py-3 px-6">#</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                      <tr><td colSpan={8} className="py-8 text-center text-slate-500"><Loader2 className="animate-spin inline mr-2"/> Đang tải dữ liệu...</td></tr>
                  ) : filteredMedications.length === 0 ? (
                      <tr><td colSpan={8} className="py-8 text-center text-slate-500">Không tìm thấy thuốc nào phù hợp.</td></tr>
                  ) : (
                    filteredMedications.map((medication) => {
                        const status = getFrontendStatus(medication);
                        const profitMargin = medication.importPrice > 0 
                            ? ((medication.salePrice - medication.importPrice) / medication.importPrice) * 100 
                            : 0;

                        return (
                            <tr key={medication.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-3 px-6">
                                <div>
                                <div className="font-medium text-slate-900">{medication.name}</div>
                                <div className="text-xs text-slate-500 font-mono">{medication.medicineCode}</div>
                                </div>
                            </td>
                            <td className="py-3 px-6 text-slate-600 text-sm">{medication.group}</td>
                            <td className="py-3 px-6">
                                <span className={`font-medium ${medication.quantity <= medication.minStockLevel ? "text-amber-600" : "text-slate-900"}`}>
                                {medication.quantity} {medication.unit}
                                </span>
                            </td>
                            <td className="py-3 px-6">
                                <div className="font-medium text-blue-600">{Number(medication.salePrice).toLocaleString()} đ</div>
                            </td>
                            <td className="py-3 px-6 text-center">
                                <span className="text-emerald-600 font-medium text-sm">+{profitMargin.toFixed(1)}%</span>
                            </td>
                            <td className="py-3 px-6">
                                <div className="flex items-center gap-2 text-slate-600 text-sm">
                                <Calendar className="h-3 w-3 text-slate-400" />
                                {new Date(medication.expiryDate).toLocaleDateString('vi-VN')}
                                </div>
                            </td>
                            <td className="py-3 px-6 text-center">{getStatusBadge(status)}</td>
                            <td className="py-3 px-6 text-center">
                                <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-slate-400 hover:text-blue-600">
                                <Link to={`/admin/pharmacy/${medication.id}`}>
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                                </Button>
                            </td>
                            </tr>
                        )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminSidebar>
  )
}