"use client"

import { useState, useEffect } from "react"
import { TrendingUp, DollarSign, Package, AlertTriangle, ArrowUpRight, ArrowDownRight, Clock, Loader2, ChevronRight, Activity, Users, CalendarIcon, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"
import { Calendar } from "@/components/ui/calendar"
import { toast } from "sonner"
import AdminSidebar from "@/components/sidebar/admin"
import UpcomingAppointmentsWidget from "@/components/UpcomingAppointmentsWidget"
import { MedicineService, type Medicine } from "@/services/medicine.service"
import { DashboardService, type DashboardStats, type DashboardOverview, type RecentActivity, type QuickStats, type SystemAlert } from "@/services/dashboard.service"
import { ShiftService, type DoctorOnDuty } from "@/services/shift.service"
import { AttendanceService, type Attendance } from "@/services/attendance.service"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

export default function AdminDashboardPage() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [lowStockMedicines, setLowStockMedicines] = useState<Medicine[]>([])
  const [expiringMedicines, setExpiringMedicines] = useState<Medicine[]>([])
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(true)
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true)
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [dashboardOverview, setDashboardOverview] = useState<DashboardOverview | null>(null)
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null)
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([])
  const [doctorsOnDuty, setDoctorsOnDuty] = useState<DoctorOnDuty[]>([])
  const [isLoadingOnDuty, setIsLoadingOnDuty] = useState(false)
  const [todayAttendance, setTodayAttendance] = useState<Attendance[]>([])
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false)

  // Default values when API data is not available (will be 0 if API fails)
  const todayRevenue = dashboardOverview?.revenue.today || 0
  const monthRevenue = dashboardOverview?.revenue.thisMonth || 0
  const revenueChange = dashboardOverview?.revenue.change || 0
  const medicationStock = dashboardOverview?.medicationStock || 0
  const medicationChange = dashboardOverview?.medicationChange || 0

  useEffect(() => {
    fetchDashboardData()
    fetchAlerts()
    fetchDoctorsOnDuty()
    fetchTodayAttendance()
  }, [])

  const fetchDoctorsOnDuty = async () => {
    try {
      setIsLoadingOnDuty(true)
      const data = await ShiftService.getDoctorsOnDuty()
      setDoctorsOnDuty(data)
    } catch (error: any) {
      // Silent fail for widget
      console.error('Failed to fetch doctors on duty:', error)
    } finally {
      setIsLoadingOnDuty(false)
    }
  }

  const fetchTodayAttendance = async () => {
    try {
      setIsLoadingAttendance(true)
      const today = format(new Date(), "yyyy-MM-dd")
      const response = await AttendanceService.getAllAttendance({
        startDate: today,
        endDate: today,
        limit: 100,
      })
      setTodayAttendance(response.attendances || [])
    } catch (error: any) {
      // Silent fail for widget
      console.error('Failed to fetch today attendance:', error)
    } finally {
      setIsLoadingAttendance(false)
    }
  }

  const fetchDashboardData = async () => {
    try {
      setIsLoadingDashboard(true)
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardPage.tsx:42',message:'FETCH_DASHBOARD_START',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      // Try to get all dashboard data at once
      try {
        const data = await DashboardService.getDashboardData()
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardPage.tsx:47',message:'DASHBOARD_DATA_RECEIVED',data:{hasStats:!!data.stats,hasOverview:!!data.overview,hasRecentActivities:!!data.recentActivities,recentActivitiesType:typeof data.recentActivities,recentActivitiesIsArray:Array.isArray(data.recentActivities),hasQuickStats:!!data.quickStats,hasAlerts:!!data.alerts,alertsType:typeof data.alerts,alertsIsArray:Array.isArray(data.alerts)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        setDashboardStats(data.stats)
        setDashboardOverview(data.overview)
        setRecentActivities(Array.isArray(data.recentActivities) ? data.recentActivities : [])
        setQuickStats(data.quickStats)
        setSystemAlerts(Array.isArray(data.alerts) ? data.alerts : [])
      } catch (error) {
        // If unified endpoint fails, try individual endpoints
        try {
          const [stats, overview, activities, quick, alerts] = await Promise.all([
            DashboardService.getStats().catch(() => null),
            DashboardService.getOverview().catch(() => null),
            DashboardService.getRecentActivities(10).catch(() => []),
            DashboardService.getQuickStats().catch(() => null),
            DashboardService.getAlerts().catch(() => []),
          ])
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardPage.tsx:56',message:'INDIVIDUAL_FETCH_RESULTS',data:{hasStats:!!stats,hasOverview:!!overview,activitiesType:typeof activities,activitiesIsArray:Array.isArray(activities),hasQuick:!!quick,alertsType:typeof alerts,alertsIsArray:Array.isArray(alerts)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
          // #endregion
          if (stats) setDashboardStats(stats)
          if (overview) setDashboardOverview(overview)
          setRecentActivities(Array.isArray(activities) ? activities : [])
          if (quick) setQuickStats(quick)
          setSystemAlerts(Array.isArray(alerts) ? alerts : [])
        } catch (err) {
          // Silent fail - use fallback data
          console.warn('Failed to fetch dashboard data, using fallback')
        }
      }
    } catch (error: any) {
      if (error.response?.status !== 429) {
        console.error('Error fetching dashboard data:', error)
      }
    } finally {
      setIsLoadingDashboard(false)
    }
  }

  const fetchAlerts = async () => {
    try {
      setIsLoadingAlerts(true)
      const [lowStockResponse, expiringResponse] = await Promise.all([
        MedicineService.getLowStockMedicines({ page: 1, limit: 10 }),
        MedicineService.getExpiringMedicines({ page: 1, limit: 10 }),
      ])
      
      if (lowStockResponse.medicines) {
        setLowStockMedicines(lowStockResponse.medicines)
      }
      if (expiringResponse.medicines) {
        setExpiringMedicines(expiringResponse.medicines)
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tải cảnh báo thuốc")
    } finally {
      setIsLoadingAlerts(false)
    }
  }

  const lowStockCount = Array.isArray(lowStockMedicines) ? lowStockMedicines.length : 0
  const expiringCount = Array.isArray(expiringMedicines) ? expiringMedicines.length : 0
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'DashboardPage.tsx:103',message:'CALCULATE_COUNTS',data:{lowStockMedicinesType:typeof lowStockMedicines,lowStockMedicinesIsArray:Array.isArray(lowStockMedicines),expiringMedicinesType:typeof expiringMedicines,expiringMedicinesIsArray:Array.isArray(expiringMedicines),recentActivitiesType:typeof recentActivities,recentActivitiesIsArray:Array.isArray(recentActivities),systemAlertsType:typeof systemAlerts,systemAlertsIsArray:Array.isArray(systemAlerts)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion

  const getDaysUntilExpiry = (expiryDate: string): number => {
    const expiry = new Date(expiryDate)
    const today = new Date()
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

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

            {/* Upcoming Appointments Widget */}
            <UpcomingAppointmentsWidget limit={5} />

            {/* Doctors On Duty Widget */}
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-green-50/50 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-600" />
                    Bác sĩ đang trực
                  </CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/admin/doctor-schedule">
                      Xem tất cả
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isLoadingOnDuty ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : doctorsOnDuty.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Không có bác sĩ đang trực</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {doctorsOnDuty.slice(0, 5).map((doctor) => (
                      <div
                        key={doctor.id}
                        className="p-4 hover:bg-green-50/30 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                              <Users className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">{doctor.fullName}</div>
                              <div className="text-sm text-slate-600">
                                {doctor.specialty} • {doctor.shift.name}
                              </div>
                              <div className="text-xs text-slate-500">
                                {format(new Date(doctor.workDate), "dd/MM/yyyy", { locale: vi })} • {doctor.shift.startTime} - {doctor.shift.endTime}
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Đang trực
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Today's Attendance Widget */}
            <Card className="border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      Chấm công hôm nay
                    </CardTitle>
                    <p className="text-sm text-slate-600 mt-1">
                      {format(new Date(), "dd/MM/yyyy", { locale: vi })}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/admin/attendance">
                      Xem tất cả
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {isLoadingAttendance ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                  </div>
                ) : todayAttendance.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Clock className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                    <p className="text-sm">Chưa có dữ liệu chấm công hôm nay</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-emerald-50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-emerald-700 mb-1">
                          {todayAttendance.filter((a) => a.status === "PRESENT").length}
                        </div>
                        <div className="text-xs text-emerald-600 font-medium">Có mặt</div>
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-red-700 mb-1">
                          {todayAttendance.filter((a) => a.status === "ABSENT").length}
                        </div>
                        <div className="text-xs text-red-600 font-medium">Vắng mặt</div>
                      </div>
                      <div className="p-4 bg-yellow-50 rounded-lg text-center">
                        <div className="text-2xl font-bold text-yellow-700 mb-1">
                          {todayAttendance.filter((a) => a.status === "LATE").length}
                        </div>
                        <div className="text-xs text-yellow-600 font-medium">Đi muộn</div>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="text-sm text-slate-600 mb-2">Tổng nhân viên: {todayAttendance.length}</div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Users className="h-3 w-3" />
                        {todayAttendance.filter((a) => a.checkInTime).length} đã check-in
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activities */}
            {Array.isArray(recentActivities) && recentActivities.length > 0 && (
              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50/50 border-b">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Activity className="h-5 w-5 text-purple-600" />
                    Hoạt động gần đây
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {recentActivities.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="p-4 hover:bg-purple-50/30 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                            <Activity className="h-4 w-4 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-900">{activity.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {activity.user && (
                                <span className="text-xs text-slate-500">
                                  {activity.user.fullName}
                                </span>
                              )}
                              <span className="text-xs text-slate-400">
                                {format(new Date(activity.timestamp), "dd/MM/yyyy HH:mm", { locale: vi })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* System Alerts */}
            {Array.isArray(systemAlerts) && systemAlerts.length > 0 && (
              <Card className="border-0 shadow-xl border-l-4 border-l-orange-500">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    Cảnh báo hệ thống
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {systemAlerts.slice(0, 3).map((alert) => (
                      <div
                        key={alert.id}
                        className={`p-3 rounded-lg ${
                          alert.type === 'error'
                            ? 'bg-red-50 border border-red-200'
                            : alert.type === 'warning'
                            ? 'bg-amber-50 border border-amber-200'
                            : 'bg-blue-50 border border-blue-200'
                        }`}
                      >
                        <p className="text-sm text-slate-900">{alert.message}</p>
                        {alert.actionUrl && (
                          <Link to={alert.actionUrl}>
                            <Button variant="link" size="sm" className="p-0 h-auto mt-1">
                              Xem chi tiết
                            </Button>
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

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
                  {isLoadingAlerts ? (
                    <div className="flex items-center justify-center h-20">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <Link
                        to="/pharmacy"
                        className="flex-1 hover:opacity-80 transition-opacity"
                        onClick={(e) => {
                          // Could add filter parameter here
                        }}
                      >
                        <div>
                          <div className="text-2xl font-bold text-slate-900">{lowStockCount}</div>
                          <div className="text-xs text-slate-500">Sắp hết</div>
                        </div>
                      </Link>
                      <div className="h-10 w-px bg-slate-200" />
                      <Link
                        to="/pharmacy"
                        className="flex-1 hover:opacity-80 transition-opacity"
                        onClick={(e) => {
                          // Could add filter parameter here
                        }}
                      >
                        <div>
                          <div className="text-2xl font-bold text-slate-900">{expiringCount}</div>
                          <div className="text-xs text-slate-500">Sắp hết hạn</div>
                        </div>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Expiring Medications Alert */}
            {Array.isArray(expiringMedicines) && expiringMedicines.length > 0 && (
              <Card className="border-0 shadow-lg border-l-4 border-l-amber-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="h-5 w-5 text-amber-600" />
                        Thuốc sắp hết hạn
                      </CardTitle>
                      <p className="text-sm text-slate-600 mt-1">Cần xử lý trong 30 ngày tới</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/pharmacy">
                        Xem tất cả
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {expiringMedicines.slice(0, 5).map((medicine) => {
                      const daysUntilExpiry = getDaysUntilExpiry(medicine.expiryDate)
                      const isUrgent = daysUntilExpiry <= 15
                      
                      return (
                        <Link
                          key={medicine.id}
                          to={`/pharmacy/${medicine.id}`}
                          className="flex items-center justify-between p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
                        >
                          <div>
                            <div className="font-medium text-slate-900">{medicine.name}</div>
                            <div className="text-sm text-slate-600">
                              Hết hạn: {format(new Date(medicine.expiryDate), "dd/MM/yyyy", { locale: vi })} ({daysUntilExpiry} ngày)
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              isUrgent
                                ? "bg-red-500/10 text-red-700 border-red-200"
                                : "bg-amber-500/10 text-amber-700 border-amber-200"
                            }
                          >
                            {isUrgent ? "Khẩn cấp" : "Cảnh báo"}
                          </Badge>
                        </Link>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Low Stock Medications Alert */}
            {Array.isArray(lowStockMedicines) && lowStockMedicines.length > 0 && (
              <Card className="border-0 shadow-lg border-l-4 border-l-red-500">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        Thuốc sắp hết
                      </CardTitle>
                      <p className="text-sm text-slate-600 mt-1">Cần nhập thêm</p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/pharmacy">
                        Xem tất cả
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {lowStockMedicines.slice(0, 5).map((medicine) => (
                      <Link
                        key={medicine.id}
                        to={`/pharmacy/${medicine.id}`}
                        className="flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <div>
                          <div className="font-medium text-slate-900">{medicine.name}</div>
                          <div className="text-sm text-slate-600">
                            Tồn kho: {medicine.quantity} (Tối thiểu: {medicine.minStockLevel})
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-red-500/10 text-red-700 border-red-200">
                          Sắp hết
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Calendar Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            {quickStats && (
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-lg">Thống kê nhanh</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-red-600" />
                      <span className="text-sm text-slate-700">Thuốc sắp hết</span>
                    </div>
                    <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
                      {quickStats.lowStockMedicines}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-600" />
                      <span className="text-sm text-slate-700">Thuốc sắp hết hạn</span>
                    </div>
                    <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
                      {quickStats.expiringMedicines}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-slate-700">Hóa đơn chưa thanh toán</span>
                    </div>
                    <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                      {quickStats.unpaidInvoices}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-purple-600" />
                      <span className="text-sm text-slate-700">Lịch hẹn chờ</span>
                    </div>
                    <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
                      {quickStats.pendingAppointments}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

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
                  <Link to="/admin/inventory">
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