"use client"

import { useState, useEffect } from "react"
import { DollarSign, Users, Calendar, Search, Eye, Loader2, Calculator, Filter, SlidersHorizontal, Link as LinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"
import { Label } from "@/components/ui/label"
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
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterEmployeeId, setFilterEmployeeId] = useState<string>("")
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false)

  useEffect(() => {
    fetchPayrolls()
  }, [selectedMonth, pagination.page, filterStatus, filterEmployeeId])

  const fetchPayrolls = async () => {
    try {
      setIsLoading(true)
      const [yearStr, monthStr] = selectedMonth.split("-")
      const year = parseInt(yearStr)
      const month = parseInt(monthStr)

      const params: any = {
        month,
        year,
        page: pagination.page,
        limit: pagination.limit,
      }

      if (filterStatus !== "all") {
        params.status = filterStatus
      }
      if (filterEmployeeId) {
        params.userId = parseInt(filterEmployeeId)
      }

      const response = await PayrollService.getPayrollsByPeriod({
        month,
        year,
        page: pagination.page,
        limit: pagination.limit,
      })
      
      // Apply additional filters if needed
      let filtered = response.payrolls || []
      if (filterStatus !== "all") {
        filtered = filtered.filter((p) => p.status === filterStatus)
      }
      if (filterEmployeeId) {
        filtered = filtered.filter((p) => p.employeeId === parseInt(filterEmployeeId))
      }

      setPayrolls(filtered)
      setPagination({
        page: response.page || 1,
        limit: response.limit || 20,
        total: response.total || filtered.length,
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

  const handleCalculate = async () => {
    try {
      setIsCalculating(true)
      // Parse selectedMonth (format: "YYYY-MM") to month and year
      const [yearStr, monthStr] = selectedMonth.split("-")
      const year = parseInt(yearStr)
      const month = parseInt(monthStr)
      
      await PayrollService.calculatePayroll({ 
        month, 
        year, 
        calculateAll: true 
      })
      toast.success("Tính lương thành công!")
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

  const filteredPayrolls = payrolls.filter(
    (payroll) =>
      payroll.employee?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payroll.employee?.employeeCode?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalSalaryPayout = filteredPayrolls.reduce((sum, p) => sum + p.totalSalary, 0)
  const totalDoctors = filteredPayrolls.filter((p) => p.employee?.role === "doctor").length
  const totalReceptionists = filteredPayrolls.filter((p) => p.employee?.role === "receptionist").length

  return (
    <AdminSidebar>
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Quản lý lương</h1>
          <p className="text-slate-600">Tính lương nhân viên và theo dõi hoa hồng</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-emerald-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Tổng chi lương</CardTitle>
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{totalSalaryPayout.toLocaleString()} VND</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Bác sĩ</CardTitle>
              <Users className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{totalDoctors}</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-violet-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Lễ tân</CardTitle>
              <Users className="h-5 w-5 text-violet-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{totalReceptionists}</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-amber-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Tháng</CardTitle>
              <Calendar className="h-5 w-5 text-amber-600" />
            </CardHeader>
            <CardContent>
              <Input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
            </CardContent>
          </Card>
        </div>

        {/* Calculate Payroll */}
        <Card className="border-0 shadow-xl mb-6">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b">
            <CardTitle className="text-xl">Tính lương</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-end gap-4">
              <div className="flex-1">
                <Label htmlFor="month">Tháng</Label>
                <Input
                  id="month"
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="mt-2"
                />
              </div>
              <Button onClick={handleCalculate} disabled={isCalculating}>
                {isCalculating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang tính...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4 mr-2" />
                    Tính lương
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-slate-600 mt-4">
              Công thức:{" "}
              <strong>Lương = (Lương cơ bản × Hệ số) + (Kinh nghiệm × 500,000) + Hoa hồng (5% bác sĩ)</strong>
            </p>
          </CardContent>
        </Card>

        {/* Search and Filters */}
        <Card className="border-0 shadow-xl mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
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
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="DRAFT">Nháp</SelectItem>
                    <SelectItem value="APPROVED">Đã phê duyệt</SelectItem>
                    <SelectItem value="PAID">Đã thanh toán</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  placeholder="Employee ID"
                  value={filterEmployeeId}
                  onChange={(e) => setFilterEmployeeId(e.target.value)}
                  className="w-32"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    setFilterStatus("all")
                    setFilterEmployeeId("")
                    setSearchQuery("")
                    setPagination({ ...pagination, page: 1 })
                  }}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsAdvancedFiltersOpen(true)}
                  asChild
                >
                  <Link to="/admin/payroll-statistics">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Statistics
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Salary List */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b">
            <CardTitle className="text-2xl">Bảng lương tháng {selectedMonth}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredPayrolls.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Chưa có bảng lương cho tháng này</p>
                <Button onClick={handleCalculate} className="mt-4" disabled={isCalculating}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Tính lương
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b">
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Mã NV</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Họ tên</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Chức vụ</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Hệ số</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Kinh nghiệm</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Hoa hồng</th>
                      <th className="text-right py-4 px-6 text-sm font-semibold text-slate-700">Tổng lương</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Trạng thái</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayrolls.map((payroll, index) => (
                      <tr
                        key={payroll.id}
                        className={`border-b hover:bg-blue-50/30 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                        }`}
                      >
                        <td className="py-4 px-6 font-medium text-blue-600">{payroll.employee?.employeeCode || 'N/A'}</td>
                        <td className="py-4 px-6 text-slate-900 font-medium">{payroll.employee?.fullName}</td>
                        <td className="py-4 px-6">
                          <Badge
                            variant="outline"
                            className={payroll.employee?.role === "doctor" ? "border-blue-300" : "border-violet-300"}
                          >
                            {payroll.employee?.role === "doctor" ? "Bác sĩ" : "Lễ tân"}
                          </Badge>
                        </td>
                        <td className="py-4 px-6 text-slate-700">{payroll.coefficient}</td>
                        <td className="py-4 px-6 text-slate-700">{payroll.experience} năm</td>
                        <td className="py-4 px-6 text-slate-700">
                          {payroll.commission ? `${payroll.commission.toLocaleString()} VND` : "-"}
                        </td>
                        <td className="py-4 px-6 text-right font-bold text-emerald-600">
                          {payroll.totalSalary.toLocaleString()} VND
                        </td>
                        <td className="py-4 px-6">
                          {payroll.status === 'DRAFT' && (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                              Nháp
                            </Badge>
                          )}
                          {payroll.status === 'APPROVED' && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              Đã phê duyệt
                            </Badge>
                          )}
                          {payroll.status === 'PAID' && (
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                              Đã thanh toán
                            </Badge>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <Button variant="ghost" size="sm" asChild>
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
            <CardContent className="border-t p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  Page {pagination.page} of {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    disabled={pagination.page >= pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </AdminSidebar>
  )
}
