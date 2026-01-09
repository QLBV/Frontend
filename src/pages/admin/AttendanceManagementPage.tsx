"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/auth/authContext"
import AdminSidebar from "@/components/sidebar/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Search,
  User,
  Filter,
} from "lucide-react"
import { toast } from "sonner"
import { AttendanceService, type Attendance, AttendanceStatus } from "@/services/attendance.service"
import { format } from "date-fns"

export default function AttendanceManagementPage() {
  const { user } = useAuth()
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterUserId, setFilterUserId] = useState<string>("")
  const [filterDateFrom, setFilterDateFrom] = useState<string>("")
  const [filterDateTo, setFilterDateTo] = useState<string>("")

  // Edit dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedAttendance, setSelectedAttendance] = useState<Attendance | null>(null)
  const [editData, setEditData] = useState({
    checkInTime: "",
    checkOutTime: "",
    status: "" as "" | AttendanceStatus,
    notes: "",
  })

  useEffect(() => {
    fetchAttendances()
  }, [pagination.page, filterStatus, filterUserId, filterDateFrom, filterDateTo])

  const fetchAttendances = async () => {
    try {
      setIsLoading(true)
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      }

      if (filterStatus !== "all") {
        params.status = filterStatus
      }
      if (filterUserId) {
        params.userId = parseInt(filterUserId)
      }
      if (filterDateFrom) {
        params.startDate = filterDateFrom
      }
      if (filterDateTo) {
        params.endDate = filterDateTo
      }

      const response = await AttendanceService.getAllAttendance(params)
      setAttendances(response.attendances || [])
      setPagination({
        page: response.page || 1,
        limit: response.limit || 20,
        total: response.total || 0,
        totalPages: response.totalPages || 0,
      })
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tải danh sách chấm công")
      setAttendances([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (attendance: Attendance) => {
    setSelectedAttendance(attendance)
    setEditData({
      checkInTime: attendance.checkInTime ? format(new Date(attendance.checkInTime), "yyyy-MM-dd'T'HH:mm") : "",
      checkOutTime: attendance.checkOutTime ? format(new Date(attendance.checkOutTime), "yyyy-MM-dd'T'HH:mm") : "",
      status: attendance.status,
      notes: attendance.notes || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdate = async () => {
    if (!selectedAttendance) return

    try {
      await AttendanceService.updateAttendance(selectedAttendance.id, {
        checkInTime: editData.checkInTime || undefined,
        checkOutTime: editData.checkOutTime || undefined,
        status: editData.status || undefined,
        notes: editData.notes || undefined,
      })
      toast.success("Cập nhật chấm công thành công!")
      setIsEditDialogOpen(false)
      setSelectedAttendance(null)
      await fetchAttendances()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể cập nhật chấm công")
    }
  }

  const getStatusBadge = (status: AttendanceStatus) => {
    const config: Record<AttendanceStatus, { label: string; className: string }> = {
      PRESENT: { label: "Có mặt", className: "bg-emerald-500/10 text-emerald-700 border-emerald-200" },
      ABSENT: { label: "Vắng mặt", className: "bg-red-500/10 text-red-700 border-red-200" },
      LATE: { label: "Đi muộn", className: "bg-yellow-500/10 text-yellow-700 border-yellow-200" },
      LEAVE: { label: "Nghỉ phép", className: "bg-blue-500/10 text-blue-700 border-blue-200" },
      HALF_DAY: { label: "Nửa ngày", className: "bg-orange-500/10 text-orange-700 border-orange-200" },
    }
    const statusInfo = config[status] || { label: status, className: "bg-gray-500/10 text-gray-700 border-gray-200" }
    return (
      <Badge variant="outline" className={statusInfo.className}>
        {statusInfo.label}
      </Badge>
    )
  }

  const filteredAttendances = attendances.filter((attendance) => {
    const matchesSearch =
      attendance.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attendance.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  return (
    <AdminSidebar>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Quản lý chấm công</h1>
          <p className="text-slate-600">Xem và quản lý chấm công của tất cả nhân viên</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Tổng bản ghi</CardTitle>
              <Calendar className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">{pagination.total}</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-emerald-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Có mặt</CardTitle>
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {attendances.filter((a) => a.status === AttendanceStatus.PRESENT).length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-red-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Vắng mặt</CardTitle>
              <XCircle className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {attendances.filter((a) => a.status === AttendanceStatus.ABSENT).length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-yellow-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Đi muộn</CardTitle>
              <Clock className="h-5 w-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                {attendances.filter((a) => a.status === AttendanceStatus.LATE).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-xl">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo tên, email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="PRESENT">Có mặt</SelectItem>
                    <SelectItem value="ABSENT">Vắng mặt</SelectItem>
                    <SelectItem value="LATE">Đi muộn</SelectItem>
                    <SelectItem value="LEAVE">Nghỉ phép</SelectItem>
                    <SelectItem value="HALF_DAY">Nửa ngày</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Input
                  type="number"
                  placeholder="User ID"
                  value={filterUserId}
                  onChange={(e) => setFilterUserId(e.target.value)}
                />
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  setFilterStatus("all")
                  setFilterUserId("")
                  setFilterDateFrom("")
                  setFilterDateTo("")
                  setSearchQuery("")
                  setPagination({ ...pagination, page: 1 })
                }}
              >
                Reset
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="dateFrom">Từ ngày</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => {
                    setFilterDateFrom(e.target.value)
                    setPagination({ ...pagination, page: 1 })
                  }}
                />
              </div>
              <div>
                <Label htmlFor="dateTo">Đến ngày</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => {
                    setFilterDateTo(e.target.value)
                    setPagination({ ...pagination, page: 1 })
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance List */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Danh sách chấm công ({filteredAttendances.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredAttendances.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Không có bản ghi chấm công</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b">
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Nhân viên</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Ngày</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Check-in</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Check-out</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Trạng thái</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendances.map((attendance) => (
                      <tr
                        key={attendance.id}
                        className="border-b hover:bg-blue-50/30 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                              {attendance.user?.fullName?.charAt(0) || "?"}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">
                                {attendance.user?.fullName || "N/A"}
                              </p>
                              <p className="text-xs text-gray-500">
                                {attendance.user?.email || "N/A"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{format(new Date(attendance.date), "dd/MM/yyyy")}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {attendance.checkInTime ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-emerald-600" />
                              <span>{format(new Date(attendance.checkInTime), "HH:mm:ss")}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          {attendance.checkOutTime ? (
                            <div className="flex items-center gap-2">
                              <XCircle className="h-4 w-4 text-blue-600" />
                              <span>{format(new Date(attendance.checkOutTime), "HH:mm:ss")}</span>
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-4 px-6">{getStatusBadge(attendance.status)}</td>
                        <td className="py-4 px-6">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(attendance)}
                          >
                            <Filter className="h-4 w-4 mr-1" />
                            Sửa
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
          {pagination.totalPages > 1 && (
            <CardContent className="border-t p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">
                  Page {pagination.page} of {pagination.totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    disabled={pagination.page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    disabled={pagination.page >= pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sửa chấm công</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin chấm công cho nhân viên
            </DialogDescription>
          </DialogHeader>
          {selectedAttendance && (
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="user">Nhân viên</Label>
                <Input
                  id="user"
                  value={selectedAttendance.user?.fullName || "N/A"}
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="date">Ngày</Label>
                <Input
                  id="date"
                  value={format(new Date(selectedAttendance.date), "dd/MM/yyyy")}
                  disabled
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="checkInTime">Check-in</Label>
                  <Input
                    id="checkInTime"
                    type="datetime-local"
                    value={editData.checkInTime}
                    onChange={(e) => setEditData({ ...editData, checkInTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="checkOutTime">Check-out</Label>
                  <Input
                    id="checkOutTime"
                    type="datetime-local"
                    value={editData.checkOutTime}
                    onChange={(e) => setEditData({ ...editData, checkOutTime: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  value={editData.status}
                  onValueChange={(value) => setEditData({ ...editData, status: value as AttendanceStatus })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRESENT">Có mặt</SelectItem>
                    <SelectItem value="ABSENT">Vắng mặt</SelectItem>
                    <SelectItem value="LATE">Đi muộn</SelectItem>
                    <SelectItem value="LEAVE">Nghỉ phép</SelectItem>
                    <SelectItem value="HALF_DAY">Nửa ngày</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="notes">Ghi chú</Label>
                <Input
                  id="notes"
                  value={editData.notes}
                  onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                  placeholder="Ghi chú..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleUpdate}>
              Cập nhật
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminSidebar>
  )
}
