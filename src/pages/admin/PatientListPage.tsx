import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import AdminSidebar from '@/components/sidebar/admin';
import { 
  Search,
  Trash2,
  Loader2,
  Ban,
  UserCheck,
  Eye,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { getPatients, updatePatient, type Patient } from "@/services/patient.service";

export default function PatientListPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  
  // Status toggle dialog states
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [patientToToggle, setPatientToToggle] = useState<Patient | null>(null)
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)
  
  // Delete dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const itemsPerPage = 10

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const { patients: data, pagination } = await getPatients({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery || undefined
      })
      setPatients(data)
      setTotalPages(pagination?.totalPages || Math.ceil((pagination?.total || data.length) / itemsPerPage))
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể tải danh sách bệnh nhân")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [currentPage])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1)
      fetchPatients()
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant="outline" className={isActive ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"}>
        {isActive ? "Hoạt động" : "Vô hiệu hóa"}
      </Badge>
    )
  }

  const getGenderBadge = (gender: string) => {
    const config: Record<string, { label: string; className: string }> = {
      MALE: { label: "Nam", className: "bg-blue-100 text-blue-800 border-blue-200" },
      FEMALE: { label: "Nữ", className: "bg-pink-100 text-pink-800 border-pink-200" },
      OTHER: { label: "Khác", className: "bg-gray-100 text-gray-800 border-gray-200" },
    }
    const item = config[gender?.toUpperCase()] || config.OTHER
    return (
      <Badge variant="outline" className={item.className}>
        {item.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString("vi-VN")
  }

  const handleToggleStatusClick = (patient: Patient) => {
    setPatientToToggle(patient)
    setStatusDialogOpen(true)
  }

  const handleToggleStatusConfirm = async () => {
    if (!patientToToggle) return
    try {
      setIsTogglingStatus(true)
      const newStatus = !patientToToggle.isActive;
      await updatePatient(patientToToggle.id, { isActive: newStatus });
      toast.success(`${newStatus ? "Kích hoạt" : "Vô hiệu hóa"} tài khoản thành công!`);
      setStatusDialogOpen(false)
      setPatientToToggle(null)
      fetchPatients();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể cập nhật trạng thái");
    } finally {
      setIsTogglingStatus(false)
    }
  }

  const handleDeleteClick = (patient: Patient) => {
    setPatientToDelete(patient)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!patientToDelete) return
    try {
      setIsDeleting(true)
      // For now, we'll just deactivate instead of deleting
      await updatePatient(patientToDelete.id, { isActive: false });
      toast.success("Đã xóa bệnh nhân thành công (vô hiệu hóa)!")
      setDeleteDialogOpen(false)
      setPatientToDelete(null)
      fetchPatients()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể xóa bệnh nhân")
    } finally {
      setIsDeleting(false)
    }
  }

  const getAvatarInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(name => name.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getAvatarColor = (name: string) => {
    const colors = [
      "bg-blue-500",
      "bg-purple-500", 
      "bg-orange-500",
      "bg-green-500",
      "bg-red-500",
      "bg-indigo-500",
      "bg-pink-500",
      "bg-teal-500"
    ]
    const index = name.length % colors.length
    return colors[index]
  }

  return (
    <AdminSidebar>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý bệnh nhân</h1>
            <p className="text-gray-500 mt-1">Quản lý thông tin và trạng thái bệnh nhân</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo tên, mã bệnh nhân, SĐT..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50/50">
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase">Bệnh nhân</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase">Mã BN</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase">Liên hệ</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase">Giới tính</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase">Ngày sinh</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase">Trạng thái</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-20 text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-2" />
                        <p className="text-gray-500">Đang tải danh sách...</p>
                      </td>
                    </tr>
                  ) : patients.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-20 text-center text-gray-500">
                        Không tìm thấy bệnh nhân nào
                      </td>
                    </tr>
                  ) : (
                    patients.map((patient) => (
                      <tr key={patient.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full ${getAvatarColor(patient.fullName)} flex items-center justify-center text-white font-bold`}>
                              {patient.avatar ? (
                                <img 
                                  src={patient.avatar} 
                                  alt={patient.fullName}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                getAvatarInitials(patient.fullName)
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{patient.fullName}</div>
                              {patient.email && (
                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {patient.email}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-mono text-sm">{patient.patientCode || "-"}</td>
                        <td className="py-4 px-6">
                          {patient.phone ? (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Phone className="h-4 w-4" />
                              {patient.phone}
                            </div>
                          ) : "-"}
                        </td>
                        <td className="py-4 px-6">{getGenderBadge(patient.gender)}</td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(patient.dateOfBirth)}
                          </div>
                        </td>
                        <td className="py-4 px-6">{getStatusBadge(patient.isActive)}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600"
                              onClick={() => navigate(`/admin/patients/${patient.id}`)}
                              title="Xem chi tiết"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={patient.isActive ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50" : "text-green-600 hover:text-green-700 hover:bg-green-50"}
                              onClick={() => handleToggleStatusClick(patient)}
                              title={patient.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                            >
                              {patient.isActive ? <Ban className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteClick(patient)}
                              title="Xóa"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Trước
            </Button>
            <div className="text-sm text-gray-500">
              Trang {currentPage} / {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Sau
            </Button>
          </div>
        )}

        {/* Status Toggle Confirmation Dialog */}
        <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {patientToToggle?.isActive ? "Vô hiệu hóa tài khoản" : "Kích hoạt tài khoản"}
              </DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn {patientToToggle?.isActive ? "vô hiệu hóa" : "kích hoạt"} tài khoản của bệnh nhân{" "}
                <strong>{patientToToggle?.fullName}</strong>?
                {patientToToggle?.isActive && (
                  <span className="block mt-2 text-amber-600">
                    Bệnh nhân sẽ không thể đăng nhập vào hệ thống sau khi bị vô hiệu hóa.
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setStatusDialogOpen(false)
                  setPatientToToggle(null)
                }}
                disabled={isTogglingStatus}
              >
                Hủy
              </Button>
              <Button
                variant={patientToToggle?.isActive ? "destructive" : "default"}
                onClick={handleToggleStatusConfirm}
                disabled={isTogglingStatus}
                className={!patientToToggle?.isActive ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {isTogglingStatus ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    {patientToToggle?.isActive ? (
                      <><Ban className="h-4 w-4 mr-2" />Vô hiệu hóa</>
                    ) : (
                      <><UserCheck className="h-4 w-4 mr-2" />Kích hoạt</>
                    )}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận xóa bệnh nhân</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xóa bệnh nhân <strong>{patientToDelete?.fullName}</strong>?
                <span className="block mt-2 text-amber-600">
                  Thao tác này sẽ vô hiệu hóa tài khoản bệnh nhân và giữ lại dữ liệu cho mục đích lưu trữ.
                </span>
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
                Hủy
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                Xóa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminSidebar>
  )
}
