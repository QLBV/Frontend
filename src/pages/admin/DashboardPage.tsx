"use client"

import { useState, useEffect, useMemo } from "react"
import { 
  DollarSign, Package, AlertTriangle, ArrowUpRight, 
  Clock, Loader2, ChevronRight, Activity, Users, CalendarIcon, 
  UserCheck
} from "lucide-react"
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer
} from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import AdminSidebar from "@/components/sidebar/admin"
import UpcomingAppointmentsWidget from "@/components/UpcomingAppointmentsWidget"
import { MedicineService, type Medicine } from "@/services/medicine.service"
import { DashboardService, type DashboardData } from "@/services/dashboard.service"
import { ShiftService, type DoctorOnDuty } from "@/services/shift.service"
import { AttendanceService, type Attendance } from "@/services/attendance.service"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

export default function AdminDashboardPage() {
  const [lowStockMedicines, setLowStockMedicines] = useState<Medicine[]>([])
  const [expiringMedicines, setExpiringMedicines] = useState<Medicine[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [doctorsOnDuty, setDoctorsOnDuty] = useState<DoctorOnDuty[]>([])
  const [isLoadingOnDuty, setIsLoadingOnDuty] = useState(false)
  const [todayAttendance, setTodayAttendance] = useState<Attendance[]>([])

  useEffect(() => {
    const init = async () => {
      setIsLoading(true)
      await Promise.all([
        fetchDashboardData(),
        fetchAlerts(),
        fetchDoctorsOnDuty(),
        fetchTodayAttendance()
      ])
      setIsLoading(false)
    }
    init()
  }, [])

  const fetchDoctorsOnDuty = async () => {
    try {
      setIsLoadingOnDuty(true)
      const data = await ShiftService.getDoctorsOnDuty()
      setDoctorsOnDuty(data)
    } catch (error) {
      console.error('Failed to fetch doctors on duty:', error)
    } finally {
      setIsLoadingOnDuty(false)
    }
  }

  const fetchTodayAttendance = async () => {
    try {
      const today = format(new Date(), "yyyy-MM-dd")
      const response = await AttendanceService.getAllAttendance({
        startDate: today,
        endDate: today,
        limit: 100,
      })
      setTodayAttendance(response.attendances || [])
    } catch (error) {
      console.error('Failed to fetch today attendance:', error)
    }
  }

  const fetchDashboardData = async () => {
    try {
      const data = await DashboardService.getDashboardData()
      setDashboardData(data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }
  }

  const fetchAlerts = async () => {
    try {
      const [lowStockResponse, expiringResponse] = await Promise.all([
        MedicineService.getLowStockMedicines({ page: 1, limit: 5 }),
        MedicineService.getExpiringMedicines({ page: 1, limit: 5 }),
      ])
      
      setLowStockMedicines(lowStockResponse.medicines || [])
      setExpiringMedicines(expiringResponse.medicines || [])
    } catch (error) {
      console.error('Failed to fetch alerts:', error)
    }
  }

  // Derived Stats
  const revenueData = useMemo(() => dashboardData?.charts?.dailyRevenue || [], [dashboardData])
  const stats = dashboardData?.stats
  const overview = dashboardData?.overview
  const activities = dashboardData?.recentActivities || []

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)

  if (isLoading) {
    return (
      <AdminSidebar>
        <div className="flex h-[80vh] w-full items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary/60" />
            <p className="text-slate-500 font-medium animate-pulse">Đang tải dữ liệu dashboard...</p>
          </div>
        </div>
      </AdminSidebar>
    )
  }

  return (
    <AdminSidebar>
      <div className="container mx-auto px-6 py-8 bg-slate-50/50 min-h-screen">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Admin Dashboard</h1>
            <p className="text-slate-500 mt-3 flex items-center gap-2 font-medium">
              <CalendarIcon className="h-4 w-4 text-primary" />
              {format(new Date(), "eeee, 'ngày' dd 'tháng' MM 'năm' yyyy", { locale: vi })}
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Left Column: Main Content */}
          <div className="xl:col-span-3 space-y-8">
            
            {/* Real Top Level Stats */}
            {/* Premium Top Level Stats - Harmonized */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { 
                  label: "Doanh thu hôm nay", 
                  value: formatCurrency(overview?.revenue.today || 0), 
                  change: `${overview?.revenue.change || 0}%`, 
                  trend: (overview?.revenue.change || 0) >= 0 ? "up" : "down",
                  icon: DollarSign, 
                  color: "emerald",
                  lightBg: "bg-emerald-50",
                  textColor: "text-emerald-600"
                },
                { 
                  label: "Bệnh nhân mới", 
                  value: overview?.patients.today || 0, 
                  change: `+${overview?.patients.change || 0}%`, 
                  trend: "up",
                  icon: Users, 
                  color: "blue",
                  lightBg: "bg-blue-50",
                  textColor: "text-blue-600"
                },
                { 
                  label: "Lịch hẹn hôm nay", 
                  value: overview?.appointments.today || 0, 
                  change: `+${overview?.appointments.change || 0}%`, 
                  trend: "up",
                  icon: CalendarIcon, 
                  color: "indigo",
                  lightBg: "bg-indigo-50",
                  textColor: "text-indigo-600"
                },
                { 
                  label: "Kho thuốc (Loại)", 
                  value: overview?.medicationStock || 0, 
                  change: "Số loại", 
                  trend: "neutral",
                  icon: Package, 
                  color: "amber",
                  lightBg: "bg-amber-50",
                  textColor: "text-amber-600"
                }
              ].map((item, idx) => (
                <Card key={idx} className={`group border-0 shadow-lg shadow-slate-200/50 hover:shadow-2xl transition-all duration-500 bg-white rounded-3xl overflow-hidden relative
                  ${item.color === 'emerald' ? 'hover:shadow-emerald-100/50' : 
                    item.color === 'blue' ? 'hover:shadow-blue-100/50' : 
                    item.color === 'indigo' ? 'hover:shadow-indigo-100/50' : 
                    'hover:shadow-amber-100/50'}`}>
                  
                  {/* Decorative Pattern Background */}
                  <div className={`absolute -right-4 -bottom-4 h-24 w-24 rounded-full opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 ${item.lightBg.replace('50', '500')}`} />
                  
                  <CardContent className="p-7 relative z-10">
                    <div className="flex items-center justify-between mb-5">
                      <div className={`p-3.5 rounded-2xl ${item.lightBg} ${item.textColor} transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-sm`}>
                        <item.icon className="h-6 w-6" />
                      </div>
                      <Badge className={`border-0 font-black text-[10px] px-2.5 py-1 shadow-sm transition-transform duration-500 group-hover:scale-110 ${item.trend === 'up' ? 'bg-emerald-500 text-white' : item.trend === 'down' ? 'bg-red-500 text-white' : 'bg-slate-500 text-white'}`}>
                        {item.change}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="text-slate-400 text-[11px] font-black uppercase tracking-widest transition-colors group-hover:text-slate-500">{item.label}</h3>
                      <p className="text-2xl font-black text-slate-900 mt-2 tracking-tight group-hover:scale-[1.02] origin-left transition-transform duration-500">{item.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Performance Chart Section */}
            <Card className="border-0 shadow-sm bg-white overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 pb-6 px-8">
                <div>
                  <CardTitle className="text-lg">Xu hướng doanh thu</CardTitle>
                  <CardDescription>Dữ liệu thanh toán trong 7 ngày gần nhất</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8 text-xs">Xuất báo cáo</Button>
                </div>
              </CardHeader>
              <CardContent className="pt-8 px-4 h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }} 
                      tickFormatter={(value) => `${value / 1000}k`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: number) => [formatCurrency(value), "Doanh thu"]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorRev)" 
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upcoming Appointments */}
              <UpcomingAppointmentsWidget limit={5} />

              {/* Doctors & Attendance Hub - Harmonized */}
              <div className="space-y-8">
                {/* Doctors Tag Feed */}
                <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white overflow-hidden rounded-3xl">
                  <CardHeader className="pb-4 px-8 pt-7 border-b border-slate-50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg font-black flex items-center gap-3">
                        <div className="bg-emerald-50 p-2 rounded-xl">
                          <UserCheck className="h-5 w-5 text-emerald-600" />
                        </div>
                        Đội ngũ đang trực
                      </CardTitle>
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 font-bold border-0">
                        {doctorsOnDuty.length} Bác sĩ
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                      {isLoadingOnDuty ? (
                        <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-slate-200" /></div>
                      ) : doctorsOnDuty.length === 0 ? (
                        <div className="text-center py-10 px-6 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 relative overflow-hidden group">
                          {/* Decorative Background Element */}
                          <div className="absolute -right-8 -bottom-8 h-32 w-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                          
                          <div className="relative z-10">
                            <div className="h-16 w-16 bg-white shadow-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100 transition-transform group-hover:rotate-12 duration-500">
                              <Users className="h-8 w-8 text-slate-200" />
                            </div>
                            <h4 className="text-slate-900 font-black text-sm mb-1 uppercase tracking-tight">Trạm trực trống</h4>
                            <p className="text-xs text-slate-400 font-medium max-w-[180px] mx-auto leading-relaxed">
                              Hiện tại không có bác sĩ nào trong ca trực này. 
                            </p>
                            <Button variant="outline" className="mt-5 h-9 text-[11px] font-black uppercase tracking-widest bg-white rounded-xl shadow-sm hover:shadow-md transition-all border-slate-100 group-hover:border-primary group-hover:text-primary" asChild>
                                <Link to="/admin/doctor-schedule">
                                    Sắp xếp ca trực
                                </Link>
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-3">
                          {doctorsOnDuty.map(d => (
                            <div key={d.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/50 hover:bg-emerald-50/50 transition-all border border-slate-100 group cursor-default">
                              <div className="flex items-center gap-4">
                                <Avatar className="h-10 w-10 border-2 border-white shadow-sm transition-transform group-hover:scale-105">
                                  <AvatarFallback className="bg-emerald-100 text-emerald-700 font-black text-xs">
                                    {d.fullName.split(' ').pop()?.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-black text-slate-800">{d.fullName}</p>
                                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tighter">Đang hoạt động</p>
                                </div>
                              </div>
                              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Premium Activity Timeline */}
            <Card className="border-0 shadow-lg bg-white overflow-hidden rounded-2xl">
              <CardHeader className="border-b border-slate-50 flex flex-row items-center justify-between px-8 py-5">
                <CardTitle className="text-lg font-black flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Activity className="h-4 w-4 text-indigo-600" />
                  </div>
                  Nhật ký hoạt động
                </CardTitle>
                <Button variant="ghost" size="sm" className="h-8 text-xs font-bold text-slate-400 hover:text-primary transition-colors">Xem tất cả</Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative">
                  <div className="absolute left-10 top-0 bottom-0 w-px bg-slate-100" />
                  <div className="divide-y divide-slate-50/50">
                    {activities.length === 0 ? (
                      <div className="p-20 text-center">
                        <Activity className="h-10 w-10 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-400 font-medium">Chưa có hoạt động nào được ghi nhận</p>
                      </div>
                    ) : (
                      activities.slice(0, 2).map((act, idx) => (
                        <div key={act.id} className="p-6 pl-8 hover:bg-slate-50/50 transition-all duration-300 flex items-start gap-6 group relative">
                          <Avatar className="h-10 w-10 border-4 border-white shadow-md z-10 transition-transform group-hover:scale-110">
                            <AvatarFallback className={`text-white text-xs font-black ${idx % 2 === 0 ? 'bg-indigo-500' : 'bg-blue-500'}`}>
                              {act.user?.fullName?.charAt(0) || "S"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors truncate">
                                    {act.description}
                                </p>
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full whitespace-nowrap">
                                    {format(new Date(act.timestamp), "HH:mm")}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium italic">
                                {act.user?.fullName || "Hệ thống tự động"} • {format(new Date(act.timestamp), "dd/MM/yyyy")}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Insights & Quick Actions */}
          <div className="space-y-8">
            {/* Clean Professional Overview Summary */}
            <Card className="border-0 shadow-lg bg-white overflow-hidden">
              <CardHeader className="pb-4 bg-slate-50/50 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-slate-900 text-lg font-bold whitespace-nowrap">Tổng quan hệ thống</CardTitle>
                    <CardDescription className="text-slate-500 text-xs">Dữ liệu tổng hợp toàn thời gian</CardDescription>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 gap-4">
                    {[
                        { label: "Tổng số bệnh nhân", val: stats?.totalPatients || 0, color: "text-blue-600", icon: Users, bgColor: "bg-blue-50" },
                        { label: "Đội ngũ bác sĩ", val: stats?.totalDoctors || 0, color: "text-emerald-600", icon: UserCheck, bgColor: "bg-emerald-50" },
                        { label: "Lịch hẹn hệ thống", val: stats?.totalAppointments || 0, color: "text-purple-600", icon: CalendarIcon, bgColor: "bg-purple-50" },
                        { label: "Tổng doanh thu", val: formatCurrency(stats?.totalRevenue || 0), color: "text-amber-600", icon: DollarSign, bgColor: "bg-amber-50" }
                    ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between group p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                            <div className="flex items-center gap-4">
                                <div className={`h-12 w-12 rounded-2xl ${item.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm`}>
                                    <item.icon className={`h-6 w-6 ${item.color}`} />
                                </div>
                                <div>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                                    <p className="text-lg font-black text-slate-900 leading-none mt-1">{item.val}</p>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                        </div>
                    ))}
                </div>
                
                <div className="pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-end mb-3">
                        <div>
                            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest">Hiệu suất tháng này</p>
                            <p className="text-sm font-bold text-slate-700 mt-1">
                                Mục tiêu: {overview?.revenue.targetMonth ? formatCurrency(overview.revenue.targetMonth) : "Chưa đặt"}
                            </p>
                        </div>
                        <span className="text-2xl font-black text-primary italic">{overview?.revenue.performance || 0}%</span>
                    </div>
                    <div className="relative h-4 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary/80 to-primary rounded-full transition-all duration-1000 flex items-center justify-end px-2" 
                          style={{ width: `${overview?.revenue.performance || 0}%` }}
                        >
                            <div className="h-1 w-1 bg-white rounded-full animate-ping" />
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-3 text-center font-medium italic">
                        * Chỉ tiêu dựa trên mức tăng trưởng 10% so với tháng trước
                    </p>
                </div>
              </CardContent>
            </Card>

            {/* Attendance Summary - Moved Up */}
            <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white overflow-hidden rounded-3xl mt-8">
                <CardHeader className="pb-4 pt-7 px-8 border-b border-slate-50 bg-indigo-50/20">
                    <CardTitle className="text-lg font-black flex items-center gap-2 text-slate-800 whitespace-nowrap">
                        <div className="bg-indigo-50 p-2 rounded-xl flex-shrink-0">
                            <Clock className="h-5 w-5 text-indigo-600" />
                        </div>
                        Nhân sự hôm nay
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="grid grid-cols-3 gap-3 mb-8">
                        <div className="text-center p-4 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm transition-transform hover:scale-105">
                            <p className="text-2xl font-black text-emerald-600 leading-none">{todayAttendance.filter(a => a.status === 'PRESENT').length}</p>
                            <p className="text-[9px] text-emerald-500 uppercase font-black tracking-widest mt-2">Hiện diện</p>
                        </div>
                        <div className="text-center p-4 bg-amber-50 rounded-2xl border border-amber-100 shadow-sm transition-transform hover:scale-105">
                            <p className="text-2xl font-black text-amber-600 leading-none">{todayAttendance.filter(a => a.status === 'LATE').length}</p>
                            <p className="text-[9px] text-amber-500 uppercase font-black tracking-widest mt-2">Đi muộn</p>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-2xl border border-red-100 shadow-sm transition-transform hover:scale-105">
                            <p className="text-2xl font-black text-red-500 leading-none">{todayAttendance.filter(a => a.status === 'ABSENT').length}</p>
                            <p className="text-[9px] text-red-500 uppercase font-black tracking-widest mt-2">Nghỉ</p>
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        <div className="flex justify-between text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">
                            <span>Chỉ số vận hành</span>
                            <span className="text-indigo-600">{Math.round((todayAttendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length / Math.max(1, todayAttendance.length)) * 100)}%</span>
                        </div>
                        <div className="relative h-3 w-full bg-slate-100 rounded-full overflow-hidden flex shadow-inner p-0.5">
                            <div className="h-full bg-emerald-500 rounded-full shadow-lg" style={{ width: `${(todayAttendance.filter(a => a.status === 'PRESENT').length / Math.max(1, todayAttendance.length)) * 100}%` }} />
                            <div className="h-full bg-amber-400" style={{ width: `${(todayAttendance.filter(a => a.status === 'LATE').length / Math.max(1, todayAttendance.length)) * 100}%` }} />
                            <div className="h-full bg-red-400" style={{ width: `${(todayAttendance.filter(a => a.status === 'ABSENT').length / Math.max(1, todayAttendance.length)) * 100}%` }} />
                        </div>
                        <p className="text-[10px] text-slate-400 text-center font-medium italic mt-2">
                            * Cập nhật lúc {format(new Date(), "HH:mm")}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Unified Alerts & Warnings - Moved Down */}
            <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white overflow-hidden rounded-3xl mt-8">
                <CardHeader className="pb-4 pt-7 px-8 border-b border-slate-50 bg-red-50/20">
                    <CardTitle className="text-lg font-black flex items-center gap-2 text-red-600 whitespace-nowrap">
                        <div className="bg-red-50 p-2 rounded-xl flex-shrink-0">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        Cảnh báo vận hành
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-7 space-y-6">
                    {/* Low Stock Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Tồn kho thấp</span>
                            <Badge className="bg-red-500 text-white border-0 shadow-md px-2 py-0.5">{lowStockMedicines.length}</Badge>
                        </div>
                        <div className="grid grid-cols-1 gap-2.5">
                            {lowStockMedicines.slice(0, 3).map(m => (
                                <div key={m.id} className="p-3.5 bg-red-50/40 rounded-2xl border border-red-100 flex justify-between items-center group hover:bg-red-50 transition-all">
                                    <span className="text-sm font-bold text-slate-700">{m.name}</span>
                                    <span className="text-xs text-red-600 font-black px-2.5 py-1.5 bg-white rounded-xl shadow-sm border border-red-50">{m.quantity} 📦</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Expiry Section */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center justify-between px-1">
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Sắp hết hạn</span>
                            <Badge className="bg-amber-500 text-white border-0 shadow-md px-2 py-0.5">{expiringMedicines.length}</Badge>
                        </div>
                        <div className="grid grid-cols-1 gap-2.5">
                            {expiringMedicines.slice(0, 3).map(m => (
                                <div key={m.id} className="p-3.5 bg-amber-50/40 rounded-2xl border border-amber-100 flex justify-between items-center hover:bg-amber-50 transition-all">
                                    <span className="text-sm font-bold text-slate-700 truncate pr-2">{m.name}</span>
                                    <span className="text-[10px] font-black text-amber-700 bg-white px-2.5 py-1.5 rounded-xl shadow-sm border border-amber-50">{format(new Date(m.expiryDate), "dd/MM")}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <Button variant="outline" className="w-full h-12 text-sm font-black gap-2 rounded-2xl border-slate-200 hover:bg-slate-50 shadow-sm mt-2 group" asChild>
                        <Link to="/pharmacy">
                            Kiểm kho ngay
                            <ArrowUpRight className="h-4 w-4 text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
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
