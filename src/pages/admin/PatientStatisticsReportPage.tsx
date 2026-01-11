import { useState, useEffect, useCallback } from "react";
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
  Bar,
  AreaChart,
  Area
} from "recharts";
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  UserX, 
  LineChart as LineChartIcon,
  Download,
  Calendar,
  Search,
  Loader2,
  Activity,
  Award
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

// --- Interfaces ---
interface PatientTrend {
  period: string;
  newPatients: number;
  totalPatients: number;
}

interface PatientByGender {
  gender: string;
  count: number;
  percentage: number;
  [key: string]: any;
}

interface PatientByAge {
  ageRange: string;
  count: number;
}

interface TopPatient {
  patientName: string;
  visitCount: number;
}

interface PatientStatistics {
  totalPatients: number;
  newPatients: number;
  activePatients: number;
  inactivePatients: number;
  patientsByAge: PatientByAge[];
  patientsByGender: PatientByGender[];
  patientsOverTime: PatientTrend[];
  topVisitingPatients: TopPatient[];
}

const GENDER_COLORS = ['#6366f1', '#ec4899', '#94a3b8'];
const AGE_COLORS = ['#3b82f6', '#2dd4bf', '#f59e0b', '#8b5cf6', '#ef4444'];

export default function PatientStatisticsReportPage() {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<PatientStatistics | null>(null);
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [month, setMonth] = useState<string>("all");

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("year", year);
      if (month !== "all") params.append("month", month);

      const response = await api.get(`/reports/patient-statistics?${params.toString()}`);
      if (response.data.success) {
        setReportData(response.data.data);
      }
    } catch (error: any) {
      console.error("Error fetching patient statistics:", error);
      toast.error(error.response?.data?.message || "Không thể tải dữ liệu báo cáo");
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleExportPDF = async () => {
    try {
      toast.info("Đang khởi tạo tệp PDF...");
      const params = new URLSearchParams();
      params.append("year", year);
      if (month !== "all") params.append("month", month);

      const response = await api.get(`/reports/patient-statistics/pdf?${params.toString()}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Bao-cao-benh-nhan-${month !== 'all' ? `Thang${month}-` : ''}${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success("Tải báo cáo PDF thành công");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Lỗi khi tải báo cáo PDF");
    }
  };

  const getGenderLabel = (gender: string) => {
    const labels: Record<string, string> = {
      MALE: "Nam",
      FEMALE: "Nữ",
      OTHER: "Khác",
      UNKNOWN: "Chưa xác định"
    };
    return labels[gender] || gender;
  };

  return (
    <AdminSidebar>
      <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-10">
        <div className="max-w-[1600px] mx-auto space-y-10">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-200">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-none font-bold px-4 py-1 rounded-full">
                  Báo cáo Phân tích
                </Badge>
              </div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-3">
                Thống kê Bệnh nhân
              </h1>
              <p className="text-lg font-bold text-slate-400 max-w-2xl leading-relaxed">
                Phân tích nhân khẩu học, xu hướng đăng ký mới và mức độ hoạt động của bệnh nhân tại hệ thống.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                onClick={handleExportPDF}
                disabled={loading || !reportData}
                size="lg"
                className="bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-200 rounded-2xl px-6 font-bold shadow-xl shadow-slate-200/50 transition-all active:scale-95"
              >
                <Download className="mr-2 h-5 w-5 text-indigo-600" />
                Xuất PDF
              </Button>
            </div>
          </div>

          {/* Filters Card */}
          <Card className="border-0 shadow-2xl shadow-slate-200/40 bg-white/80 backdrop-blur-xl rounded-[40px] overflow-hidden">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-end">
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                    <Calendar className="h-3 w-3" /> Năm báo cáo
                  </label>
                  <Select value={year} onValueChange={setYear}>
                    <SelectTrigger className="h-14 rounded-2xl border-2 border-slate-100 bg-white font-bold text-slate-700 shadow-sm transition-all focus:ring-indigo-500">
                      <SelectValue placeholder="Chọn năm" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-2 border-slate-100 shadow-2xl">
                      {[2023, 2024, 2025, 2026].map((y) => (
                        <SelectItem key={y} value={y.toString()} className="font-bold py-3 rounded-xl">Năm {y}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                    <Activity className="h-3 w-3" /> Tháng báo cáo
                  </label>
                  <Select value={month} onValueChange={setMonth}>
                    <SelectTrigger className="h-14 rounded-2xl border-2 border-slate-100 bg-white font-bold text-slate-700 shadow-sm transition-all focus:ring-indigo-500">
                      <SelectValue placeholder="Tất cả các tháng" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-2 border-slate-100 shadow-2xl">
                      <SelectItem value="all" className="font-bold py-3 rounded-xl">Cả năm</SelectItem>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()} className="font-bold py-3 rounded-xl">
                          Tháng {(i + 1).toString().padStart(2, '0')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Button 
                    onClick={fetchReport} 
                    disabled={loading}
                    className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black shadow-xl shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Search className="h-6 w-6" />}
                    CẬP NHẬT DỮ LIỆU
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="h-[600px] flex flex-col items-center justify-center bg-white/50 backdrop-blur-md rounded-[40px] border-2 border-dashed border-slate-200">
              <Loader2 className="h-16 w-16 text-indigo-600 animate-spin mb-6" />
              <p className="text-xl font-bold text-slate-400 animate-pulse">Đang phân tích dữ liệu bệnh nhân...</p>
            </div>
          ) : reportData ? (
            <div className="space-y-10">
              
              {/* Summary KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white rounded-[32px] overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="bg-indigo-100 p-4 rounded-2xl group-hover:bg-indigo-600 transition-colors duration-300">
                        <Users className="h-7 w-7 text-indigo-600 group-hover:text-white" />
                      </div>
                      <Badge className="bg-indigo-50 text-indigo-700 border-none font-black px-3 py-1 rounded-full uppercase text-[10px] tracking-widest">Toàn bộ</Badge>
                    </div>
                    <p className="text-sm font-black text-slate-400 uppercase tracking-wider mb-1">Tổng bệnh nhân</p>
                    <h3 className="text-4xl font-black text-slate-900 leading-none tracking-tight">
                      {reportData.totalPatients}
                    </h3>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white rounded-[32px] overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="bg-emerald-100 p-4 rounded-2xl group-hover:bg-emerald-600 transition-colors duration-300">
                        <UserPlus className="h-7 w-7 text-emerald-600 group-hover:text-white" />
                      </div>
                      <Badge className="bg-emerald-50 text-emerald-700 border-none font-black px-3 py-1 rounded-full uppercase text-[10px] tracking-widest">Đăng ký mới</Badge>
                    </div>
                    <p className="text-sm font-black text-slate-400 uppercase tracking-wider mb-1">Bệnh nhân mới</p>
                    <h3 className="text-4xl font-black text-slate-900 leading-none tracking-tight">
                      {reportData.newPatients}
                    </h3>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white rounded-[32px] overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="bg-sky-100 p-4 rounded-2xl group-hover:bg-sky-600 transition-colors duration-300">
                        <UserCheck className="h-7 w-7 text-sky-600 group-hover:text-white" />
                      </div>
                      <Badge className="bg-sky-50 text-sky-700 border-none font-black px-3 py-1 rounded-full uppercase text-[10px] tracking-widest">Đang khám</Badge>
                    </div>
                    <p className="text-sm font-black text-slate-400 uppercase tracking-wider mb-1">Đang hoạt động</p>
                    <h3 className="text-4xl font-black text-slate-900 leading-none tracking-tight">
                      {reportData.activePatients}
                    </h3>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-xl shadow-slate-200/50 bg-white rounded-[32px] overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div className="bg-slate-100 p-4 rounded-2xl group-hover:bg-slate-600 transition-colors duration-300">
                        <UserX className="h-7 w-7 text-slate-600 group-hover:text-white" />
                      </div>
                      <Badge className="bg-slate-50 text-slate-700 border-none font-black px-3 py-1 rounded-full uppercase text-[10px] tracking-widest">Không hoạt động</Badge>
                    </div>
                    <p className="text-sm font-black text-slate-400 uppercase tracking-wider mb-1">Bệnh nhân vắng</p>
                    <h3 className="text-4xl font-black text-slate-900 leading-none tracking-tight">
                      {reportData.inactivePatients}
                    </h3>
                  </CardContent>
                </Card>
              </div>

              {/* Main Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Gender Distribution Pie */}
                <Card className="lg:col-span-1 border-0 shadow-2xl shadow-slate-200/40 bg-white rounded-[40px] overflow-hidden order-1">
                  <CardHeader className="pb-0 pt-10 px-10">
                    <div className="bg-pink-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-pink-100">
                      <Activity className="h-6 w-6 text-pink-600" />
                    </div>
                    <CardTitle className="text-2xl font-black text-slate-800 tracking-tight">Phân loại Giới tính</CardTitle>
                    <CardDescription className="font-bold text-slate-400 mt-1">Cơ cấu bệnh nhân theo giới tính</CardDescription>
                  </CardHeader>
                  <CardContent className="p-10 h-[420px] relative">
                    <ResponsiveContainer width="100%" height="80%">
                      <PieChart>
                        <Tooltip
                          contentStyle={{ backgroundColor: 'white', borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', padding: '16px' }}
                          itemStyle={{ fontWeight: '900', fontSize: '13px' }}
                          formatter={(val: number) => [`${val} bệnh nhân`, 'Số lượng']}
                        />
                        <Pie
                          data={reportData.patientsByGender}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={110}
                          paddingAngle={10}
                          dataKey="count"
                          stroke="none"
                        >
                          {reportData.patientsByGender.map((_entry, index) => (
                            <Cell 
                               key={`cell-${index}`} 
                               fill={GENDER_COLORS[index % GENDER_COLORS.length]} 
                               className="hover:opacity-80 transition-opacity cursor-pointer focus:outline-none"
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    
                    <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center mt-[-5px]">
                      <span className="block text-3xl font-black text-slate-900 leading-none">
                        {reportData.totalPatients}
                      </span>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1 block">Bệnh nhân</span>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-3">
                      {reportData.patientsByGender.map((g, idx) => (
                        <div key={idx} className="bg-slate-50/80 p-3 rounded-2xl border border-slate-100/50 flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: GENDER_COLORS[idx % GENDER_COLORS.length] }} />
                            <span className="text-[10px] font-bold text-slate-500 truncate">{getGenderLabel(g.gender)}</span>
                          </div>
                          <span className="text-sm font-black text-slate-900">{g.percentage.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Patient Trend Chart */}
                <Card className="lg:col-span-2 border-0 shadow-2xl shadow-slate-200/40 bg-white rounded-[40px] overflow-hidden order-2">
                  <CardHeader className="pb-0 pt-10 px-10 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-black text-slate-800 tracking-tight">Xu hướng Phát triển</CardTitle>
                      <CardDescription className="font-bold text-slate-400 mt-1">
                        {month !== "all" ? `Số lượng bệnh nhân mới tháng ${month}/${year}` : `Bệnh nhân mới theo các tháng trong năm ${year}`}
                      </CardDescription>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-3xl">
                      <LineChartIcon className="h-6 w-6 text-indigo-600" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-10 h-[450px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={reportData.patientsOverTime} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="period" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: '700' }}
                          dy={10}
                          tickFormatter={(val) => month !== "all" ? val.split('-').pop()! : `T${val.split('-').pop()}`}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: '700' }}
                        />
                        <Tooltip
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
                        <Area
                          type="monotone"
                          dataKey="newPatients"
                          stroke="#6366f1"
                          strokeWidth={4}
                          fillOpacity={1}
                          fill="url(#colorNew)"
                          name="Bệnh nhân mới"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Bottom Row - Age Breakdown & Top Patients */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Age Range Bar Chart */}
                <Card className="border-0 shadow-2xl shadow-slate-200/40 bg-white rounded-[40px] overflow-hidden">
                  <CardHeader className="pb-0 pt-10 px-10">
                    <CardTitle className="text-2xl font-black text-slate-800 tracking-tight">Phân phối Độ tuổi</CardTitle>
                    <CardDescription className="font-bold text-slate-400 mt-1">Số lượng bệnh nhân phân theo nhóm tuổi</CardDescription>
                  </CardHeader>
                  <CardContent className="p-10 h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportData.patientsByAge}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="ageRange" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#64748b', fontSize: 13, fontWeight: '800' }}
                          dy={10}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: '700' }}
                        />
                        <Tooltip
                          cursor={{ fill: '#f8fafc' }}
                          contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', padding: '16px' }}
                          itemStyle={{ fontWeight: '900', color: '#3b82f6' }}
                        />
                        <Bar 
                          dataKey="count" 
                          fill="#3b82f6" 
                          radius={[12, 12, 0, 0]} 
                          barSize={45}
                          name="Bệnh nhân"
                        >
                          {reportData.patientsByAge.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={AGE_COLORS[index % AGE_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Top Patients List */}
                <Card className="border-0 shadow-2xl shadow-slate-200/40 bg-white rounded-[40px] overflow-hidden">
                  <CardHeader className="pb-0 pt-10 px-10 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-2xl font-black text-slate-800 tracking-tight">Bệnh nhân Tin cậy</CardTitle>
                      <CardDescription className="font-bold text-slate-400 mt-1">Top 10 bệnh nhân có số lượt khám nhiều nhất</CardDescription>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-3xl">
                      <Award className="h-6 w-6 text-amber-600" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-10">
                    <div className="space-y-4">
                      {reportData.topVisitingPatients.length > 0 ? (
                        reportData.topVisitingPatients.map((p, idx) => (
                          <div key={idx} className="flex items-center justify-between p-5 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 rounded-[28px] border border-slate-100/50 group">
                            <div className="flex items-center gap-5">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${
                                idx === 0 ? 'bg-amber-100 text-amber-600' : 
                                idx === 1 ? 'bg-slate-200 text-slate-600' :
                                idx === 2 ? 'bg-orange-100 text-orange-600' : 'bg-white text-slate-400 border border-slate-100'
                              }`}>
                                {idx + 1}
                              </div>
                              <div>
                                <h4 className="font-black text-slate-900 leading-none mb-1 group-hover:text-indigo-600 transition-colors">{p.patientName}</h4>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bệnh nhân tiêu biểu</p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-xl font-black text-slate-900">{p.visitCount}</span>
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Lượt khám</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-20">
                          <p className="font-bold text-slate-400">Chưa có dữ liệu bệnh nhân tiêu biểu</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

            </div>
          ) : (
            <Card className="border-0 shadow-2xl shadow-slate-200/40 bg-white rounded-[40px] overflow-hidden">
              <CardContent className="p-20 flex flex-col items-center justify-center">
                <div className="bg-slate-50 p-8 rounded-[40px] mb-8">
                  <Activity className="h-20 w-20 text-slate-300" />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight text-center">Không tìm thấy dữ liệu</h3>
                <p className="text-lg font-bold text-slate-400 mb-10 text-center max-w-sm">
                  Rất tiếc, chúng tôi không tìm thấy dữ liệu báo cáo cho khoảng thời gian này. Vui lòng chọn thời gian khác hoặc cập nhật dữ liệu.
                </p>
                <Button 
                  onClick={fetchReport}
                  size="lg"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-10 font-bold shadow-xl shadow-indigo-200 transition-all active:scale-95"
                >
                  Tải lại báo cáo
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminSidebar>
  );
}
