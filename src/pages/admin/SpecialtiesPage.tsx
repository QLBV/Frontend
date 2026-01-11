"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Users,
  Eye,
  Activity,
  Stethoscope,
  MoreHorizontal,
  Save,
  FileText
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
import { SpecialtyService, type Specialty, type Doctor } from "@/services/specialty.service"
import api from "@/lib/api"

export default function SpecialtiesPage() {
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDoctorsDialogOpen, setIsViewDoctorsDialogOpen] = useState(false)
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | null>(null)
  const [doctorsBySpecialty, setDoctorsBySpecialty] = useState<Doctor[]>([])
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })

  useEffect(() => {
    fetchSpecialties()
  }, [])

  const fetchSpecialties = async () => {
    try {
      setIsLoading(true)
      const data = await SpecialtyService.getSpecialties()
      setSpecialties(data)
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        toast.error(error.message || "Không thể tải danh sách chuyên khoa")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const fetchDoctorsBySpecialty = async (specialtyId: number) => {
    try {
      setIsLoadingDoctors(true)
      const doctors = await SpecialtyService.getDoctorsBySpecialty(specialtyId)
      setDoctorsBySpecialty(doctors)
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        toast.error(error.message || "Không thể tải danh sách bác sĩ")
      }
    } finally {
      setIsLoadingDoctors(false)
    }
  }

  const handleCreate = () => {
    setFormData({ name: "", description: "" })
    setIsCreateDialogOpen(true)
  }

  const handleEdit = (specialty: Specialty) => {
    setSelectedSpecialty(specialty)
    setFormData({
      name: specialty.name,
      description: specialty.description || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (specialty: Specialty) => {
    setSelectedSpecialty(specialty)
    setIsDeleteDialogOpen(true)
  }

  const handleViewDoctors = async (specialty: Specialty) => {
    setSelectedSpecialty(specialty)
    setIsViewDoctorsDialogOpen(true)
    await fetchDoctorsBySpecialty(specialty.id)
  }

  const handleCreateSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên chuyên khoa")
      return
    }

    try {
      setIsCreating(true)
      const response = await api.post("/specialties", {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      })

      if (response.data.success) {
        toast.success("Tạo chuyên khoa thành công!")
        setIsCreateDialogOpen(false)
        setFormData({ name: "", description: "" })
        fetchSpecialties()
      } else {
        throw new Error(response.data.message || "Không thể tạo chuyên khoa")
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        toast.error(error.response?.data?.message || "Không thể tạo chuyên khoa")
      }
    } finally {
      setIsCreating(false)
    }
  }

  const handleUpdateSubmit = async () => {
    if (!selectedSpecialty || !formData.name.trim()) {
      toast.error("Vui lòng nhập tên chuyên khoa")
      return
    }

    try {
      setIsUpdating(true)
      const response = await api.put(`/specialties/${selectedSpecialty.id}`, {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      })

      if (response.data.success) {
        toast.success("Cập nhật chuyên khoa thành công!")
        setIsEditDialogOpen(false)
        setSelectedSpecialty(null)
        setFormData({ name: "", description: "" })
        fetchSpecialties()
      } else {
        throw new Error(response.data.message || "Không thể cập nhật chuyên khoa")
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        toast.error(error.response?.data?.message || "Không thể cập nhật chuyên khoa")
      }
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteSubmit = async () => {
    if (!selectedSpecialty) return

    try {
      setIsDeleting(true)
      const response = await api.delete(`/specialties/${selectedSpecialty.id}`)

      if (response.data.success) {
        toast.success("Xóa chuyên khoa thành công!")
        setIsDeleteDialogOpen(false)
        setSelectedSpecialty(null)
        fetchSpecialties()
      } else {
        throw new Error(response.data.message || "Không thể xóa chuyên khoa")
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        toast.error(error.response?.data?.message || "Không thể xóa chuyên khoa")
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredSpecialties = specialties.filter((specialty) =>
    specialty.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (specialty.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <AdminSidebar>
      <div className="min-h-screen bg-slate-50/50">
        <div className="p-8 max-w-[1600px] mx-auto space-y-8">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Quản lý Chuyên khoa</h1>
              <p className="text-slate-500 mt-1">Thiết lập và quản lý các chuyên khoa y tế</p>
            </div>
            <Button 
              onClick={handleCreate} 
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm chuyên khoa
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-0 shadow-sm bg-white overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Stethoscope className="w-16 h-16 text-indigo-600" />
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-50 rounded-xl">
                    <Stethoscope className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Tổng chuyên khoa</p>
                    <h3 className="text-2xl font-bold text-slate-900">{specialties.length}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Users className="w-16 h-16 text-blue-600" />
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Bác sĩ chuyên khoa</p>
                    <h3 className="text-2xl font-bold text-slate-900">--</h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Activity className="w-16 h-16 text-emerald-600" />
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 rounded-xl">
                    <Activity className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Đang hoạt động</p>
                    <h3 className="text-2xl font-bold text-slate-900">{specialties.length}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Specialties List */}
          <Card className="border border-slate-200 shadow-sm overflow-hidden bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6 pb-4">
              <div className="flex flex-col gap-1">
                <CardTitle className="text-lg font-semibold text-slate-900">Danh sách chuyên khoa</CardTitle>
                <CardDescription>Các chuyên khoa hiện có trong hệ thống</CardDescription>
              </div>
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Tìm kiếm..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
              ) : filteredSpecialties.length === 0 ? (
                <div className="text-center py-20 bg-slate-50/50">
                  <Stethoscope className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900">Không tìm thấy chuyên khoa</h3>
                  <p className="text-slate-500 mt-1">Thử thay đổi từ khóa tìm kiếm hoặc thêm mới</p>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="w-[100px] pl-6">ID</TableHead>
                      <TableHead>Tên chuyên khoa</TableHead>
                      <TableHead>Mô tả</TableHead>
                      <TableHead className="text-right pr-6">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSpecialties.map((specialty) => (
                      <TableRow key={specialty.id} className="group hover:bg-slate-50/50 transition-colors">
                        <TableCell className="pl-6 font-mono text-xs text-slate-500">#{specialty.id}</TableCell>
                        <TableCell>
                          <div className="font-medium text-slate-900">{specialty.name}</div>
                        </TableCell>
                        <TableCell>
                          <span className="text-slate-600 text-sm line-clamp-1 max-w-[400px]">
                            {specialty.description || <span className="text-slate-400 italic">Không có mô tả</span>}
                          </span>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleViewDoctors(specialty)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  <span>Xem bác sĩ</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEdit(specialty)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Chỉnh sửa</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleDelete(specialty)} className="text-red-600 focus:text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  <span>Xóa chuyên khoa</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Create Dialog */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Thêm chuyên khoa mới</DialogTitle>
                <DialogDescription>
                  Nhập thông tin chuyên khoa y tế mới vào hệ thống
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="create-name">Tên chuyên khoa <span className="text-red-500">*</span></Label>
                  <Input
                    id="create-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ví dụ: Nội khoa, Ngoại khoa..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-description">Mô tả</Label>
                  <Textarea
                    id="create-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Mô tả chi tiết về chuyên khoa..."
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isCreating}
                >
                  Hủy bỏ
                </Button>
                <Button onClick={handleCreateSubmit} disabled={isCreating} className="bg-indigo-600 hover:bg-indigo-700">
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Lưu chuyên khoa
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
                <DialogTitle>Chỉnh sửa chuyên khoa</DialogTitle>
                <DialogDescription>
                  Cập nhật thông tin cho chuyên khoa {selectedSpecialty?.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Tên chuyên khoa <span className="text-red-500">*</span></Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ví dụ: Nội khoa, Ngoại khoa..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Mô tả</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Mô tả chi tiết về chuyên khoa..."
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  disabled={isUpdating}
                >
                  Hủy bỏ
                </Button>
                <Button onClick={handleUpdateSubmit} disabled={isUpdating} className="bg-indigo-600 hover:bg-indigo-700">
                  {isUpdating ? (
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
                <DialogTitle className="text-center">Xóa chuyên khoa</DialogTitle>
                <DialogDescription className="text-center">
                  Bạn có chắc chắn muốn xóa chuyên khoa <span className="font-semibold text-slate-900">"{selectedSpecialty?.name}"</span>? 
                  <br/>Hành động này không thể hoàn tác.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="sm:justify-center">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                  disabled={isDeleting}
                >
                  Hủy bỏ
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteSubmit}
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? (
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

          {/* View Doctors Dialog */}
          <Dialog open={isViewDoctorsDialogOpen} onOpenChange={setIsViewDoctorsDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-indigo-600" />
                  Bác sĩ thuộc chuyên khoa: {selectedSpecialty?.name}
                </DialogTitle>
                <DialogDescription>
                  Danh sách nhân sự y tế đang hoạt động trong chuyên khoa này
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {isLoadingDoctors ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                  </div>
                ) : doctorsBySpecialty.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                    <Users className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">Chưa có bác sĩ nào trong chuyên khoa này</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {doctorsBySpecialty.map((doctor) => (
                      <Card key={doctor.id} className="border border-slate-200 hover:border-indigo-200 transition-colors">
                        <CardContent className="p-3 flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                            {doctor.user?.fullName?.charAt(0) || "D"}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm text-slate-900 truncate" title={doctor.user?.fullName}>
                              {doctor.user?.fullName || "N/A"}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              <Badge variant="secondary" className="text-[10px] px-1 h-5 bg-slate-100 text-slate-600 font-mono">
                                {doctor.doctorCode}
                              </Badge>
                              {doctor.degree && (
                                <Badge variant="outline" className="text-[10px] px-1 h-5 border-indigo-200 text-indigo-700">
                                  {doctor.degree}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Link to={`/admin/doctors/${doctor.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewDoctorsDialogOpen(false)}>
                  Đóng
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </AdminSidebar>
  )
}
