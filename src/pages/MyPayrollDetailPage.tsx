"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Download, CheckCircle, DollarSign, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useAuth } from "@/auth/authContext"
import AdminSidebar from "@/components/sidebar/admin"
import DoctorSidebar from "@/components/sidebar/doctor"
import ReceptionistSidebar from "@/components/sidebar/recep"
import { PayrollService, type Payroll } from "@/services/payroll.service"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function MyPayrollDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [payroll, setPayroll] = useState<Payroll | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [isApproving, setIsApproving] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false)

  useEffect(() => {
    if (id) {
      fetchPayroll()
    }
  }, [id])

  const fetchPayroll = async () => {
    if (!id) return
    try {
      setIsLoading(true)
      const data = await PayrollService.getPayrollById(Number(id))
      setPayroll(data)
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        toast.error(error.response?.data?.message || "Không thể tải thông tin bảng lương")
      }
      navigate("/my-payrolls")
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportPDF = async () => {
    if (!id) return
    try {
      setIsExporting(true)
      const blob = await PayrollService.exportPayrollPDF(Number(id))
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `BangLuong-${payroll?.employee?.employeeCode || id}-${payroll?.month || ''}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success("Xuất PDF thành công")
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        toast.error(error.response?.data?.message || "Không thể xuất PDF")
      }
    } finally {
      setIsExporting(false)
    }
  }

  const handleApprove = async () => {
    if (!id) return
    try {
      setIsApproving(true)
      const updated = await PayrollService.approvePayroll(Number(id))
      setPayroll(updated)
      setIsApproveDialogOpen(false)
      toast.success("Phê duyệt bảng lương thành công!")
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        toast.error(error.response?.data?.message || "Không thể phê duyệt bảng lương")
      }
    } finally {
      setIsApproving(false)
    }
  }

  const handlePay = async () => {
    if (!id) return
    try {
      setIsPaying(true)
      const updated = await PayrollService.payPayroll(Number(id))
      setPayroll(updated)
      setIsPayDialogOpen(false)
      toast.success("Đánh dấu đã thanh toán thành công!")
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        toast.error(error.response?.data?.message || "Không thể đánh dấu đã thanh toán")
      }
    } finally {
      setIsPaying(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      DRAFT: { label: "Nháp", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
      APPROVED: { label: "Đã phê duyệt", className: "bg-blue-50 text-blue-700 border-blue-200" },
      PAID: { label: "Đã thanh toán", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    }

    const statusInfo = statusMap[status] || {
      label: status,
      className: "bg-gray-50 text-gray-700 border-gray-200",
    }

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
  const isAdmin = role === "admin" || role === "1"

  const content = (
    <div className="container mx-auto px-6 py-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 min-h-full">
      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !payroll ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Không tìm thấy thông tin bảng lương</p>
          <Button onClick={() => navigate("/my-payrolls")} className="mt-4">
            Quay lại
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <Button variant="ghost" className="mb-2 pl-0" onClick={() => navigate("/my-payrolls")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Chi tiết bảng lương</h1>
              <p className="text-slate-600 mt-1">
                {payroll.employee?.fullName} - Tháng {payroll.month}
              </p>
            </div>
            <div className="flex gap-2">
              {isAdmin && payroll.status === 'DRAFT' && (
                <Button
                  onClick={() => setIsApproveDialogOpen(true)}
                  disabled={isApproving}
                >
                  {isApproving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang phê duyệt...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Phê duyệt
                    </>
                  )}
                </Button>
              )}
              {isAdmin && payroll.status === 'APPROVED' && (
                <Button
                  onClick={() => setIsPayDialogOpen(true)}
                  disabled={isPaying}
                  variant="default"
                >
                  {isPaying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Đánh dấu đã thanh toán
                    </>
                  )}
                </Button>
              )}
              <Button variant="outline" onClick={handleExportPDF} disabled={isExporting}>
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang xuất...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Xuất PDF
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Employee Info */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin nhân viên</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600">Mã nhân viên</p>
                  <p className="font-semibold text-slate-900">{payroll.employee?.employeeCode || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Họ và tên</p>
                  <p className="font-semibold text-slate-900">{payroll.employee?.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Chức vụ</p>
                  <p className="font-semibold text-slate-900">{payroll.employee?.role}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Tháng</p>
                  <p className="font-semibold text-slate-900">{payroll.month}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Trạng thái</p>
                  {getStatusBadge(payroll.status)}
                </div>
              </CardContent>
            </Card>

            {/* Salary Details */}
            <Card>
              <CardHeader>
                <CardTitle>Chi tiết lương</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600">Lương cơ bản</p>
                  <p className="font-semibold text-slate-900">
                    {(typeof payroll.baseSalary === 'number' ? payroll.baseSalary : parseFloat(payroll.baseSalary || '0') || 0).toLocaleString("vi-VN")} VND
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Hệ số</p>
                  <p className="font-semibold text-slate-900">{payroll.coefficient}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Kinh nghiệm</p>
                  <p className="font-semibold text-slate-900">{payroll.experience} năm</p>
                </div>
                {payroll.commission && (
                  <div>
                    <p className="text-sm text-slate-600">Hoa hồng</p>
                    <p className="font-semibold text-slate-900">
                      {(typeof payroll.commission === 'number' ? payroll.commission : parseFloat(payroll.commission || '0') || 0).toLocaleString("vi-VN")} VND
                    </p>
                  </div>
                )}
                {payroll.totalAppointments && (
                  <div>
                    <p className="text-sm text-slate-600">Tổng số ca khám</p>
                    <p className="font-semibold text-slate-900">{payroll.totalAppointments}</p>
                  </div>
                )}
                <div className="pt-4 border-t">
                  <p className="text-sm text-slate-600">Tổng lương</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {(typeof payroll.totalSalary === 'number' ? payroll.totalSalary : parseFloat(payroll.totalSalary || '0') || 0).toLocaleString("vi-VN")} VND
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin thời gian</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-600">Ngày tạo</p>
                <p className="font-semibold text-slate-900">
                  {format(new Date(payroll.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                </p>
              </div>
              {payroll.approvedAt && (
                <div>
                  <p className="text-sm text-slate-600">Ngày phê duyệt</p>
                  <p className="font-semibold text-slate-900">
                    {format(new Date(payroll.approvedAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                  </p>
                </div>
              )}
              {payroll.paidAt && (
                <div>
                  <p className="text-sm text-slate-600">Ngày thanh toán</p>
                  <p className="font-semibold text-slate-900">
                    {format(new Date(payroll.paidAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Approve Dialog - Only for Admin */}
          {isAdmin && (
            <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Xác nhận phê duyệt</DialogTitle>
                  <DialogDescription>
                    Bạn có chắc chắn muốn phê duyệt bảng lương này?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button onClick={handleApprove} disabled={isApproving}>
                    {isApproving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      "Xác nhận"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* Pay Dialog - Only for Admin */}
          {isAdmin && (
            <Dialog open={isPayDialogOpen} onOpenChange={setIsPayDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Xác nhận thanh toán</DialogTitle>
                  <DialogDescription>
                    Bạn có chắc chắn muốn đánh dấu bảng lương này đã được thanh toán?
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsPayDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button onClick={handlePay} disabled={isPaying}>
                    {isPaying ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      "Xác nhận"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      )}
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
