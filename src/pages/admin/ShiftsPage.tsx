"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Clock,
  Calendar,
  Save,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import AdminSidebar from "@/components/sidebar/admin"
import { ShiftService, type Shift, type ShiftSchedule } from "@/services/shift.service"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

export default function ShiftsPage() {
  const [shifts, setShifts] = useState<Shift[]>([])
  const [shiftSchedule, setShiftSchedule] = useState<ShiftSchedule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewScheduleDialogOpen, setIsViewScheduleDialogOpen] = useState(false)
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [activeTab, setActiveTab] = useState("list")

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    startTime: "",
    endTime: "",
    description: "",
  })

  useEffect(() => {
    fetchShifts()
    fetchShiftSchedule()
  }, [])

  const fetchShifts = async () => {
    try {
      setIsLoading(true)
      const data = await ShiftService.getShifts()
      setShifts(data)
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        toast.error(error.message || "Không thể tải danh sách ca trực")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const fetchShiftSchedule = async () => {
    try {
      setIsLoadingSchedule(true)
      const today = new Date()
      const nextWeek = new Date(today)
      nextWeek.setDate(today.getDate() + 7)

      const data = await ShiftService.getShiftSchedule({
        startDate: format(today, "yyyy-MM-dd"),
        endDate: format(nextWeek, "yyyy-MM-dd"),
      })
      setShiftSchedule(data)
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        // Silent fail for schedule
        console.warn("Failed to fetch shift schedule:", error)
      }
    } finally {
      setIsLoadingSchedule(false)
    }
  }

  const handleCreate = () => {
    setFormData({ name: "", startTime: "", endTime: "", description: "" })
    setIsCreateDialogOpen(true)
  }

  const handleEdit = (shift: Shift) => {
    setSelectedShift(shift)
    setFormData({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      description: shift.description || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (shift: Shift) => {
    setSelectedShift(shift)
    setIsDeleteDialogOpen(true)
  }

  const handleViewSchedule = () => {
    setIsViewScheduleDialogOpen(true)
    fetchShiftSchedule()
  }

  const handleCreateSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên ca trực")
      return
    }
    if (!formData.startTime || !formData.endTime) {
      toast.error("Vui lòng nhập thời gian bắt đầu và kết thúc")
      return
    }

    try {
      setIsCreating(true)
      const data = await ShiftService.createShift({
        name: formData.name.trim(),
        startTime: formData.startTime,
        endTime: formData.endTime,
        description: formData.description.trim() || undefined,
      })

      toast.success("Tạo ca trực thành công!")
      setIsCreateDialogOpen(false)
      setFormData({ name: "", startTime: "", endTime: "", description: "" })
      fetchShifts()
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        toast.error(error.response?.data?.message || "Không thể tạo ca trực")
      }
    } finally {
      setIsCreating(false)
    }
  }

  const handleUpdateSubmit = async () => {
    if (!selectedShift || !formData.name.trim()) {
      toast.error("Vui lòng nhập tên ca trực")
      return
    }
    if (!formData.startTime || !formData.endTime) {
      toast.error("Vui lòng nhập thời gian bắt đầu và kết thúc")
      return
    }

    try {
      setIsUpdating(true)
      const data = await ShiftService.updateShift(selectedShift.id, {
        name: formData.name.trim(),
        startTime: formData.startTime,
        endTime: formData.endTime,
        description: formData.description.trim() || undefined,
      })

      toast.success("Cập nhật ca trực thành công!")
      setIsEditDialogOpen(false)
      setSelectedShift(null)
      setFormData({ name: "", startTime: "", endTime: "", description: "" })
      fetchShifts()
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        toast.error(error.response?.data?.message || "Không thể cập nhật ca trực")
      }
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteSubmit = async () => {
    if (!selectedShift) return

    try {
      setIsDeleting(true)
      await ShiftService.deleteShift(selectedShift.id)

      toast.success("Xóa ca trực thành công!")
      setIsDeleteDialogOpen(false)
      setSelectedShift(null)
      fetchShifts()
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        toast.error(error.response?.data?.message || "Không thể xóa ca trực")
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredShifts = shifts.filter((shift) =>
    shift.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shift.startTime.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shift.endTime.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (shift.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(":")
      return `${hours}:${minutes}`
    } catch {
      return time
    }
  }

  return (
    <AdminSidebar>
      <div className="container mx-auto px-6 py-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 min-h-full">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Quản lý Ca Trực</h1>
              <p className="text-slate-600">Quản lý các ca trực và lịch trực của bác sĩ</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleViewSchedule}>
                <Calendar className="h-4 w-4 mr-2" />
                Xem lịch trực
              </Button>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Thêm ca trực
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="list">Danh sách ca trực</TabsTrigger>
            <TabsTrigger value="schedule">Lịch trực</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-6">
            {/* Search */}
            <Card className="border-0 shadow-lg">
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Tìm kiếm ca trực..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Shifts List */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Danh sách ca trực ({filteredShifts.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                ) : filteredShifts.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">Không tìm thấy ca trực nào</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Tên ca trực</TableHead>
                        <TableHead>Thời gian</TableHead>
                        <TableHead>Mô tả</TableHead>
                        <TableHead>Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredShifts.map((shift) => (
                        <TableRow key={shift.id}>
                          <TableCell className="font-mono text-sm">{shift.id}</TableCell>
                          <TableCell>
                            <span className="font-medium">{shift.name}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-blue-50">
                                {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-slate-600 text-sm">
                              {shift.description || "—"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(shift)}
                                title="Sửa"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(shift)}
                                title="Xóa"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Lịch trực (7 ngày tới)</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingSchedule ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  </div>
                ) : shiftSchedule.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">Không có lịch trực nào</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {shiftSchedule.map((schedule) => (
                      <Card key={schedule.date} className="p-4">
                        <h3 className="font-semibold text-lg mb-4">
                          {format(new Date(schedule.date), "EEEE, dd/MM/yyyy", { locale: vi })}
                        </h3>
                        <div className="space-y-3">
                          {schedule.shifts.map((shiftItem, idx) => (
                            <div key={idx} className="border-l-4 border-l-blue-500 pl-4 py-2">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <p className="font-medium">{shiftItem.shift.name}</p>
                                  <p className="text-sm text-slate-500">
                                    {formatTime(shiftItem.shift.startTime)} - {formatTime(shiftItem.shift.endTime)}
                                  </p>
                                </div>
                                <Badge variant="outline">
                                  {shiftItem.doctors.length} bác sĩ
                                </Badge>
                              </div>
                              {shiftItem.doctors.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {shiftItem.doctors.map((doctor) => (
                                    <div key={doctor.id} className="text-sm text-slate-600">
                                      • {doctor.fullName} ({doctor.doctorCode})
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm ca trực mới</DialogTitle>
              <DialogDescription>
                Nhập thông tin ca trực mới
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="create-name">Tên ca trực *</Label>
                <Input
                  id="create-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ví dụ: Ca sáng, Ca chiều, Ca tối..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="create-start-time">Thời gian bắt đầu *</Label>
                  <Input
                    id="create-start-time"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="create-end-time">Thời gian kết thúc *</Label>
                  <Input
                    id="create-end-time"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="create-description">Mô tả</Label>
                <Textarea
                  id="create-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả về ca trực..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isCreating}
              >
                Hủy
              </Button>
              <Button onClick={handleCreateSubmit} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Tạo
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sửa ca trực</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin ca trực
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-name">Tên ca trực *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ví dụ: Ca sáng, Ca chiều, Ca tối..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-start-time">Thời gian bắt đầu *</Label>
                  <Input
                    id="edit-start-time"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-end-time">Thời gian kết thúc *</Label>
                  <Input
                    id="edit-end-time"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-description">Mô tả</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả về ca trực..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isUpdating}
              >
                Hủy
              </Button>
              <Button onClick={handleUpdateSubmit} disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Cập nhật
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận xóa</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xóa ca trực "{selectedShift?.name}"? Hành động này không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={isDeleting}
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteSubmit}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Xóa
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminSidebar>
  )
}
