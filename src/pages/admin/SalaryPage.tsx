"use client"

import { useState, useEffect } from "react"
import { 
  DollarSign, 
  Users, 
  Calendar, 
  Search, 
  Eye, 
  Loader2, 
  Calculator, 
  SlidersHorizontal, 
  RotateCcw, 
  FileDown, 
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Filter
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { PayrollService, type Payroll } from "@/services/payroll.service"
import AdminSidebar from "@/components/sidebar/admin"

export default function SalaryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [payrolls, setPayrolls] = useState<Payroll[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCalculating, setIsCalculating] = useState(false)
  const [confirmCalculateOpen, setConfirmCalculateOpen] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })
  const [isExportingExcel, setIsExportingExcel] = useState(false)
  const [isExportingPDF, setIsExportingPDF] = useState(false)

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>("all")

  useEffect(() => {
    fetchPayrolls()
  }, [selectedMonth, pagination.page, filterStatus])

  const fetchPayrolls = async () => {
    try {
      setIsLoading(true)
      const [yearStr, monthStr] = selectedMonth.split("-")
      const year = parseInt(yearStr)
      const month = parseInt(monthStr)

      // Only pass necessary params
      const params: any = {
        month,
        year,
        page: pagination.page,
        limit: pagination.limit,
      }

      const response = await PayrollService.getPayrollsByPeriod(params)
      
      let fetchedPayrolls = response.payrolls || []

      // Client-side status filtering if backend doesn't support it fully via getPayrollsByPeriod
      // Note: Typically backend should handle this, but for safety in this demo:
      if (filterStatus !== "all") {
        fetchedPayrolls = fetchedPayrolls.filter(p => p.status === filterStatus)
      }

      setPayrolls(fetchedPayrolls)
      setPagination({
        page: response.page || 1,
        limit: response.limit || 20,
        total: response.total || fetchedPayrolls.length, // Update total if possible
        totalPages: response.totalPages || 1,
      })
    } catch (error: any) {
      if (error.response?.status !== 429) {
        toast.error(error.response?.data?.message || "Không thể tải danh sách bảng lương")
      }
      setPayrolls([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCalculateClick = () => {
    setConfirmCalculateOpen(true)
  }

  const handleConfirmCalculate = async () => {
    setConfirmCalculateOpen(false)
    try {
      setIsCalculating(true)
      const [yearStr, monthStr] = selectedMonth.split("-")
      const year = parseInt(yearStr)
      const month = parseInt(monthStr)
      
      await PayrollService.calculatePayroll({ 
        month, 
        year, 
        calculateAll: true 
      })
      toast.success(`Đã tính lương cho tháng ${month}/${year} thành công!`)
      fetchPayrolls()
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        toast.error(error.response?.data?.message || "Không thể tính lương")
      }
    } finally {
      setIsCalculating(false)
    }
  }

  // Client-side search filtering
  const filteredPayrolls = payrolls.filter(
    (payroll) =>
      payroll.employee?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payroll.employee?.employeeCode?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  // Calculate summary statistics from loaded data
  const totalSalaryPayout = filteredPayrolls.reduce((sum, p) => sum + p.totalSalary, 0)
  const totalDoctors = filteredPayrolls.filter((p) => p.employee?.role === "doctor" || p.employee?.role === "Doctor").length

  const handleExportExcel = async () => {
    try {
      setIsExportingExcel(true)
      const [yearStr, monthStr] = selectedMonth.split("-")
      const month = parseInt(monthStr)
      const year = parseInt(yearStr)

      const blob = await PayrollService.exportPayrollsExcel({
        month,
        year,
        status: filterStatus !== "all" ? filterStatus : undefined
      })

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `DanhSachLuong-${selectedMonth}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success("Xuất file Excel thành công!")
    } catch (error: any) {
      toast.error(error.message || "Không thể xuất file Excel")
    } finally {
      setIsExportingExcel(false)
    }
  }

  const handleExportPDF = async () => {
    try {
      setIsExportingPDF(true)
      const [yearStr, monthStr] = selectedMonth.split("-")
      const month = parseInt(monthStr)
      const year = parseInt(yearStr)

      const blob = await PayrollService.exportPayrollsPDF({
        month,
        year,
        status: filterStatus !== "all" ? filterStatus : undefined
      })

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `DanhSachLuong-${selectedMonth}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success("Xuất file PDF thành công!")
    } catch (error: any) {
      toast.error(error.message || "Không thể xuất file PDF")
    } finally {
      setIsExportingPDF(false)
    }
  }

  return (
    <AdminSidebar>
      <div className="space-y-6">
        {/* Simplified Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Quản lý Lương
              </h1>
              <p className="text-slate-500 text-sm font-medium">
                Bảng lương nhân viên tháng {selectedMonth}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <Button 
                variant="outline" 
                size="sm"
                className="border-slate-200 h-9 rounded-lg font-semibold text-xs text-slate-700 hover:bg-slate-50"
                onClick={handleExportPDF} 
                disabled={isExportingPDF}
              >
                {isExportingPDF ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <FileDown className="h-3.5 w-3.5 mr-2 text-rose-500" />}
                PDF
             </Button>
             <Button 
                variant="outline" 
                size="sm"
                className="border-slate-200 h-9 rounded-lg font-semibold text-xs text-slate-700 hover:bg-slate-50"
                onClick={handleExportExcel} 
                disabled={isExportingExcel}
              >
                {isExportingExcel ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <FileSpreadsheet className="h-3.5 w-3.5 mr-2 text-emerald-500" />}
                Excel
             </Button>
             <Button 
                variant="outline" 
                size="sm"
                className="border-slate-200 h-9 rounded-lg font-semibold text-xs text-slate-700 hover:bg-slate-50"
                asChild
              >
                <Link to="/admin/payroll-statistics">
                    <SlidersHorizontal className="h-3.5 w-3.5 mr-2 text-indigo-500" />
                    Thống kê
                </Link>
             </Button>
          </div>
        </div>

        {/* Stats */}
        {/* Simplified Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border border-slate-100 bg-white shadow-sm rounded-xl hover:border-emerald-200 transition-colors">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tổng chi trả</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-xl font-bold text-slate-900">{formatCurrency(totalSalaryPayout)}</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-100 bg-white shadow-sm rounded-xl hover:border-blue-200 transition-colors">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tổng nhân viên</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-xl font-bold text-slate-900">{filteredPayrolls.length}</h3>
                  <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase">Người</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-100 bg-white shadow-sm rounded-xl hover:border-indigo-200 transition-colors">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Bác sĩ</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-xl font-bold text-slate-900">{totalDoctors}</h3>
                  <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">Doctors</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-100 bg-white shadow-sm rounded-xl hover:border-amber-200 transition-colors">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Kỳ lương</p>
                <Input 
                  type="month" 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="h-7 border-none bg-amber-50/50 focus:bg-white text-xs font-bold text-slate-900 p-1" 
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Bar (Calculate) */}
        {/* Simplified Action Bar */}
        <div className="bg-blue-600/10 backdrop-blur-xl rounded-2xl p-4 border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-3">
             <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-200">
               <Calculator className="h-5 w-5 text-white" />
             </div>
             <div>
               <p className="text-sm font-bold text-slate-900">Tính toán bảng lương</p>
               <p className="text-xs text-slate-500 font-medium">Tự động đồng bộ từ Chấm công & Doanh thu dịch vụ.</p>
             </div>
           </div>
           <Button 
            onClick={handleCalculateClick} 
            disabled={isCalculating} 
            size="sm" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 rounded-lg shadow-lg shadow-blue-100"
          >
            {isCalculating ? (
              <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
            ) : (
              <Calculator className="h-3.5 w-3.5 mr-2" />
            )}
            {isCalculating ? "Đang tính..." : "Tính lương ngay"}
          </Button>
        </div>

        {/* Simplified Filters Bar */}
        <div className="bg-white/70 backdrop-blur-xl rounded-[24px] p-2 border border-slate-100 shadow-sm mt-6 mb-6">
          <div className="flex flex-col xl:flex-row gap-3">
            {/* Search input with focus effects */}
            <div className="relative flex-grow group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <Input
                placeholder="Tìm kiếm theo tên hoặc mã nhân viên..."
                className="w-full h-11 pl-11 pr-4 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500/50 rounded-xl transition-all text-sm font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filters grid */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-100">
                <div className="px-3 flex items-center gap-2 border-r border-slate-200 mr-1">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lọc</span>
                </div>
                
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[160px] h-9 border-none bg-transparent focus:ring-0 text-xs font-bold text-slate-700">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="DRAFT">📋 Bản nháp</SelectItem>
                    <SelectItem value="APPROVED">✅ Đã phê duyệt</SelectItem>
                    <SelectItem value="PAID">💰 Đã thanh toán</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="h-11 w-11 p-0 rounded-xl hover:bg-slate-50 text-slate-400"
                onClick={() => {
                  setFilterStatus("all")
                  setSearchQuery("")
                  setPagination({ ...pagination, page: 1 })
                  fetchPayrolls()
                }}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Premium Salary Table Overlay */}
        <Card className="border border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Đang tải dữ liệu...</p>
              </div>
            ) : filteredPayrolls.length === 0 ? (
              <div className="text-center py-20 bg-slate-50/50">
                <div className="bg-white rounded-2xl p-6 w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-sm ring-1 ring-slate-100">
                    <Calculator className="h-10 w-10 text-slate-200" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Chưa có dữ liệu lương</h3>
                <p className="text-slate-500 text-sm mt-1 mb-6">Bảng lương cho tháng {selectedMonth} chưa được khởi tạo.</p>
                <Button 
                  onClick={handleCalculateClick} 
                  disabled={isCalculating}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                >
                  Khởi tạo bảng lương
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50/50 border-y border-slate-100">
                    <tr>
                      <th className="py-4 px-6 text-left font-bold uppercase text-[11px] tracking-widest text-slate-500">Nhân viên</th>
                      <th className="py-4 px-6 text-left font-bold uppercase text-[11px] tracking-widest text-slate-500">Mã NV</th>
                      <th className="py-4 px-6 text-left font-bold uppercase text-[11px] tracking-widest text-slate-500">Gross Salary</th>
                      <th className="py-4 px-6 text-center font-bold uppercase text-[11px] tracking-widest text-slate-500">Hệ số</th>
                      <th className="py-4 px-6 text-right font-bold uppercase text-[11px] tracking-widest text-slate-500">Hoa hồng</th>
                      <th className="py-4 px-6 text-right font-bold uppercase text-[11px] tracking-widest text-slate-500 text-rose-500">Khấu trừ</th>
                      <th className="py-4 px-6 text-right font-bold uppercase text-[11px] tracking-widest text-slate-500 bg-slate-100/30">Thực nhận</th>
                      <th className="py-4 px-6 text-center font-bold uppercase text-[11px] tracking-widest text-slate-500">Trạng thái</th>
                      <th className="py-4 px-6 text-right font-bold uppercase text-[11px] tracking-widest text-slate-500">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredPayrolls.map((payroll) => (
                      <tr
                        key={payroll.id}
                        className="group hover:bg-blue-50/20 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 overflow-hidden shrink-0 ring-1 ring-slate-100 group-hover:ring-blue-100 transition-all">
                              {payroll.employee?.avatar ? (
                                <img 
                                  src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000').replace('/api', '')}${payroll.employee.avatar}`} 
                                  alt={payroll.employee.fullName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-sm">{payroll.employee?.fullName?.charAt(0) || "NV"}</span>
                              )}
                            </div>
                            <div>
                                <p className="font-bold text-slate-900 text-sm leading-tight">{payroll.employee?.fullName}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 tracking-wider">{payroll.employee?.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                            <span className="font-mono text-[11px] font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
                              {payroll.employee?.employeeCode || '#'}
                            </span>
                        </td>
                        <td className="py-4 px-6">
                            <p className="text-sm font-bold text-slate-700">{formatCurrency(payroll.grossSalary)}</p>
                            <p className="text-[10px] text-slate-400 font-medium">Bản: {formatCurrency(payroll.baseSalary)}</p>
                        </td>
                        <td className="py-4 px-6 text-center">
                            <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-0 font-bold text-[10px] rounded-md px-1.5 py-0">
                              x{payroll.coefficient}
                            </Badge>
                        </td>
                        <td className="py-4 px-6 text-right font-semibold text-slate-600 text-sm">
                          {payroll.commission ? formatCurrency(payroll.commission) : <span className="text-slate-200">—</span>}
                        </td>
                        <td className="py-4 px-6 text-right">
                           {payroll.penaltyAmount ? (
                             <>
                               <p className="text-sm font-bold text-rose-500">-{formatCurrency(payroll.penaltyAmount)}</p>
                               <p className="text-[10px] text-rose-400 font-medium">{payroll.penaltyDaysOff} ngày</p>
                             </>
                           ) : (
                             <span className="text-slate-200">—</span>
                           )}
                        </td>
                        <td className="py-4 px-6 text-right bg-slate-50/30">
                          <span className="text-sm font-bold text-emerald-600 group-hover:scale-105 transition-transform inline-block">
                            {formatCurrency(payroll.totalSalary)}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          {payroll.status === 'DRAFT' && (
                            <Badge className="bg-amber-100/50 text-amber-700 border-amber-200/50 text-[10px] font-bold rounded-full px-2.5 py-0.5 tracking-wide">
                              <span className="h-1 w-1 rounded-full bg-amber-500 mr-1.5 animate-pulse" />
                              BẢN NHÁP
                            </Badge>
                          )}
                          {payroll.status === 'APPROVED' && (
                            <Badge className="bg-indigo-100/50 text-indigo-700 border-indigo-200/50 text-[10px] font-bold rounded-full px-2.5 py-0.5 tracking-wide">
                              <span className="h-1 w-1 rounded-full bg-indigo-500 mr-1.5" />
                              ĐÃ DUYỆT
                            </Badge>
                          )}
                          {payroll.status === 'PAID' && (
                            <Badge className="bg-emerald-100/50 text-emerald-700 border-emerald-200/50 text-[10px] font-bold rounded-full px-2.5 py-0.5 tracking-wide">
                              <span className="h-1 w-1 rounded-full bg-emerald-500 mr-1.5" />
                              ĐÃ TRẢ
                            </Badge>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                            <Link to={`/admin/salary/${payroll.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 p-4 bg-slate-50/30">
              <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                Trang <span className="text-slate-900 font-bold">{pagination.page}</span> / {pagination.totalPages}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-lg hover:bg-white disabled:opacity-30 shadow-sm border border-transparent hover:border-slate-200"
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => {
                  if (
                    page === 1 || 
                    page === pagination.totalPages || 
                    (page >= pagination.page - 1 && page <= pagination.page + 1)
                  ) {
                    return (
                      <Button
                        key={page}
                        variant={pagination.page === page ? "default" : "ghost"}
                        size="sm"
                        className={`h-8 w-8 p-0 rounded-lg font-bold text-xs transition-colors ${
                          pagination.page === page 
                            ? "bg-blue-600 text-white shadow-md shadow-blue-100 hover:bg-blue-700" 
                            : "text-slate-600 hover:bg-white hover:text-blue-600 border border-transparent hover:border-slate-200"
                        }`}
                        onClick={() => setPagination({ ...pagination, page: page })}
                      >
                        {page}
                      </Button>
                    );
                  }
                  if (
                    (page === 2 && pagination.page > 3) || 
                    (page === pagination.totalPages - 1 && pagination.page < pagination.totalPages - 2)
                  ) {
                    return <span key={page} className="px-1 text-slate-400 font-bold text-[10px]">...</span>;
                  }
                  return null;
                })}

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-lg hover:bg-white disabled:opacity-30 shadow-sm border border-transparent hover:border-slate-200"
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Confirm Dialog */}
        <Dialog open={confirmCalculateOpen} onOpenChange={setConfirmCalculateOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Xác nhận tính lương</DialogTitle>
                    <DialogDescription>
                        Bạn có chắc chắn muốn tính lương cho tất cả nhân viên trong tháng <strong>{selectedMonth}</strong>?
                        <br /><br />
                        <span className="text-amber-600 block bg-amber-50 p-3 rounded-md border border-amber-200">
                            Lưu ý: Các phiếu lương đang ở trạng thái <strong>Nháp (DRAFT)</strong> sẽ bị ghi đè/cập nhật lại. Các phiếu lương đã duyệt hoặc thanh toán sẽ không bị ảnh hưởng.
                        </span>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setConfirmCalculateOpen(false)}>Hủy</Button>
                    <Button onClick={handleConfirmCalculate} className="bg-blue-600 hover:bg-blue-700">
                        Xác nhận tính lương
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
    </AdminSidebar>
  )
}
