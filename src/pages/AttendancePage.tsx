"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/auth/authContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Clock,
  Calendar,
  LogIn,
  LogOut,
  Loader2,
  CheckCircle,
  XCircle,
  CalendarDays,
} from "lucide-react"
import { toast } from "sonner"
import { AttendanceService, type Attendance, AttendanceStatus } from "@/services/attendance.service"
import { format } from "date-fns"
import AdminSidebar from "@/components/sidebar/admin"
import DoctorSidebar from "@/components/sidebar/doctor"
import ReceptionistSidebar from "@/components/sidebar/recep"

export default function AttendancePage() {
  const { user } = useAuth()
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null)
  const [myAttendance, setMyAttendance] = useState<Attendance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingIn, setIsCheckingIn] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [isLeaveRequestOpen, setIsLeaveRequestOpen] = useState(false)
  const [leaveRequest, setLeaveRequest] = useState({
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
    reason: "",
    type: "",
  })

  useEffect(() => {
    fetchMyAttendance()
  }, [])

  const fetchMyAttendance = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true)
      
      // Fetch both today's and history
      const [todayResp, historyResp] = await Promise.all([
        AttendanceService.getMyAttendance({
          startDate: format(new Date(), "yyyy-MM-dd"),
          endDate: format(new Date(), "yyyy-MM-dd"),
          limit: 1,
        }),
        AttendanceService.getMyAttendance({
          page: 1,
          limit: 20, // Fetch more to be sure
        })
      ])

      if (todayResp.attendances && todayResp.attendances.length > 0) {
        setTodayAttendance(todayResp.attendances[0])
      } else {
        setTodayAttendance(null)
      }

      setMyAttendance(historyResp.attendances || [])
    } catch (error: any) {
      console.error("Attendance fetch error:", error)
      toast.error(error.response?.data?.message || "Không thể tải thông tin chấm công")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckIn = async () => {
    setIsCheckingIn(true)
    try {
      const response = await AttendanceService.checkIn()
      toast.success("Check-in thành công!")
      // Update local state immediately to show time
      setTodayAttendance(response.data)
      // Re-fetch in the background to update history
      await fetchMyAttendance(true)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Không thể check-in"
      if (errorMessage === "ALREADY_CHECKED_IN_TODAY") {
        toast.error("Bạn đã check-in hôm nay rồi")
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setIsCheckingIn(false)
    }
  }

  const handleCheckOut = async () => {
    setIsCheckingOut(true)
    try {
      const response = await AttendanceService.checkOut()
      toast.success("Check-out thành công!")
      // Update local state immediately
      setTodayAttendance(response.data)
      // Re-fetch history in the background
      await fetchMyAttendance(true)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Không thể check-out"
      if (errorMessage === "NO_CHECK_IN_RECORD_TODAY") {
        toast.error("Bạn chưa check-in hôm nay")
      } else if (errorMessage === "ALREADY_CHECKED_OUT") {
        toast.error("Bạn đã check-out hôm nay rồi")
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setIsCheckingOut(false)
    }
  }

  const handleRequestLeave = async () => {
    try {
      if (!leaveRequest.startDate || !leaveRequest.endDate || !leaveRequest.reason || !leaveRequest.type) {
        toast.error("Vui lòng điền đầy đủ thông tin")
        return
      }

      await AttendanceService.requestLeave(leaveRequest)
      toast.success("Gửi đơn xin nghỉ thành công!")
      setIsLeaveRequestOpen(false)
      setLeaveRequest({
        startDate: format(new Date(), "yyyy-MM-dd"),
        endDate: format(new Date(), "yyyy-MM-dd"),
        reason: "",
        type: "",
      })
      await fetchMyAttendance()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể gửi đơn xin nghỉ")
    }
  }

  if (!user) {
    return null
  }

  const role = String(user.roleId || user.role || "").toLowerCase()

  const getStatusBadge = (status: AttendanceStatus) => {
    const config: Record<AttendanceStatus, { label: string; className: string }> = {
      PRESENT: { label: "Có mặt", className: "bg-emerald-500/10 text-emerald-700 border-emerald-200" },
      ABSENT: { label: "Vắng mặt", className: "bg-red-500/10 text-red-700 border-red-200" },
      LATE: { label: "Đi muộn", className: "bg-yellow-500/10 text-yellow-700 border-yellow-200" },
      LEAVE: { label: "Nghỉ phép", className: "bg-blue-500/10 text-blue-700 border-blue-200" },
      SICK_LEAVE: { label: "Nghỉ ốm", className: "bg-purple-500/10 text-purple-700 border-purple-200" },
      EARLY_LEAVE: { label: "Về sớm", className: "bg-orange-500/10 text-orange-700 border-orange-200" },
      HALF_DAY: { label: "Nửa ngày", className: "bg-slate-500/10 text-slate-700 border-slate-200" },
    }
    const statusInfo = config[status] || { label: status, className: "bg-gray-500/10 text-gray-700 border-gray-200" }
    return (
      <Badge variant="outline" className={statusInfo.className}>
        {statusInfo.label}
      </Badge>
    )
  }

  const canCheckIn = !todayAttendance?.checkInTime
  const canCheckOut = todayAttendance?.checkInTime && !todayAttendance?.checkOutTime

  const content = (
    <div className="container mx-auto px-6 py-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 min-h-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Chấm công</h1>
        <p className="text-slate-600">Check-in, check-out và quản lý chấm công</p>
      </div>

      <div className="space-y-6">

        {/* Today's Attendance Card */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Chấm công hôm nay - {format(new Date(), "dd/MM/yyyy")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-4 p-4 bg-white rounded-lg border">
                    <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <LogIn className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Check-in</p>
                      <p className="text-lg font-semibold">
                        {todayAttendance?.checkInTime
                          ? format(new Date(todayAttendance.checkInTime), "HH:mm:ss")
                          : "Chưa check-in"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-white rounded-lg border">
                    <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <LogOut className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Check-out</p>
                      <p className="text-lg font-semibold">
                        {todayAttendance?.checkOutTime
                          ? format(new Date(todayAttendance.checkOutTime), "HH:mm:ss")
                          : "Chưa check-out"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-white rounded-lg border">
                    <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Trạng thái</p>
                      {todayAttendance ? (
                        getStatusBadge(todayAttendance.status)
                      ) : (
                        <Badge variant="outline" className="bg-gray-500/10 text-gray-700 border-gray-200">
                          Chưa check-in
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={handleCheckIn}
                    disabled={!canCheckIn || isCheckingIn || isCheckingOut}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 flex-1"
                  >
                    {isCheckingIn ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Đang check-in...
                      </>
                    ) : (
                      <>
                        <LogIn className="h-5 w-5 mr-2" />
                        Check-in
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleCheckOut}
                    disabled={!canCheckOut || isCheckingIn || isCheckingOut}
                    size="lg"
                    variant="outline"
                    className="border-emerald-200 hover:bg-emerald-50 flex-1"
                  >
                    {isCheckingOut ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Đang check-out...
                      </>
                    ) : (
                      <>
                        <LogOut className="h-5 w-5 mr-2" />
                        Check-out
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => setIsLeaveRequestOpen(true)}
                    size="lg"
                    variant="outline"
                    className="border-blue-200 hover:bg-blue-50"
                  >
                    <CalendarDays className="h-5 w-5 mr-2" />
                    Xin nghỉ
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attendance History */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle>Lịch sử chấm công</CardTitle>
          </CardHeader>
          <CardContent>
            {myAttendance.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Clock className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p>Chưa có lịch sử chấm công</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b">
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Ngày</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Check-in</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Check-out</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Trạng thái</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myAttendance.map((attendance) => (
                      <tr key={attendance.id} className="border-b hover:bg-blue-50/30 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <span>{attendance.date.split("-").reverse().join("/")}</span>
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
                          <span className="text-sm text-slate-500">{attendance.note || "-"}</span>
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
    </div>
  )

  const pageContent = (
    <>
      {content}

      {/* Leave Request Dialog */}
      <Dialog open={isLeaveRequestOpen} onOpenChange={setIsLeaveRequestOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đơn xin nghỉ</DialogTitle>
            <DialogDescription>
              Gửi đơn xin nghỉ phép
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Từ ngày</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={leaveRequest.startDate}
                  onChange={(e) => setLeaveRequest({ ...leaveRequest, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endDate">Đến ngày</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={leaveRequest.endDate}
                  onChange={(e) => setLeaveRequest({ ...leaveRequest, endDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="type">Loại nghỉ</Label>
              <Select
                value={leaveRequest.type}
                onValueChange={(value) => setLeaveRequest({ ...leaveRequest, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại nghỉ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ANNUAL">Nghỉ phép năm</SelectItem>
                  <SelectItem value="SICK">Nghỉ ốm</SelectItem>
                  <SelectItem value="PERSONAL">Nghỉ cá nhân</SelectItem>
                  <SelectItem value="EMERGENCY">Nghỉ khẩn cấp</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reason">Lý do</Label>
              <Textarea
                id="reason"
                placeholder="Nhập lý do nghỉ..."
                value={leaveRequest.reason}
                onChange={(e) => setLeaveRequest({ ...leaveRequest, reason: e.target.value })}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLeaveRequestOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleRequestLeave}>
              Gửi đơn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )

  // roleId: 1=Admin, 2=Receptionist, 3=Patient, 4=Doctor (theo enum RoleCode)
  if (role === "admin" || role === "1") {
    return <AdminSidebar>{pageContent}</AdminSidebar>
  } else if (role === "doctor" || role === "4") {
    return <DoctorSidebar>{pageContent}</DoctorSidebar>
  } else if (role === "receptionist" || role === "2") {
    return <ReceptionistSidebar>{pageContent}</ReceptionistSidebar>
  }

  return null
}
