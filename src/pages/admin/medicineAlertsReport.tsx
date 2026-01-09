import { useState, useEffect } from "react";
import AdminSidebar from "@/components/sidebar/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, AlertTriangle, Package, Clock } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

// --- Interfaces ---
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

interface MedicineAlertsReportData {
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

export default function MedicineAlertsReport() {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<MedicineAlertsReportData | null>(null);

  const fetchMedicineAlerts = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/reports/medicine-alerts`);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'medicineAlertsReport.tsx:44',message:'API response received',data:{success:response.data.success,hasData:!!response.data.data,dataKeys:response.data.data?Object.keys(response.data.data):null,hasSummary:!!response.data.data?.summary,summaryKeys:response.data.data?.summary?Object.keys(response.data.data.summary):null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      if (response.data.success) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'medicineAlertsReport.tsx:46',message:'Setting reportData',data:{dataType:typeof response.data.data,isNull:response.data.data===null,isUndefined:response.data.data===undefined,hasSummary:!!response.data.data?.summary},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        setReportData(response.data.data);
        toast.success("Tải dữ liệu báo cáo thành công");
      } else {
        toast.error(response.data.message || "Không thể tải dữ liệu báo cáo");
      }
    } catch (error: any) {
      console.error("Error fetching medicine alerts:", error);
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.");
      } else {
        toast.error(error.response?.data?.message || "Lỗi khi tải báo cáo cảnh báo thuốc");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicineAlerts();
  }, []);

  const handleExportPDF = async () => {
    try {
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

  const getAlertBadge = (alertType: string) => {
    switch (alertType) {
      case 'low-stock':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Sắp hết</Badge>;
      case 'expiring':
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Sắp hết hạn</Badge>;
      case 'expired':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Đã hết hạn</Badge>;
      default:
        return null;
    }
  };

  return (
    <AdminSidebar>
      <div className="p-8">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Báo cáo cảnh báo thuốc</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Xem danh sách thuốc cần chú ý: sắp hết, sắp hết hạn, đã hết hạn
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex justify-end">
            <Button onClick={handleExportPDF} disabled={!reportData || loading} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Xuất PDF
            </Button>
          </div>

          {/* Summary Cards */}
          {reportData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* #region agent log */}
              {(() => {
                fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'medicineAlertsReport.tsx:125',message:'Accessing reportData.summary',data:{hasReportData:!!reportData,hasSummary:!!reportData?.summary,reportDataKeys:reportData?Object.keys(reportData):null,summaryType:typeof reportData?.summary,summaryValue:reportData?.summary},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
                return null;
              })()}
              {/* #endregion */}
              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 border-l-4 border-l-red-500">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Package className="h-8 w-8 mx-auto mb-2 text-red-600" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Thuốc sắp hết</p>
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                      {reportData.summary?.totalLowStock ?? 0}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 border-l-4 border-l-amber-500">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-amber-600" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Sắp hết hạn</p>
                    <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                      {reportData.summary?.totalExpiring ?? 0}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 border-l-4 border-l-gray-500">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Đã hết hạn</p>
                    <p className="text-3xl font-bold text-gray-600 dark:text-gray-400">
                      {reportData.summary?.totalExpired ?? 0}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 border-l-4 border-l-orange-500">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Khẩn cấp</p>
                    <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                      {reportData.summary?.urgentCount ?? 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Cần xử lý ngay</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Low Stock Medicines */}
          {reportData && reportData.lowStockMedicines && reportData.lowStockMedicines.length > 0 && (
            <Card className="border-gray-200 dark:border-gray-800 border-l-4 border-l-red-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <Package className="h-5 w-5" />
                  Thuốc sắp hết ({reportData.lowStockMedicines.length})
                </CardTitle>
                <CardDescription>
                  Các thuốc có số lượng dưới mức tối thiểu
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportData.lowStockMedicines.map((medicine) => (
                    <Link
                      key={medicine.id}
                      to={`/pharmacy/${medicine.id}`}
                      className="flex items-center justify-between p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{medicine.medicineName}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          Mã: {medicine.medicineCode} | 
                          Tồn kho: {medicine.currentQuantity} | 
                          Tối thiểu: {medicine.minStockLevel}
                        </div>
                      </div>
                      {getAlertBadge(medicine.alertType)}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Expiring Medicines */}
          {reportData && reportData.expiringMedicines && reportData.expiringMedicines.length > 0 && (
            <Card className="border-gray-200 dark:border-gray-800 border-l-4 border-l-amber-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-600">
                  <Clock className="h-5 w-5" />
                  Thuốc sắp hết hạn ({reportData.expiringMedicines.length})
                </CardTitle>
                <CardDescription>
                  Các thuốc sẽ hết hạn trong 30 ngày tới
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportData.expiringMedicines.map((medicine) => (
                    <Link
                      key={medicine.id}
                      to={`/pharmacy/${medicine.id}`}
                      className="flex items-center justify-between p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{medicine.medicineName}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          Mã: {medicine.medicineCode} | 
                          Hết hạn: {medicine.expiryDate ? format(new Date(medicine.expiryDate), "dd/MM/yyyy", { locale: vi }) : "N/A"} | 
                          Còn lại: {medicine.daysUntilExpiry !== undefined ? `${medicine.daysUntilExpiry} ngày` : "N/A"}
                        </div>
                      </div>
                      {getAlertBadge(medicine.alertType)}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Expired Medicines */}
          {reportData && reportData.expiredMedicines && reportData.expiredMedicines.length > 0 && (
            <Card className="border-gray-200 dark:border-gray-800 border-l-4 border-l-gray-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-600">
                  <AlertTriangle className="h-5 w-5" />
                  Thuốc đã hết hạn ({reportData.expiredMedicines.length})
                </CardTitle>
                <CardDescription>
                  Các thuốc đã quá hạn sử dụng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportData.expiredMedicines.map((medicine) => (
                    <Link
                      key={medicine.id}
                      to={`/pharmacy/${medicine.id}`}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{medicine.medicineName}</div>
                        <div className="text-sm text-gray-600 mt-1">
                          Mã: {medicine.medicineCode} | 
                          Hết hạn: {medicine.expiryDate ? format(new Date(medicine.expiryDate), "dd/MM/yyyy", { locale: vi }) : "N/A"}
                        </div>
                      </div>
                      {getAlertBadge(medicine.alertType)}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!loading && reportData && 
           (!reportData.lowStockMedicines || reportData.lowStockMedicines.length === 0) && 
           (!reportData.expiringMedicines || reportData.expiringMedicines.length === 0) && 
           (!reportData.expiredMedicines || reportData.expiredMedicines.length === 0) && (
            <Card className="border-gray-200 dark:border-gray-800">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">Không có cảnh báo thuốc nào.</p>
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
