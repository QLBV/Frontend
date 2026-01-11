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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  LineChart,
  Line,
  Legend,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  FileText, 
  PieChart as PieChartIcon, 
  Download, 
  FileSpreadsheet,
  SlidersHorizontal, 
  Loader2, 
  Search, 
  Activity,
  Users,
  Wallet
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

// --- Interfaces ---
interface RevenueOverTime {
  period: string;
  revenue: number;
  [key: string]: any;
}

interface RevenueBySummary {
  totalRevenue: number;
  collectedRevenue: number;
  uncollectedRevenue: number;
  totalInvoices: number;
  averageInvoiceValue: number;
}

interface RevenueByStatus {
  paymentStatus: string;
  count: number;
  totalAmount: number;
  paidAmount: number;
  [key: string]: any;
}

interface RevenueReportData {
  summary: RevenueBySummary;
  byStatus: RevenueByStatus[];
  overTime: RevenueOverTime[];
}

interface ExpenseSummary {
  totalExpense: number;
  medicineExpense: number;
  salaryExpense: number;
  medicinePercentage: number;
  salaryPercentage: number;
}

interface SalaryByRole {
  role: string;
  totalSalary: number;
  count: number;
  [key: string]: any;
}

interface ExpenseReportData {
  summary: ExpenseSummary;
  salaryByRole: SalaryByRole[];
  medicineByMonth: { month: number; expense: number }[];
}

interface ProfitOverTime {
  period: string;
  revenue: number;
  expense: number;
  profit: number;
  [key: string]: any;
}

interface ProfitSummary {
  totalRevenue: number;
  totalExpense: number;
  totalProfit: number;
  profitMargin: number;
  revenueChange: number;
  expenseChange: number;
  profitChange: number;
}

interface ProfitReportData {
  summary: ProfitSummary;
  overTime: ProfitOverTime[];
}

