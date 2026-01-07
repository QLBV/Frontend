"use client"

import { useState } from "react"
import { TrendingUp, DollarSign, Package, AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"
import { Calendar } from "@/components/ui/calendar"
import AdminSidebar from "@/components/sidebar/admin" // Đường dẫn import của bạn

export default function AdminDashboardPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())

  // Mock data giữ nguyên...
  const todayRevenue = 30000000
  const monthRevenue = 450000000
  const revenueChange = 8
  const medicationStock = 150
  const lowStockCount = 12
  const expiringCount = 5
  const medicationChange = -3

  return (
    // 1. BỎ thẻ div wrap bên ngoài (cái có flex min-h-screen)
    // 2. Thay vì tự gọi AdminSidebar đóng ngay (children={undefined}), hãy bọc nội dung vào trong nó.
    
    <AdminSidebar>
      {/* Container nội dung chính */}
      {/* Bỏ ml-64 vì SidebarLayout đã tự chia cột flex rồi */}
      <div className="container mx-auto px-6 py-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 min-h-full">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
          <p className="text-slate-600">Tổng quan hệ thống và quản lý</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Revenue Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-emerald-50/30">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Doanh thu hôm nay</CardTitle>
                  <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900 mb-1">{todayRevenue.toLocaleString()} VND</div>
                  <div className="flex items-center gap-1 text-sm">
                    <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                    <span className="text-emerald-600 font-medium">+{revenueChange}%</span>
                    <span className="text-slate-500">vs yesterday</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Doanh thu tháng</CardTitle>
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900 mb-1">{monthRevenue.toLocaleString()} VND</div>
                  <div className="flex items-center gap-1 text-sm">
                    <ArrowUpRight className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-600 font-medium">+12%</span>
                    <span className="text-slate-500">vs last month</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Medication Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-violet-50/30">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Thuốc trong kho</CardTitle>
                  <div className="h-10 w-10 rounded-full bg-violet-500/10 flex items-center justify-center">
                    <Package className="h-5 w-5 text-violet-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900 mb-1">{medicationStock}</div>
                  <div className="flex items-center gap-1 text-sm">
                    <ArrowDownRight className="h-4 w-4 text-red-600" />
                    <span className="text-red-600 font-medium">{medicationChange}%</span>
                    <span className="text-slate-500">vs last week</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-amber-50/30">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Cảnh báo thuốc</CardTitle>
                  <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="text-2xl font-bold text-slate-900">{lowStockCount}</div>
                      <div className="text-xs text-slate-500">Sắp hết</div>
                    </div>
                    <div className="h-10 w-px bg-slate-200" />
                    <div>
                      <div className="text-2xl font-bold text-slate-900">{expiringCount}</div>
                      <div className="text-xs text-slate-500">Sắp hết hạn</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Expiring Medications Alert */}
            <Card className="border-0 shadow-lg border-l-4 border-l-amber-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                      Thuốc sắp hết hạn
                    </CardTitle>
                    <p className="text-sm text-slate-600 mt-1">Cần xử lý trong 30 ngày tới</p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/pharmacy">Xem chi tiết</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <div>
                      <div className="font-medium text-slate-900">Amoxicillin 500mg</div>
                      <div className="text-sm text-slate-600">Hết hạn: 15/12/2025 (15 ngày)</div>
                    </div>
                    <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-200">
                      Khẩn cấp
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <div>
                      <div className="font-medium text-slate-900">Paracetamol 500mg</div>
                      <div className="text-sm text-slate-600">Hết hạn: 20/12/2025 (20 ngày)</div>
                    </div>
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-200">
                      Cảnh báo
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Calendar Sidebar */}
          <div className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg">Lịch</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border-0" />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link to="/admin/salary">
                    <Package className="h-4 w-4 mr-2" />
                    Quản lý lương
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link to="/pharmacy">
                    <Package className="h-4 w-4 mr-2" />
                    Quản lý kho thuốc
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminSidebar>
  )
}