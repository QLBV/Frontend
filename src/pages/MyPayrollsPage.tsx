"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/auth/authContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, DollarSign, Calendar, Download, Eye, FileText } from "lucide-react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { PayrollService, type Payroll } from "@/services/payroll.service"
import AdminSidebar from "@/components/sidebar/admin"
import DoctorSidebar from "@/components/sidebar/doctor"
import ReceptionistSidebar from "@/components/sidebar/recep"

export default function MyPayrollsPage() {
  const { user } = useAuth()
  const [payrolls, setPayrolls] = useState<Payroll[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchMyPayrolls()
  }, [])

  const fetchMyPayrolls = async () => {
    try {
      setIsLoading(true)
      const response = await PayrollService.getMyPayrolls()
      setPayrolls(response || [])
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tải lịch sử lương")
      setPayrolls([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportPDF = async (payroll: Payroll) => {
    try {
      const blob = await PayrollService.exportPayrollPDF(payroll.id)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `payroll-${payroll.month}-${payroll.id}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success("Xuất PDF thành công!")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể xuất PDF")
    }
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      DRAFT: { label: "Nháp", className: "bg-yellow-500/10 text-yellow-700 border-yellow-200" },
      APPROVED: { label: "Đã phê duyệt", className: "bg-blue-500/10 text-blue-700 border-blue-200" },
      PAID: { label: "Đã thanh toán", className: "bg-emerald-500/10 text-emerald-700 border-emerald-200" },
    }
    const statusInfo = config[status] || { label: status, className: "bg-gray-500/10 text-gray-700 border-gray-200" }
    return (
      <Badge variant="outline" className={statusInfo.className}>
        {statusInfo.label}
      </Badge>
    )
  }

  if (!user) {
    return null
  }

  const role = String(user.roleId || user.role || "").toLowerCase()

  // Calculate totals
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MyPayrollsPage.tsx:85','message':'CALCULATING_TOTALS','data':{payrollsCount:payrolls.length,payrolls:payrolls.map(p=>({id:p.id,totalSalary:p.totalSalary,baseSalary:p.baseSalary,commission:p.commission,status:p.status}))},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  const totalSalary = payrolls.reduce((sum, p) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MyPayrollsPage.tsx:88','message':'REDUCE_TOTAL_SALARY','data':{sum,payrollId:p.id,totalSalary:p.totalSalary,totalSalaryType:typeof p.totalSalary,totalSalaryIsUndefined:p.totalSalary===undefined,totalSalaryIsNull:p.totalSalary===null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    return sum + (p.totalSalary || 0)
  }, 0)
  const totalPaid = payrolls.filter((p) => p.status === "PAID").reduce((sum, p) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MyPayrollsPage.tsx:93','message':'REDUCE_TOTAL_PAID','data':{sum,payrollId:p.id,totalSalary:p.totalSalary,totalSalaryType:typeof p.totalSalary},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    return sum + (p.totalSalary || 0)
  }, 0)
  const pendingSalary = payrolls.filter((p) => p.status !== "PAID").reduce((sum, p) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MyPayrollsPage.tsx:98','message':'REDUCE_PENDING_SALARY','data':{sum,payrollId:p.id,totalSalary:p.totalSalary,totalSalaryType:typeof p.totalSalary},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    return sum + (p.totalSalary || 0)
  }, 0)
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MyPayrollsPage.tsx:102','message':'TOTALS_CALCULATED','data':{totalSalary,totalSalaryType:typeof totalSalary,totalPaid,totalPaidType:typeof totalPaid,pendingSalary,pendingSalaryType:typeof pendingSalary},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion

  const content = (
    <div className="container mx-auto px-6 py-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 min-h-full">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Lịch sử lương của tôi</h1>
        <p className="text-slate-600">Xem và quản lý lịch sử lương của bạn</p>
      </div>

      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-emerald-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Tổng lương</CardTitle>
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              {/* #region agent log */}
              {(()=>{fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MyPayrollsPage.tsx:107','message':'RENDERING_TOTAL_SALARY','data':{totalSalary,totalSalaryType:typeof totalSalary,totalSalaryIsUndefined:totalSalary===undefined,totalSalaryIsNull:totalSalary===null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});return null})()}
              {/* #endregion */}
              <div className="text-3xl font-bold text-slate-900">{(totalSalary || 0).toLocaleString()}</div>
              <p className="text-xs text-slate-500 mt-1">VND</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Đã thanh toán</CardTitle>
              <FileText className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              {/* #region agent log */}
              {(()=>{fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MyPayrollsPage.tsx:118','message':'RENDERING_TOTAL_PAID','data':{totalPaid,totalPaidType:typeof totalPaid},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});return null})()}
              {/* #endregion */}
              <div className="text-3xl font-bold text-slate-900">{(totalPaid || 0).toLocaleString()}</div>
              <p className="text-xs text-slate-500 mt-1">VND</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-amber-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Chờ thanh toán</CardTitle>
              <Calendar className="h-5 w-5 text-amber-600" />
            </CardHeader>
            <CardContent>
              {/* #region agent log */}
              {(()=>{fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MyPayrollsPage.tsx:129','message':'RENDERING_PENDING_SALARY','data':{pendingSalary,pendingSalaryType:typeof pendingSalary},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H'})}).catch(()=>{});return null})()}
              {/* #endregion */}
              <div className="text-3xl font-bold text-slate-900">{(pendingSalary || 0).toLocaleString()}</div>
              <p className="text-xs text-slate-500 mt-1">VND</p>
            </CardContent>
          </Card>
        </div>

        {/* Payroll List */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b">
            <CardTitle className="text-2xl">Danh sách lương</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : payrolls.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Chưa có lịch sử lương</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b">
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Tháng</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Lương cơ bản</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Hệ số</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Kinh nghiệm</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Hoa hồng</th>
                      <th className="text-right py-4 px-6 text-sm font-semibold text-slate-700">Tổng lương</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Trạng thái</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payrolls.map((payroll, index) => (
                      <tr
                        key={payroll.id}
                        className={`border-b hover:bg-blue-50/30 transition-colors ${
                          index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                        }`}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-400" />
                          <span className="font-medium">{payroll.month}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {/* #region agent log */}
                          {(()=>{fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MyPayrollsPage.tsx:179','message':'RENDERING_BASE_SALARY','data':{payrollId:payroll.id,baseSalary:payroll.baseSalary,baseSalaryType:typeof payroll.baseSalary},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'I'})}).catch(()=>{});return null})()}
                          {/* #endregion */}
                          {(typeof payroll.baseSalary === 'number' ? payroll.baseSalary : parseFloat(payroll.baseSalary || '0') || 0).toLocaleString()} VND
                        </td>
                        <td className="py-4 px-6">{payroll.coefficient}</td>
                        <td className="py-4 px-6">{payroll.experience} năm</td>
                        <td className="py-4 px-6">
                          {payroll.commission ? `${(typeof payroll.commission === 'number' ? payroll.commission : parseFloat(payroll.commission || '0') || 0).toLocaleString()} VND` : "-"}
                        </td>
                        <td className="py-4 px-6 text-right font-bold text-emerald-600">
                          {/* #region agent log */}
                          {(()=>{fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MyPayrollsPage.tsx:186','message':'RENDERING_TOTAL_SALARY_ROW','data':{payrollId:payroll.id,totalSalary:payroll.totalSalary,totalSalaryType:typeof payroll.totalSalary},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'J'})}).catch(()=>{});return null})()}
                          {/* #endregion */}
                          {(payroll.totalSalary || 0).toLocaleString()} VND
                        </td>
                        <td className="py-4 px-6">{getStatusBadge(payroll.status)}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/my-payrolls/${payroll.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleExportPDF(payroll)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )

  // roleId: 1=Admin, 2=Receptionist, 3=Patient, 4=Doctor (theo enum RoleCode)
  if (role === "admin" || role === "1") {
    return <AdminSidebar>{content}</AdminSidebar>
  } else if (role === "doctor" || role === "4") {
    return <DoctorSidebar>{content}</DoctorSidebar>
  } else if (role === "receptionist" || role === "2") {
    return <ReceptionistSidebar>{content}</ReceptionistSidebar>
  }

  return null
}
