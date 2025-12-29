"use client"

import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { ArrowLeft, Download, Printer, User, FileText, Activity, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function InvoiceDetailPage() {
  const { id } = useParams()
  const [hasMedication, setHasMedication] = useState(true)
  const [isPaid, setIsPaid] = useState(false)

  // Mock data
  const invoice = {
    id: "1",
    invoiceNumber: "INV-2025-001",
    patientName: "Nguyễn Văn A",
    patientId: "P001",
    date: "2025-11-30",
    time: "14:30",
    doctor: "BS. Trần Thị B",
    diagnosis: "Viêm họng cấp",
    consultationFee: 300000,
    medications: [
      { name: "Amoxicillin 500mg", quantity: 20, unitPrice: 5000, total: 100000 },
      { name: "Paracetamol 500mg", quantity: 10, unitPrice: 2000, total: 20000 },
      { name: "Vitamin C", quantity: 30, unitPrice: 1000, total: 30000 },
    ],
    status: "pending" as const,
  }

  const medicationTotal = hasMedication ? invoice.medications.reduce((sum, med) => sum + med.total, 0) : 0
  const totalAmount = invoice.consultationFee + medicationTotal

  const handleConfirmPayment = () => {
    setIsPaid(true)
    alert("Xác nhận thanh toán thành công!")
  }

  const handleExportPDF = () => {
    alert("Xuất PDF hóa đơn...")
  }

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
              <Link to="/invoices">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Invoices
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Chi tiết hóa đơn</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div>
        </div>

        {/* Invoice Card */}
        <Card className="border-0 shadow-xl mb-6">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">{invoice.invoiceNumber}</CardTitle>
                <p className="text-blue-100">
                  {invoice.date} - {invoice.time}
                </p>
              </div>
              <Badge
                variant="outline"
                className={
                  isPaid ? "bg-emerald-500/20 text-white border-white/30" : "bg-amber-500/20 text-white border-white/30"
                }
              >
                {isPaid ? "Đã thanh toán" : "Chờ thanh toán"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <div className="flex items-center gap-2 text-slate-600 mb-1">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">Bệnh nhân</span>
                </div>
                <div className="text-lg font-semibold text-slate-900">{invoice.patientName}</div>
                <div className="text-sm text-slate-500">{invoice.patientId}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-slate-600 mb-1">
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">Bác sĩ điều trị</span>
                </div>
                <div className="text-lg font-semibold text-slate-900">{invoice.doctor}</div>
                <div className="text-sm text-slate-500">{invoice.diagnosis}</div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold text-lg text-slate-900 mb-4">Chi tiết thanh toán</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between py-2">
                  <span className="text-slate-600">Phí khám bệnh</span>
                  <span className="font-semibold text-slate-900">{invoice.consultationFee.toLocaleString()} VND</span>
                </div>

                {/* Medication Toggle */}
                <div className="flex items-center justify-between py-3 bg-blue-50/50 rounded-lg px-4">
                  <Label htmlFor="medication-toggle" className="text-slate-700 font-medium cursor-pointer">
                    Sử dụng thuốc
                  </Label>
                  <Switch id="medication-toggle" checked={hasMedication} onCheckedChange={setHasMedication} />
                </div>

                {hasMedication && (
                  <div className="border rounded-lg p-4 space-y-2">
                    <div className="font-medium text-slate-900 mb-3">Danh sách thuốc:</div>
                    {invoice.medications.map((med, idx) => (
                      <div key={idx} className="flex justify-between py-2 border-b last:border-0">
                        <div className="flex-1">
                          <div className="font-medium text-slate-900">{med.name}</div>
                          <div className="text-sm text-slate-500">
                            {med.quantity} x {med.unitPrice.toLocaleString()} VND
                          </div>
                        </div>
                        <div className="font-semibold text-slate-900">{med.total.toLocaleString()} VND</div>
                      </div>
                    ))}
                    <div className="flex justify-between py-2 pt-3 border-t">
                      <span className="text-slate-600">Tổng tiền thuốc</span>
                      <span className="font-semibold text-slate-900">{medicationTotal.toLocaleString()} VND</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t-2 pt-4 flex justify-between items-center">
                <span className="text-xl font-bold text-slate-900">Tổng cộng</span>
                <span className="text-2xl font-bold text-blue-600">{totalAmount.toLocaleString()} VND</span>
              </div>
            </div>

            {!isPaid && (
              <div className="mt-6">
                <Button
                  onClick={handleConfirmPayment}
                  className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                  size="lg"
                >
                  <Check className="h-5 w-5 mr-2" />
                  Xác nhận thanh toán
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
