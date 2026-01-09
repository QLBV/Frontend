"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/auth/authContext"
import { ArrowLeft, Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { InvoiceService } from "@/services/invoice.service"
import { getVisits, type Visit } from "@/services/visit.service"
import ReceptionistSidebar from "@/components/sidebar/recep"
import AdminSidebar from "@/components/sidebar/admin"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function CreateInvoicePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingVisits, setIsLoadingVisits] = useState(true)
  const [visits, setVisits] = useState<Visit[]>([])
  const [selectedVisitId, setSelectedVisitId] = useState<string>("")
  const [examinationFee, setExaminationFee] = useState("")

  useEffect(() => {
    fetchVisits()
  }, [])

  const fetchVisits = async () => {
    try {
      setIsLoadingVisits(true)
      // Fetch completed visits that might not have invoices yet
      const response = await getVisits({
        status: "COMPLETED",
        limit: 100,
      })
      setVisits(response.data || [])
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tải danh sách lần khám")
    } finally {
      setIsLoadingVisits(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedVisitId || !examinationFee) {
      toast.error("Vui lòng điền đầy đủ thông tin")
      return
    }

    const fee = parseFloat(examinationFee)
    if (isNaN(fee) || fee <= 0) {
      toast.error("Phí khám bệnh phải lớn hơn 0")
      return
    }

    try {
      setIsLoading(true)
      const response = await InvoiceService.createInvoice({
        visitId: parseInt(selectedVisitId),
        examinationFee: fee,
      })
      if (response.success && response.data) {
        toast.success("Tạo hóa đơn thành công")
        navigate(`/invoices/${response.data.id}`)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tạo hóa đơn")
    } finally {
      setIsLoading(false)
    }
  }

  const selectedVisit = visits.find((v) => v.id === parseInt(selectedVisitId))

  if (!user) {
    return null
  }

  const role = String(user.roleId || user.role || "").toLowerCase()

  const content = (
    <div className="container mx-auto px-6 py-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 min-h-full">
      <div className="space-y-6">
        <Button variant="ghost" className="mb-2 pl-0" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Tạo hóa đơn mới</h1>
          <p className="text-slate-600">Tạo hóa đơn từ lần khám đã hoàn thành</p>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Thông tin hóa đơn</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="visitId">Lần khám *</Label>
                {isLoadingVisits ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <Select value={selectedVisitId} onValueChange={setSelectedVisitId}>
                    <SelectTrigger id="visitId">
                      <SelectValue placeholder="Chọn lần khám" />
                    </SelectTrigger>
                    <SelectContent>
                      {visits.length === 0 ? (
                        <div className="px-2 py-1.5 text-sm text-slate-500 text-center">
                          Không có lần khám nào
                        </div>
                      ) : (
                        visits.map((visit) => (
                          <SelectItem key={visit.id} value={visit.id.toString()}>
                            {visit.patient?.fullName || "N/A"} - {visit.doctor?.fullName || "N/A"} -{" "}
                            {new Date(visit.visitDate).toLocaleDateString("vi-VN")}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
                {selectedVisit && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg text-sm">
                    <p>
                      <strong>Bệnh nhân:</strong> {selectedVisit.patient?.fullName || "N/A"} (
                      {selectedVisit.patient?.patientCode || "N/A"})
                    </p>
                    <p>
                      <strong>Bác sĩ:</strong> {selectedVisit.doctor?.fullName || "N/A"}
                    </p>
                    <p>
                      <strong>Ngày khám:</strong>{" "}
                      {new Date(selectedVisit.visitDate).toLocaleDateString("vi-VN", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    {selectedVisit.diagnosis && (
                      <p>
                        <strong>Chẩn đoán:</strong> {selectedVisit.diagnosis}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="examinationFee">Phí khám bệnh (VND) *</Label>
                <Input
                  id="examinationFee"
                  type="number"
                  min="0"
                  step="1000"
                  value={examinationFee}
                  onChange={(e) => setExaminationFee(e.target.value)}
                  placeholder="Nhập phí khám bệnh"
                  required
                />
                <p className="text-sm text-slate-500 mt-1">
                  Phí khám bệnh sẽ được tính vào tổng tiền hóa đơn. Nếu có đơn thuốc, tiền thuốc sẽ được tự động
                  thêm vào.
                </p>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading || !selectedVisitId || !examinationFee}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Tạo hóa đơn
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                  Hủy
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
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
