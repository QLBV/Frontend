"use client"

import { Link, useParams } from "react-router-dom"
import { Activity, ArrowLeft, Calendar, Package, DollarSign, TrendingUp, Clock, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ImportLog {
  id: string
  date: string
  quantity: number
  costPrice: number
  supplier: string
  batchNumber: string
  importedBy: string
}

const importLogs: ImportLog[] = [
  {
    id: "1",
    date: "2024-11-15",
    quantity: 500,
    costPrice: 1500,
    supplier: "Công ty Dược phẩm ABC",
    batchNumber: "LOT001",
    importedBy: "Admin Nguyễn Văn A",
  },
  {
    id: "2",
    date: "2024-10-20",
    quantity: 300,
    costPrice: 1450,
    supplier: "Công ty Dược phẩm ABC",
    batchNumber: "LOT000",
    importedBy: "Admin Nguyễn Văn A",
  },
]

export default function PharmacyDetailPage() {
  const { id } = useParams()

  // Mock data - in real app, fetch based on id
  const medication = {
    id: id,
    name: "Paracetamol 500mg",
    group: "Giảm đau - Hạ sốt",
    quantity: 500,
    unit: "viên",
    price: 2000,
    costPrice: 1500,
    profitMargin: 33.33,
    expiryDate: "2026-12-31",
    batchNumber: "LOT001",
    status: "in-stock" as const,
    supplier: "Công ty Dược phẩm ABC",
    usage: "Uống 1-2 viên mỗi 4-6 giờ khi cần. Không quá 8 viên trong 24 giờ.",
    indications: "Giảm đau, hạ sốt",
    contraindications: "Người bị suy gan nặng, quá mẫn với paracetamol",
    sideEffects: "Hiếm gặp: phát ban, buồn nôn, suy gan (nếu quá liều)",
    storage: "Bảo quản nơi khô ráo, tránh ánh sáng trực tiếp, nhiệt độ dưới 30°C",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/pharmacy" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                HealthCare Plus
              </span>
            </Link>
            <Button variant="outline" size="sm" asChild>
              <Link to="/pharmacy">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">{medication.name}</h1>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-200">
                  {medication.group}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 border-emerald-200"
                >
                  <Package className="h-3 w-3 mr-1" />
                  Còn hàng
                </Badge>
              </div>
            </div>
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30"
            >
              Cập nhật thông tin
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card className="border-0 shadow-xl shadow-slate-900/5">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b">
                <CardTitle className="text-xl text-slate-900">Thông tin cơ bản</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Số lượng tồn kho</div>
                    <div className="text-2xl font-bold text-slate-900">
                      {medication.quantity} {medication.unit}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Số lô</div>
                    <div className="text-2xl font-bold text-slate-900">{medication.batchNumber}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Hạn sử dụng</div>
                    <div className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                      <Calendar className="h-5 w-5 text-slate-400" />
                      {medication.expiryDate}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Nhà cung cấp</div>
                    <div className="text-lg font-semibold text-slate-900">{medication.supplier}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Info */}
            <Card className="border-0 shadow-xl shadow-slate-900/5">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-emerald-50/50 border-b">
                <CardTitle className="text-xl text-slate-900">Thông tin giá</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Giá vốn</div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-slate-400" />
                      <span className="text-xl font-bold text-slate-900">
                        {medication.costPrice.toLocaleString()} đ
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Giá bán</div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-blue-400" />
                      <span className="text-xl font-bold text-blue-600">{medication.price.toLocaleString()} đ</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Lãi suất</div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-emerald-400" />
                      <span className="text-xl font-bold text-emerald-600">+{medication.profitMargin.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage Instructions */}
            <Card className="border-0 shadow-xl shadow-slate-900/5">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b">
                <CardTitle className="text-xl text-slate-900">Hướng dẫn sử dụng</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    Cách dùng
                  </h3>
                  <p className="text-slate-700">{medication.usage}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Chỉ định</h3>
                  <p className="text-slate-700">{medication.indications}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Chống chỉ định</h3>
                  <p className="text-slate-700">{medication.contraindications}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Tác dụng phụ</h3>
                  <p className="text-slate-700">{medication.sideEffects}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">Bảo quản</h3>
                  <p className="text-slate-700">{medication.storage}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Import History */}
          <div>
            <Card className="border-0 shadow-xl shadow-slate-900/5">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50/50 border-b">
                <CardTitle className="text-xl text-slate-900 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-600" />
                  Lịch sử nhập kho
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {importLogs.map((log) => (
                    <div key={log.id} className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-slate-900">{log.date}</span>
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-200">
                          {log.batchNumber}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-slate-600">
                        <div className="flex justify-between">
                          <span>Số lượng:</span>
                          <span className="font-medium text-slate-900">{log.quantity} viên</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Giá vốn:</span>
                          <span className="font-medium text-slate-900">{log.costPrice.toLocaleString()} đ</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-200">
                          <div>NCC: {log.supplier}</div>
                          <div>Nhập bởi: {log.importedBy}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
