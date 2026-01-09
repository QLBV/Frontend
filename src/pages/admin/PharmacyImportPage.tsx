"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Activity, ArrowLeft, Plus, Trash2, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import AdminSidebar from "@/components/sidebar/admin"
import api from "@/lib/api"
import { toast } from "sonner"

interface ImportItem {
  id: string
  name: string
  group: string
  quantity: number
  unit: string
  costPrice: number
  profitMargin: number
  sellingPrice: number
  expiryDate: string
  supplier: string 
  description?: string
}

export default function PharmacyImportPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  
  // State danh sách các thuốc cần tạo mới
  const [importItems, setImportItems] = useState<ImportItem[]>([
    {
      id: "1",
      name: "",
      group: "Kháng sinh",
      quantity: 1,
      unit: "VIEN",
      costPrice: 0,
      profitMargin: 30,
      sellingPrice: 0,
      expiryDate: "",
      supplier: "",
      description: ""
    },
  ])

  const addImportItem = () => {
    const newItem: ImportItem = {
      id: Date.now().toString(),
      name: "",
      group: "Kháng sinh",
      quantity: 1,
      unit: "VIEN",
      costPrice: 0,
      profitMargin: 30,
      sellingPrice: 0,
      expiryDate: "",
      supplier: "",
      description: ""
    }
    setImportItems([...importItems, newItem])
  }

  const removeImportItem = (id: string) => {
    if (importItems.length > 1) {
      setImportItems(importItems.filter((item) => item.id !== id))
    }
  }

  const updateImportItem = (id: string, field: keyof ImportItem, value: string | number) => {
    setImportItems(
      importItems.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }
          // Tự động tính giá bán khi thay đổi giá vốn hoặc lãi suất
          if (field === "costPrice" || field === "profitMargin") {
            const costPrice = field === "costPrice" ? Number(value) : item.costPrice
            const profitMargin = field === "profitMargin" ? Number(value) : item.profitMargin
            updatedItem.sellingPrice = Math.round(costPrice * (1 + profitMargin / 100))
          }
          return updatedItem
        }
        return item
      }),
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate cơ bản
    if(importItems.some(i => !i.name || !i.expiryDate || i.quantity <= 0)) {
        toast.error("Vui lòng điền đầy đủ thông tin (Tên, Hạn dùng, Số lượng > 0)");
        return;
    }

    setLoading(true)

    try {
        // Lặp qua từng item và gọi API tạo thuốc mới
        const promises = importItems.map(item => {
            const payload = {
                name: item.name,
                group: item.group,
                quantity: item.quantity,
                unit: item.unit,
                importPrice: item.costPrice,
                salePrice: item.sellingPrice,
                expiryDate: item.expiryDate,
                manufacturer: item.supplier, // Map supplier -> manufacturer
                description: item.description,
                minStockLevel: 10 // Mặc định cảnh báo khi còn 10
            };
            return api.post("/api/medicines", payload);
        });

        await Promise.all(promises);
        
        toast.success(`Đã nhập kho thành công ${importItems.length} loại thuốc mới!`);
        navigate("/admin/pharmacy");

    } catch (error: any) {
        console.error(error);
        toast.error(error.response?.data?.message || "Có lỗi xảy ra khi nhập kho");
    } finally {
        setLoading(false)
    }
  }

  const totalCost = importItems.reduce((sum, item) => sum + item.costPrice * item.quantity, 0)
  const totalValue = importItems.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0)

  return (
    <AdminSidebar>
      <div className="p-6 pb-24"> {/* Thêm padding bottom để tránh nút bị che */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Nhập thuốc mới</h1>
            <p className="text-slate-500">Khai báo thuốc mới và nhập kho lần đầu</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/admin/pharmacy">
                <ArrowLeft className="h-4 w-4 mr-2"/> Quay lại
            </Link>
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Summary Card */}
          <Card className="border-0 shadow-md mb-6 bg-slate-50">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
                <div>
                  <Label className="text-slate-500">Số lượng mặt hàng</Label>
                  <div className="text-3xl font-bold text-slate-900 mt-1">{importItems.length}</div>
                </div>
                <div>
                  <Label className="text-slate-500">Tổng vốn nhập</Label>
                  <div className="text-3xl font-bold text-blue-600 mt-1">{totalCost.toLocaleString()} đ</div>
                </div>
                <div>
                  <Label className="text-slate-500">Tổng giá trị bán</Label>
                  <div className="text-3xl font-bold text-emerald-600 mt-1">{totalValue.toLocaleString()} đ</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Import Items List */}
          <div className="space-y-6">
            {importItems.map((item, index) => (
              <Card key={item.id} className="border-0 shadow-md overflow-visible">
                <CardHeader className="bg-white border-b py-3 sticky top-0 z-10">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                            {index + 1}
                        </span>
                        Thông tin thuốc
                    </CardTitle>
                    {importItems.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeImportItem(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Row 1 */}
                    <div className="lg:col-span-2">
                      <Label className="mb-2 block">Tên thuốc <span className="text-red-500">*</span></Label>
                      <Input
                        value={item.name}
                        onChange={(e) => updateImportItem(item.id, "name", e.target.value)}
                        placeholder="Vd: Paracetamol 500mg"
                        required
                        className="font-medium"
                      />
                    </div>

                    <div>
                      <Label className="mb-2 block">Nhóm thuốc</Label>
                      <select
                        value={item.group}
                        onChange={(e) => updateImportItem(item.id, "group", e.target.value)}
                        className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="Kháng sinh">Kháng sinh</option>
                        <option value="Giảm đau - Hạ sốt">Giảm đau - Hạ sốt</option>
                        <option value="Vitamin">Vitamin & Khoáng chất</option>
                        <option value="Tiêu hóa">Tiêu hóa</option>
                        <option value="Tim mạch">Tim mạch</option>
                        <option value="Hô hấp">Hô hấp</option>
                        <option value="Dị ứng">Dị ứng</option>
                        <option value="Khác">Khác</option>
                      </select>
                    </div>

                    <div>
                      <Label className="mb-2 block">Nhà sản xuất / NCC</Label>
                      <Input
                        value={item.supplier}
                        onChange={(e) => updateImportItem(item.id, "supplier", e.target.value)}
                        placeholder="Công ty dược..."
                      />
                    </div>

                    {/* Row 2 */}
                    <div>
                      <Label className="mb-2 block">Số lượng nhập <span className="text-red-500">*</span></Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateImportItem(item.id, "quantity", Number(e.target.value))}
                          min="1"
                          required
                        />
                        <select
                          value={item.unit}
                          onChange={(e) => updateImportItem(item.id, "unit", e.target.value)}
                          className="w-24 h-10 px-2 rounded-md border border-slate-200 bg-white text-sm"
                        >
                          <option value="VIEN">Viên</option>
                          <option value="HOP">Hộp</option>
                          <option value="CHAI">Chai</option>
                          <option value="VI">Vỉ</option>
                          <option value="TUYP">Tuýp</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label className="mb-2 block">Hạn sử dụng <span className="text-red-500">*</span></Label>
                      <Input
                        type="date"
                        value={item.expiryDate}
                        onChange={(e) => updateImportItem(item.id, "expiryDate", e.target.value)}
                        required
                      />
                    </div>

                    <div>
                         {/* Placeholder for layout balance */}
                    </div>
                     <div>
                         {/* Placeholder for layout balance */}
                    </div>

                    {/* Row 3 - Pricing */}
                    <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <div>
                        <Label className="mb-2 block text-slate-600">Giá vốn (VNĐ)</Label>
                        <Input
                            type="number"
                            value={item.costPrice}
                            onChange={(e) => updateImportItem(item.id, "costPrice", Number(e.target.value))}
                            min="0"
                            className="bg-white"
                        />
                        </div>

                        <div>
                        <Label className="mb-2 block text-slate-600">Lãi suất (%)</Label>
                        <Input
                            type="number"
                            value={item.profitMargin}
                            onChange={(e) => updateImportItem(item.id, "profitMargin", Number(e.target.value))}
                            min="0"
                            step="0.1"
                            className="bg-white"
                        />
                        </div>

                        <div>
                        <Label className="mb-2 block text-emerald-600 font-semibold">Giá bán đề xuất</Label>
                        <Input
                            value={item.sellingPrice}
                            readOnly
                            className="bg-emerald-50 text-emerald-700 font-bold border-emerald-200"
                        />
                        </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Buttons Footer */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 z-50 md:pl-72"> {/* md:pl-72 để tránh sidebar */}
            <div className="container mx-auto flex justify-between items-center">
                <Button
                type="button"
                variant="outline"
                onClick={addImportItem}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                <Plus className="h-4 w-4 mr-2" />
                Thêm thuốc khác
                </Button>

                <div className="flex gap-3">
                <Button type="button" variant="ghost" asChild>
                    <Link to="/admin/pharmacy">Hủy bỏ</Link>
                </Button>
                <Button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white min-w-[180px] shadow-lg shadow-blue-200"
                >
                    {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Lưu & Nhập kho
                </Button>
                </div>
            </div>
          </div>
        </form>
      </div>
    </AdminSidebar>
  )
}