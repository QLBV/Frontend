"use client"

import { useState, useEffect } from "react"
import { DollarSign, Users, Calendar, Search, Eye, Loader2, AlertTriangle, Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"
import { Label } from "@/components/ui/label"
import api from "@/lib/api"
// Import Sidebar của bạn (đường dẫn có thể khác tùy cấu trúc thư mục của bạn)
import AdminSidebar from "@/components/sidebar/admin" // Hoặc đường dẫn tới file admin.tsx chứa AdminSidebar

interface SalaryRecord {
  id: number
  payrollCode: string
  employeeId: number
  employeeName: string
  roleName: string
  roleId: number
  baseSalary: number
  coefficient: number
  experience: number
  commission: number
  month: string
  totalSalary: number
  status: string
}

export default function SalaryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr)
  const [salaries, setSalaries] = useState<SalaryRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [baseSalaryDoctor] = useState(2500000)

  // Hàm gọi API lấy danh sách lương
  useEffect(() => {
    const fetchPayrolls = async () => {
      try {
        setLoading(true)
        setError(null)
        const [year, month] = selectedMonth.split("-")
        
        // SỬA: Giảm limit xuống 50 để tránh lỗi Validator Backend
        const response = await api.get("/api/payrolls", {
            params: {
                month: month,
                year: year,
                limit: 50 
            }
        })

        if (response.data.success) {
            const mappedData: SalaryRecord[] = response.data.data.map((item: any) => ({
                id: item.id,
                payrollCode: item.payrollCode,
                employeeId: item.userId,
                employeeName: item.user?.fullName || "N/A",
                roleName: item.user?.role?.roleName || "Unknown",
                roleId: item.user?.roleId,
                baseSalary: Number(item.baseSalary),
                coefficient: Number(item.roleCoefficient),
                experience: item.yearsOfService,
                commission: Number(item.commission),
                month: `${item.year}-${String(item.month).padStart(2, '0')}`,
                totalSalary: Number(item.netSalary),
                status: item.status
            }))
            setSalaries(mappedData)
        }
      } catch (err: any) {
        console.error("Lỗi tải bảng lương:", err)
        // Không set salaries rỗng ở đây để tránh nháy màn hình nếu reload
      } finally {
        setLoading(false)
      }
    }

    fetchPayrolls()
  }, [selectedMonth])

  // Hàm tính lương
  const handleCalculateSalary = async () => {
    try {
      const [year, month] = selectedMonth.split("-")
      
      const isConfirm = window.confirm(`Bạn có chắc muốn tính lương cho tất cả nhân viên tháng ${month}/${year}?`);
      if (!isConfirm) return;

      setLoading(true);
      
      const response = await api.post("/api/payrolls/calculate", {
        month: parseInt(month),
        year: parseInt(year),
        calculateAll: true
      });

      if (response.data.success) {
        alert(`Thành công! Đã tính lương cho ${response.data.data.calculated} nhân viên.`);
        window.location.reload(); 
      }
    } catch (err: any) {
      console.error(err);
      alert("Lỗi tính lương: " + (err.response?.data?.message || err.message));
      setLoading(false);
    }
  }

  // Filter Client-side
  const filteredSalaries = salaries.filter(
    (salary) =>
      salary.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      salary.payrollCode.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Thống kê
  const totalSalaryPayout = filteredSalaries.reduce((sum, s) => sum + s.totalSalary, 0)
  const totalDoctors = filteredSalaries.filter((s) => s.roleName.toLowerCase().includes("doctor") || s.roleName.toLowerCase().includes("bác sĩ")).length
  const totalReceptionists = filteredSalaries.filter((s) => s.roleName.toLowerCase().includes("reception") || s.roleName.toLowerCase().includes("lễ tân")).length

  const renderRoleBadge = (roleName: string) => {
    const isDoctor = roleName.toLowerCase().includes("doctor") || roleName.toLowerCase().includes("bác sĩ");
    return (
        <Badge variant="outline" className={isDoctor ? "border-blue-300 text-blue-700" : "border-violet-300 text-violet-700"}>
            {isDoctor ? "Bác sĩ" : "Lễ tân"}
        </Badge>
    )
  }

  const renderStatusBadge = (status: string) => {
      switch(status) {
          case "PAID": return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Đã thanh toán</Badge>
          case "APPROVED": return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Đã duyệt</Badge>
          default: return <Badge variant="outline" className="text-slate-500">Nháp</Badge>
      }
  }

  // --- UI CHÍNH ---
  // Bọc tất cả trong AdminSidebar
  return (
    <AdminSidebar>
      <div className="p-2 md:p-6 space-y-6">
        
        {/* Title & Action */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Quản lý lương</h1>
            <p className="text-slate-500">Kỳ lương: Tháng {selectedMonth}</p>
          </div>
          
          <Button 
            onClick={handleCalculateSalary} 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"
          >
            {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Calculator className="w-4 h-4 mr-2" />}
            Tính lương tháng này
          </Button>
        </div>

        {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 border border-red-100">
                <AlertTriangle className="h-5 w-5" />
                {error}
            </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Tổng chi lương</CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {totalSalaryPayout.toLocaleString('vi-VN')} đ
              </div>
              <p className="text-xs text-slate-400 mt-1">Dựa trên phiếu lương đã tạo</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Bác sĩ nhận lương</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{totalDoctors}</div>
              <p className="text-xs text-slate-400 mt-1">
                 {totalDoctors === 0 && !loading ? "Chưa tính lương tháng này" : "Đã có phiếu lương"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Lễ tân nhận lương</CardTitle>
              <Users className="h-4 w-4 text-violet-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{totalReceptionists}</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-amber-50/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-amber-700">Chọn Tháng</CardTitle>
              <Calendar className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <Input 
                type="month" 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-white border-amber-200 focus-visible:ring-amber-500" 
              />
            </CardContent>
          </Card>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800 flex flex-col md:flex-row gap-4 justify-between items-center">
            <span>
                ℹ️ <strong>Lưu ý:</strong> Số lượng bác sĩ/lễ tân ở trên là số người <strong>đã được tính lương</strong> trong tháng này. 
                Nếu số liệu là 0, vui lòng nhấn nút <strong>"Tính lương tháng này"</strong> để hệ thống tạo phiếu lương từ danh sách nhân viên.
            </span>
            <div className="shrink-0 text-slate-500">
                Lương CB Bác sĩ: <strong>{baseSalaryDoctor.toLocaleString('vi-VN')} đ</strong>
            </div>
        </div>

        {/* Search */}
        <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
            placeholder="Tìm kiếm theo tên nhân viên hoặc mã phiếu lương..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white shadow-sm"
            />
        </div>

        {/* Table */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardHeader className="bg-slate-50 border-b py-4">
            <CardTitle className="text-lg">Danh sách phiếu lương</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white border-b text-xs uppercase text-slate-500 tracking-wider">
                    <th className="text-left py-3 px-6 font-semibold">Mã Phiếu</th>
                    <th className="text-left py-3 px-6 font-semibold">Nhân viên</th>
                    <th className="text-left py-3 px-6 font-semibold">Chức vụ</th>
                    <th className="text-center py-3 px-6 font-semibold">Hệ số</th>
                    <th className="text-center py-3 px-6 font-semibold">Thâm niên</th>
                    <th className="text-right py-3 px-6 font-semibold">Hoa hồng</th>
                    <th className="text-right py-3 px-6 font-semibold">Thực nhận</th>
                    <th className="text-center py-3 px-6 font-semibold">Trạng thái</th>
                    <th className="text-center py-3 px-6 font-semibold">#</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                      <tr><td colSpan={9} className="py-8 text-center text-slate-500">Đang tải dữ liệu...</td></tr>
                  ) : filteredSalaries.length === 0 ? (
                      <tr>
                          <td colSpan={9} className="py-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                              <span className="bg-slate-100 p-3 rounded-full"><Users className="w-6 h-6 text-slate-400"/></span>
                              <span>Chưa có dữ liệu lương cho tháng {selectedMonth}.</span>
                              <Button variant="link" onClick={handleCalculateSalary} className="text-blue-600">
                                  Tạo bảng lương ngay
                              </Button>
                          </td>
                      </tr>
                  ) : (
                    filteredSalaries.map((salary) => (
                        <tr key={salary.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-6 font-medium text-slate-600 text-sm">{salary.payrollCode}</td>
                            <td className="py-3 px-6 text-slate-900 font-medium">{salary.employeeName}</td>
                            <td className="py-3 px-6">{renderRoleBadge(salary.roleName)}</td>
                            <td className="py-3 px-6 text-slate-500 text-center">{salary.coefficient}</td>
                            <td className="py-3 px-6 text-slate-500 text-center">{salary.experience} năm</td>
                            <td className="py-3 px-6 text-slate-500 text-right">
                                {salary.commission > 0 ? `${salary.commission.toLocaleString('vi-VN')} đ` : "-"}
                            </td>
                            <td className="py-3 px-6 text-right font-bold text-emerald-600">
                                {salary.totalSalary.toLocaleString('vi-VN')} đ
                            </td>
                            <td className="py-3 px-6 text-center">{renderStatusBadge(salary.status)}</td>
                            <td className="py-3 px-6 text-center">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600">
                                    <Link to={`/admin/salary/${salary.id}`}><Eye className="h-4 w-4" /></Link>
                                </Button>
                            </td>
                        </tr>
                    ))
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