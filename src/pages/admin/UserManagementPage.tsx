import { useState, useEffect } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import AdminSidebar from '@/components/sidebar/admin'
import { 
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Loader2,
  Plus,
  Edit,
  UserCheck,
  UserX,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"


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
import { toast } from "sonner"
import { UserService, type User } from "@/services/user.service"

type RoleFilter = "all" | "admin" | "doctor" | "receptionist" | "patient" | "employee"
type StatusFilter = "all" | "active" | "inactive"

export default function UserManagementPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialRole = (searchParams.get("role") as RoleFilter) || "all"
  
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<RoleFilter>(initialRole)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const role = searchParams.get("role") as RoleFilter
    if (role) {
      setRoleFilter(role)
      setCurrentPage(1)
    }
  }, [searchParams])
  const [users, setUsers] = useState<User[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [userToToggle, setUserToToggle] = useState<User | null>(null)
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)
  
  const itemsPerPage = 10

  const fetchUsers = async () => {
    try {
      setLoading(true)
      
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      }
      
      if (searchQuery) {
        params.search = searchQuery
      }
      
      if (roleFilter !== "all") {
        params.role = roleFilter
      }
      
      if (statusFilter !== "all") {
        params.isActive = statusFilter === "active"
      }
      
      const response = await UserService.getUsers(params)
      console.log("fetchUsers response:", response)
      
      const userList = response.users || []
      const mappedUsers = userList.map((user: any) => {
        let roleString = 'patient'
        if (typeof user.role === 'string') {
          roleString = user.role.toLowerCase()
        } else if (user.role?.name) {
          roleString = user.role.name.toLowerCase()
        } else if (user.roleId) {
          const roleIdMap: Record<number, string> = {
            1: 'admin',
            2: 'receptionist',
            3: 'patient',
            4: 'doctor',
          }
          roleString = roleIdMap[user.roleId] || 'patient'
        }
        return {
          ...user,
          role: roleString as any,
        }
      })
      setUsers(mappedUsers)
      setTotalPages(response.totalPages || 1)
    } catch (err: any) {
      console.error("fetchUsers error:", err)
      if (err.response?.status === 429) {
        const errorMessage = "Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại."
        toast.error(errorMessage)
      } else {
        const errorMessage = err.response?.data?.message || err.message || 'Không thể tải danh sách người dùng'
        toast.error(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [currentPage, roleFilter, statusFilter])

  useEffect(() => {
    // Reset to page 1 when search or filters change
    setCurrentPage(1)
    const timeoutId = setTimeout(() => {
      fetchUsers()
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return
    
    try {
      setIsDeleting(true)
      await UserService.deleteUser(userToDelete.id)
      toast.success("Xóa người dùng thành công!")
      setDeleteDialogOpen(false)
      setUserToDelete(null)
      setTimeout(() => {
        fetchUsers()
      }, 500)
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        const errorMessage = error.response?.data?.message || "Không thể xóa người dùng"
        toast.error(errorMessage)
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const handleActivateClick = (user: User) => {
    setUserToToggle(user)
    setStatusDialogOpen(true)
  }

  const handleDeactivateClick = (user: User) => {
    setUserToToggle(user)
    setStatusDialogOpen(true)
  }

  const handleStatusToggleConfirm = async () => {
    if (!userToToggle) return
    
    try {
      setIsTogglingStatus(true)
      if (userToToggle.isActive) {
        await UserService.deactivateUser(userToToggle.id)
        toast.success("Vô hiệu hóa người dùng thành công!")
      } else {
        await UserService.activateUser(userToToggle.id)
        toast.success("Kích hoạt người dùng thành công!")
      }
      setStatusDialogOpen(false)
      setUserToToggle(null)
      fetchUsers()
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        toast.error(error.response?.data?.message || "Không thể thay đổi trạng thái")
      }
    } finally {
      setIsTogglingStatus(false)
    }
  }



  const getRoleBadge = (role: string) => {
    const config: Record<string, { label: string; className: string }> = {
      admin: { label: "Admin", className: "bg-red-100 text-red-800 border-red-200" },
      doctor: { label: "Bác sĩ", className: "bg-blue-100 text-blue-800 border-blue-200" },
      receptionist: { label: "Lễ tân", className: "bg-green-100 text-green-800 border-green-200" },
      patient: { label: "Bệnh nhân", className: "bg-gray-100 text-gray-800 border-gray-200" },
    }
    // role should already be a string after mapping, but add safety check
    const roleName = typeof role === 'string' ? role.toLowerCase() : 'patient'
    const roleConfig = config[roleName] || config.patient
    
    return (
      <Badge variant="outline" className={roleConfig.className}>
        {roleConfig.label}
      </Badge>
    )
  }

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant="outline" className={isActive ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"}>
        {isActive ? "Hoạt động" : "Vô hiệu hóa"}
      </Badge>
    )
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

  if (loading && users.length === 0) {
    return (
      <AdminSidebar>
        <div className="p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải danh sách người dùng...</p>
          </div>
        </div>
      </AdminSidebar>
    )
  }

  return (
    <AdminSidebar>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Quản lý người dùng</h1>
          
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo tên, email..."
              className="pl-10 h-12 text-base bg-white border-gray-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filters and Add User Button */}
          <div className="flex items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-4">
              <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as RoleFilter)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả vai trò</SelectItem>
                  <SelectItem value="employee">Nhân viên</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="doctor">Bác sĩ</SelectItem>
                  <SelectItem value="receptionist">Lễ tân</SelectItem>
                  <SelectItem value="patient">Bệnh nhân</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Vô hiệu hóa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={() => navigate("/admin/users/add")}
              className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-6"
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm người dùng
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <span className="text-sm text-gray-600">
            Hiển thị {users.length} người dùng
          </span>
        </div>

        {/* Users Table */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">
                      NGƯỜI DÙNG
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">
                      EMAIL
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">
                      VAI TRÒ
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">
                      TRẠNG THÁI
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">
                      THAO TÁC
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={user.id} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full ${getAvatarColor(user.fullName)} flex items-center justify-center text-white font-semibold text-sm`}>
                            {user.avatar ? (
                              <img 
                                src={user.avatar} 
                                alt={user.fullName}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              getAvatarInitials(user.fullName)
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user.fullName}</div>
                            {user.phone && (
                              <div className="text-sm text-gray-500">{user.phone}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-900">{user.email}</span>
                      </td>
                      <td className="py-4 px-6">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(user.isActive)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Link to={`/admin/users/${user.id}`}>
                            <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          {user.isActive ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-orange-600 hover:text-orange-800"
                              onClick={() => handleDeactivateClick(user)}
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-800"
                              onClick={() => handleActivateClick(user)}
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            onClick={() => handleDeleteClick(user)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <Button 
              variant="ghost" 
              className="flex items-center gap-2"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "ghost"}
                  size="sm"
                  className={currentPage === page ? "bg-blue-600 text-white" : ""}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
            </div>
            
            <Button 
              variant="ghost" 
              className="flex items-center gap-2"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận xóa người dùng</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn xóa người dùng <strong>{userToDelete?.fullName}</strong> ({userToDelete?.email})? 
                Hành động này không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false)
                  setUserToDelete(null)
                }}
                disabled={isDeleting}
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
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
        
        {/* Status Toggle Dialog */}
        <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Xác nhận thay đổi trạng thái</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn {userToToggle?.isActive ? "vô hiệu hóa" : "kích hoạt"} người dùng <strong>{userToToggle?.fullName}</strong>?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setStatusDialogOpen(false)
                  setUserToToggle(null)
                }}
                disabled={isTogglingStatus}
              >
                Hủy
              </Button>
              <Button
                variant={userToToggle?.isActive ? "destructive" : "default"}
                onClick={handleStatusToggleConfirm}
                disabled={isTogglingStatus}
              >
                {isTogglingStatus ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Xác nhận"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </AdminSidebar>
  )
}
