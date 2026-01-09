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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { AlertTriangle, TrendingDown, Download } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

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

interface ExpiringMedicine {
  id: number;
  medicineCode: string;
  medicineName: string;
  currentQuantity: number;
  minStockLevel: number;
  expiryDate?: string;
  daysUntilExpiry?: number;
  alertType: 'expiring';
}

interface LowStockMedicine {
  id: number;
  medicineCode: string;
  medicineName: string;
  currentQuantity: number;
  minStockLevel: number;
  alertType: 'low-stock';
}

interface ExpiredMedicine {
  id: number;
  medicineCode: string;
  medicineName: string;
  currentQuantity: number;
  minStockLevel: number;
  expiryDate?: string;
  alertType: 'expired';
}

interface TopMedicinesResponse {
  topMedicines: TopMedicine[];
}

interface MedicineAlertsResponse {
  lowStockMedicines: LowStockMedicine[];
  expiringMedicines: ExpiringMedicine[];
  expiredMedicines: ExpiredMedicine[];
  summary: {
    totalLowStock: number;
    totalExpiring: number;
    totalExpired: number;
    urgentCount: number;
  };
}

export default function MedicineReport() {
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [month, setMonth] = useState<string>("");
  const [limit, setLimit] = useState<string>("10");
  const [daysUntilExpiry, setDaysUntilExpiry] = useState<string>("30");
  const [minStock, setMinStock] = useState<string>("10");
  
  const [loadingTop, setLoadingTop] = useState(false);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [topMedicinesData, setTopMedicinesData] = useState<TopMedicinesResponse | null>(null);
  const [medicineAlertsData, setMedicineAlertsData] = useState<MedicineAlertsResponse | null>(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: "1", label: "Tháng 1" }, { value: "2", label: "Tháng 2" },
    { value: "3", label: "Tháng 3" }, { value: "4", label: "Tháng 4" },
    { value: "5", label: "Tháng 5" }, { value: "6", label: "Tháng 6" },
    { value: "7", label: "Tháng 7" }, { value: "8", label: "Tháng 8" },
    { value: "9", label: "Tháng 9" }, { value: "10", label: "Tháng 10" },
    { value: "11", label: "Tháng 11" }, { value: "12", label: "Tháng 12" },
  ];

  // Fetch top medicines từ API
  const fetchTopMedicines = async () => {
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
  };

  // Fetch medicine alerts từ API
  const fetchMedicineAlerts = async () => {
    try {
      setLoadingAlerts(true);
      const params = new URLSearchParams();
      params.append("daysUntilExpiry", daysUntilExpiry);
      params.append("minStock", minStock);

      const response = await api.get(`/reports/medicine-alerts?${params.toString()}`);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'medicineReport.tsx:136',message:'API response received',data:{success:response.data.success,hasData:!!response.data.data,dataKeys:response.data.data?Object.keys(response.data.data):null,hasExpiring:!!response.data.data?.expiring,hasLowStock:!!response.data.data?.lowStock,hasSummary:!!response.data.data?.summary},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      if (response.data.success) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'medicineReport.tsx:138',message:'Setting medicineAlertsData',data:{hasSummary:!!response.data.data?.summary,hasLowStockMedicines:!!response.data.data?.lowStockMedicines,hasExpiringMedicines:!!response.data.data?.expiringMedicines},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
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
  };

  useEffect(() => {
    fetchTopMedicines();
    fetchMedicineAlerts();
  }, []);

  const handleExportPDF = async () => {
    try {
      const params = new URLSearchParams();
      params.append("year", year.toString());
      params.append("limit", limit);
      if (month) {
        params.append("month", month);
      }

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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const topMedicinesChartData = (topMedicinesData?.topMedicines || []).map((item) => ({
    name: item.medicine.name,
    quantity: item.totalQuantity,
    revenue: item.estimatedRevenue,
  }));

  return (
    <AdminSidebar>
      <div className="p-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Báo cáo thuốc</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Xem thống kê thuốc dùng nhiều nhất và cảnh báo thuốc sắp hết hạn
            </p>
          </div>

          {/* Top Medicines Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Thuốc dùng nhiều nhất</h2>
            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader><CardTitle className="text-lg">Bộ lọc</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Năm</label>
                    <Select value={year.toString()} onValueChange={(value) => setYear(parseInt(value))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {years.map((y) => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Tháng</label>
                    <Select value={month || "0"} onValueChange={(value) => setMonth(value === "0" ? "" : value)}>
                      <SelectTrigger><SelectValue placeholder="Tất cả" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Tất cả các tháng</SelectItem>
                        {months.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Số lượng</label>
                    <Select value={limit} onValueChange={setLimit}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">Top 5</SelectItem>
                        <SelectItem value="10">Top 10</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 items-end">
                    <Button onClick={fetchTopMedicines} disabled={loadingTop} className="flex-1">
                      {loadingTop ? "Đang tải..." : "Tìm kiếm"}
                    </Button>
                    <Button
                      onClick={handleExportPDF}
                      disabled={!topMedicinesData || loadingTop}
                      variant="outline"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {topMedicinesData && (
              <Card className="border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle>Biểu đồ kê đơn</CardTitle>
                  <CardDescription>
                    {month ? `Top ${limit} - Tháng ${month}/${year}` : `Top ${limit} - Năm ${year}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={topMedicinesChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                      <Tooltip formatter={(value: any, name) => String(name) === "revenue" ? [formatCurrency(value), "Doanh thu"] : [value, "Số lượng"]} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="quantity" fill="#3b82f6" name="Số lượng" radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="right" dataKey="revenue" fill="#10b981" name="Doanh thu" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Medicine Alerts Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cảnh báo thuốc</h2>
            <Card className="border-gray-200 dark:border-gray-800">
              <CardHeader><CardTitle className="text-lg">Cài đặt cảnh báo</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Sắp hết hạn (ngày)</label>
                    <Select value={daysUntilExpiry} onValueChange={setDaysUntilExpiry}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">7 ngày</SelectItem>
                        <SelectItem value="14">14 ngày</SelectItem>
                        <SelectItem value="30">30 ngày</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium">Tồn kho tối thiểu</label>
                    <Select value={minStock} onValueChange={setMinStock}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 đơn vị</SelectItem>
                        <SelectItem value="10">10 đơn vị</SelectItem>
                        <SelectItem value="20">20 đơn vị</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 items-end">
                    <Button onClick={fetchMedicineAlerts} disabled={loadingAlerts} className="flex-1">
                      {loadingAlerts ? "Đang tải..." : "Cập nhật"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {medicineAlertsData && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* #region agent log */}
                {(() => {
                  fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'medicineReport.tsx:328',message:'Accessing medicineAlertsData.summary',data:{hasMedicineAlertsData:!!medicineAlertsData,hasSummary:!!medicineAlertsData?.summary,summaryKeys:medicineAlertsData?.summary?Object.keys(medicineAlertsData.summary):null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                  return null;
                })()}
                {/* #endregion */}
                <SummaryCard title="Sắp hết hạn" count={medicineAlertsData.summary?.totalExpiring ?? 0} icon={<AlertTriangle className="text-orange-600" />} colorClass="bg-orange-50" />
                <SummaryCard title="Tồn kho thấp" count={medicineAlertsData.summary?.totalLowStock ?? 0} icon={<TrendingDown className="text-yellow-600" />} colorClass="bg-yellow-50" />
                <SummaryCard title="Đã hết hạn" count={medicineAlertsData.summary?.totalExpired ?? 0} icon={<AlertTriangle className="text-red-600" />} colorClass="bg-red-50" />
              </div>
            )}

            {/* Expiring Table */}
            {medicineAlertsData && medicineAlertsData.expiringMedicines && medicineAlertsData.expiringMedicines.length > 0 && (
              <AlertTable 
                title="Thuốc sắp hết hạn" 
                data={medicineAlertsData.expiringMedicines} 
                type="expiring"
              />
            )}
          </div>
        </div>
      </div>
    </AdminSidebar>
  );
}

// Helper Components để code gọn hơn
function SummaryCard({ title, count, icon, colorClass }: any) {
  return (
    <Card className={`${colorClass} border-none`}>
      <CardContent className="pt-6 flex items-center gap-4">
        {icon}
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold">{count}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function AlertTable({ title, data, type }: any) {
  return (
    <Card>
      <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Tên thuốc</th>
                <th className="text-right py-3 px-4">Tồn kho</th>
                <th className="text-left py-3 px-4">Hạn dùng/Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {data.map((med: any, i: number) => (
                <tr key={i} className="border-b">
                  <td className="py-3 px-4">{med.medicineName || med.name}</td>
                  <td className="text-right py-3 px-4">{med.currentQuantity || med.stock} {med.unit || ''}</td>
                  <td className="py-3 px-4">
                    {type === 'expiring' ? `${med.daysUntilExpiry ?? 'N/A'} ngày` : 'Cần nhập thêm'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}