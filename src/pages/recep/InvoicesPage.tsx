"use client"

import { useState } from "react"
import { Search, Calendar, DollarSign, FileText, Eye, Download, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"

interface Invoice {
  id: string
  invoiceNumber: string
  patientName: string
  patientId: string
  date: string
  amount: number
  status: "paid" | "pending" | "cancelled"
  hasMedication: boolean
  doctor: string
}

const mockInvoices: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-2025-001",
    patientName: "Nguyễn Văn A",
    patientId: "P001",
    date: "2025-11-30",
    amount: 500000,
    status: "paid",
    hasMedication: true,
    doctor: "BS. Trần Thị B",
  },
  {
    id: "2",
    invoiceNumber: "INV-2025-002",
    patientName: "Lê Thị C",
    patientId: "P002",
    date: "2025-11-29",
    amount: 300000,
    status: "pending",
    hasMedication: false,
    doctor: "BS. Nguyễn Văn D",
  },
  {
    id: "3",
    invoiceNumber: "INV-2025-003",
    patientName: "Phạm Minh E",
    patientId: "P003",
    date: "2025-11-28",
    amount: 850000,
    status: "paid",
    hasMedication: true,
    doctor: "BS. Trần Thị B",
  },
]

export default function InvoicesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredInvoices = mockInvoices.filter((invoice) => {
    const matchesSearch =
      invoice.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.patientId.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: Invoice["status"]) => {
    const config = {
      paid: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
      pending: "bg-amber-500/10 text-amber-700 border-amber-200",
      cancelled: "bg-red-500/10 text-red-700 border-red-200",
    }
    const labels = { paid: "Đã thanh toán", pending: "Chờ thanh toán", cancelled: "Đã hủy" }
    return (
      <Badge variant="outline" className={config[status]}>
        {labels[status]}
      </Badge>
    )
  }

  const totalRevenue = filteredInvoices.filter((inv) => inv.status === "paid").reduce((sum, inv) => sum + inv.amount, 0)
  const pendingAmount = filteredInvoices
    .filter((inv) => inv.status === "pending")
    .reduce((sum, inv) => sum + inv.amount, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                HealthCare Plus
              </span>
            </Link>
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Quản lý hóa đơn</h1>
          <p className="text-slate-600">Danh sách và theo dõi hóa đơn thanh toán</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-emerald-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Tổng doanh thu</CardTitle>
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{totalRevenue.toLocaleString()} VND</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-amber-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Chờ thanh toán</CardTitle>
              <Calendar className="h-5 w-5 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{pendingAmount.toLocaleString()} VND</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Tổng hóa đơn</CardTitle>
              <FileText className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{filteredInvoices.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="border-0 shadow-xl mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Tìm kiếm theo tên, mã hóa đơn, mã bệnh nhân..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  onClick={() => setStatusFilter("all")}
                  size="sm"
                >
                  Tất cả
                </Button>
                <Button
                  variant={statusFilter === "paid" ? "default" : "outline"}
                  onClick={() => setStatusFilter("paid")}
                  size="sm"
                >
                  Đã thanh toán
                </Button>
                <Button
                  variant={statusFilter === "pending" ? "default" : "outline"}
                  onClick={() => setStatusFilter("pending")}
                  size="sm"
                >
                  Chờ thanh toán
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoice List */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b">
            <CardTitle className="text-2xl">Danh sách hóa đơn</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Mã hóa đơn</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Bệnh nhân</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Bác sĩ</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Ngày</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Thuốc</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-slate-700">Số tiền</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Trạng thái</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((invoice, index) => (
                    <tr
                      key={invoice.id}
                      className={`border-b hover:bg-blue-50/30 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                      }`}
                    >
                      <td className="py-4 px-6 font-medium text-blue-600">{invoice.invoiceNumber}</td>
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium text-slate-900">{invoice.patientName}</div>
                          <div className="text-sm text-slate-500">{invoice.patientId}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-700">{invoice.doctor}</td>
                      <td className="py-4 px-6 text-slate-700">{invoice.date}</td>
                      <td className="py-4 px-6">
                        <Badge
                          variant="outline"
                          className={invoice.hasMedication ? "border-blue-300" : "border-slate-300"}
                        >
                          {invoice.hasMedication ? "Có thuốc" : "Không thuốc"}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-right font-semibold text-slate-900">
                        {invoice.amount.toLocaleString()} VND
                      </td>
                      <td className="py-4 px-6">{getStatusBadge(invoice.status)}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/invoices/${invoice.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
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
