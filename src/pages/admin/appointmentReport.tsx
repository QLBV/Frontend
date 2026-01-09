import { useState, useEffect } from "react";
import AdminSidebar from "@/components/sidebar/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Download, CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

// --- Interfaces ---
interface AppointmentOverTime {
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
  percentage: number;
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
  overTime: AppointmentOverTime[];
  byStatus: AppointmentByStatus[];
  byDoctor: AppointmentByDoctor[];
}

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#6366f1', '#8b5cf6'];

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
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.");
      } else {
        toast.error(error.response?.data?.message || "Lỗi khi tải báo cáo lịch hẹn");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointmentReport();
  }, []);

  const handleSearch = () => {
    fetchAppointmentReport();
  };

  const handleExportPDF = async () => {
    try {
      const params = new URLSearchParams();
      params.append("year", year.toString());
      if (month) {
        params.append("month", month);
      }

      const response = await api.get(`/reports/appointments/pdf?${params.toString()}`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `appointment-report-${year}${month ? `-${month}` : ""}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success("Tải báo cáo thành công");
    } catch (error: any) {
      console.error("Error exporting PDF:", error);
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.");
      } else {
        toast.error(error.response?.data?.message || "Lỗi khi tải báo cáo");
      }
    }
  };

  const summaryData = reportData?.summary || {
    totalAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    noShowAppointments: 0,
    averagePerDay: 0,
    completionRate: 0,
  };

  const statusData = reportData?.byStatus || [];
  const doctorData = reportData?.byDoctor || [];
  const chartData = reportData?.overTime || [];

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      COMPLETED: "Hoàn thành",
      CANCELLED: "Đã hủy",
      NO_SHOW: "Không đến",
      WAITING: "Chờ khám",
      IN_PROGRESS: "Đang khám",
    };
    return labels[status] || status;
  };

  return (
    <AdminSidebar>
      <div className="p-8">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Báo cáo lịch hẹn</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Xem thống kê lịch hẹn theo thời gian
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
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Năm</label>
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
                  <Button onClick={handleSearch} disabled={loading} className="flex-1">
                    {loading ? "Đang tải..." : "Tìm kiếm"}
                  </Button>
                  <Button onClick={handleExportPDF} disabled={!reportData || loading} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          {reportData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Tổng lịch hẹn</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {summaryData.totalAppointments}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Đã hoàn thành</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {summaryData.completedAppointments}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Tỷ lệ: {(summaryData.completionRate || 0).toFixed(1)}%
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Trung bình/ngày</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {(summaryData.averagePerDay || 0).toFixed(1)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Charts */}
          {reportData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Appointments Over Time */}
              {chartData.length > 0 && (
                <Card className="border-gray-200 dark:border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5" />
                      Lịch hẹn theo thời gian
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="total" fill="#3b82f6" name="Tổng" />
                        <Bar dataKey="completed" fill="#10b981" name="Hoàn thành" />
                        <Bar dataKey="cancelled" fill="#ef4444" name="Đã hủy" />
                        <Bar dataKey="noShow" fill="#f59e0b" name="Không đến" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Appointments By Status */}
              {statusData.length > 0 && (
                <Card className="border-gray-200 dark:border-gray-800">
                  <CardHeader>
                    <CardTitle>Lịch hẹn theo trạng thái</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={statusData as any}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry: any) => `${getStatusLabel(entry.status)}: ${(entry.percentage || 0).toFixed(1)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {statusData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Appointments By Doctor */}
          {reportData && doctorData.length > 0 && (
            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle>Lịch hẹn theo bác sĩ</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={doctorData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis dataKey="doctorName" type="category" tick={{ fontSize: 12 }} width={150} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#6366f1" name="Số lịch hẹn" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!loading && !reportData && (
            <Card className="border-gray-200 dark:border-gray-800">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">Chưa có dữ liệu báo cáo. Vui lòng chọn năm và tháng để xem báo cáo.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {loading && (
            <Card className="border-gray-200 dark:border-gray-800">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-gray-500">Đang tải dữ liệu...</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminSidebar>
  );
}
