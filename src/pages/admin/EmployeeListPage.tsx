import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import AdminSidebar from '@/components/sidebar/admin';
import { 
  Search,
  Trash2,
  Loader2,
  Plus,
  Ban,
  UserCheck,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { EmployeeService, type Employee } from "@/services/employee.service";

export default function EmployeeListPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  // Status toggle dialog states
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [employeeToToggle, setEmployeeToToggle] = useState<Employee | null>(null)
  const [isTogglingStatus, setIsTogglingStatus] = useState(false)
  
  const itemsPerPage = 10

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (searchQuery) params.search = searchQuery
      if (roleFilter !== "all") params.roleId = parseInt(roleFilter)
      
      const data = await EmployeeService.getEmployees(params)
      setEmployees(data)
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Không thể tải danh sách nhân viên")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [roleFilter])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEmployees()
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant="outline" className={isActive ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"}>
        {isActive ? "Active" : "Inactive"}
      </Badge>
    )
  }

  const getRoleBadge = (role: any) => {
    const config: any = {
      admin: { label: "Admin", className: "bg-purple-100 text-purple-800 border-purple-200" },
      doctor: { label: "Bác sĩ", className: "bg-blue-100 text-blue-800 border-blue-200" },
      receptionist: { label: "Lễ tân", className: "bg-orange-100 text-orange-800 border-orange-200" },
    }
    const roleName = (typeof role === "string" ? role : role?.name || "staff").toLowerCase()
    const item = config[roleName] || {
      label: roleName.toUpperCase(),
      className: "bg-gray-100 text-gray-800 border-gray-200",
    }
    return (
      <Badge variant="outline" className={item.className}>
        {item.label}
      </Badge>
    )
  }

  // Pagination logic
  const totalPages = Math.ceil(employees.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentEmployees = employees.slice(startIndex, startIndex + itemsPerPage)

  const handleDeleteClick = (employee: Employee) => {
    setEmployeeToDelete(employee)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!employeeToDelete) return
    try {
      setIsDeleting(true)
      await EmployeeService.deleteEmployee(employeeToDelete.id)
      toast.success("Xóa nhân viên thành công!")
      setDeleteDialogOpen(false)
      fetchEmployees()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể xóa nhân viên")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleStatusClick = (emp: Employee) => {
    setEmployeeToToggle(emp)
    setStatusDialogOpen(true)
  }

  const handleToggleStatusConfirm = async () => {
    if (!employeeToToggle) return
    try {
      setIsTogglingStatus(true)
      const newStatus = !employeeToToggle.isActive;
      await EmployeeService.updateEmployee(employeeToToggle.id, { isActive: newStatus });
      toast.success(`${newStatus ? "Kích hoạt" : "Vô hiệu hóa"} tài khoản thành công!`);
      setStatusDialogOpen(false)
      setEmployeeToToggle(null)
      fetchEmployees();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể cập nhật trạng thái");
    } finally {
      setIsTogglingStatus(false)
    }
  }

  return (
    <AdminSidebar>
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Employee Management</h1>
            <p className="text-gray-500 mt-1">Manage all clinic staff (Doctors, Receptionists, Admins)</p>
          </div>
          <Button onClick={() => navigate("/admin/users/add")} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search by name, email, or code..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="1">Admin</SelectItem>
              <SelectItem value="4">Doctor</SelectItem>
              <SelectItem value="2">Receptionist</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50/50">
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase">Employee</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase">Code</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase">Role</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase">Phone</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase">Position</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-20 text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-2" />
                        <p className="text-gray-500">Loading employees...</p>
                      </td>
                    </tr>
                  ) : currentEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-20 text-center text-gray-500">
                        No employees found
                      </td>
                    </tr>
                  ) : (
                    currentEmployees.map((emp) => (
                      <tr key={emp.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                              {emp.user.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{emp.user.fullName}</div>
                              <div className="text-xs text-gray-500">{emp.user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-mono text-sm">{emp.employeeCode}</td>
                        <td className="py-4 px-6">{getRoleBadge(emp.user.role)}</td>
                        <td className="py-4 px-6 text-sm text-gray-600">{emp.phone || "-"}</td>
                        <td className="py-4 px-6 text-sm text-gray-600">{emp.position || "-"}</td>
                        <td className="py-4 px-6">{getStatusBadge(emp.isActive)}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600"
                              onClick={() => navigate(`/admin/employees/${emp.id}`)}
                            >
                              Details
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={emp.isActive ? "text-amber-600 hover:text-amber-700 hover:bg-amber-50" : "text-green-600 hover:text-green-700 hover:bg-green-50"}
                              onClick={() => handleToggleStatusClick(emp)}
                              title={emp.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
                            >
                              {emp.isActive ? <Ban className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteClick(emp)}
                              title="Xóa vĩnh viễn"
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
              Previous
            </Button>
            <div className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        )}

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete employee <strong>{employeeToDelete?.user.fullName}</strong>? 
                This will remove their profile but keep their account for audit purposes.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Status Toggle Confirmation Dialog */}
        <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {employeeToToggle?.isActive ? "Vô hiệu hóa tài khoản" : "Kích hoạt tài khoản"}
              </DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn {employeeToToggle?.isActive ? "vô hiệu hóa" : "kích hoạt"} tài khoản của nhân viên{" "}
                <strong>{employeeToToggle?.user.fullName}</strong>?
                {employeeToToggle?.isActive && (
                  <span className="block mt-2 text-amber-600">
                    Nhân viên sẽ không thể đăng nhập vào hệ thống sau khi bị vô hiệu hóa.
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setStatusDialogOpen(false)
                  setEmployeeToToggle(null)
                }}
                disabled={isTogglingStatus}
              >
                Hủy
              </Button>
              <Button
                variant={employeeToToggle?.isActive ? "destructive" : "default"}
                onClick={handleToggleStatusConfirm}
                disabled={isTogglingStatus}
                className={!employeeToToggle?.isActive ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {isTogglingStatus ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    {employeeToToggle?.isActive ? (
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
      </div>
    </AdminSidebar>
  )
}
