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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Download } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

// --- Interfaces ---
interface RevenueOverTime {
  period: string;
  revenue: number;
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
}

interface RevenueReportData {
  summary: RevenueBySummary;
  byStatus: RevenueByStatus[];
  overTime: RevenueOverTime[];
}

// --- Mock Data ---
// const generateMockData = (year: number, month?: string): RevenueReportData => {
//   if (month) {
//     // Daily data for a specific month
//     const daysInMonth = 30;
//     const overTime = Array.from({ length: daysInMonth }, (_, i) => ({
//       period: `${year}-${String(month).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`,
//       revenue: Math.floor(Math.random() * 50000000) + 10000000,
//     }));

//     const totalRevenue = overTime.reduce((sum, d) => sum + d.revenue, 0);

//     return {
//       summary: {
//         totalRevenue: totalRevenue,
//         collectedRevenue: Math.floor(totalRevenue * 0.85),
//         uncollectedRevenue: Math.floor(totalRevenue * 0.15),
//         totalInvoices: Math.floor(Math.random() * 100) + 50,
//         averageInvoiceValue: Math.floor(totalRevenue / (Math.floor(Math.random() * 100) + 50)),
//       },
//       byStatus: [
//         {
//           paymentStatus: "PAID",
//           count: 80,
//           totalAmount: Math.floor(totalRevenue * 0.85),
//           paidAmount: Math.floor(totalRevenue * 0.85),
//         },
//         {
//           paymentStatus: "UNPAID",
//           count: 20,
//           totalAmount: Math.floor(totalRevenue * 0.15),
//           paidAmount: 0,
//         },
//       ],
//       overTime: overTime,
//     };
//   } else {
//     // Monthly data for a year
//     const overTime = Array.from({ length: 12 }, (_, i) => ({
//       period: `${year}-${String(i + 1).padStart(2, "0")}`,
//       revenue: Math.floor(Math.random() * 500000000) + 100000000,
//     }));

//     const totalRevenue = overTime.reduce((sum, d) => sum + d.revenue, 0);

//     return {
//       summary: {
//         totalRevenue: totalRevenue,
//         collectedRevenue: Math.floor(totalRevenue * 0.85),
//         uncollectedRevenue: Math.floor(totalRevenue * 0.15),
//         totalInvoices: Math.floor(Math.random() * 1000) + 500,
//         averageInvoiceValue: Math.floor(totalRevenue / (Math.floor(Math.random() * 1000) + 500)),
//       },
//       byStatus: [
//         {
//           paymentStatus: "PAID",
//           count: 800,
//           totalAmount: Math.floor(totalRevenue * 0.85),
//           paidAmount: Math.floor(totalRevenue * 0.85),
//         },
//         {
//           paymentStatus: "UNPAID",
//           count: 200,
//           totalAmount: Math.floor(totalRevenue * 0.15),
//           paidAmount: 0,
//         },
//       ],
//       overTime: overTime,
//     };
//   }
// };

export default function RevenueReport() {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<RevenueReportData | null>(null);

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

  // Fetch revenue report
  const fetchRevenueReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("year", year.toString());
      if (month) {
        params.append("month", month);
      }

      const response = await api.get(`/api/reports/revenue?${params.toString()}`);
      if (response.data.success) {
        setReportData(response.data.data);
        toast.success("Tải dữ liệu báo cáo thành công");
      } else {
        toast.error(response.data.message || "Không thể tải dữ liệu báo cáo");
      }
    } catch (error: any) {
      console.error("Error fetching revenue report:", error);
      toast.error(error.response?.data?.message || "Lỗi khi tải báo cáo doanh thu");
    } finally {
      setLoading(false);
    }
  };

  // Load report on mount
  useEffect(() => {
    fetchRevenueReport();
  }, []);

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Format chart data
  const chartData = reportData?.overTime || [];

  // Calculate statistics
  const summaryData = reportData?.summary || {
    totalRevenue: 0,
    collectedRevenue: 0,
    uncollectedRevenue: 0,
    totalInvoices: 0,
    averageInvoiceValue: 0,
  };

  // Revenue by status data
  const statusData = (reportData?.byStatus && reportData.byStatus.length > 0)
    ? reportData.byStatus.map((item: any) => ({
        name: item.paymentStatus === "PAID" ? "Đã thanh toán" : "Chưa thanh toán",
        value: item.totalAmount || 0,
      }))
    : [
        { name: "Đã thanh toán", value: 0 },
        { name: "Chưa thanh toán", value: 0 },
      ];

  const handleSearch = () => {
    fetchRevenueReport();
  };

  const handleExportPDF = async () => {
    try {
      const params = new URLSearchParams();
      params.append("year", year.toString());
      if (month) {
        params.append("month", month);
      }

      const response = await api.get(`/api/reports/revenue/pdf?${params.toString()}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `revenue-report-${year}${month ? `-${month}` : ""}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success("Tải báo cáo thành công");
    } catch (error: any) {
      console.error("Error exporting PDF:", error);
      toast.error(error.response?.data?.message || "Lỗi khi tải báo cáo");
    }
  };

  return (
    <AdminSidebar>
      <div className="p-8">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Báo cáo doanh thu</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Xem thống kê doanh thu theo thời gian
            </p>
          </div>

          {/* Filters */}
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg">Bộ lọc</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Năm
                  </label>
                  <Select value={year.toString()} onValueChange={(value) => setYear(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((y) => (
                        <SelectItem key={y} value={y.toString()}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tháng (tùy chọn)
                  </label>
                  <Select value={month || "0"} onValueChange={(value) => setMonth(value === "0" ? "" : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn tháng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Tất cả các tháng</SelectItem>
                      {months.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 items-end justify-between col-span-1 md:col-span-2">
                  <Button
                    onClick={handleSearch}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? "Đang tải..." : "Tìm kiếm"}
                  </Button>
                  <Button
                    onClick={handleExportPDF}
                    disabled={!reportData || loading}
                    variant="outline"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          {reportData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Tổng doanh thu</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(summaryData.totalRevenue)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Đã thu</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(summaryData.collectedRevenue)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Chưa thu</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(summaryData.uncollectedRevenue)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Số hóa đơn</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {summaryData.totalInvoices}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">TB/Hóa đơn</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(summaryData.averageInvoiceValue)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Chart */}
          {reportData && chartData.length > 0 && (
            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle>
                  Biểu đồ đường doanh thu
                </CardTitle>
                <CardDescription>
                  {month
                    ? `Doanh thu theo ngày - Tháng ${month}/${year}`
                    : `Doanh thu theo tháng - Năm ${year}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                      <Tooltip
                        formatter={(value) => formatCurrency(value as number)}
                        labelStyle={{ color: "#000" }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10b981"
                        dot={{ fill: "#10b981" }}
                        activeDot={{ r: 8 }}
                        name="Doanh thu"
                      />
                    </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Revenue by Status Chart */}
          {reportData && (
            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle>Doanh thu theo trạng thái thanh toán</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statusData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                    <Tooltip
                      formatter={(value) => formatCurrency(value as number)}
                      labelStyle={{ color: "#000" }}
                    />
                    <Legend />
                    <Bar
                      dataKey="value"
                      fill="#3b82f6"
                      name="Doanh thu"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          
          {/* Empty State */}
          {!loading && !reportData && (
            <Card className="border-gray-200 dark:border-gray-800">
              <CardContent className="pt-8 text-center">
                <p className="text-gray-500">Nhấn "Tìm kiếm" để xem báo cáo doanh thu</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminSidebar>
  );
}
