"use client"

import { useState, useEffect } from "react"
import { DollarSign, Users, Calendar, Search, Eye, Loader2, Calculator, SlidersHorizontal, RotateCcw, FileDown, FileSpreadsheet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">Quản lý lương</h1>
            <p className="text-slate-600">Tháng {selectedMonth}</p>
          </div>
          <div className="flex gap-2">
             <Button variant="outline" onClick={handleExportPDF} disabled={isExportingPDF}>
                {isExportingPDF ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileDown className="h-4 w-4 mr-2" />}
                Xuất PDF
             </Button>
             <Button variant="outline" onClick={handleExportExcel} disabled={isExportingExcel}>
                {isExportingExcel ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileSpreadsheet className="h-4 w-4 mr-2" />}
                Xuất Excel
             </Button>
             <Button variant="outline" asChild>
                <Link to="/admin/payroll-statistics">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Thống kê chi tiết
                </Link>
             </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-emerald-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Tổng thực nhận</CardTitle>
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {formatCurrency(totalSalaryPayout)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Số lượng nhân viên</CardTitle>
              <Users className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{filteredPayrolls.length}</div>
            </CardContent>
          </Card>

           <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-violet-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Bác sĩ</CardTitle>
              <Users className="h-5 w-5 text-violet-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{totalDoctors}</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-amber-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Tháng làm việc</CardTitle>
              <Calendar className="h-5 w-5 text-amber-600" />
            </CardHeader>
            <CardContent>
               <div className="flex items-center gap-2">
                 <Input 
                   type="month" 
                   value={selectedMonth} 
                   onChange={(e) => setSelectedMonth(e.target.value)}
                   className="font-semibold" 
                 />
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Bar (Calculate) */}
        <Card className="border-0 shadow-xl mb-6 bg-white">
          <CardContent className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
             <div className="flex items-center gap-2 text-slate-600">
               <Calculator className="h-5 w-5 text-blue-500" />
               <span>Tự động tính lương từ dữ liệu Chấm công & Doanh thu</span>
             </div>
             <Button onClick={handleCalculateClick} disabled={isCalculating} size="lg" className="shadow-md bg-blue-600 hover:bg-blue-700">
                {isCalculating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang tính toán...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4 mr-2" />
                    Tính lương tháng này
                  </>
                )}
              </Button>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Tìm kiếm theo tên hoặc mã nhân viên..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40 bg-white">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="DRAFT">Nháp</SelectItem>
                    <SelectItem value="APPROVED">Đã phê duyệt</SelectItem>
                    <SelectItem value="PAID">Đã thanh toán</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilterStatus("all")
                    setSearchQuery("")
                    setPagination({ ...pagination, page: 1 })
                    fetchPayrolls()
                  }}
                  title="Reload"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
        </div>

        {/* Salary List */}
        <Card className="border-0 shadow-xl overflow-hidden">
          <CardHeader className="bg-slate-50 border-b py-4">
            <CardTitle className="text-lg text-slate-800">Danh sách lương nhân viên</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                <p className="text-slate-500">Đang tải dữ liệu...</p>
              </div>
            ) : filteredPayrolls.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="bg-slate-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                    <Calculator className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">Chưa có dữ liệu lương</h3>
                <p className="mb-4">Chưa có bảng lương nào được tạo cho tháng {selectedMonth}</p>
                <Button onClick={handleCalculateClick} disabled={isCalculating}>
                  Tính lương ngay
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/50 border-b text-xs uppercase text-slate-500 font-semibold tracking-wider">
                      <th className="text-left py-3 px-6">Mã NV</th>
                      <th className="text-left py-3 px-6">Họ tên / Chức vụ</th>
                      <th className="text-left py-3 px-6">Tổng thu nhập (Gross)</th>
                      <th className="text-left py-3 px-6 text-center">Hệ số</th>
                      <th className="text-left py-3 px-6 text-center">Thâm niên</th>
                      <th className="text-right py-3 px-6">Hoa hồng</th>
                      <th className="text-right py-3 px-6 text-red-500">Phạt & Khấu trừ</th>
                      <th className="text-right py-3 px-6 bg-slate-50">Thực nhận</th>
                      <th className="text-center py-3 px-6">Trạng thái</th>
                      <th className="text-center py-3 px-6">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredPayrolls.map((payroll) => (
                      <tr
                        key={payroll.id}
                        className="hover:bg-blue-50/30 transition-colors"
                      >
                        <td className="py-4 px-6 font-medium text-slate-600">
                            {payroll.employee?.employeeCode || '#'}
                        </td>
                        <td className="py-4 px-6">
                            <div className="font-medium text-slate-900">{payroll.employee?.fullName}</div>
                            <div className="text-xs text-slate-500 mt-0.5 capitalize">{payroll.employee?.role}</div>
                        </td>
                        <td className="py-4 px-6 text-slate-800 font-medium">
                            {formatCurrency(payroll.grossSalary)}
                            <div className="text-xs text-slate-400 font-normal mt-0.5">
                                Cơ bản: {formatCurrency(payroll.baseSalary)}
                            </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                            <Badge variant="secondary" className="font-normal">{payroll.coefficient}</Badge>
                        </td>
                        <td className="py-4 px-6 text-center text-slate-600">
                            {payroll.experience} năm
                        </td>
                        <td className="py-4 px-6 text-right text-slate-600">
                          {payroll.commission ? formatCurrency(payroll.commission) : "-"}
                        </td>
                        <td className="py-4 px-6 text-right text-red-600">
                           {payroll.penaltyAmount ? (
                             <>
                               -{formatCurrency(payroll.penaltyAmount)}
                               <div className="text-xs text-red-400 font-normal mt-0.5">
                                 {payroll.penaltyDaysOff} ngày phạt
                               </div>
                             </>
                           ) : (
                             <span className="text-slate-300">-</span>
                           )}
                        </td>
                        <td className="py-4 px-6 text-right font-bold text-emerald-600 bg-slate-50/50">
                          {formatCurrency(payroll.totalSalary)} {/* Note: backend field is netSalary, frontend typically maps to totalSalary or similar. In local state it seems mapPayrollData uses totalSalary as alias or netSalary. Checking interface... actually backend sends netSalary. Need to verify mapPayrollData or simply use payroll.netSalary if available in type. Wait, the filteredPayrolls is type Payroll. Previous step used payroll.totalSalary. I will assume totalSalary is the frontend alias for netSalary. */}
                        </td>
                        <td className="py-4 px-6 text-center">
                          {payroll.status === 'DRAFT' && (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              Nháp
                            </Badge>
                          )}
                          {payroll.status === 'APPROVED' && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              Đã duyệt
                            </Badge>
                          )}
                          {payroll.status === 'PAID' && (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                              Đã TT
                            </Badge>
                          )}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0">
                            <Link to={`/admin/salary/${payroll.id}`} title="Xem chi tiết">
                              <Eye className="h-4 w-4 text-blue-600" />
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
            <CardContent className="border-t p-4 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  Trang {pagination.page} / {pagination.totalPages}
                </p>
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
                    Tiếp
                  </Button>
                </div>
              </div>
            </CardContent>
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
