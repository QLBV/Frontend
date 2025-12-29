"use client"

import type React from "react"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Activity, ArrowLeft, Plus, Trash2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

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
  batchNumber: string
  supplier: string
}

export default function PharmacyImportPage() {
  const navigate = useNavigate()
  const [importItems, setImportItems] = useState<ImportItem[]>([
    {
      id: "1",
      name: "",
      group: "",
      quantity: 0,
      unit: "viên",
      costPrice: 0,
      profitMargin: 30,
      sellingPrice: 0,
      expiryDate: "",
      batchNumber: "",
      supplier: "",
    },
  ])

  const addImportItem = () => {
    const newItem: ImportItem = {
      id: Date.now().toString(),
      name: "",
      group: "",
      quantity: 0,
      unit: "viên",
      costPrice: 0,
      profitMargin: 30,
      sellingPrice: 0,
      expiryDate: "",
      batchNumber: "",
      supplier: "",
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

          // Auto-calculate selling price when cost price or profit margin changes
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send the data to your backend
    console.log("Importing medications:", importItems)
    alert("Nhập thuốc thành công!")
    navigate("/pharmacy")
  }

  const totalCost = importItems.reduce((sum, item) => sum + item.costPrice * item.quantity, 0)
  const totalValue = importItems.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/pharmacy" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                HealthCare Plus
              </span>
            </Link>
            <Button variant="outline" size="sm" asChild>
              <Link to="/pharmacy">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Nhập kho thuốc</h1>
          <p className="text-slate-600">Thêm thuốc mới vào kho (Chỉ Admin)</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Summary Card */}
          <Card className="border-0 shadow-xl shadow-slate-900/5 mb-6">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label className="text-slate-600">Số lượng mặt hàng</Label>
                  <div className="text-3xl font-bold text-slate-900 mt-1">{importItems.length}</div>
                </div>
                <div>
                  <Label className="text-slate-600">Tổng giá vốn</Label>
                  <div className="text-3xl font-bold text-slate-900 mt-1">{totalCost.toLocaleString()} đ</div>
                </div>
                <div>
                  <Label className="text-slate-600">Tổng giá trị bán</Label>
                  <div className="text-3xl font-bold text-emerald-600 mt-1">{totalValue.toLocaleString()} đ</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Import Items */}
          <div className="space-y-6">
            {importItems.map((item, index) => (
              <Card key={item.id} className="border-0 shadow-xl shadow-slate-900/5">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl text-slate-900">Mặt hàng #{index + 1}</CardTitle>
                    {importItems.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeImportItem(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Medication Name */}
                    <div>
                      <Label htmlFor={`name-${item.id}`}>Tên thuốc *</Label>
                      <Input
                        id={`name-${item.id}`}
                        value={item.name}
                        onChange={(e) => updateImportItem(item.id, "name", e.target.value)}
                        placeholder="Vd: Paracetamol 500mg"
                        required
                      />
                    </div>

                    {/* Group */}
                    <div>
                      <Label htmlFor={`group-${item.id}`}>Nhóm thuốc *</Label>
                      <select
                        id={`group-${item.id}`}
                        value={item.group}
                        onChange={(e) => updateImportItem(item.id, "group", e.target.value)}
                        className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Chọn nhóm thuốc</option>
                        <option value="Giảm đau - Hạ sốt">Giảm đau - Hạ sốt</option>
                        <option value="Kháng sinh">Kháng sinh</option>
                        <option value="Vitamin & Khoáng chất">Vitamin & Khoáng chất</option>
                        <option value="Tiêu hóa">Tiêu hóa</option>
                        <option value="Tim mạch">Tim mạch</option>
                        <option value="Hô hấp">Hô hấp</option>
                      </select>
                    </div>

                    {/* Quantity */}
                    <div>
                      <Label htmlFor={`quantity-${item.id}`}>Số lượng *</Label>
                      <div className="flex gap-2">
                        <Input
                          id={`quantity-${item.id}`}
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateImportItem(item.id, "quantity", Number(e.target.value))}
                          placeholder="0"
                          min="1"
                          required
                        />
                        <select
                          value={item.unit}
                          onChange={(e) => updateImportItem(item.id, "unit", e.target.value)}
                          className="w-24 h-10 px-3 rounded-md border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="viên">viên</option>
                          <option value="vỉ">vỉ</option>
                          <option value="hộp">hộp</option>
                          <option value="chai">chai</option>
                          <option value="gói">gói</option>
                        </select>
                      </div>
                    </div>

                    {/* Cost Price */}
                    <div>
                      <Label htmlFor={`costPrice-${item.id}`}>Giá vốn (đ) *</Label>
                      <Input
                        id={`costPrice-${item.id}`}
                        type="number"
                        value={item.costPrice}
                        onChange={(e) => updateImportItem(item.id, "costPrice", Number(e.target.value))}
                        placeholder="0"
                        min="0"
                        required
                      />
                    </div>

                    {/* Profit Margin */}
                    <div>
                      <Label htmlFor={`profitMargin-${item.id}`}>Lãi suất (%) *</Label>
                      <Input
                        id={`profitMargin-${item.id}`}
                        type="number"
                        value={item.profitMargin}
                        onChange={(e) => updateImportItem(item.id, "profitMargin", Number(e.target.value))}
                        placeholder="30"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>

                    {/* Selling Price (Auto-calculated) */}
                    <div>
                      <Label htmlFor={`sellingPrice-${item.id}`}>Giá bán (đ)</Label>
                      <Input
                        id={`sellingPrice-${item.id}`}
                        type="number"
                        value={item.sellingPrice}
                        readOnly
                        className="bg-slate-50"
                      />
                    </div>

                    {/* Batch Number */}
                    <div>
                      <Label htmlFor={`batchNumber-${item.id}`}>Số lô *</Label>
                      <Input
                        id={`batchNumber-${item.id}`}
                        value={item.batchNumber}
                        onChange={(e) => updateImportItem(item.id, "batchNumber", e.target.value)}
                        placeholder="Vd: LOT001"
                        required
                      />
                    </div>

                    {/* Expiry Date */}
                    <div>
                      <Label htmlFor={`expiryDate-${item.id}`}>Hạn dùng *</Label>
                      <Input
                        id={`expiryDate-${item.id}`}
                        type="date"
                        value={item.expiryDate}
                        onChange={(e) => updateImportItem(item.id, "expiryDate", e.target.value)}
                        required
                      />
                    </div>

                    {/* Supplier */}
                    <div>
                      <Label htmlFor={`supplier-${item.id}`}>Nhà cung cấp *</Label>
                      <Input
                        id={`supplier-${item.id}`}
                        value={item.supplier}
                        onChange={(e) => updateImportItem(item.id, "supplier", e.target.value)}
                        placeholder="Vd: Công ty Dược phẩm ABC"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={addImportItem}
              className="border-blue-200 text-blue-600 hover:bg-blue-50 bg-transparent"
            >
              <Plus className="h-5 w-5 mr-2" />
              Thêm mặt hàng
            </Button>

            <div className="flex gap-4">
              <Button type="button" variant="outline" size="lg" asChild>
                <Link to="/pharmacy">Hủy</Link>
              </Button>
              <Button
                type="submit"
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30"
              >
                <Save className="h-5 w-5 mr-2" />
                Lưu phiếu nhập
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
