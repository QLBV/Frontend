"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Receipt, Calendar, ArrowLeft, Download, DollarSign } from "lucide-react"
import { toast } from "sonner"
import { InvoiceService, type Invoice, PaymentStatus } from "@/services/invoice.service"
import PatientSidebar from "@/components/sidebar/patient"
import { useAuth } from "@/auth/authContext"

export default function InvoicesPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!user?.patientId) {
        toast.error("Không tìm thấy thông tin bệnh nhân")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const response = await InvoiceService.getInvoicesByPatient(user.patientId)
        
        if (response.success && response.data) {
          setInvoices(Array.isArray(response.data) ? response.data : [])
        }
      } catch (error: any) {
        console.error("Error fetching invoices:", error)
        toast.error(error.response?.data?.message || "Không thể tải danh sách hóa đơn")
      } finally {
        setIsLoading(false)
      }
    }

    fetchInvoices()
  }, [user?.patientId])

  const getStatusBadge = (paymentStatus: PaymentStatus) => {
    const statusMap: Record<PaymentStatus, { label: string; className: string }> = {
      [PaymentStatus.UNPAID]: { label: "Chờ thanh toán", className: "bg-yellow-100 text-yellow-700" },
      [PaymentStatus.PARTIALLY_PAID]: { label: "Thanh toán một phần", className: "bg-orange-100 text-orange-700" },
      [PaymentStatus.PAID]: { label: "Đã thanh toán", className: "bg-green-100 text-green-700" },
    }

    const statusInfo = statusMap[paymentStatus] || {
      label: paymentStatus,
      className: "bg-gray-100 text-gray-700",
    }

    return (
      <Badge className={statusInfo.className}>
        {statusInfo.label}
      </Badge>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  return (
    <PatientSidebar 
      userName={user?.fullName || user?.email}
    >
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Hóa đơn của tôi</h1>
            <p className="text-muted-foreground mt-1">
              Xem và quản lý các hóa đơn thanh toán
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : invoices.length > 0 ? (
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <Card
                key={invoice.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/invoices/${invoice.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Receipt className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">
                          Hóa đơn #{invoice.invoiceCode}
                        </h3>
                        {getStatusBadge(invoice.paymentStatus)}
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-semibold text-foreground">
                            Tổng tiền: {formatCurrency(invoice.totalAmount)}
                          </span>
                        </div>
                        {invoice.visit?.visitDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Ngày khám: {new Date(invoice.visit.visitDate).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Tạo lúc: {new Date(invoice.createdAt).toLocaleString("vi-VN")}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm">
                        Xem chi tiết
                      </Button>
                      {invoice.paymentStatus === PaymentStatus.PAID && (
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Tải PDF
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Chưa có hóa đơn</h3>
              <p className="text-muted-foreground mb-6">
                Các hóa đơn thanh toán sẽ được hiển thị ở đây sau khi bạn khám bệnh.
              </p>
              <Button onClick={() => navigate("/patient/appointments")}>
                Xem lịch hẹn của tôi
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </PatientSidebar>
  )
}
