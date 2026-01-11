import { useState, useEffect, useCallback } from "react";
import AdminSidebar from "@/components/sidebar/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend
} from "recharts";
import { 
  AlertTriangle, 
  Download, 
  Pill, 
  Package, 
  Clock, 
  Loader2,
  Search,
  Calendar,
  TrendingUp,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  ChevronRight,
  FileText,
  ShieldAlert,
  Timer,
  XCircle,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

// --- Interfaces ---
interface Medicine {
  id: number;
  name: string;
  code: string;
  unit: string;
  unitPrice: number;
}

interface TopMedicine {
  medicine: Medicine;
  totalQuantity: number;
  prescriptionCount: number;
  estimatedRevenue: number;
}

interface MedicineAlert {
  id: number;
  medicineCode: string;
  medicineName: string;
  currentQuantity: number;
  minStockLevel: number;
  expiryDate?: string;
  daysUntilExpiry?: number;
  alertType: 'low-stock' | 'expiring' | 'expired';
}

interface TopMedicinesResponse {
  topMedicines: TopMedicine[];
}

interface MedicineAlertsResponse {
  lowStockMedicines: MedicineAlert[];
  expiringMedicines: MedicineAlert[];
  expiredMedicines: MedicineAlert[];
  summary: {
    totalLowStock: number;
    totalExpiring: number;
    totalExpired: number;
    urgentCount: number;
  };
}

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6'];

// Custom tooltip component for better UX
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-100 p-4 min-w-[180px]">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{payload[0]?.payload?.fullName || label}</p>
        <div className="space-y-1">
          {payload.map((p: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-slate-600">{p.name}</span>
              <span className="text-sm font-black text-slate-900">
                {typeof p.value === 'number' ? p.value.toLocaleString('vi-VN') : p.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function MedicineReportPage() {
  const [activeTab, setActiveTab] = useState("top-medicines");
  
  // States for Top Medicines
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<string>("");
  const [limit, setLimit] = useState<string>("10");
  const [loadingTop, setLoadingTop] = useState(false);
  const [topMedicinesData, setTopMedicinesData] = useState<TopMedicinesResponse | null>(null);
  
  // States for Medicine Alerts
  const [daysUntilExpiry, setDaysUntilExpiry] = useState<string>("30");
  const [minStock, setMinStock] = useState<string>("10");
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [medicineAlertsData, setMedicineAlertsData] = useState<MedicineAlertsResponse | null>(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: "1", label: "Tháng 01" }, { value: "2", label: "Tháng 02" },
    { value: "3", label: "Tháng 03" }, { value: "4", label: "Tháng 04" },
    { value: "5", label: "Tháng 05" }, { value: "6", label: "Tháng 06" },
    { value: "7", label: "Tháng 07" }, { value: "8", label: "Tháng 08" },
    { value: "9", label: "Tháng 09" }, { value: "10", label: "Tháng 10" },
    { value: "11", label: "Tháng 11" }, { value: "12", label: "Tháng 12" },
  ];

  // Fetch top medicines
  const fetchTopMedicines = useCallback(async () => {
    try {
      setLoadingTop(true);
      const params = new URLSearchParams();
      params.append("year", year.toString());
      params.append("limit", limit);
      if (month) params.append("month", month);

      const response = await api.get(`/reports/top-medicines?${params.toString()}`);
      if (response.data.success) {
        setTopMedicinesData(response.data.data);
      } else {
        toast.error(response.data.message || "Không thể tải dữ liệu báo cáo");
      }
    } catch (error: any) {
      console.error("Error fetching top medicines:", error);
      toast.error(error.response?.data?.message || "Lỗi khi tải báo cáo thuốc");
    } finally {
      setLoadingTop(false);
    }
  }, [year, month, limit]);

  // Fetch medicine alerts
  const fetchMedicineAlerts = useCallback(async () => {
    try {
      setLoadingAlerts(true);
      const params = new URLSearchParams();
      params.append("daysUntilExpiry", daysUntilExpiry);
      params.append("minStock", minStock);

      const response = await api.get(`/reports/medicine-alerts?${params.toString()}`);
      if (response.data.success) {
        setMedicineAlertsData(response.data.data);
      } else {
        toast.error(response.data.message || "Không thể tải dữ liệu cảnh báo");
      }
    } catch (error: any) {
      console.error("Error fetching medicine alerts:", error);
      toast.error(error.response?.data?.message || "Lỗi khi tải cảnh báo thuốc");
    } finally {
      setLoadingAlerts(false);
    }
  }, [daysUntilExpiry, minStock]);

  useEffect(() => {
    fetchTopMedicines();
    fetchMedicineAlerts();
  }, []);

  const handleExportTopMedicinesPDF = async () => {
    try {
      toast.info("Đang khởi tạo tệp PDF...");
      const params = new URLSearchParams();
      params.append("year", year.toString());
      params.append("limit", limit);
      if (month) params.append("month", month);

      const response = await api.get(`/reports/top-medicines/pdf?${params.toString()}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `top-medicines-report-${year}${month ? `-${month}` : ""}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success("Tải báo cáo thành công!");
    } catch (error: any) {
      console.error("Error exporting PDF:", error);
      toast.error(error.response?.data?.message || "Lỗi khi tải báo cáo");
    }
  };

  const handleExportAlertsPDF = async () => {
    try {
      toast.info("Đang khởi tạo tệp PDF...");
      const response = await api.get(`/reports/medicine-alerts/pdf`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `medicine-alerts-report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success("Tải báo cáo thành công!");
    } catch (error: any) {
      console.error("Error exporting PDF:", error);
      toast.error(error.response?.data?.message || "Lỗi khi tải báo cáo");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const topMedicinesChartData = (topMedicinesData?.topMedicines || []).map((item, idx) => ({
    name: item.medicine.name.length > 12 ? item.medicine.name.substring(0, 12) + "..." : item.medicine.name,
    fullName: item.medicine.name,
    quantity: item.totalQuantity,
    revenue: item.estimatedRevenue,
    prescriptions: item.prescriptionCount,
    fill: CHART_COLORS[idx % CHART_COLORS.length],
  }));

  const getAlertBadge = (alertType: string) => {
    switch (alertType) {
      case 'low-stock':
        return <Badge className="bg-gradient-to-r from-red-500 to-rose-500 text-white border-none font-bold px-3 py-1 rounded-full text-[10px] shadow-lg shadow-red-200">Sắp hết</Badge>;
      case 'expiring':
        return <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-none font-bold px-3 py-1 rounded-full text-[10px] shadow-lg shadow-amber-200">Sắp hết hạn</Badge>;
      case 'expired':
        return <Badge className="bg-gradient-to-r from-slate-500 to-slate-600 text-white border-none font-bold px-3 py-1 rounded-full text-[10px] shadow-lg shadow-slate-200">Đã hết hạn</Badge>;
      default:
        return null;
    }
  };

  // Create pie chart data for alerts summary
  const alertsPieData = medicineAlertsData ? [
    { name: 'Sắp hết', value: medicineAlertsData.summary?.totalLowStock ?? 0, fill: '#ef4444' },
    { name: 'Sắp hết hạn', value: medicineAlertsData.summary?.totalExpiring ?? 0, fill: '#f59e0b' },
    { name: 'Đã hết hạn', value: medicineAlertsData.summary?.totalExpired ?? 0, fill: '#64748b' },
  ].filter(item => item.value > 0) : [];

  const totalAlerts = (medicineAlertsData?.summary?.totalLowStock ?? 0) + 
                      (medicineAlertsData?.summary?.totalExpiring ?? 0) + 
                      (medicineAlertsData?.summary?.totalExpired ?? 0);

  // Calculate total revenue from top medicines
  const totalRevenue = topMedicinesData?.topMedicines.reduce((sum, item) => sum + item.estimatedRevenue, 0) || 0;
  const totalQuantity = topMedicinesData?.topMedicines.reduce((sum, item) => sum + item.totalQuantity, 0) || 0;

  return (
    <AdminSidebar>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
        {/* Decorative Background Elements */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-emerald-400/10 to-teal-400/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-violet-400/10 to-purple-400/10 rounded-full blur-3xl" />
        </div>

        <div className="relative p-6 lg:p-10">
          <div className="max-w-[1700px] mx-auto space-y-8">
            
            {/* Premium Header Section */}
            <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-8 lg:p-10 shadow-2xl shadow-emerald-500/20">
              {/* Header Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-full" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
              </div>
              
              <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-start gap-5">
                  <div className="bg-white/20 backdrop-blur-xl p-4 rounded-2xl shadow-lg">
                    <Pill className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <Badge className="bg-white/20 text-white border-none font-bold px-4 py-1.5 rounded-full backdrop-blur-xl">
                        <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                        Báo cáo Phân tích
                      </Badge>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight mb-2">
                      Báo cáo Thuốc & Cảnh báo
                    </h1>
                    <p className="text-emerald-100 font-medium max-w-xl">
                      Thống kê thuốc được kê đơn nhiều nhất và theo dõi cảnh báo tồn kho, hạn sử dụng.
                    </p>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="flex gap-4">
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl px-6 py-4 border border-white/20">
                    <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-1">Tổng thuốc top</p>
                    <p className="text-3xl font-black text-white">{topMedicinesData?.topMedicines.length || 0}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-xl rounded-2xl px-6 py-4 border border-white/20">
                    <p className="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-1">Cảnh báo</p>
                    <p className="text-3xl font-black text-white flex items-center gap-2">
                      {totalAlerts}
                      {totalAlerts > 0 && <AlertCircle className="w-5 h-5 text-amber-300 animate-pulse" />}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <TabsList className="bg-white p-1.5 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 h-auto gap-1">
                  <TabsTrigger 
                    value="top-medicines" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-teal-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-200 rounded-xl px-6 py-3 font-bold text-slate-500 transition-all duration-300"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Thuốc dùng nhiều
                  </TabsTrigger>
                  <TabsTrigger 
                    value="alerts" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-amber-200 rounded-xl px-6 py-3 font-bold text-slate-500 transition-all duration-300 relative"
                  >
                    <ShieldAlert className="h-4 w-4 mr-2" />
                    Cảnh báo thuốc
                    {totalAlerts > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black min-w-[20px] h-5 rounded-full flex items-center justify-center px-1 shadow-lg animate-pulse">
                        {totalAlerts}
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>

                {/* Export Button */}
                <Button 
                  onClick={activeTab === "top-medicines" ? handleExportTopMedicinesPDF : handleExportAlertsPDF}
                  disabled={(activeTab === "top-medicines" ? !topMedicinesData || loadingTop : !medicineAlertsData || loadingAlerts)}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl px-5 py-2.5 font-bold shadow-lg shadow-slate-200/50 transition-all hover:shadow-xl group"
                >
                  <Download className="h-4 w-4 mr-2 text-emerald-600 group-hover:animate-bounce" />
                  Xuất PDF
                </Button>
              </div>

              {/* Top Medicines Tab */}
              <TabsContent value="top-medicines" className="space-y-6 animate-in fade-in-50 duration-500">
                {/* Filters Card */}
                <Card className="border-0 shadow-xl shadow-slate-200/40 bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 ml-1">
                          <Calendar className="h-3 w-3" /> Năm
                        </label>
                        <Select value={year.toString()} onValueChange={(value) => setYear(parseInt(value))}>
                          <SelectTrigger className="h-12 rounded-xl border-2 border-slate-100 bg-white font-semibold text-slate-700 shadow-sm transition-all focus:border-emerald-300 focus:ring-emerald-100">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                            {years.map((y) => <SelectItem key={y} value={y.toString()} className="font-semibold py-2.5 rounded-lg">{y}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 ml-1">
                          <FileText className="h-3 w-3" /> Tháng
                        </label>
                        <Select value={month || "0"} onValueChange={(value) => setMonth(value === "0" ? "" : value)}>
                          <SelectTrigger className="h-12 rounded-xl border-2 border-slate-100 bg-white font-semibold text-slate-700 shadow-sm transition-all focus:border-emerald-300 focus:ring-emerald-100">
                            <SelectValue placeholder="Tất cả" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                            <SelectItem value="0" className="font-semibold py-2.5 rounded-lg">Tất cả tháng</SelectItem>
                            {months.map((m) => <SelectItem key={m.value} value={m.value} className="font-semibold py-2.5 rounded-lg">{m.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 ml-1">
                          <Package className="h-3 w-3" /> Số lượng
                        </label>
                        <Select value={limit} onValueChange={setLimit}>
                          <SelectTrigger className="h-12 rounded-xl border-2 border-slate-100 bg-white font-semibold text-slate-700 shadow-sm transition-all focus:border-emerald-300 focus:ring-emerald-100">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                            <SelectItem value="5" className="font-semibold py-2.5 rounded-lg">Top 5</SelectItem>
                            <SelectItem value="10" className="font-semibold py-2.5 rounded-lg">Top 10</SelectItem>
                            <SelectItem value="15" className="font-semibold py-2.5 rounded-lg">Top 15</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button 
                        onClick={fetchTopMedicines} 
                        disabled={loadingTop}
                        className="h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all active:scale-95"
                      >
                        {loadingTop ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                        Tìm kiếm
                      </Button>
                      
                      <Button 
                        onClick={() => { setYear(currentYear); setMonth(""); setLimit("10"); }}
                        variant="outline"
                        className="h-12 rounded-xl font-semibold border-2 border-slate-200 hover:bg-slate-50"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Đặt lại
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {loadingTop ? (
                  <div className="h-[500px] flex flex-col items-center justify-center bg-white/50 backdrop-blur-md rounded-3xl border-2 border-dashed border-slate-200">
                    <div className="relative">
                      <div className="w-20 h-20 border-4 border-emerald-200 rounded-full animate-pulse" />
                      <Loader2 className="absolute inset-0 m-auto h-10 w-10 text-emerald-500 animate-spin" />
                    </div>
                    <p className="mt-6 text-lg font-bold text-slate-400">Đang phân tích dữ liệu thuốc...</p>
                  </div>
                ) : topMedicinesData && topMedicinesData.topMedicines.length > 0 ? (
                  <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Card className="border-0 shadow-lg shadow-emerald-100/50 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Tổng số lượng</p>
                              <p className="text-3xl font-black text-slate-800">{totalQuantity.toLocaleString('vi-VN')}</p>
                              <p className="text-xs text-slate-500 mt-1">đơn vị thuốc</p>
                            </div>
                            <div className="bg-emerald-500/10 p-3 rounded-xl group-hover:scale-110 transition-transform">
                              <Package className="h-6 w-6 text-emerald-600" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-0 shadow-lg shadow-violet-100/50 bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-bold text-violet-600 uppercase tracking-wider mb-1">Doanh thu ước tính</p>
                              <p className="text-2xl font-black text-slate-800">{formatCurrency(totalRevenue)}</p>
                              <p className="text-xs text-slate-500 mt-1">từ top thuốc</p>
                            </div>
                            <div className="bg-violet-500/10 p-3 rounded-xl group-hover:scale-110 transition-transform">
                              <TrendingUp className="h-6 w-6 text-violet-600" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-0 shadow-lg shadow-blue-100/50 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300">
                        <CardContent className="p-5">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Kỳ báo cáo</p>
                              <p className="text-xl font-black text-slate-800">{month ? `Tháng ${month.padStart(2, '0')}` : 'Cả năm'} {year}</p>
                              <p className="text-xs text-slate-500 mt-1">thống kê hiện tại</p>
                            </div>
                            <div className="bg-blue-500/10 p-3 rounded-xl group-hover:scale-110 transition-transform">
                              <Calendar className="h-6 w-6 text-blue-600" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                      {/* Bar Chart */}
                      <Card className="lg:col-span-3 border-0 shadow-xl shadow-slate-200/40 bg-white rounded-3xl overflow-hidden">
                        <CardHeader className="pb-2 pt-6 px-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-xl font-black text-slate-800">Biểu đồ Top Thuốc</CardTitle>
                              <CardDescription className="font-medium text-slate-400 mt-1">
                                {month ? `Tháng ${month}/${year}` : `Năm ${year}`} • Top {limit} thuốc được kê đơn nhiều nhất
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-6 pt-2 h-[400px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topMedicinesChartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                              <defs>
                                {CHART_COLORS.map((color, idx) => (
                                  <linearGradient key={idx} id={`gradient-${idx}`} x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor={color} stopOpacity={0.8} />
                                    <stop offset="100%" stopColor={color} stopOpacity={1} />
                                  </linearGradient>
                                ))}
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} />
                              <YAxis 
                                type="category" 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false} 
                                width={100}
                                tick={{ fill: '#475569', fontSize: 12, fontWeight: 700 }}
                              />
                              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                              <Bar dataKey="quantity" radius={[0, 8, 8, 0]} barSize={22} name="Số lượng">
                                {topMedicinesChartData.map((_, index) => (
                                  <Cell key={`cell-${index}`} fill={`url(#gradient-${index % CHART_COLORS.length})`} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      {/* Top Medicines List */}
                      <Card className="lg:col-span-2 border-0 shadow-xl shadow-slate-200/40 bg-white rounded-3xl overflow-hidden">
                        <CardHeader className="pb-2 pt-6 px-6">
                          <CardTitle className="text-xl font-black text-slate-800">Bảng xếp hạng</CardTitle>
                          <CardDescription className="font-medium text-slate-400 mt-1">Chi tiết top thuốc kê đơn</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
                            {topMedicinesData.topMedicines.map((item, idx) => (
                              <div 
                                key={idx} 
                                className="flex items-center gap-3 p-3 bg-slate-50/50 hover:bg-white hover:shadow-lg transition-all duration-300 rounded-xl border border-transparent hover:border-slate-100 group cursor-pointer"
                              >
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                                  idx === 0 ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-200' : 
                                  idx === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-white shadow-lg shadow-slate-200' :
                                  idx === 2 ? 'bg-gradient-to-br from-orange-300 to-amber-600 text-white shadow-lg shadow-orange-200' : 
                                  'bg-slate-100 text-slate-500'
                                }`}>
                                  {idx + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-slate-800 text-sm truncate group-hover:text-emerald-600 transition-colors">{item.medicine.name}</h4>
                                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{item.medicine.code} • {item.medicine.unit}</p>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="text-lg font-black text-slate-800">{item.totalQuantity.toLocaleString()}</span>
                                  <p className="text-[10px] font-semibold text-slate-400">{item.prescriptionCount} đơn</p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <Card className="border-0 shadow-xl shadow-slate-200/40 bg-white rounded-3xl overflow-hidden">
                    <CardContent className="p-16 flex flex-col items-center justify-center">
                      <div className="bg-slate-100 p-6 rounded-full mb-6">
                        <Pill className="h-12 w-12 text-slate-400" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-800 mb-2">Không tìm thấy dữ liệu</h3>
                      <p className="text-slate-500 mb-6 text-center max-w-sm">Vui lòng thay đổi bộ lọc và thử lại.</p>
                      <Button onClick={fetchTopMedicines} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6 font-bold">
                        Tải lại
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Alerts Tab */}
              <TabsContent value="alerts" className="space-y-6 animate-in fade-in-50 duration-500">
                {/* Filters Card */}
                <Card className="border-0 shadow-xl shadow-slate-200/40 bg-white/80 backdrop-blur-xl rounded-3xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 ml-1">
                          <Timer className="h-3 w-3" /> Sắp hết hạn (ngày)
                        </label>
                        <Select value={daysUntilExpiry} onValueChange={setDaysUntilExpiry}>
                          <SelectTrigger className="h-12 rounded-xl border-2 border-slate-100 bg-white font-semibold text-slate-700 shadow-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                            <SelectItem value="7" className="font-semibold py-2.5 rounded-lg">7 ngày</SelectItem>
                            <SelectItem value="14" className="font-semibold py-2.5 rounded-lg">14 ngày</SelectItem>
                            <SelectItem value="30" className="font-semibold py-2.5 rounded-lg">30 ngày</SelectItem>
                            <SelectItem value="60" className="font-semibold py-2.5 rounded-lg">60 ngày</SelectItem>
                            <SelectItem value="90" className="font-semibold py-2.5 rounded-lg">90 ngày</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 ml-1">
                          <Package className="h-3 w-3" /> Tồn kho tối thiểu
                        </label>
                        <Select value={minStock} onValueChange={setMinStock}>
                          <SelectTrigger className="h-12 rounded-xl border-2 border-slate-100 bg-white font-semibold text-slate-700 shadow-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                            <SelectItem value="5" className="font-semibold py-2.5 rounded-lg">5 đơn vị</SelectItem>
                            <SelectItem value="10" className="font-semibold py-2.5 rounded-lg">10 đơn vị</SelectItem>
                            <SelectItem value="20" className="font-semibold py-2.5 rounded-lg">20 đơn vị</SelectItem>
                            <SelectItem value="50" className="font-semibold py-2.5 rounded-lg">50 đơn vị</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button 
                        onClick={fetchMedicineAlerts} 
                        disabled={loadingAlerts}
                        className="h-12 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl font-bold shadow-lg shadow-amber-200 transition-all active:scale-95"
                      >
                        {loadingAlerts ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                        Cập nhật
                      </Button>
                      
                      <Button 
                        onClick={() => { setDaysUntilExpiry("30"); setMinStock("10"); }}
                        variant="outline"
                        className="h-12 rounded-xl font-semibold border-2 border-slate-200 hover:bg-slate-50"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Đặt lại
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {loadingAlerts ? (
                  <div className="h-[500px] flex flex-col items-center justify-center bg-white/50 backdrop-blur-md rounded-3xl border-2 border-dashed border-slate-200">
                    <div className="relative">
                      <div className="w-20 h-20 border-4 border-amber-200 rounded-full animate-pulse" />
                      <Loader2 className="absolute inset-0 m-auto h-10 w-10 text-amber-500 animate-spin" />
                    </div>
                    <p className="mt-6 text-lg font-bold text-slate-400">Đang kiểm tra cảnh báo thuốc...</p>
                  </div>
                ) : medicineAlertsData ? (
                  <div className="space-y-6">
                    {/* Summary KPIs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 via-white to-rose-50 rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300 border-l-4 border-l-red-500">
                        <CardContent className="p-5">
                          <div className="flex items-center gap-4">
                            <div className="bg-red-500/10 p-3 rounded-xl group-hover:scale-110 transition-transform">
                              <Package className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sắp hết hàng</p>
                              <p className="text-3xl font-black text-slate-800">{medicineAlertsData.summary?.totalLowStock ?? 0}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 via-white to-orange-50 rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300 border-l-4 border-l-amber-500">
                        <CardContent className="p-5">
                          <div className="flex items-center gap-4">
                            <div className="bg-amber-500/10 p-3 rounded-xl group-hover:scale-110 transition-transform">
                              <Clock className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sắp hết hạn</p>
                              <p className="text-3xl font-black text-slate-800">{medicineAlertsData.summary?.totalExpiring ?? 0}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 via-white to-gray-50 rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300 border-l-4 border-l-slate-500">
                        <CardContent className="p-5">
                          <div className="flex items-center gap-4">
                            <div className="bg-slate-500/10 p-3 rounded-xl group-hover:scale-110 transition-transform">
                              <XCircle className="h-6 w-6 text-slate-600" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Đã hết hạn</p>
                              <p className="text-3xl font-black text-slate-800">{medicineAlertsData.summary?.totalExpired ?? 0}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 via-white to-red-50 rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300 border-l-4 border-l-orange-500">
                        <CardContent className="p-5">
                          <div className="flex items-center gap-4">
                            <div className="bg-orange-500/10 p-3 rounded-xl group-hover:scale-110 transition-transform">
                              <AlertTriangle className="h-6 w-6 text-orange-600 animate-pulse" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Khẩn cấp</p>
                              <p className="text-3xl font-black text-slate-800">{medicineAlertsData.summary?.urgentCount ?? 0}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Charts and Lists */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Pie Chart */}
                      {alertsPieData.length > 0 && (
                        <Card className="border-0 shadow-xl shadow-slate-200/40 bg-white rounded-3xl overflow-hidden">
                          <CardHeader className="pb-0 pt-6 px-6">
                            <CardTitle className="text-xl font-black text-slate-800">Phân loại cảnh báo</CardTitle>
                            <CardDescription className="font-medium text-slate-400 mt-1">Tổng quan tình trạng</CardDescription>
                          </CardHeader>
                          <CardContent className="p-6 h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={alertsPieData}
                                  cx="50%"
                                  cy="45%"
                                  innerRadius={50}
                                  outerRadius={85}
                                  paddingAngle={4}
                                  dataKey="value"
                                  strokeWidth={0}
                                >
                                  {alertsPieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                  ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend 
                                  verticalAlign="bottom" 
                                  height={36}
                                  formatter={(value) => <span className="text-xs font-semibold text-slate-600">{value}</span>}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      )}

                      {/* Alerts List */}
                      <Card className={`border-0 shadow-xl shadow-slate-200/40 bg-white rounded-3xl overflow-hidden ${alertsPieData.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                        <CardHeader className="pb-2 pt-6 px-6">
                          <CardTitle className="text-xl font-black text-slate-800">Danh sách cảnh báo</CardTitle>
                          <CardDescription className="font-medium text-slate-400 mt-1">Thuốc cần được xử lý ({totalAlerts} mục)</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                            {/* Low Stock */}
                            {medicineAlertsData.lowStockMedicines?.map((medicine) => (
                              <Link
                                key={`low-${medicine.id}`}
                                to={`/pharmacy/${medicine.id}`}
                                className="flex items-center gap-3 p-3 bg-red-50/50 hover:bg-white hover:shadow-lg transition-all duration-300 rounded-xl border border-transparent hover:border-red-100 group"
                              >
                                <div className="bg-red-500/10 p-2.5 rounded-xl">
                                  <Package className="h-5 w-5 text-red-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-slate-800 text-sm truncate group-hover:text-red-600 transition-colors">{medicine.medicineName}</h4>
                                  <p className="text-xs text-slate-500">Mã: {medicine.medicineCode} • Tồn: <span className="font-bold text-red-600">{medicine.currentQuantity}</span></p>
                                </div>
                                {getAlertBadge(medicine.alertType)}
                                <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-red-500 transition-colors" />
                              </Link>
                            ))}

                            {/* Expiring */}
                            {medicineAlertsData.expiringMedicines?.map((medicine) => (
                              <Link
                                key={`exp-${medicine.id}`}
                                to={`/pharmacy/${medicine.id}`}
                                className="flex items-center gap-3 p-3 bg-amber-50/50 hover:bg-white hover:shadow-lg transition-all duration-300 rounded-xl border border-transparent hover:border-amber-100 group"
                              >
                                <div className="bg-amber-500/10 p-2.5 rounded-xl">
                                  <Clock className="h-5 w-5 text-amber-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-slate-800 text-sm truncate group-hover:text-amber-600 transition-colors">{medicine.medicineName}</h4>
                                  <p className="text-xs text-slate-500">
                                    HSD: {medicine.expiryDate ? format(new Date(medicine.expiryDate), "dd/MM/yyyy", { locale: vi }) : "N/A"} • 
                                    Còn: <span className="font-bold text-amber-600">{medicine.daysUntilExpiry} ngày</span>
                                  </p>
                                </div>
                                {getAlertBadge(medicine.alertType)}
                                <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-amber-500 transition-colors" />
                              </Link>
                            ))}

                            {/* Expired */}
                            {medicineAlertsData.expiredMedicines?.map((medicine) => (
                              <Link
                                key={`expired-${medicine.id}`}
                                to={`/pharmacy/${medicine.id}`}
                                className="flex items-center gap-3 p-3 bg-slate-50/50 hover:bg-white hover:shadow-lg transition-all duration-300 rounded-xl border border-transparent hover:border-slate-200 group"
                              >
                                <div className="bg-slate-500/10 p-2.5 rounded-xl">
                                  <XCircle className="h-5 w-5 text-slate-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-bold text-slate-800 text-sm truncate group-hover:text-slate-600 transition-colors">{medicine.medicineName}</h4>
                                  <p className="text-xs text-slate-500">
                                    HSD: {medicine.expiryDate ? format(new Date(medicine.expiryDate), "dd/MM/yyyy", { locale: vi }) : "N/A"} • Đã hết hạn
                                  </p>
                                </div>
                                {getAlertBadge(medicine.alertType)}
                                <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                              </Link>
                            ))}

                            {/* Empty state */}
                            {totalAlerts === 0 && (
                              <div className="text-center py-12">
                                <div className="bg-emerald-100 p-4 rounded-full inline-block mb-4">
                                  <Package className="h-8 w-8 text-emerald-600" />
                                </div>
                                <p className="font-bold text-slate-700">Không có cảnh báo!</p>
                                <p className="text-sm text-slate-400 mt-1">Tất cả thuốc đều trong tình trạng tốt 🎉</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <Card className="border-0 shadow-xl shadow-slate-200/40 bg-white rounded-3xl overflow-hidden">
                    <CardContent className="p-16 flex flex-col items-center justify-center">
                      <div className="bg-slate-100 p-6 rounded-full mb-6">
                        <AlertTriangle className="h-12 w-12 text-slate-400" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-800 mb-2">Không tìm thấy dữ liệu</h3>
                      <p className="text-slate-500 mb-6 text-center max-w-sm">Vui lòng thử lại hoặc kiểm tra kết nối.</p>
                      <Button onClick={fetchMedicineAlerts} className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl px-6 font-bold">
                        Tải lại
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </AdminSidebar>
  );
}