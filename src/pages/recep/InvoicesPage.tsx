"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/auth/authContext"
import { Search, Calendar, DollarSign, FileText, Eye, Download, Activity, Loader2, Plus, SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { InvoiceService, type Invoice, PaymentStatus } from "@/services/invoice.service"
import { SearchService } from "@/services/search.service"
import ReceptionistSidebar from "@/components/sidebar/recep"
import AdminSidebar from "@/components/sidebar/admin"

export default function InvoicesPage() {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState({
    keyword: "",
    invoiceCode: "",
    paymentStatus: "all" as "all" | "UNPAID" | "PARTIALLY_PAID" | "PAID",
    patientId: "",
    doctorId: "",
    totalMin: "",
    totalMax: "",
    createdFrom: "",
    createdTo: "",
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  useEffect(() => {
    fetchInvoices()
  }, [statusFilter, pagination.page])

  const fetchInvoices = async () => {
    try {
      setIsLoading(true)
      const filters: any = {
        page: pagination.page,
        limit: pagination.limit,
      }
      if (statusFilter !== "all") {
        filters.paymentStatus = statusFilter as PaymentStatus
      }
      const response = await InvoiceService.getInvoices(filters)
      if (response.success && response.data) {
        setInvoices(response.data)
        if (response.pagination) {
          setPagination(response.pagination)
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tải danh sách hóa đơn")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdvancedSearch = async () => {
    try {
      setIsSearching(true)
      const filters: any = {
        page: 1,
        limit: pagination.limit,
      }

      if (advancedFilters.keyword) filters.keyword = advancedFilters.keyword
      if (advancedFilters.invoiceCode) filters.invoiceCode = advancedFilters.invoiceCode
      if (advancedFilters.paymentStatus && advancedFilters.paymentStatus !== "all") {
        filters.paymentStatus = advancedFilters.paymentStatus
      }
      if (advancedFilters.patientId) filters.patientId = parseInt(advancedFilters.patientId)
      if (advancedFilters.doctorId) filters.doctorId = parseInt(advancedFilters.doctorId)
      if (advancedFilters.totalMin) filters.totalMin = parseFloat(advancedFilters.totalMin)
      if (advancedFilters.totalMax) filters.totalMax = parseFloat(advancedFilters.totalMax)
      if (advancedFilters.createdFrom) filters.createdFrom = advancedFilters.createdFrom
      if (advancedFilters.createdTo) filters.createdTo = advancedFilters.createdTo

      const response = await SearchService.searchInvoices(filters)
      setInvoices(response.data || [])
      setPagination(response.pagination || pagination)
      setIsAdvancedSearchOpen(false)
      toast.success(`Tìm thấy ${response.data?.length || 0} hóa đơn`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tìm kiếm hóa đơn")
    } finally {
      setIsSearching(false)
    }
  }

  const handleQuickSearch = async () => {
    if (!searchQuery.trim()) {
      fetchInvoices()
      return
    }

    try {
      setIsSearching(true)
      const response = await SearchService.searchInvoices({
        keyword: searchQuery,
        paymentStatus: statusFilter !== "all" ? (statusFilter as PaymentStatus) : undefined,
        page: 1,
        limit: pagination.limit,
      })
      setInvoices(response.data || [])
      setPagination(response.pagination || pagination)
      toast.success(`Tìm thấy ${response.data?.length || 0} hóa đơn`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tìm kiếm hóa đơn")
    } finally {
      setIsSearching(false)
    }
  }

  const clearAdvancedSearch = () => {
    setAdvancedFilters({
      keyword: "",
      invoiceCode: "",
      paymentStatus: "all",
      patientId: "",
      doctorId: "",
      totalMin: "",
      totalMax: "",
      createdFrom: "",
      createdTo: "",
    })
    fetchInvoices()
  }

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.patient?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.invoiceCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.patient?.patientCode?.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSearch
  })

  const getStatusBadge = (status: PaymentStatus) => {
    const config: Record<PaymentStatus, { label: string; className: string }> = {
      PAID: { label: "Đã thanh toán", className: "bg-emerald-500/10 text-emerald-700 border-emerald-200" },
      PARTIALLY_PAID: { label: "Thanh toán một phần", className: "bg-yellow-500/10 text-yellow-700 border-yellow-200" },
      UNPAID: { label: "Chờ thanh toán", className: "bg-amber-500/10 text-amber-700 border-amber-200" },
    }
    const statusInfo = config[status] || { label: status, className: "bg-gray-500/10 text-gray-700 border-gray-200" }
    return (
      <Badge variant="outline" className={statusInfo.className}>
        {statusInfo.label}
      </Badge>
    )
  }

  const totalRevenue = invoices
    .filter((inv) => inv.paymentStatus === PaymentStatus.PAID)
    .reduce((sum, inv) => sum + parseFloat(inv.totalAmount.toString()), 0)
  const pendingAmount = invoices
    .filter((inv) => inv.paymentStatus === PaymentStatus.UNPAID || inv.paymentStatus === PaymentStatus.PARTIALLY_PAID)
    .reduce((sum, inv) => {
      const remaining = parseFloat(inv.totalAmount.toString()) - parseFloat(inv.paidAmount.toString())
      return sum + remaining
    }, 0)

  if (!user) {
    return null
  }

  const role = String(user.roleId || user.role || "").toLowerCase()

  const content = (
    <div className="container mx-auto px-6 py-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 min-h-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Quản lý hóa đơn</h1>
            <p className="text-slate-600">Danh sách và theo dõi hóa đơn thanh toán</p>
          </div>
          <Button asChild>
            <Link to="/recep/invoices/create">
              <Plus className="h-4 w-4 mr-2" />
              Tạo hóa đơn
            </Link>
          </Button>
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
        <Card className="border-0 shadow-xl">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Tìm kiếm theo tên, mã hóa đơn, mã bệnh nhân..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleQuickSearch()
                    }
                  }}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  onClick={() => {
                    setStatusFilter("all")
                    setPagination({ ...pagination, page: 1 })
                  }}
                  size="sm"
                >
                  Tất cả
                </Button>
                <Button
                  variant={statusFilter === PaymentStatus.PAID ? "default" : "outline"}
                  onClick={() => {
                    setStatusFilter(PaymentStatus.PAID)
                    setPagination({ ...pagination, page: 1 })
                  }}
                  size="sm"
                >
                  Đã thanh toán
                </Button>
                <Button
                  variant={statusFilter === PaymentStatus.UNPAID ? "default" : "outline"}
                  onClick={() => {
                    setStatusFilter(PaymentStatus.UNPAID)
                    setPagination({ ...pagination, page: 1 })
                  }}
                  size="sm"
                >
                  Chờ thanh toán
                </Button>
                <Button
                  variant={statusFilter === PaymentStatus.PARTIALLY_PAID ? "default" : "outline"}
                  onClick={() => {
                    setStatusFilter(PaymentStatus.PARTIALLY_PAID)
                    setPagination({ ...pagination, page: 1 })
                  }}
                  size="sm"
                >
                  Thanh toán một phần
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsAdvancedSearchOpen(true)}
                  size="sm"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Advanced
                </Button>
                <Button
                  onClick={handleQuickSearch}
                  disabled={isSearching}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
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
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Không có hóa đơn nào</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b">
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Mã hóa đơn</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Bệnh nhân</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Bác sĩ</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Ngày</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Thuốc</th>
                      <th className="text-right py-4 px-6 text-sm font-semibold text-slate-700">Tổng tiền</th>
                      <th className="text-right py-4 px-6 text-sm font-semibold text-slate-700">Đã thanh toán</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Trạng thái</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((invoice, index) => {
                      const hasMedicine = (invoice.medicineTotalAmount || 0) > 0
                      return (
                        <tr
                          key={invoice.id}
                          className={`border-b hover:bg-blue-50/30 transition-colors ${
                            index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                          }`}
                        >
                          <td className="py-4 px-6 font-medium text-blue-600">{invoice.invoiceCode}</td>
                          <td className="py-4 px-6">
                            <div>
                              <div className="font-medium text-slate-900">{invoice.patient?.fullName || "N/A"}</div>
                              {invoice.patient?.patientCode && (
                                <div className="text-sm text-slate-500">Mã: {invoice.patient.patientCode}</div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-slate-700">{invoice.doctor?.fullName || "N/A"}</td>
                          <td className="py-4 px-6 text-slate-700">
                            {new Date(invoice.createdAt).toLocaleDateString("vi-VN")}
                          </td>
                          <td className="py-4 px-6">
                            <Badge variant="outline" className={hasMedicine ? "border-blue-300" : "border-slate-300"}>
                              {hasMedicine ? "Có thuốc" : "Không thuốc"}
                            </Badge>
                          </td>
                          <td className="py-4 px-6 text-right font-semibold text-slate-900">
                            {parseFloat(invoice.totalAmount.toString()).toLocaleString("vi-VN")} VND
                          </td>
                          <td className="py-4 px-6 text-right text-slate-700">
                            {parseFloat(invoice.paidAmount.toString()).toLocaleString("vi-VN")} VND
                          </td>
                          <td className="py-4 px-6">{getStatusBadge(invoice.paymentStatus)}</td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" asChild>
                                <Link to={`/invoices/${invoice.id}`}>
                                  <Eye className="h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t">
                <div className="text-sm text-slate-600">
                  Trang {pagination.page} / {pagination.totalPages} ({pagination.total} hóa đơn)
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    disabled={pagination.page === 1}
                  >
                    Trước
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    disabled={pagination.page >= pagination.totalPages}
                  >
                    Sau
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Advanced Search Dialog */}
        <Dialog open={isAdvancedSearchOpen} onOpenChange={setIsAdvancedSearchOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Advanced Search</DialogTitle>
              <DialogDescription>
                Tìm kiếm hóa đơn với các bộ lọc chi tiết
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="keyword">Keyword</Label>
                  <Input
                    id="keyword"
                    placeholder="Patient name, invoice code..."
                    value={advancedFilters.keyword}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, keyword: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="invoiceCode">Invoice Code</Label>
                  <Input
                    id="invoiceCode"
                    placeholder="Invoice code"
                    value={advancedFilters.invoiceCode}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, invoiceCode: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="paymentStatus">Payment Status</Label>
                  <Select
                    value={advancedFilters.paymentStatus}
                    onValueChange={(value) => setAdvancedFilters({ ...advancedFilters, paymentStatus: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                      <SelectItem value="PARTIALLY_PAID">Partially Paid</SelectItem>
                      <SelectItem value="UNPAID">Unpaid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="patientId">Patient ID</Label>
                  <Input
                    id="patientId"
                    type="number"
                    placeholder="Patient ID"
                    value={advancedFilters.patientId}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, patientId: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="doctorId">Doctor ID</Label>
                  <Input
                    id="doctorId"
                    type="number"
                    placeholder="Doctor ID"
                    value={advancedFilters.doctorId}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, doctorId: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="totalMin">Min Total</Label>
                  <Input
                    id="totalMin"
                    type="number"
                    placeholder="Min amount"
                    value={advancedFilters.totalMin}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, totalMin: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="totalMax">Max Total</Label>
                  <Input
                    id="totalMax"
                    type="number"
                    placeholder="Max amount"
                    value={advancedFilters.totalMax}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, totalMax: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="createdFrom">Created From</Label>
                  <Input
                    id="createdFrom"
                    type="date"
                    value={advancedFilters.createdFrom}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, createdFrom: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="createdTo">Created To</Label>
                  <Input
                    id="createdTo"
                    type="date"
                    value={advancedFilters.createdTo}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, createdTo: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={clearAdvancedSearch}>
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
              <Button onClick={handleAdvancedSearch} disabled={isSearching}>
                {isSearching ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )

  // roleId: 1=Admin, 2=Receptionist, 3=Patient, 4=Doctor (theo enum RoleCode)
  if (role === "admin" || role === "1") {
    return <AdminSidebar>{content}</AdminSidebar>
  } else if (role === "receptionist" || role === "2") {
    return <ReceptionistSidebar>{content}</ReceptionistSidebar>
  }

  return null
}
