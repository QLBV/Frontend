"use client"

import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "@/auth/authContext"
import ReceptionistSidebar from "@/components/sidebar/recep"
import AdminSidebar from "@/components/sidebar/admin"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Search,
  Calendar,
  Clock,
  UserCheck,
  Loader2,
  Eye,
  XCircle,
  Plus,
  SlidersHorizontal,
  X,
} from "lucide-react"
import { toast } from "sonner"
import {
  getAppointments,
  markNoShow,
  type Appointment,
} from "@/services/appointment.service"
import { checkInAppointment } from "@/services/visit.service"
import { SearchService } from "@/services/search.service"
import { Label } from "@/components/ui/label"
import { format } from "date-fns"

export default function ReceptionistAppointmentsPage() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingIn, setIsCheckingIn] = useState<number | null>(null)
  const [isMarkingNoShow, setIsMarkingNoShow] = useState<number | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterDate, setFilterDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd")
  )
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState({
    keyword: "",
    status: "all" as "all" | "WAITING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "NO_SHOW",
    bookingType: "all" as "all" | "ONLINE" | "OFFLINE",
    bookedBy: "all" as "all" | "PATIENT" | "RECEPTIONIST",
    doctorId: "",
    patientId: "",
    shiftId: "",
    dateFrom: "",
    dateTo: "",
    createdFrom: "",
    createdTo: "",
  })

  // Check-in dialog
  const [isCheckInDialogOpen, setIsCheckInDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null)
  
  // No-show dialog
  const [isNoShowDialogOpen, setIsNoShowDialogOpen] = useState(false)
  const [appointmentToMarkNoShow, setAppointmentToMarkNoShow] =
    useState<Appointment | null>(null)

  // Fetch appointments
  const fetchAppointments = useCallback(async () => {
    try {
      setIsLoading(true)
      const params: any = {}
      if (filterDate) params.date = filterDate
      if (filterStatus !== "all") params.status = filterStatus

      const data = await getAppointments(params)
      // Debug: Log first appointment structure
      if (data.length > 0) {
        const first = data[0]
        console.log("🔍 Frontend - First appointment:", {
          id: first.id,
          doctorId: first.doctorId,
          hasDoctor: !!first.doctor,
          doctorUserId: (first as any).doctor?.userId,
          hasDoctorUser: !!(first as any).doctor?.user,
          doctorUserName: (first as any).doctor?.user?.fullName,
          doctorData: first.doctor,
        })
      }
      setAppointments(data)
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Không thể tải danh sách lịch hẹn"
      )
    } finally {
      setIsLoading(false)
    }
  }, [filterDate, filterStatus])

  useEffect(() => {
    fetchAppointments()
  }, [fetchAppointments])

  const handleCheckIn = async () => {
    if (!selectedAppointment) return

    setIsCheckingIn(selectedAppointment.id)
    try {
      await checkInAppointment(selectedAppointment.id)
      toast.success("Check-in thành công!")
      setIsCheckInDialogOpen(false)
      setSelectedAppointment(null)
      // Refresh appointments
      const data = await getAppointments({
        date: filterDate,
        status: filterStatus !== "all" ? filterStatus : undefined,
      })
      setAppointments(data)
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Không thể check-in"
      toast.error(errorMessage)
    } finally {
      setIsCheckingIn(null)
    }
  }

  const openCheckInDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsCheckInDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      WAITING: { label: "Chờ khám", className: "bg-blue-50 text-blue-700 border-blue-200" },
      IN_PROGRESS: { label: "Đang khám", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
      COMPLETED: { label: "Hoàn thành", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
      CANCELLED: { label: "Đã hủy", className: "bg-red-50 text-red-700 border-red-200" },
      NO_SHOW: { label: "Không đến", className: "bg-gray-50 text-gray-700 border-gray-200" },
    }

    const statusInfo = statusMap[status] || {
      label: status,
      className: "bg-gray-50 text-gray-700 border-gray-200",
    }

    return (
      <Badge variant="outline" className={statusInfo.className}>
        {statusInfo.label}
      </Badge>
    )
  }

  const handleAdvancedSearch = async () => {
    try {
      setIsSearching(true)
      const filters: any = {
        page: 1,
        limit: 100,
      }

      if (advancedFilters.keyword) filters.keyword = advancedFilters.keyword
      if (advancedFilters.status && advancedFilters.status !== "all") {
        filters.status = advancedFilters.status
      }
      if (advancedFilters.bookingType && advancedFilters.bookingType !== "all") {
        filters.bookingType = advancedFilters.bookingType
      }
      if (advancedFilters.bookedBy && advancedFilters.bookedBy !== "all") {
        filters.bookedBy = advancedFilters.bookedBy
      }
      if (advancedFilters.doctorId) filters.doctorId = parseInt(advancedFilters.doctorId)
      if (advancedFilters.patientId) filters.patientId = parseInt(advancedFilters.patientId)
      if (advancedFilters.shiftId) filters.shiftId = parseInt(advancedFilters.shiftId)
      if (advancedFilters.dateFrom) filters.dateFrom = advancedFilters.dateFrom
      if (advancedFilters.dateTo) filters.dateTo = advancedFilters.dateTo
      if (advancedFilters.createdFrom) filters.createdFrom = advancedFilters.createdFrom
      if (advancedFilters.createdTo) filters.createdTo = advancedFilters.createdTo

      const response = await SearchService.searchAppointments(filters)
      setAppointments(response.data || [])
      setIsAdvancedSearchOpen(false)
      toast.success(`Tìm thấy ${response.data?.length || 0} lịch hẹn`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tìm kiếm lịch hẹn")
    } finally {
      setIsSearching(false)
    }
  }

  const handleQuickSearch = async () => {
    if (!searchQuery.trim()) {
      // Reset to default fetch
      const data = await getAppointments({
        date: filterDate,
        status: filterStatus !== "all" ? filterStatus : undefined,
      })
      setAppointments(data)
      return
    }

    try {
      setIsSearching(true)
      const response = await SearchService.searchAppointments({
        keyword: searchQuery,
        dateFrom: filterDate,
        dateTo: filterDate,
        status: filterStatus !== "all" ? filterStatus : undefined,
        page: 1,
        limit: 100,
      })
      setAppointments(response.data || [])
      toast.success(`Tìm thấy ${response.data?.length || 0} lịch hẹn`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tìm kiếm lịch hẹn")
    } finally {
      setIsSearching(false)
    }
  }

  const clearAdvancedSearch = () => {
    setAdvancedFilters({
      keyword: "",
      status: "all",
      bookingType: "all",
      bookedBy: "all",
      doctorId: "",
      patientId: "",
      shiftId: "",
      dateFrom: "",
      dateTo: "",
      createdFrom: "",
      createdTo: "",
    })
    // Reset to default fetch
    fetchAppointments()
  }

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.patient?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.patient?.patientCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.doctor?.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const canCheckIn = (appointment: Appointment) => {
    return appointment.status === "WAITING"
  }

  const canMarkNoShow = (appointment: Appointment) => {
    return appointment.status === "WAITING" || appointment.status === "IN_PROGRESS"
  }

  const handleMarkNoShow = async () => {
    if (!appointmentToMarkNoShow) return

    setIsMarkingNoShow(appointmentToMarkNoShow.id)
    try {
      await markNoShow(appointmentToMarkNoShow.id)
      toast.success("Đã đánh dấu không đến!")
      setIsNoShowDialogOpen(false)
      setAppointmentToMarkNoShow(null)
      // Refresh appointments
      const data = await getAppointments({
        date: filterDate,
        status: filterStatus !== "all" ? filterStatus : undefined,
      })
      setAppointments(data)
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Không thể đánh dấu không đến"
      toast.error(errorMessage)
    } finally {
      setIsMarkingNoShow(null)
    }
  }

  const openNoShowDialog = (appointment: Appointment) => {
    setAppointmentToMarkNoShow(appointment)
    setIsNoShowDialogOpen(true)
  }

  if (!user) {
    return null
  }

  const role = String(user.roleId || user.role || "").toLowerCase()

  const content = (
    <div className="container mx-auto px-6 py-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 min-h-full">
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                Quản lý lịch hẹn
              </h1>
              <p className="text-slate-600">
                Xem và quản lý lịch hẹn của bệnh nhân
              </p>
            </div>
          <Button asChild>
            <Link to="/recep/appointments/offline">
              <Plus className="h-4 w-4 mr-2" />
              Đặt lịch offline
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm bệnh nhân, mã bệnh nhân..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleQuickSearch()
                    }
                  }}
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
                    <SelectItem value="WAITING">Chờ khám</SelectItem>
                    <SelectItem value="IN_PROGRESS">Đang khám</SelectItem>
                    <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                    <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                    <SelectItem value="NO_SHOW">Không đến</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAdvancedSearchOpen(true)}
                  className="flex-1"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Advanced
                </Button>
                <Button
                  onClick={handleQuickSearch}
                  disabled={isSearching}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách lịch hẹn ({filteredAppointments.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Không có lịch hẹn</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b">
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                        Bệnh nhân
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                        Bác sĩ
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                        Ngày
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                        Ca trực
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                        Trạng thái
                      </th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map((appointment) => (
                      <tr
                        key={appointment.id}
                        className="border-b hover:bg-blue-50/30 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                              {appointment.patient?.fullName?.charAt(0) || "?"}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">
                                {appointment.patient?.fullName || "N/A"}
                              </p>
                              {appointment.patient?.patientCode && (
                                <p className="text-xs text-gray-500">
                                  {appointment.patient.patientCode}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-sm">{appointment.doctor?.user?.fullName || "N/A"}</p>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">
                              {new Date(appointment.date).toLocaleDateString("vi-VN")}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {appointment.shift ? (
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">
                                {appointment.shift.name} ({appointment.shift.startTime} - {appointment.shift.endTime})
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          {getStatusBadge(appointment.status)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            {canCheckIn(appointment) && (
                              <Button
                                size="sm"
                                onClick={() => openCheckInDialog(appointment)}
                                disabled={isCheckingIn === appointment.id}
                              >
                                {isCheckingIn === appointment.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <UserCheck className="h-4 w-4 mr-1" />
                                    Check-in
                                  </>
                                )}
                              </Button>
                            )}
                            {canMarkNoShow(appointment) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openNoShowDialog(appointment)}
                                disabled={isMarkingNoShow === appointment.id}
                                className="text-orange-600 hover:text-orange-700"
                              >
                                {isMarkingNoShow === appointment.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Không đến
                                  </>
                                )}
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                            >
                              <Link to={`/appointments/${appointment.id}`}>
                                <Eye className="h-4 w-4 mr-1" />
                                Xem
                              </Link>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Check-in Dialog */}
      <Dialog open={isCheckInDialogOpen} onOpenChange={setIsCheckInDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận check-in</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn check-in cho bệnh nhân này?
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-2 py-4">
              <p className="text-sm">
                <strong>Bệnh nhân:</strong> {selectedAppointment.patient?.fullName}
              </p>
              <p className="text-sm">
                <strong>Bác sĩ:</strong> {selectedAppointment.doctor?.user?.fullName}
              </p>
              <p className="text-sm">
                <strong>Ngày:</strong>{" "}
                {new Date(selectedAppointment.date).toLocaleDateString("vi-VN")}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCheckInDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={handleCheckIn}
              disabled={isCheckingIn !== null}
            >
              {isCheckingIn !== null ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Xác nhận check-in"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* No-Show Dialog */}
      <Dialog open={isNoShowDialogOpen} onOpenChange={setIsNoShowDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đánh dấu không đến</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn đánh dấu bệnh nhân này là không đến?
            </DialogDescription>
          </DialogHeader>
          {appointmentToMarkNoShow && (
            <div className="space-y-2 py-4">
              <p className="text-sm">
                <strong>Bệnh nhân:</strong> {appointmentToMarkNoShow.patient?.fullName}
              </p>
              <p className="text-sm">
                <strong>Bác sĩ:</strong> {appointmentToMarkNoShow.doctor?.user?.fullName}
              </p>
              <p className="text-sm">
                <strong>Ngày:</strong>{" "}
                {new Date(appointmentToMarkNoShow.date).toLocaleDateString("vi-VN")}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsNoShowDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={handleMarkNoShow}
              disabled={isMarkingNoShow !== null}
              variant="destructive"
            >
              {isMarkingNoShow !== null ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Xác nhận"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Advanced Search Dialog */}
      <Dialog open={isAdvancedSearchOpen} onOpenChange={setIsAdvancedSearchOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Advanced Search</DialogTitle>
            <DialogDescription>
              Tìm kiếm lịch hẹn với các bộ lọc chi tiết
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="keyword">Keyword</Label>
                <Input
                  id="keyword"
                  placeholder="Patient name, code..."
                  value={advancedFilters.keyword}
                  onChange={(e) => setAdvancedFilters({ ...advancedFilters, keyword: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={advancedFilters.status}
                  onValueChange={(value) => setAdvancedFilters({ ...advancedFilters, status: value as typeof advancedFilters.status })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="WAITING">Waiting</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="NO_SHOW">No Show</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bookingType">Booking Type</Label>
                <Select
                  value={advancedFilters.bookingType}
                  onValueChange={(value) => setAdvancedFilters({ ...advancedFilters, bookingType: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="ONLINE">Online</SelectItem>
                    <SelectItem value="OFFLINE">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="bookedBy">Booked By</Label>
                <Select
                  value={advancedFilters.bookedBy}
                  onValueChange={(value) => setAdvancedFilters({ ...advancedFilters, bookedBy: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="PATIENT">Patient</SelectItem>
                    <SelectItem value="RECEPTIONIST">Receptionist</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="doctorId">Doctor ID</Label>
                <Input
                  id="doctorId"
                  type="number"
                  placeholder="Doctor ID"
                  value={advancedFilters.doctorId}
                  onChange={(e) => setAdvancedFilters({ ...advancedFilters, doctorId: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="patientId">Patient ID</Label>
                <Input
                  id="patientId"
                  type="number"
                  placeholder="Patient ID"
                  value={advancedFilters.patientId}
                  onChange={(e) => setAdvancedFilters({ ...advancedFilters, patientId: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="shiftId">Shift ID</Label>
                <Input
                  id="shiftId"
                  type="number"
                  placeholder="Shift ID"
                  value={advancedFilters.shiftId}
                  onChange={(e) => setAdvancedFilters({ ...advancedFilters, shiftId: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateFrom">Date From</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={advancedFilters.dateFrom}
                  onChange={(e) => setAdvancedFilters({ ...advancedFilters, dateFrom: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="dateTo">Date To</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={advancedFilters.dateTo}
                  onChange={(e) => setAdvancedFilters({ ...advancedFilters, dateTo: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="createdFrom">Created From</Label>
                <Input
                  id="createdFrom"
                  type="date"
                  value={advancedFilters.createdFrom}
                  onChange={(e) => setAdvancedFilters({ ...advancedFilters, createdFrom: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="createdTo">Created To</Label>
                <Input
                  id="createdTo"
                  type="date"
                  value={advancedFilters.createdTo}
                  onChange={(e) => setAdvancedFilters({ ...advancedFilters, createdTo: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={clearAdvancedSearch}>
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
            <Button onClick={handleAdvancedSearch} disabled={isSearching}>
              {isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  )

  // roleId: 1=Admin, 2=Receptionist, 3=Patient, 4=Doctor (theo enum RoleCode)
  if (role === "admin" || role === "1") {
    return <AdminSidebar>{content}</AdminSidebar>
  } else if (role === "receptionist" || role === "2") {
    return <ReceptionistSidebar>{content}</ReceptionistSidebar>
  }

  return null
}