export default function FinancialReportPage() {
  const [activeTab, setActiveTab] = useState("revenue");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<string>("");
  const [loading, setLoading] = useState(false);
  
  const [revenueData, setRevenueData] = useState<RevenueReportData | null>(null);
  const [expenseData, setExpenseData] = useState<ExpenseReportData | null>(null);
  const [profitData, setProfitData] = useState<ProfitReportData | null>(null);

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

  const fetchData = async (tab: string = activeTab) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("year", year.toString());
      if (month) {
        params.append("month", month);
      }

      const response = await api.get(`/reports/${tab}?${params.toString()}`);
      if (response.data.success) {
        if (tab === "revenue") setRevenueData(response.data.data);
        if (tab === "expense") setExpenseData(response.data.data);
        if (tab === "profit") setProfitData(response.data.data);
      }
    } catch (error: any) {
      console.error(`Error fetching ${tab} report:`, error);
      toast.error(error.response?.data?.message || `Lỗi khi tải báo cáo ${tab}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      const params = new URLSearchParams();
      params.append("year", year.toString());
      if (month) {
        params.append("month", month);
      }

      const response = await api.get(`/reports/${activeTab}/${format}?${params.toString()}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      const extension = format === 'pdf' ? 'pdf' : 'xlsx';
      link.setAttribute("download", `${activeTab}-report-${year}${month ? `-${month}` : ""}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success(`Tải báo cáo ${format.toUpperCase()} thành công`);
    } catch (error: any) {
      console.error(`Error exporting ${format}:`, error);
      toast.error(error.response?.data?.message || `Lỗi khi tải báo cáo ${format.toUpperCase()}`);
    }
  };

  return (
    <AdminSidebar>
      <div className="container mx-auto px-6 py-10 bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 min-h-screen">
        <div className="max-w-[1600px] mx-auto space-y-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-100 p-2 rounded-xl">
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 font-bold uppercase tracking-wider text-[10px] px-3">
                  Tài chính & Kinh doanh
                </Badge>
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                Báo cáo Tài chính Tổng hợp
              </h1>
              <p className="text-slate-500 font-medium mt-1">
                Theo dõi Doanh thu, Chi phí và Lợi nhuận tại một nơi
              </p>
            </div>
            
            <div className="flex items-center gap-3">
               <Button
                onClick={() => handleExport('pdf')}
                disabled={loading}
                className="h-11 px-6 bg-white hover:bg-slate-50 text-slate-900 border-slate-200 font-bold rounded-2xl shadow-sm transition-all hover:shadow-md flex items-center gap-2"
                variant="outline"
              >
                <Download className="w-4 h-4 text-rose-500" />
                Xuất PDF
              </Button>
               <Button
                onClick={() => handleExport('excel')}
                disabled={loading} // Profit Excel now implemented
                className="h-11 px-6 bg-white hover:bg-slate-50 text-slate-900 border-slate-200 font-bold rounded-2xl shadow-sm transition-all hover:shadow-md flex items-center gap-2"
                variant="outline"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                Xuất Excel
              </Button>
            </div>
          </div>

          {/* Filter Card */}
          <Card className="border-0 shadow-xl shadow-slate-200/40 bg-white/80 backdrop-blur-md rounded-[32px] overflow-hidden">
            <CardHeader className="pb-4 pt-7 px-8 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-50 p-2 rounded-xl">
                  <SlidersHorizontal className="h-5 w-5 text-indigo-600" />
                </div>
                <CardTitle className="text-lg font-black text-slate-800">Cấu hình báo cáo</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-3 space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Chọn Năm
                  </label>
                  <Select value={year.toString()} onValueChange={(value) => setYear(parseInt(value))}>
                    <SelectTrigger className="h-12 rounded-2xl bg-slate-50/50 border-slate-100 font-bold text-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100 shadow-xl">
                      {years.map((y) => (
                        <SelectItem key={y} value={y.toString()} className="font-bold py-3 rounded-xl focus:bg-indigo-50/50 outline-none">
                          Năm {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-4 space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">
                    Chọn Tháng (Tùy chọn)
                  </label>
                  <Select value={month || "0"} onValueChange={(value) => setMonth(value === "0" ? "" : value)}>
                    <SelectTrigger className="h-12 rounded-2xl bg-slate-50/50 border-slate-100 font-bold text-slate-700">
                      <SelectValue placeholder="Toàn bộ năm" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100 shadow-xl max-h-[300px]">
                      <SelectItem value="0" className="font-bold py-3 rounded-xl focus:bg-indigo-50/50">Toàn bộ các tháng</SelectItem>
                      {months.map((m) => (
                        <SelectItem key={m.value} value={m.value} className="font-bold py-3 rounded-xl focus:bg-indigo-50/50">
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-5 flex items-end">
                  <Button
                    onClick={() => fetchData()}
                    disabled={loading}
                    className="w-full h-12 bg-slate-900 hover:bg-black text-white font-black rounded-2xl shadow-lg shadow-slate-200 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 active:scale-[0.98]"
                  >
                    {loading ? (
                       <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                       <Search className="h-5 w-5" />
                    )}
                    {loading ? "Đang cập nhật..." : "Cập nhật dữ liệu"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Unified Tabs */}
          <Tabs defaultValue="revenue" className="w-full space-y-6" onValueChange={setActiveTab}>
            <TabsList className="bg-white/50 backdrop-blur-md p-1.5 rounded-[20px] border border-slate-100 shadow-sm inline-flex h-auto">
              <TabsTrigger value="revenue" className="rounded-[14px] px-8 py-3 font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-md transition-all">
                Doanh thu
              </TabsTrigger>
              <TabsTrigger value="expense" className="rounded-[14px] px-8 py-3 font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-rose-600 data-[state=active]:shadow-md transition-all">
                Chi phí
              </TabsTrigger>
              <TabsTrigger value="profit" className="rounded-[14px] px-8 py-3 font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-md transition-all">
                Lợi nhuận
              </TabsTrigger>
            </TabsList>

            {/* REVENUE TAB */}
            <TabsContent value="revenue" className="space-y-6">
              {revenueData && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    {[
                      { label: "Tổng doanh thu", value: revenueData.summary.totalRevenue, icon: DollarSign, color: "emerald", bg: "bg-emerald-50", text: "text-emerald-600", isCurrency: true },
                      { label: "Đã thực thu", value: revenueData.summary.collectedRevenue, icon: TrendingUp, color: "blue", bg: "bg-blue-50", text: "text-blue-600", isCurrency: true },
                      { label: "Còn nợ (Unpaid)", value: revenueData.summary.uncollectedRevenue, icon: TrendingDown, color: "red", bg: "bg-red-50", text: "text-red-600", isCurrency: true },
                      { label: "Hóa đơn phát sinh", value: revenueData.summary.totalInvoices, icon: FileText, color: "indigo", bg: "bg-indigo-50", text: "text-indigo-600" },
                      { label: "TB hóa đơn", value: revenueData.summary.averageInvoiceValue, icon: PieChartIcon, color: "amber", bg: "bg-amber-50", text: "text-amber-600", isCurrency: true }
                    ].map((item, idx) => (
                      <Card key={idx} className="group border-0 shadow-lg shadow-slate-200/40 bg-white rounded-3xl overflow-hidden relative transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
                        <CardContent className="p-6 relative z-10">
                          <div className={`${item.bg} ${item.text} w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 group-hover:rotate-6 shadow-sm`}>
                            <item.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest mb-1">{item.label}</p>
                            <h4 className="text-lg font-black text-slate-900 tracking-tight">
                              {item.isCurrency ? formatCurrency(item.value) : item.value.toLocaleString()}
                            </h4>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Card className="lg:col-span-2 border-0 shadow-xl shadow-slate-200/40 bg-white rounded-[32px] overflow-hidden">
                      <CardHeader className="pb-0 pt-8 px-8 flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="text-xl font-black text-slate-800">Biến động Doanh thu</CardTitle>
                          <CardDescription className="font-bold text-slate-400">
                            {month ? `Theo ngày của tháng ${month}/${year}` : `Theo tháng của năm ${year}`}
                          </CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent className="p-8 h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={revenueData.overTime}>
                            <defs>
                              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: '700' }} dy={15} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: '700' }} tickFormatter={(value) => `${(value / 1000000).toFixed(0)}Tr`} />
                            <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px -12px rgb(0 0 0 / 0.15)' }} formatter={(value) => [formatCurrency(value as number), "Doanh thu"]} />
                            <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-xl shadow-slate-200/40 bg-white rounded-[32px] overflow-hidden">
                      <CardHeader className="pb-0 pt-8 px-8">
                        <CardTitle className="text-xl font-black text-slate-800 text-center">Trạng thái thanh toán</CardTitle>
                      </CardHeader>
                      <CardContent className="p-8 h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={revenueData.byStatus}
                              cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={8} dataKey="totalAmount" nameKey="paymentStatus"
                            >
                              {revenueData.byStatus.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.paymentStatus === 'PAID' ? '#10b981' : entry.paymentStatus === 'UNPAID' ? '#ef4444' : '#f59e0b'} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => formatCurrency(value as number)} />
                            <Legend verticalAlign="bottom" height={36}/>
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </TabsContent>

            {/* EXPENSE TAB */}
            <TabsContent value="expense" className="space-y-6">
              {expenseData && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { label: "Tổng chi phí", value: expenseData.summary.totalExpense, icon: Wallet, bg: "bg-rose-50", text: "text-rose-600" },
                      { label: "Chi lương", value: expenseData.summary.salaryExpense, icon: Users, bg: "bg-indigo-50", text: "text-indigo-600" },
                      { label: "Chi thuốc", value: expenseData.summary.medicineExpense, icon: Activity, bg: "bg-amber-50", text: "text-amber-600" },
                    ].map((item, idx) => (
                      <Card key={idx} className="group border-0 shadow-lg shadow-slate-200/40 bg-white rounded-3xl overflow-hidden relative transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
                        <CardContent className="p-7">
                          <div className="flex items-center gap-5">
                            <div className={`${item.bg} ${item.text} w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6 shadow-sm`}>
                              <item.icon className="h-7 w-7" />
                            </div>
                            <div>
                              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{item.label}</p>
                              <h4 className="text-2xl font-black text-slate-900 tracking-tight">{formatCurrency(item.value)}</h4>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="border-0 shadow-xl shadow-slate-200/40 bg-white rounded-[32px] overflow-hidden">
                      <CardHeader className="pb-0 pt-8 px-8">
                        <CardTitle className="text-xl font-black text-slate-800 text-center">Tỷ lệ chi phí</CardTitle>
                      </CardHeader>
                      <CardContent className="p-8 h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: "Lương", value: expenseData.summary.salaryExpense },
                                { name: "Thuốc", value: expenseData.summary.medicineExpense }
                              ]}
                              cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={10} dataKey="value"
                            >
                              <Cell fill="#6366f1" stroke="none" />
                              <Cell fill="#f59e0b" stroke="none" />
                            </Pie>
                            <Tooltip formatter={(value) => formatCurrency(value as number)} />
                            <Legend verticalAlign="bottom" height={36}/>
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-xl shadow-slate-200/40 bg-white rounded-[32px] overflow-hidden">
                      <CardHeader className="pb-0 pt-8 px-8">
                        <CardTitle className="text-xl font-black text-slate-800 text-center">Phân bổ lương</CardTitle>
                      </CardHeader>
                      <CardContent className="p-8 h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={expenseData.salaryByRole}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="role" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: '700' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: '700' }} tickFormatter={(value) => `${(value / 1000000).toFixed(0)}Tr`} />
                            <Tooltip formatter={(value) => formatCurrency(value as number)} />
                            <Bar dataKey="totalSalary" fill="#6366f1" radius={[10, 10, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </TabsContent>

            {/* PROFIT TAB */}
            <TabsContent value="profit" className="space-y-6">
              {profitData && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { label: "Tổng Doanh thu", value: profitData.summary.totalRevenue, color: "emerald-600", bg: "bg-emerald-50", change: profitData.summary.revenueChange },
                      { label: "Tổng Chi phí", value: profitData.summary.totalExpense, color: "rose-600", bg: "bg-rose-50", change: profitData.summary.expenseChange },
                      { label: "Lợi nhuận gộp", value: profitData.summary.totalProfit, color: "blue-600", bg: "bg-blue-50", change: profitData.summary.profitChange },
                      { label: "Tỷ suất lợi nhuận", value: `${profitData.summary.profitMargin.toFixed(2)}%`, color: "indigo-600", bg: "bg-indigo-50", isPercentage: true }
                    ].map((item, idx) => (
                      <Card key={idx} className="group border-0 shadow-lg shadow-slate-200/40 bg-white rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
                        <CardContent className="p-7">
                          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{item.label}</p>
                          <div className="flex items-baseline justify-between gap-2">
                             <h4 className={`text-2xl font-black tracking-tight ${item.color}`}>
                                {typeof item.value === 'string' ? item.value : formatCurrency(item.value)}
                             </h4>
                             {item.change !== undefined && item.change !== 0 && (
                               <Badge className={`text-[10px] ${item.change > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'} border-none`}>
                                 {item.change > 0 ? '+' : ''}{(item.change as number).toFixed(1)}%
                               </Badge>
                             )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Card className="border-0 shadow-xl shadow-slate-200/40 bg-white rounded-[32px] overflow-hidden">
                    <CardHeader className="pb-0 pt-8 px-8">
                       <CardTitle className="text-xl font-black text-slate-800">Phân tích Lợi nhuận</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 h-[450px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={profitData.overTime}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: '700' }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: '700' }} tickFormatter={(value) => `${(value / 1000000).toFixed(0)}Tr`} />
                          <Tooltip contentStyle={{ borderRadius: '20px' }} formatter={(value) => formatCurrency(value as number)} />
                          <Legend iconType="circle" />
                          <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} name="Doanh thu" dot={{ r: 4 }} />
                          <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={3} name="Chi phí" dot={{ r: 4 }} />
                          <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={4} name="Lợi nhuận" dot={{ r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>
          </Tabs>

          {!loading && !revenueData && !expenseData && !profitData && (
             <Card className="border-0 shadow-lg bg-white rounded-[32px] p-20 text-center">
                <div className="max-w-md mx-auto space-y-4">
                  <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Activity className="h-10 w-10 text-slate-300 animate-pulse" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Cần dữ liệu để bắt đầu</h3>
                  <p className="text-slate-500 font-medium">Chọn cấu hình lọc và nhấn cập nhật dữ liệu để đồng bộ hóa báo cáo tài chính.</p>
                </div>
             </Card>
          )}

          {loading && (
             <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                <p className="text-slate-400 font-black uppercase tracking-[0.2em]">Đang đồng bộ hóa dữ liệu...</p>
             </div>
          )}
        </div>
      </div>
    </AdminSidebar>
  );
}
