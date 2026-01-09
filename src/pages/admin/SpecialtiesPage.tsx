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
  X,
  Save,
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
      <div className="container mx-auto px-6 py-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 min-h-full">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Quản lý Chuyên khoa</h1>
              <p className="text-slate-600">Quản lý các chuyên khoa và bác sĩ theo chuyên khoa</p>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm chuyên khoa
            </Button>
          </div>
        </div>

        {/* Search */}
        <Card className="mb-6 border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Tìm kiếm chuyên khoa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Specialties List */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Danh sách chuyên khoa ({filteredSpecialties.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : filteredSpecialties.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Không tìm thấy chuyên khoa nào</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tên chuyên khoa</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSpecialties.map((specialty) => (
                    <TableRow key={specialty.id}>
                      <TableCell className="font-mono text-sm">{specialty.id}</TableCell>
                      <TableCell>
                        <span className="font-medium">{specialty.name}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-slate-600 text-sm">
                          {specialty.description || "—"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDoctors(specialty)}
                            title="Xem bác sĩ"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(specialty)}
                            title="Sửa"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(specialty)}
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

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thêm chuyên khoa mới</DialogTitle>
              <DialogDescription>
                Nhập thông tin chuyên khoa mới
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="create-name">Tên chuyên khoa *</Label>
                <Input
                  id="create-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ví dụ: Nội khoa, Ngoại khoa..."
                />
              </div>
              <div>
                <Label htmlFor="create-description">Mô tả</Label>
                <Textarea
                  id="create-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả về chuyên khoa..."
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
              <DialogTitle>Sửa chuyên khoa</DialogTitle>
              <DialogDescription>
                Cập nhật thông tin chuyên khoa
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-name">Tên chuyên khoa *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ví dụ: Nội khoa, Ngoại khoa..."
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Mô tả</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả về chuyên khoa..."
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
                Bạn có chắc chắn muốn xóa chuyên khoa "{selectedSpecialty?.name}"? Hành động này không thể hoàn tác.
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

        {/* View Doctors Dialog */}
        <Dialog open={isViewDoctorsDialogOpen} onOpenChange={setIsViewDoctorsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                Bác sĩ thuộc chuyên khoa: {selectedSpecialty?.name}
              </DialogTitle>
              <DialogDescription>
                Danh sách các bác sĩ trong chuyên khoa này
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 max-h-[400px] overflow-y-auto">
              {isLoadingDoctors ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : doctorsBySpecialty.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Chưa có bác sĩ nào trong chuyên khoa này</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {doctorsBySpecialty.map((doctor) => (
                    <Card key={doctor.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{doctor.user?.fullName || "N/A"}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{doctor.doctorCode}</Badge>
                            {doctor.position && (
                              <span className="text-sm text-slate-500">{doctor.position}</span>
                            )}
                            {doctor.degree && (
                              <span className="text-sm text-slate-500">{doctor.degree}</span>
                            )}
                          </div>
                        </div>
                        <Link to={`/admin/doctors/${doctor.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
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
    </AdminSidebar>
  )
}
