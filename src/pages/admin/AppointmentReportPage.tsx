import { useState, useEffect } from "react";
import AdminSidebar from "@/components/sidebar/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar
} from "recharts";
import { 
  Calendar, 
  CheckCircle2, 
  UserMinus, 
  Activity, 
  Download, 
  Search, 
  Loader2, 
  TrendingUp,
  Clock,
  Users
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

// --- Interfaces ---
interface AppointmentTrend {
  period: string;
  total: number;
  completed: number;
  cancelled: number;
  noShow: number;
}

interface AppointmentByStatus {
  status: string;
  count: number;
  percentage: number;
  [key: string]: any;
}

interface AppointmentByDoctor {
  doctorName: string;
  count: number;
}

interface AppointmentReportData {
  summary: {
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    noShowAppointments: number;
    averagePerDay: number;
    completionRate: number;
  };
  overTime: AppointmentTrend[];
  byStatus: AppointmentByStatus[];
  byDoctor: AppointmentByDoctor[];
}

export default function AppointmentReport() {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<AppointmentReportData | null>(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: "1", label: "Tháng 1" },
    { value: "2", label: "Tháng 2" },
    { value: "3", label: "Tháng 3" },
    { value: "4", label: "Tháng 4" },
    { value: "5", label: "Tháng 5" },
    { value: "6", label: "Tháng 6" },
    { value: "7", label: "Tháng 7" },
    { value: "8", label: "Tháng 8" },
    { value: "9", label: "Tháng 9" },
    { value: "10", label: "Tháng 10" },
    { value: "11", label: "Tháng 11" },
    { value: "12", label: "Tháng 12" },
  ];

  const fetchAppointmentReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("year", year.toString());
      if (month) {
        params.append("month", month);
      }

      const response = await api.get(`/reports/appointments?${params.toString()}`);
      if (response.data.success) {
        setReportData(response.data.data);
        toast.success("Tải dữ liệu báo cáo thành công");
      } else {
        toast.error(response.data.message || "Không thể tải dữ liệu báo cáo");
      }
    } catch (error: any) {
      console.error("Error fetching appointment report:", error);
      toast.error(error.response?.data?.message || "Lỗi khi tải báo cáo lịch hẹn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointmentReport();
  }, []);

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      COMPLETED: "Hoàn thành",
      CANCELLED: "Đã hủy",
      NO_SHOW: "Vắng mặt",
      WAITING: "Đang chờ",
      IN_PROGRESS: "Đang thực hiện",
      CHECKED_IN: "Đã check-in"
    };
    return labels[status] || status;
  };

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#6366f1", "#8b5cf6"];

  return (
    <AdminSidebar>
      <div className="container mx-auto px-6 py-10 bg-gradient-to-br from-indigo-50/50 via-white to-blue-50/50 min-h-screen font-sans">
        <div className="max-w-[1600px] mx-auto space-y-10">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-200">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-100 font-bold uppercase tracking-[0.15em] text-[10px] px-3 py-1">
                  Quản lý Vận hành
                </Badge>
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Thống kê Lịch hẹn</h1>
              <p className="text-slate-500 font-medium">Báo cáo chi tiết về hiệu suất đặt lịch và khám bệnh</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                disabled={!reportData || loading}
                className="h-12 px-6 bg-white hover:bg-slate-50 text-slate-900 border-slate-200 font-bold rounded-2xl shadow-sm transition-all hover:shadow-md flex items-center gap-2"
                variant="outline"
              >
                <Download className="w-4 h-4 text-indigo-600" />
                Xuất Báo cáo
              </Button>
            </div>
          </div>

          {/* Configuration Card */}
          <Card className="border-0 shadow-2xl shadow-slate-200/50 bg-white/80 backdrop-blur-xl rounded-[40px] overflow-hidden">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
                <div className="md:col-span-3 space-y-2.5">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Năm báo cáo</label>
                  <Select value={year.toString()} onValueChange={(value) => setYear(parseInt(value))}>
                    <SelectTrigger className="h-14 rounded-2xl bg-slate-50/50 border-slate-100 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                      {years.map((y) => (
                        <SelectItem key={y} value={y.toString()} className="font-bold py-3 rounded-xl focus:bg-indigo-50">
                          Năm {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-4 space-y-2.5">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Tháng (Tùy chọn)</label>
                  <Select value={month || "0"} onValueChange={(value) => setMonth(value === "0" ? "" : value)}>
                    <SelectTrigger className="h-14 rounded-2xl bg-slate-50/50 border-slate-100 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20">
                      <SelectValue placeholder="Toàn bộ năm" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100 shadow-2xl max-h-[300px]">
                      <SelectItem value="0" className="font-bold py-3 rounded-xl focus:bg-indigo-50">Tất cả các tháng</SelectItem>
                      {months.map((m) => (
                        <SelectItem key={m.value} value={m.value} className="font-bold py-3 rounded-xl focus:bg-indigo-50">{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-5">
                  <Button
                    onClick={fetchAppointmentReport}
                    disabled={loading}
                    className="w-full h-14 bg-indigo-600 hover:bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 transition-all hover:scale-[1.02] flex items-center justify-center gap-3 active:scale-95"
                  >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                    CẬP NHẬT DỮ LIỆU
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KPI Cards */}
          {reportData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { 
                  label: "Tổng lịch hẹn", 
                  value: reportData.summary.totalAppointments, 
                  icon: Activity, 
                  color: "indigo",
                  bg: "bg-indigo-50",
                  text: "text-indigo-600"
                },
                { 
                  label: "Hoàn tất khám", 
                  value: reportData.summary.completedAppointments, 
                  icon: CheckCircle2, 
                  color: "emerald",
                  bg: "bg-emerald-50",
                  text: "text-emerald-600",
                  sub: `${reportData.summary.completionRate.toFixed(1)}%`
                },
                { 
                  label: "Bệnh nhân vắng", 
                  value: reportData.summary.noShowAppointments, 
                  icon: UserMinus, 
                  color: "amber",
                  bg: "bg-amber-50",
                  text: "text-amber-600"
                },
                { 
                  label: "Trung bình ngày", 
                  value: reportData.summary.averagePerDay.toFixed(1), 
                  icon: TrendingUp, 
                  color: "blue",
                  bg: "bg-blue-50",
                  text: "text-blue-600"
                }
              ].map((item, idx) => (
                <Card key={idx} className="group border-0 shadow-xl shadow-slate-200/30 bg-white rounded-[32px] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
                  <CardContent className="p-7">
                    <div className={`${item.bg} ${item.text} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-inner`}>
                      <item.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{item.label}</p>
                        {item.sub && <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{item.sub}</span>}
                      </div>
                      <h4 className="text-3xl font-black text-slate-900 tracking-tight">{item.value.toLocaleString()}</h4>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Main Charts Grid */}
          {reportData && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Status Pie Chart */}
              <Card className="lg:col-span-1 border-0 shadow-2xl shadow-slate-200/40 bg-white rounded-[40px] overflow-hidden order-1">
                <CardHeader className="pb-0 pt-10 px-10">
                  <div className="bg-sky-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-sky-100">
                    <Activity className="h-6 w-6 text-sky-600" />
                  </div>
                  <CardTitle className="text-2xl font-black text-slate-800 tracking-tight">Phân loại Trạng thái</CardTitle>
                  <CardDescription className="font-bold text-slate-400 mt-1">Cơ cấu hiệu suất lịch hẹn</CardDescription>
                </CardHeader>
                <CardContent className="p-10 h-[420px] relative">
                  <ResponsiveContainer width="100%" height="80%">
                    <PieChart>
                      <Tooltip
                        contentStyle={{ backgroundColor: 'white', borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                        formatter={(val: number) => [`${val} lịch`, 'Số lượng']}
                      />
                      <Pie
                        data={reportData.byStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={105}
                        paddingAngle={10}
                        dataKey="count"
                        stroke="none"
                      >
                        {reportData.byStatus.map((_entry, index) => (
                          <Cell 
                             key={`cell-${index}`} 
                             fill={COLORS[index % COLORS.length]} 
                             className="hover:opacity-80 transition-opacity cursor-pointer focus:outline-none"
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center mt-[-5px]">
                    <span className="block text-3xl font-black text-slate-900 leading-none">
                      {reportData.summary.totalAppointments}
                    </span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 block">Lịch hẹn</span>
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-3">
                    {reportData.byStatus.slice(0, 4).map((status, idx) => (
                      <div key={idx} className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100/50 flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                          <span className="text-[10px] font-bold text-slate-500 truncate">{getStatusLabel(status.status)}</span>
                        </div>
                        <span className="text-sm font-black text-slate-900">{status.percentage.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Trend Chart */}
              <Card className="lg:col-span-2 border-0 shadow-2xl shadow-slate-200/40 bg-white rounded-[40px] overflow-hidden order-2">
                <CardHeader className="pb-0 pt-10 px-10 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-black text-slate-800 tracking-tight">Xu hướng Lịch hẹn</CardTitle>
                    <CardDescription className="font-bold text-slate-400 mt-1">
                      {month ? `Diễn biến trong tháng ${month}/${year}` : `Diễn biến theo các tháng trong năm ${year}`}
                    </CardDescription>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-3xl">
                    <Clock className="h-6 w-6 text-indigo-600" />
                  </div>
                </CardHeader>
                <CardContent className="p-10 h-[450px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={reportData.overTime} 
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                      barGap={8}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="period" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: '700' }}
                        dy={5}
                        tickFormatter={(val) => month ? val.split('-').pop()! : `T${val.split('-').pop()}`}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: '700' }}
                      />
                      <Tooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                          backdropFilter: 'blur(10px)',
                          borderRadius: '24px', 
                          border: 'none', 
                          boxShadow: '0 25px 50px -12px rgba(67, 56, 202, 0.15)',
                          padding: '20px'
                        }}
                        itemStyle={{ fontWeight: '900', fontSize: '13px' }}
                        labelStyle={{ color: '#64748b', fontWeight: '800', marginBottom: '12px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                      />
                      <Bar
                        dataKey="total"
                        fill="#6366f1"
                        radius={[10, 10, 0, 0]}
                        barSize={24}
                        name="Tổng lịch"
                      />
                      <Bar
                        dataKey="completed"
                        fill="#10b981"
                        radius={[10, 10, 0, 0]}
                        barSize={24}
                        name="Hoàn thành"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Doctors Chart */}
              <Card className="lg:col-span-3 border-0 shadow-2xl shadow-slate-200/40 bg-white rounded-[40px] overflow-hidden">
                <CardHeader className="pb-0 pt-10 px-10 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-black text-slate-800 tracking-tight">Top Bác sĩ theo Lịch hẹn</CardTitle>
                    <CardDescription className="font-bold text-slate-400 mt-1">Xếp hạng bác sĩ có số lượng bệnh nhân đặt lịch cao nhất</CardDescription>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-3xl">
                    <Users className="h-6 w-6 text-emerald-600" />
                  </div>
                </CardHeader>
                <CardContent className="p-10 h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={reportData.byDoctor.sort((a,b) => b.count - a.count).slice(0, 8)} 
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" hide />
                      <YAxis 
                        dataKey="doctorName" 
                        type="category"
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 11, fontWeight: '800' }}
                        width={120}
                      />
                      <Tooltip
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                        itemStyle={{ fontWeight: '900', color: '#10b981' }}
                      />
                      <Bar 
                        dataKey="count" 
                        fill="#10b981" 
                        radius={[0, 12, 12, 0]} 
                        barSize={32}
                        name="Lịch hẹn"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Empty State */}
          {!loading && !reportData && (
            <div className="py-20 flex flex-col items-center justify-center space-y-6">
              <div className="bg-slate-100 p-10 rounded-[40px] shadow-inner">
                <Calendar className="h-16 w-16 text-slate-300" />
              </div>
              <div className="text-center max-w-sm space-y-4">
                <h3 className="text-2xl font-black text-slate-800">Chưa có dữ liệu phân tích</h3>
                <p className="text-slate-400 font-medium">Vui lòng cấu hình thời gian bên trên và nhấn cập nhật để bắt đầu quá trình phân tích.</p>
                <Button onClick={fetchAppointmentReport} className="bg-indigo-600 hover:bg-slate-900 h-14 rounded-2xl px-10 font-black shadow-xl shadow-indigo-100 transition-all hover:scale-105">BẮT ĐẦU NGAY</Button>
              </div>
            </div>
          )}

          {/* Loading State Overlay */}
          {loading && (
             <div className="flex flex-col items-center justify-center py-40 animate-pulse">
                <Loader2 className="h-14 w-14 text-indigo-600 animate-spin mb-6" />
                <span className="text-[12px] font-black uppercase tracking-[0.3em] text-slate-400">Đang chuẩn bị dữ liệu báo cáo...</span>
             </div>
          )}
        </div>
      </div>
    </AdminSidebar>
  );
}
