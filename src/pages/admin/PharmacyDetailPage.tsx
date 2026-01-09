"use client"

import { useState, useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import { Activity, ArrowLeft, Calendar, Package, DollarSign, TrendingUp, Clock, FileText, Loader2, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AdminSidebar from "@/components/sidebar/admin"
import api from "@/lib/api"
import { toast } from "sonner"

export default function PharmacyDetailPage() {
  const { id } = useParams()
  const [medication, setMedication] = useState<any>(null)
  const [imports, setImports] = useState<any[]>([])
  const [exports, setExports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
        try {
            setLoading(true)
            const [medRes, importRes, exportRes] = await Promise.all([
                api.get(`/api/medicines/${id}`),
                api.get(`/api/medicines/${id}/imports`),
                api.get(`/api/medicines/${id}/exports`)
            ]);

            if (medRes.data.success) setMedication(medRes.data.data);
            if (importRes.data.success) setImports(importRes.data.data);
            if (exportRes.data.success) setExports(exportRes.data.data);

        } catch (error) {
            console.error(error)
            toast.error("Lỗi tải thông tin chi tiết thuốc");
        } finally {
            setLoading(false)
        }
    }
    if(id) fetchData();
  }, [id])

  if (loading) return (
      <AdminSidebar>
          <div className="h-screen flex items-center justify-center">
              <Loader2 className="animate-spin text-blue-600 h-8 w-8" />
          </div>
      </AdminSidebar>
  )

  if (!medication) return (
    <AdminSidebar>
         <div className="p-6 text-center text-slate-500">Không tìm thấy thông tin thuốc.</div>
    </AdminSidebar>
  )

  const profitMargin = medication.importPrice > 0 
    ? ((medication.salePrice - medication.importPrice) / medication.importPrice) * 100 
    : 0;

  return (
    <AdminSidebar>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link to="/admin/pharmacy">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        {medication.name}
                        {medication.status === 'EXPIRED' && <Badge variant="destructive">Đã hết hạn</Badge>}
                    </h1>
                    <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                        <span className="font-mono bg-slate-100 px-2 py-0.5 rounded">{medication.medicineCode}</span>
                        <span>•</span>
                        <span>{medication.group}</span>
                        <span>•</span>
                        <span className="text-blue-600 font-medium">{medication.manufacturer}</span>
                    </div>
                </div>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Cập nhật thông tin
            </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="bg-blue-50 border-blue-100 shadow-sm">
                    <CardContent className="p-4">
                        <div className="text-sm text-blue-600 mb-1">Tồn kho hiện tại</div>
                        <div className="text-2xl font-bold text-slate-900">{medication.quantity} <span className="text-sm font-normal text-slate-500">{medication.unit}</span></div>
                    </CardContent>
                </Card>
                <Card className="bg-emerald-50 border-emerald-100 shadow-sm">
                    <CardContent className="p-4">
                        <div className="text-sm text-emerald-600 mb-1">Giá bán</div>
                        <div className="text-2xl font-bold text-slate-900">{Number(medication.salePrice).toLocaleString()} <span className="text-sm font-normal text-slate-500">đ</span></div>
                    </CardContent>
                </Card>
                <Card className="bg-purple-50 border-purple-100 shadow-sm">
                    <CardContent className="p-4">
                        <div className="text-sm text-purple-600 mb-1">Lợi nhuận biên</div>
                        <div className="text-2xl font-bold text-slate-900">+{profitMargin.toFixed(1)}%</div>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Info */}
            <Card className="border-0 shadow-md">
              <CardHeader className="bg-slate-50 border-b py-3">
                <CardTitle className="text-base font-semibold">Thông tin chi tiết</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Hoạt chất chính</div>
                    <div className="font-medium">{medication.activeIngredient || "---"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Hạn sử dụng</div>
                    <div className="font-medium flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400"/>
                        {new Date(medication.expiryDate).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Giá vốn (Nhập)</div>
                    <div className="font-medium">{Number(medication.importPrice).toLocaleString()} đ</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-500 mb-1">Mức tồn kho tối thiểu</div>
                    <div className="font-medium text-amber-600">{medication.minStockLevel} {medication.unit}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-sm text-slate-500 mb-1">Mô tả / Ghi chú</div>
                    <div className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-md border border-slate-100">
                        {medication.description || "Không có mô tả thêm."}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - History Tabs */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-md h-full">
              <CardHeader className="bg-slate-50 border-b py-3">
                <CardTitle className="text-base font-semibold">Lịch sử giao dịch</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs defaultValue="import" className="w-full">
                    <TabsList className="w-full grid grid-cols-2 rounded-none bg-slate-50 p-0 border-b">
                        <TabsTrigger value="import" className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none py-3">Nhập kho</TabsTrigger>
                        <TabsTrigger value="export" className="data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none py-3">Xuất/Hủy</TabsTrigger>
                    </TabsList>
                    
                    {/* Import History */}
                    <TabsContent value="import" className="p-0 m-0 max-h-[500px] overflow-y-auto">
                        {imports.length === 0 ? (
                            <div className="p-6 text-center text-sm text-slate-500">Chưa có lịch sử nhập hàng</div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {imports.map((item: any) => (
                                    <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-sm font-semibold text-slate-900 flex items-center gap-1">
                                                <ArrowDownRight className="w-4 h-4 text-emerald-500"/>
                                                Nhập {item.quantity} {medication.unit}
                                            </span>
                                            <span className="text-xs text-slate-400">{new Date(item.importDate).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-slate-500">
                                            <span>Giá nhập: {Number(item.importPrice).toLocaleString()} đ</span>
                                            <span>Tổng: {(item.quantity * item.importPrice).toLocaleString()} đ</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Export History */}
                    <TabsContent value="export" className="p-0 m-0 max-h-[500px] overflow-y-auto">
                        {exports.length === 0 ? (
                            <div className="p-6 text-center text-sm text-slate-500">Chưa có lịch sử xuất/hủy</div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {exports.map((item: any) => (
                                    <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-sm font-semibold text-slate-900 flex items-center gap-1">
                                                <ArrowUpRight className="w-4 h-4 text-red-500"/>
                                                Xuất {item.quantity} {medication.unit}
                                            </span>
                                            <span className="text-xs text-slate-400">{new Date(item.exportDate).toLocaleDateString('vi-VN')}</span>
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1 bg-red-50 p-1.5 rounded text-red-700">
                                            Lý do: {item.reason}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminSidebar>
  )
}