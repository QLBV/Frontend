"use client"

import { useState } from "react"
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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Medication {
  id: string
  name: string
  group: string
  quantity: number
  unit: string
  price: number
  costPrice: number
  profitMargin: number
  expiryDate: string
  batchNumber: string
  status: "in-stock" | "low-stock" | "near-expiry" | "expired"
}

const medications: Medication[] = [
  {
    id: "1",
    name: "Paracetamol 500mg",
    group: "Giảm đau - Hạ sốt",
    quantity: 500,
    unit: "viên",
    price: 2000,
    costPrice: 1500,
    profitMargin: 33.33,
    expiryDate: "2026-12-31",
    batchNumber: "LOT001",
    status: "in-stock",
  },
  {
    id: "2",
    name: "Amoxicillin 500mg",
    group: "Kháng sinh",
    quantity: 50,
    unit: "viên",
    price: 5000,
    costPrice: 3800,
    profitMargin: 31.58,
    expiryDate: "2025-03-15",
    batchNumber: "LOT002",
    status: "low-stock",
  },
  {
    id: "3",
    name: "Vitamin C 1000mg",
    group: "Vitamin & Khoáng chất",
    quantity: 200,
    unit: "viên",
    price: 3000,
    costPrice: 2200,
    profitMargin: 36.36,
    expiryDate: "2025-01-20",
    batchNumber: "LOT003",
    status: "near-expiry",
  },
  {
    id: "4",
    name: "Ibuprofen 400mg",
    group: "Giảm đau - Hạ sốt",
    quantity: 0,
    unit: "viên",
    price: 4000,
    costPrice: 3000,
    profitMargin: 33.33,
    expiryDate: "2024-11-30",
    batchNumber: "LOT004",
    status: "expired",
  },
  {
    id: "5",
    name: "Omeprazole 20mg",
    group: "Tiêu hóa",
    quantity: 300,
    unit: "viên",
    price: 6000,
    costPrice: 4500,
    profitMargin: 33.33,
    expiryDate: "2026-06-30",
    batchNumber: "LOT005",
    status: "in-stock",
  },
]

const medicationGroups = ["Tất cả", "Giảm đau - Hạ sốt", "Kháng sinh", "Vitamin & Khoáng chất", "Tiêu hóa"]

export default function PharmacyPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGroup, setSelectedGroup] = useState("Tất cả")
  const [selectedStatus, setSelectedStatus] = useState("all")

  const getStatusBadge = (status: Medication["status"]) => {
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

  const filteredMedications = medications.filter((med) => {
    const matchesSearch =
      med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      med.batchNumber.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGroup = selectedGroup === "Tất cả" || med.group === selectedGroup
    const matchesStatus = selectedStatus === "all" || med.status === selectedStatus
    return matchesSearch && matchesGroup && matchesStatus
  })

  const lowStockCount = medications.filter((m) => m.status === "low-stock").length
  const nearExpiryCount = medications.filter((m) => m.status === "near-expiry").length
  const expiredCount = medications.filter((m) => m.status === "expired").length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                HealthCare Plus
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/patients">Patients</Link>
              </Button>
              <Button variant="outline" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Kho thuốc</h1>
            <p className="text-slate-600">Quản lý thuốc và vật tư y tế</p>
          </div>
          <Button
            size="lg"
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30"
            asChild
          >
            <Link to="/pharmacy/import">
              <Plus className="h-5 w-5 mr-2" />
              Nhập thuốc
            </Link>
          </Button>
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
              Hiển thị {filteredMedications.length} / {medications.length} thuốc
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b">
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
                  {filteredMedications.map((medication, index) => (
                    <tr
                      key={medication.id}
                      className={`border-b hover:bg-blue-50/30 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium text-slate-900">{medication.name}</div>
                          <div className="text-xs text-slate-500">Lô: {medication.batchNumber}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-700">{medication.group}</td>
                      <td className="py-4 px-6">
                        <span
                          className={`font-medium ${medication.quantity < 100 ? "text-amber-600" : "text-slate-900"}`}
                        >
                          {medication.quantity} {medication.unit}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium text-slate-900">{medication.price.toLocaleString()} đ</div>
                          <div className="text-xs text-slate-500">
                            Giá vốn: {medication.costPrice.toLocaleString()} đ
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-emerald-600 font-medium">+{medication.profitMargin.toFixed(2)}%</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-slate-700">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          {medication.expiryDate}
                        </div>
                      </td>
                      <td className="py-4 px-6">{getStatusBadge(medication.status)}</td>
                      <td className="py-4 px-6">
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
