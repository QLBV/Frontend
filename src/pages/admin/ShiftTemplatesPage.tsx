"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Clock,
  Save,
  LayoutGrid,
  List,
  ToggleLeft,
  ToggleRight,
  CalendarDays,
  MoreHorizontal,
  CheckCircle2,
  RefreshCw,
  Stethoscope
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import AdminSidebar from "@/components/sidebar/admin"
import {
  ShiftTemplateService,
  type ShiftTemplate,
  DAY_OF_WEEK_LABELS,
  DAY_OF_WEEK_LABELS_SHORT,
} from "@/services/shiftTemplate.service"
import { ShiftService, type Shift } from "@/services/shift.service"
import api from "@/lib/api"

// Doctor type for select
interface Doctor {
  id: number
  user: {
    id: number
    fullName: string
    email: string
  }
  specialty?: {
    id: number
    name: string
  }
}

export default function ShiftTemplatesPage() {
  const [templates, setTemplates] = useState<ShiftTemplate[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterDayOfWeek, setFilterDayOfWeek] = useState<string>("all")
  const [filterDoctor, setFilterDoctor] = useState<string>("all")
  const [filterShift, setFilterShift] = useState<string>("all")
  const [filterActive, setFilterActive] = useState<string>("all")
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid")

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<ShiftTemplate | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    doctorId: "",
    shiftId: "",
    dayOfWeek: "",
    notes: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([fetchTemplates(), fetchShifts(), fetchDoctors()])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTemplates = async () => {
    try {
      const data = await ShiftTemplateService.getTemplates()
      console.log("FETCHED TEMPLATES:", data)
      setTemplates(data)
    } catch (error: any) {
      console.error("FETCH ERROR:", error)
      toast.error(error.message || "Không thể tải danh sách mẫu ca trực")
    }
  }

  const fetchShifts = async () => {
    try {
      const data = await ShiftService.getShifts()
      setShifts(data)
    } catch (error: any) {
      console.error("Error fetching shifts:", error)
    }
  }

  const fetchDoctors = async () => {
    try {
      setIsLoadingDoctors(true)
      const response = await api.get("/doctors")
      if (response.data.success) {
        setDoctors(response.data.data || [])
      }
    } catch (error: any) {
      console.error("Error fetching doctors:", error)
    } finally {
      setIsLoadingDoctors(false)
    }
  }

  const handleCreate = () => {
    setFormData({ doctorId: "", shiftId: "", dayOfWeek: "", notes: "" })
    setIsCreateDialogOpen(true)
  }

  const handleEdit = (template: ShiftTemplate) => {
    setSelectedTemplate(template)
    setFormData({
      doctorId: template.doctorId.toString(),
      shiftId: template.shiftId.toString(),
      dayOfWeek: template.dayOfWeek.toString(),
      notes: template.notes || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (template: ShiftTemplate) => {
    setSelectedTemplate(template)
    setIsDeleteDialogOpen(true)
  }

  const handleToggleActive = async (template: ShiftTemplate) => {
    try {
      await ShiftTemplateService.toggleTemplateStatus(template.id, !template.isActive)
      toast.success(
        template.isActive ? "Đã tắt mẫu ca trực" : "Đã kích hoạt mẫu ca trực"
      )
      fetchTemplates()
    } catch (error: any) {
      toast.error(error.message || "Không thể cập nhật trạng thái")
    }
  }

  const handleCreateSubmit = async () => {
    if (!formData.doctorId || !formData.shiftId || !formData.dayOfWeek) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc")
      return
    }

    try {
      setIsSubmitting(true)
      await ShiftTemplateService.createTemplate({
        doctorId: parseInt(formData.doctorId),
        shiftId: parseInt(formData.shiftId),
        dayOfWeek: parseInt(formData.dayOfWeek),
        notes: formData.notes || undefined,
      })

      toast.success("Tạo mẫu ca trực thành công!")
      setIsCreateDialogOpen(false)
      fetchTemplates()
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Không thể tạo mẫu ca trực")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateSubmit = async () => {
    if (!selectedTemplate || !formData.dayOfWeek) {
      toast.error("Vui lòng chọn ngày trong tuần")
      return
    }

    try {
      setIsSubmitting(true)
      await ShiftTemplateService.updateTemplate(selectedTemplate.id, {
        dayOfWeek: parseInt(formData.dayOfWeek),
        notes: formData.notes || undefined,
      })

      toast.success("Cập nhật mẫu ca trực thành công!")
      setIsEditDialogOpen(false)
      setSelectedTemplate(null)
      fetchTemplates()
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Không thể cập nhật mẫu ca trực")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteSubmit = async () => {
    if (!selectedTemplate) return

    try {
      setIsSubmitting(true)
      await ShiftTemplateService.deleteTemplate(selectedTemplate.id)

      toast.success("Xóa mẫu ca trực thành công!")
      setIsDeleteDialogOpen(false)
      setSelectedTemplate(null)
      fetchTemplates()
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || "Không thể xóa mẫu ca trực")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter templates
  const filteredTemplates = templates.filter((template) => {
    // Search filter
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch =
      !searchQuery ||
      template.doctor?.user?.fullName?.toLowerCase().includes(searchLower) ||
      template.shift?.name?.toLowerCase().includes(searchLower) ||
      template.notes?.toLowerCase().includes(searchLower)

    // Day of week filter
    const matchesDay =
      filterDayOfWeek === "all" || template.dayOfWeek === parseInt(filterDayOfWeek)

    // Doctor filter
    const matchesDoctor =
      filterDoctor === "all" || template.doctorId === parseInt(filterDoctor)

    // Shift filter
    const matchesShift =
      filterShift === "all" || template.shiftId === parseInt(filterShift)

    // Active filter
    const matchesActive =
      filterActive === "all" ||
      (filterActive === "active" && template.isActive) ||
      (filterActive === "inactive" && !template.isActive)

    return matchesSearch && matchesDay && matchesDoctor && matchesShift && matchesActive
  })

  // Group templates by day of week for grid view
  const templatesByDay = ShiftTemplateService.groupTemplatesByDay(filteredTemplates)

  const formatTime = (time: string) => {
    try {
      const [hours, minutes] = time.split(":")
      return `${hours}:${minutes}`
    } catch {
      return time
    }
  }

  // Stats
  const totalTemplates = templates.length
  const activeTemplates = templates.filter((t) => t.isActive).length
  const uniqueDoctors = new Set(templates.map((t) => t.doctorId)).size

  return (
    <AdminSidebar>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-200/50">
                  <CalendarDays className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 bg-clip-text text-transparent">
                  Mẫu Ca Trực
                </h1>
              </div>
              <p className="text-slate-500 mt-1">
                Thiết lập lịch trực mẫu cho bác sĩ theo ngày trong tuần
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="bg-white hover:bg-slate-50 border-slate-200"
                onClick={fetchData}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Làm mới
              </Button>
              <Button
                onClick={handleCreate}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-200/50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm mẫu ca
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white overflow-hidden relative group hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-xl">
                    <LayoutGrid className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Tổng mẫu ca</p>
                    <h3 className="text-2xl font-bold text-slate-900">{totalTemplates}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white overflow-hidden relative group hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Đang hoạt động</p>
                    <h3 className="text-2xl font-bold text-slate-900">{activeTemplates}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white overflow-hidden relative group hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl">
                    <Stethoscope className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Bác sĩ có mẫu</p>
                    <h3 className="text-2xl font-bold text-slate-900">{uniqueDoctors}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and View Toggle */}
          <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-3 items-center flex-1">
                  <div className="relative w-full max-w-xs">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      placeholder="Tìm kiếm..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                    />
                  </div>

                  <Select value={filterDayOfWeek} onValueChange={setFilterDayOfWeek}>
                    <SelectTrigger className="w-[140px] bg-slate-50 border-slate-200">
                      <SelectValue placeholder="Ngày" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả ngày</SelectItem>
                      {Object.entries(DAY_OF_WEEK_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterDoctor} onValueChange={setFilterDoctor}>
                    <SelectTrigger className="w-[180px] bg-slate-50 border-slate-200">
                      <SelectValue placeholder="Bác sĩ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả bác sĩ</SelectItem>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id.toString()}>
                          {doctor.user?.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterShift} onValueChange={setFilterShift}>
                    <SelectTrigger className="w-[160px] bg-slate-50 border-slate-200">
                      <SelectValue placeholder="Ca trực" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả ca</SelectItem>
                      {shifts.map((shift) => (
                        <SelectItem key={shift.id} value={shift.id.toString()}>
                          {shift.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterActive} onValueChange={setFilterActive}>
                    <SelectTrigger className="w-[150px] bg-slate-50 border-slate-200">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="active">Đang hoạt động</SelectItem>
                      <SelectItem value="inactive">Đã tắt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2 border border-slate-200 rounded-lg p-1 bg-slate-50">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={viewMode === "grid" ? "bg-white shadow-sm" : ""}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={viewMode === "list" ? "bg-white shadow-sm" : ""}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
          ) : filteredTemplates.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="py-20">
                <div className="text-center">
                  <CalendarDays className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    Chưa có mẫu ca trực nào
                  </h3>
                  <p className="text-slate-500 mb-6 max-w-md mx-auto">
                    Tạo mẫu ca trực để thiết lập lịch làm việc mặc định cho bác sĩ theo từng ngày trong tuần
                  </p>
                  <Button onClick={handleCreate} className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm mẫu ca đầu tiên
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : viewMode === "grid" ? (
            /* Grid View - By Day of Week */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Object.entries(templatesByDay).map(([day, dayTemplates]) => (
                <Card
                  key={day}
                  className={`border-0 shadow-lg transition-all duration-300 hover:shadow-xl ${
                    dayTemplates.length > 0 ? "bg-white" : "bg-slate-50/50"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                            parseInt(day) === 7
                              ? "bg-gradient-to-br from-red-100 to-red-50 text-red-600"
                              : "bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-600"
                          }`}
                        >
                          {DAY_OF_WEEK_LABELS_SHORT[parseInt(day)]}
                        </div>
                        <div>
                          <CardTitle className="text-base font-semibold">
                            {DAY_OF_WEEK_LABELS[parseInt(day)]}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {dayTemplates.length} mẫu ca
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {dayTemplates.length === 0 ? (
                      <div className="text-center py-6 text-slate-400">
                        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Chưa có mẫu ca</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {dayTemplates.map((template) => (
                          <div
                            key={template.id}
                            className={`p-3 rounded-xl border transition-all duration-200 hover:shadow-md ${
                              template.isActive
                                ? "bg-white border-slate-200 hover:border-indigo-200"
                                : "bg-slate-50 border-slate-100 opacity-60"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-900 truncate">
                                  {template.doctor?.user?.fullName || "N/A"}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                  {template.doctor?.specialty?.name || "Không có chuyên khoa"}
                                </p>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleEdit(template)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Chỉnh sửa
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleToggleActive(template)}>
                                    {template.isActive ? (
                                      <>
                                        <ToggleLeft className="mr-2 h-4 w-4" />
                                        Tắt mẫu
                                      </>
                                    ) : (
                                      <>
                                        <ToggleRight className="mr-2 h-4 w-4" />
                                        Bật mẫu
                                      </>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(template)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Xóa
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <div className="flex items-center justify-between">
                              <Badge
                                variant="secondary"
                                className="bg-indigo-50 text-indigo-700 text-xs font-mono"
                              >
                                {template.shift?.name} ({formatTime(template.shift?.startTime || "")} -{" "}
                                {formatTime(template.shift?.endTime || "")})
                              </Badge>
                              {template.isActive ? (
                                <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                                  Hoạt động
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">
                                  Đã tắt
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            /* List View */
            <Card className="border-0 shadow-lg bg-white overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50/80">
                  <TableRow>
                    <TableHead className="pl-6">Bác sĩ</TableHead>
                    <TableHead>Chuyên khoa</TableHead>
                    <TableHead>Ca trực</TableHead>
                    <TableHead>Ngày</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ghi chú</TableHead>
                    <TableHead className="text-right pr-6">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTemplates.map((template) => (
                    <TableRow key={template.id} className="group hover:bg-slate-50/50">
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold">
                            {template.doctor?.user?.fullName?.charAt(0) || "?"}
                          </div>
                          <span className="font-medium">
                            {template.doctor?.user?.fullName || "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-slate-600">
                          {template.doctor?.specialty?.name || "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {template.shift?.name} ({formatTime(template.shift?.startTime || "")} -{" "}
                          {formatTime(template.shift?.endTime || "")})
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            template.dayOfWeek === 7
                              ? "bg-red-50 text-red-700"
                              : "bg-indigo-50 text-indigo-700"
                          }
                        >
                          {DAY_OF_WEEK_LABELS[template.dayOfWeek]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {template.isActive ? (
                          <Badge className="bg-emerald-100 text-emerald-700">Hoạt động</Badge>
                        ) : (
                          <Badge variant="secondary">Đã tắt</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-slate-500 text-sm line-clamp-1">
                          {template.notes || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEdit(template)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Chỉnh sửa
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActive(template)}>
                              {template.isActive ? (
                                <>
                                  <ToggleLeft className="mr-2 h-4 w-4" />
                                  Tắt mẫu
                                </>
                              ) : (
                                <>
                                  <ToggleRight className="mr-2 h-4 w-4" />
                                  Bật mẫu
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(template)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa mẫu
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}

          {/* Create Dialog */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-indigo-600" />
                  Thêm mẫu ca trực
                </DialogTitle>
                <DialogDescription>
                  Tạo mẫu ca trực mới cho bác sĩ theo ngày trong tuần
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>
                    Bác sĩ <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.doctorId}
                    onValueChange={(value) => setFormData({ ...formData, doctorId: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn bác sĩ" />
                    </SelectTrigger>
                    <SelectContent>
                      {isLoadingDoctors ? (
                        <div className="p-4 text-center">
                          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                        </div>
                      ) : (
                        doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id.toString()}>
                            <div className="flex items-center gap-2">
                              <span>{doctor.user?.fullName}</span>
                              {doctor.specialty && (
                                <span className="text-slate-400">({doctor.specialty.name})</span>
                              )}
                            </div>
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>
                    Ca trực <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.shiftId}
                    onValueChange={(value) => setFormData({ ...formData, shiftId: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn ca trực" />
                    </SelectTrigger>
                    <SelectContent>
                      {shifts.map((shift) => (
                        <SelectItem key={shift.id} value={shift.id.toString()}>
                          {shift.name} ({formatTime(shift.startTime)} - {formatTime(shift.endTime)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>
                    Ngày trong tuần <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.dayOfWeek}
                    onValueChange={(value) => setFormData({ ...formData, dayOfWeek: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn ngày" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DAY_OF_WEEK_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Ghi chú</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Ghi chú thêm về mẫu ca này..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Hủy bỏ
                </Button>
                <Button
                  onClick={handleCreateSubmit}
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Lưu mẫu ca
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5 text-indigo-600" />
                  Chỉnh sửa mẫu ca trực
                </DialogTitle>
                <DialogDescription>
                  Cập nhật thông tin cho mẫu ca của{" "}
                  <span className="font-medium">
                    {selectedTemplate?.doctor?.user?.fullName}
                  </span>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                      {selectedTemplate?.doctor?.user?.fullName?.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="font-medium">{selectedTemplate?.doctor?.user?.fullName}</p>
                      <p className="text-sm text-slate-500">
                        {selectedTemplate?.shift?.name} ({formatTime(selectedTemplate?.shift?.startTime || "")} -{" "}
                        {formatTime(selectedTemplate?.shift?.endTime || "")})
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>
                    Ngày trong tuần <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.dayOfWeek}
                    onValueChange={(value) => setFormData({ ...formData, dayOfWeek: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn ngày" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(DAY_OF_WEEK_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Ghi chú</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Ghi chú thêm về mẫu ca này..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Hủy bỏ
                </Button>
                <Button
                  onClick={handleUpdateSubmit}
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Lưu thay đổi
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Delete Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <DialogTitle className="text-center">Xóa mẫu ca trực</DialogTitle>
                <DialogDescription className="text-center">
                  Bạn có chắc chắn muốn xóa mẫu ca của{" "}
                  <span className="font-semibold text-slate-900">
                    {selectedTemplate?.doctor?.user?.fullName}
                  </span>{" "}
                  vào{" "}
                  <span className="font-semibold text-slate-900">
                    {selectedTemplate && DAY_OF_WEEK_LABELS[selectedTemplate.dayOfWeek]}
                  </span>
                  ?
                  <br />
                  Hành động này không thể hoàn tác.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="sm:justify-center">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Hủy bỏ
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteSubmit}
                  disabled={isSubmitting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang xóa...
                    </>
                  ) : (
                    "Xóa vĩnh viễn"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </AdminSidebar>
  )
}
