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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { Download } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

// --- Interfaces ---
interface ExpenseOverTime {
  period: string;
  expense: number;
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
}

interface ExpenseReportData {
  summary: ExpenseSummary;
  medicineByMonth: ExpenseOverTime[];
  salaryByRole: SalaryByRole[];
}

export default function ExpenseReport() {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ExpenseReportData | null>(null);

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

  // Fetch expense report
  const fetchExpenseReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("year", year.toString());
      if (month) {
        params.append("month", month);
      }

      const response = await api.get(`/api/reports/expense?${params.toString()}`);
      if (response.data.success) {
        setReportData(response.data.data);
        toast.success("Tải dữ liệu báo cáo thành công");
      } else {
        toast.error(response.data.message || "Không thể tải dữ liệu báo cáo");
      }
    } catch (error: any) {
      console.error("Error fetching expense report:", error);
      toast.error(error.response?.data?.message || "Lỗi khi tải báo cáo chi phí");
    } finally {
      setLoading(false);
    }
  };

  // Load report on mount
  useEffect(() => {
    fetchExpenseReport();
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
  const chartData = reportData?.medicineByMonth || [];

  // Calculate statistics
  const summaryData = reportData?.summary || {
    totalExpense: 0,
    medicineExpense: 0,
    salaryExpense: 0,
    medicinePercentage: 0,
    salaryPercentage: 0,
  };

  // Salary by role data for bar chart
  const salaryData = (reportData?.salaryByRole || []).map((item: any) => ({
    name: item.role,
    salary: item.totalSalary || 0,
    count: item.count || 0,
  }));

  // Expense breakdown for pie chart
  const expenseBreakdown = [
    { name: "Thuốc", value: summaryData.medicineExpense },
    { name: "Lương", value: summaryData.salaryExpense },
  ];

  const COLORS = ["#f59e0b", "#ef4444"];

  const handleSearch = () => {
    fetchExpenseReport();
  };

  const handleExportPDF = async () => {
    try {
      const params = new URLSearchParams();
      params.append("year", year.toString());
      if (month) {
        params.append("month", month);
      }

      const response = await api.get(`/api/reports/expense/pdf?${params.toString()}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `expense-report-${year}${month ? `-${month}` : ""}.pdf`);
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
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Báo cáo chi phí</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Xem thống kê chi phí thuốc và lương theo thời gian
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
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Tổng chi phí</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(summaryData.totalExpense)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Chi phí thuốc</p>
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      {formatCurrency(summaryData.medicineExpense)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">{summaryData.medicinePercentage.toFixed(1)}%</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Chi phí lương</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {formatCurrency(summaryData.salaryExpense)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">{summaryData.salaryPercentage.toFixed(1)}%</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Số nhân viên</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {salaryData.reduce((sum, item) => sum + item.count, 0)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Số vai trò</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {salaryData.length}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Expense Breakdown Pie Chart */}
          {reportData && (
            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle>Tỷ lệ chi phí</CardTitle>
                <CardDescription>
                  So sánh chi phí thuốc và lương
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expenseBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => {
                        const percent = ((entry.value / summaryData.totalExpense) * 100).toFixed(1);
                        return `${entry.name}: ${percent}%`;
                      }}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Medicine Expense Chart */}
          {reportData && !month && (
            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle>
                  Biểu đồ chi phí thuốc
                </CardTitle>
                <CardDescription>
                  Chi phí thuốc theo tháng - Năm {year}
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
                      dataKey="expense"
                      stroke="#f59e0b"
                      dot={{ fill: "#f59e0b" }}
                      activeDot={{ r: 8 }}
                      name="Chi phí thuốc"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Salary by Role Chart */}
          {reportData && (
            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle>Chi phí lương theo vai trò</CardTitle>
                <CardDescription>
                  {month
                    ? `Chi phí lương theo vai trò - Tháng ${month}/${year}`
                    : `Chi phí lương theo vai trò - Năm ${year}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={salaryData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                    <Tooltip
                      formatter={(value) => formatCurrency(value as number)}
                      labelStyle={{ color: "#000" }}
                    />
                    <Legend />
                    <Bar
                      dataKey="salary"
                      fill="#ef4444"
                      name="Chi phí lương"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Salary Details Table */}
          {reportData && (
            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle>Chi tiết lương theo vai trò</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">Vai trò</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Số nhân viên</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Tổng lương</th>
                        <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">Lương TB</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salaryData.map((role, index) => (
                        <tr key={index} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="py-3 px-4 text-gray-900 dark:text-white">{role.name}</td>
                          <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">{role.count}</td>
                          <td className="text-right py-3 px-4 text-gray-900 dark:text-white font-semibold">{formatCurrency(role.salary)}</td>
                          <td className="text-right py-3 px-4 text-gray-600 dark:text-gray-400">{formatCurrency(role.salary / role.count)}</td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 dark:bg-gray-800">
                        <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">Tổng cộng</td>
                        <td className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">
                          {salaryData.reduce((sum, item) => sum + item.count, 0)}
                        </td>
                        <td className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(salaryData.reduce((sum, item) => sum + item.salary, 0))}
                        </td>
                        <td className="text-right py-3 px-4 font-semibold text-gray-600 dark:text-gray-400">
                          {formatCurrency(
                            salaryData.reduce((sum, item) => sum + item.salary, 0) /
                            salaryData.reduce((sum, item) => sum + item.count, 0)
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!loading && !reportData && (
            <Card className="border-gray-200 dark:border-gray-800">
              <CardContent className="pt-8 text-center">
                <p className="text-gray-500">Nhấn "Tìm kiếm" để xem báo cáo chi phí</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminSidebar>
  );
}
