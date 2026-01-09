"use client"

import { useState, useEffect } from "react"
import { TrendingUp, DollarSign, Users, Calendar as CalendarIcon, ArrowUpRight, ArrowDownRight, Loader2, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Link } from "react-router-dom"
import { Calendar } from "@/components/ui/calendar"
import AdminSidebar from "@/components/sidebar/admin"

// --- 1. Định nghĩa Interface khớp với Backend trả về ---

// Kết quả từ API: /api/dashboard
interface DashboardSummaryData {
  summary: {
    revenue: {
      today: number
      yesterday: number
      changePercent: number
    }
    patients: {
      today: number
      yesterday: number
      changePercent: number
    }
    appointments: {
      today: number
      yesterday: number
      changePercent: number
    }
    doctors: {
      active: number
      total: number
      percentage: number
    }
  }
}

// Kết quả từ API: /api/dashboard/stats
interface DashboardStatsData {
  overview: {
    totalPatients: number
    totalDoctors: number
    totalAppointments: number
    totalRevenue: number
  }
  monthly: {
    currentMonth: number
    lastMonth: number
    changePercent: number
  }
}

export default function AdminDashboardPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  
  // State lưu dữ liệu
  const [realtimeData, setRealtimeData] = useState<DashboardSummaryData | null>(null)
  const [statsData, setStatsData] = useState<DashboardStatsData | null>(null)
  
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // --- 2. Gọi 2 API song song để lấy đủ dữ liệu ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        // 1. Kiểm tra Token trước
        const token = localStorage.getItem('accessToken'); 
        if (!token) {
            throw new Error("Chưa tìm thấy Token đăng nhập. Vui lòng đăng nhập lại.");
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }

        // 2. Gọi API và kiểm tra từng cái
        const [resRealtime, resStats] = await Promise.all([
            fetch('http://localhost:3000/api/dashboard', { headers }),
            fetch('http://localhost:3000/api/dashboard/stats', { headers })
        ])

        // 3. Bắt lỗi HTTP cụ thể
        if (!resRealtime.ok) {
            const errText = await resRealtime.text();
            throw new Error(`Lỗi API Dashboard (${resRealtime.status}): ${errText}`);
        }
        if (!resStats.ok) {
            const errText = await resStats.text();
            throw new Error(`Lỗi API Stats (${resStats.status}): ${errText}`);
        }

        const dataRealtime = await resRealtime.json()
        const dataStats = await resStats.json()

        if (dataRealtime.success) setRealtimeData(dataRealtime.data)
        if (dataStats.success) setStatsData(dataStats.data)

      } catch (err: any) {
        console.error("Dashboard Debug Error:", err)
        // Hiển thị nguyên văn lỗi server trả về để dễ sửa
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <AdminSidebar>
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
            <p className="text-slate-500">Đang đồng bộ dữ liệu hệ thống...</p>
        </div>
      </AdminSidebar>
    )
  }

  // --- 3. Chuẩn bị dữ liệu để hiển thị (Fallback về 0 nếu null) ---
  const revenue = realtimeData?.summary.revenue || { today: 0, changePercent: 0 }
  const patients = realtimeData?.summary.patients || { today: 0, changePercent: 0 }
  const appointments = realtimeData?.summary.appointments || { today: 0, changePercent: 0 }
  const monthly = statsData?.monthly || { currentMonth: 0, changePercent: 0 }

  // Helper render % thay đổi
  const renderChange = (percent: number) => {
    const isPositive = percent >= 0;
    const Icon = isPositive ? ArrowUpRight : ArrowDownRight;
    const colorClass = isPositive ? 'text-emerald-600' : 'text-red-600';
    
    return (
      <div className="flex items-center gap-1 text-sm">
        <Icon className={`h-4 w-4 ${colorClass}`} />
        <span className={`${colorClass} font-medium`}>
          {isPositive ? '+' : ''}{percent}%
        </span>
        <span className="text-slate-500">so với hôm qua</span>
      </div>
    );
  };

  return (
    <AdminSidebar>
      <div className="container mx-auto px-6 py-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 min-h-full">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
          <p className="text-slate-600">Tổng quan hoạt động phòng khám</p>
          {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Stats Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Hàng 1: Doanh thu */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Doanh thu ngày */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-emerald-50/30">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Doanh thu hôm nay</CardTitle>
                  <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900 mb-1">
                    {Number(revenue.today).toLocaleString('vi-VN')} đ
                  </div>
                  {renderChange(revenue.changePercent)}
                </CardContent>
              </Card>

              {/* Card 2: Doanh thu tháng */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Doanh thu tháng này</CardTitle>
                  <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900 mb-1">
                    {Number(monthly.currentMonth).toLocaleString('vi-VN')} đ
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    {monthly.changePercent >= 0 ? <ArrowUpRight className="h-4 w-4 text-blue-600"/> : <ArrowDownRight className="h-4 w-4 text-red-600"/>}
                    <span className="text-blue-600 font-medium">{monthly.changePercent > 0 ? '+' : ''}{monthly.changePercent}%</span>
                    <span className="text-slate-500">so với tháng trước</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Hàng 2: Bệnh nhân & Lịch hẹn (Dữ liệu từ Backend Service) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 3: Bệnh nhân hôm nay */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-violet-50/30">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Bệnh nhân tiếp nhận</CardTitle>
                  <div className="h-10 w-10 rounded-full bg-violet-500/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-violet-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900 mb-1">{patients.today}</div>
                  {renderChange(patients.changePercent)}
                </CardContent>
              </Card>

              {/* Card 4: Lịch hẹn hôm nay */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-amber-50/30">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600">Lịch hẹn hôm nay</CardTitle>
                  <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <CalendarIcon className="h-5 w-5 text-amber-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900 mb-1">{appointments.today}</div>
                  {renderChange(appointments.changePercent)}
                </CardContent>
              </Card>
            </div>

            {/* Bảng hoạt động chung (Lấy từ Stats Data) */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    Thống kê tổng quan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-slate-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-700">{statsData?.overview.totalPatients || 0}</div>
                        <div className="text-sm text-slate-500">Tổng Bệnh nhân</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-700">{statsData?.overview.totalDoctors || 0}</div>
                        <div className="text-sm text-slate-500">Tổng Bác sĩ</div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-700">{statsData?.overview.totalAppointments || 0}</div>
                        <div className="text-sm text-slate-500">Tổng Lịch hẹn</div>
                    </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Phải: Lịch & Quick Actions */}
          <div className="space-y-6">
            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg">Lịch làm việc</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border-0" />
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg">Thao tác nhanh</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link to="/admin/appointments">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Quản lý lịch hẹn
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent" asChild>
                  <Link to="/admin/patients">
                    <Users className="h-4 w-4 mr-2" />
                    Danh sách bệnh nhân
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