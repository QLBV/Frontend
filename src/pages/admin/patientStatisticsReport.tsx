import { useState, useEffect } from "react";
import AdminSidebar from "@/components/sidebar/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Download, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import api from "@/lib/api";

// --- Interfaces ---
interface PatientStatistics {
  totalPatients: number;
  newPatients: number;
  activePatients: number;
  inactivePatients: number;
  patientsByAge: Array<{
    ageRange: string;
    count: number;
  }>;
  patientsByGender: Array<{
    gender: string;
    count: number;
    percentage: number;
  }>;
  patientsOverTime: Array<{
    period: string;
    newPatients: number;
    totalPatients: number;
  }>;
  topVisitingPatients: Array<{
    patientName: string;
    visitCount: number;
  }>;
}

const COLORS = ['#3b82f6', '#ec4899', '#10b981'];

export default function PatientStatisticsReport() {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<PatientStatistics | null>(null);

  const fetchPatientStatistics = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/reports/patient-statistics`);
      if (response.data.success) {
        setReportData(response.data.data);
        toast.success("Tải dữ liệu báo cáo thành công");
      } else {
        toast.error(response.data.message || "Không thể tải dữ liệu báo cáo");
      }
    } catch (error: any) {
      console.error("Error fetching patient statistics:", error);
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.");
      } else {
        toast.error(error.response?.data?.message || "Lỗi khi tải báo cáo thống kê bệnh nhân");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientStatistics();
  }, []);


  const handleExportPDF = async () => {
    try {
      const response = await api.get(`/reports/patient-statistics/pdf`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `patient-statistics-report-${new Date().getFullYear()}.pdf`);
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

  const getGenderLabel = (gender: string) => {
    const labels: Record<string, string> = {
      MALE: "Nam",
      FEMALE: "Nữ",
      OTHER: "Khác",
    };
    return labels[gender] || gender;
  };

  return (
    <AdminSidebar>
      <div className="p-8">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Báo cáo thống kê bệnh nhân</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Xem thống kê bệnh nhân theo thời gian
            </p>
          </div>

          {/* Filters */}
          <Card className="border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg">Bộ lọc</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 items-end justify-end">
                <Button onClick={fetchPatientStatistics} disabled={loading}>
                  {loading ? "Đang tải..." : "Tải lại"}
                </Button>
                <Button onClick={handleExportPDF} disabled={!reportData || loading} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          {reportData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Tổng bệnh nhân</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {reportData.totalPatients}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Bệnh nhân mới</p>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      {reportData.newPatients}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Đang hoạt động</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {reportData.activePatients}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Không hoạt động</p>
                    <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                      {reportData.inactivePatients}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Charts */}
          {reportData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Patients By Gender */}
              {reportData.patientsByGender.length > 0 && (
                <Card className="border-gray-200 dark:border-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Bệnh nhân theo giới tính
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={reportData.patientsByGender}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry: any) => `${getGenderLabel(entry.gender)}: ${(entry.percentage || 0).toFixed(1)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {reportData.patientsByGender.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Patients By Age */}
              {reportData.patientsByAge.length > 0 && (
                <Card className="border-gray-200 dark:border-gray-800">
                  <CardHeader>
                    <CardTitle>Bệnh nhân theo độ tuổi</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={reportData.patientsByAge}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="ageRange" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#3b82f6" name="Số lượng" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {/* Patients Over Time */}
              {reportData.patientsOverTime.length > 0 && (
                <Card className="border-gray-200 dark:border-gray-800 lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Bệnh nhân theo thời gian</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={reportData.patientsOverTime}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="newPatients" stroke="#10b981" strokeWidth={2} name="Bệnh nhân mới" />
                        <Line type="monotone" dataKey="totalPatients" stroke="#3b82f6" strokeWidth={2} name="Tổng bệnh nhân" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Top Visiting Patients */}
          {reportData && reportData.topVisitingPatients.length > 0 && (
            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle>Bệnh nhân khám nhiều nhất</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {reportData.topVisitingPatients.slice(0, 10).map((patient, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-500 w-6">#{index + 1}</span>
                        <span className="font-medium text-gray-900">{patient.patientName}</span>
                      </div>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {patient.visitCount} lần khám
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!loading && !reportData && (
            <Card className="border-gray-200 dark:border-gray-800">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">Chưa có dữ liệu báo cáo. Vui lòng tải lại để xem báo cáo.</p>
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
