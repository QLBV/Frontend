import React, { useState, useEffect } from "react"
import ReceptionistSidebar from '@/components/sidebar/recep'
import { Search, UserPlus, Phone, Mail, Calendar, ChevronRight, Activity, Filter, Loader2, X, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { getPatients, type Patient } from "@/services/patient.service"
import { SearchService } from "@/services/search.service"
import { format } from "date-fns"

export default function RecepPatients() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterGender, setFilterGender] = useState<"all" | "MALE" | "FEMALE" | "OTHER">("all")
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  })

  // Advanced search dialog
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState({
    keyword: "",
    profileKeyword: "",
    gender: "all" as "all" | "MALE" | "FEMALE" | "OTHER",
    isActive: undefined as boolean | undefined,
    dateOfBirthFrom: "",
    dateOfBirthTo: "",
    createdFrom: "",
    createdTo: "",
  })

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
  })

  // Fetch patients on mount and when pagination changes
  useEffect(() => {
    if (!isAdvancedSearchOpen && !searchQuery.trim()) {
      fetchPatients()
    }
  }, [pagination.page, filterGender, isAdvancedSearchOpen])

  const fetchPatients = async () => {
    try {
      setIsLoading(true)
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      }
      
      if (searchQuery.trim()) {
        params.search = searchQuery
      }

      const response = await getPatients(params)
      let filtered = response.patients || []

      // Apply gender filter if not "all"
      if (filterGender !== "all") {
        filtered = filtered.filter((p) => p.gender === filterGender)
      }

      setPatients(filtered)
      setPagination(response.pagination || pagination)
      
      // Calculate stats
      setStats({
        total: response.pagination?.total || filtered.length,
        active: filtered.filter((p) => p.isActive).length,
      })
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tải danh sách bệnh nhân")
      setPatients([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdvancedSearch = async () => {
    try {
      setIsSearching(true)
      const filters: any = {
        page: 1,
        limit: pagination.limit,
      }

      if (advancedFilters.keyword) filters.keyword = advancedFilters.keyword
      if (advancedFilters.profileKeyword) filters.profileKeyword = advancedFilters.profileKeyword
      if (advancedFilters.gender) filters.gender = advancedFilters.gender
      if (advancedFilters.isActive !== undefined) filters.isActive = advancedFilters.isActive
      if (advancedFilters.dateOfBirthFrom) filters.dateOfBirthFrom = advancedFilters.dateOfBirthFrom
      if (advancedFilters.dateOfBirthTo) filters.dateOfBirthTo = advancedFilters.dateOfBirthTo
      if (advancedFilters.createdFrom) filters.createdFrom = advancedFilters.createdFrom
      if (advancedFilters.createdTo) filters.createdTo = advancedFilters.createdTo

      const response = await SearchService.searchPatients(filters)
      setPatients(response.data || [])
      setPagination(response.pagination || pagination)
      setIsAdvancedSearchOpen(false)
      toast.success(`Tìm thấy ${response.data?.length || 0} bệnh nhân`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tìm kiếm bệnh nhân")
    } finally {
      setIsSearching(false)
    }
  }

  const handleQuickSearch = async () => {
    if (!searchQuery.trim()) {
      fetchPatients()
      return
    }

    try {
      setIsSearching(true)
      const response = await SearchService.searchPatients({
        keyword: searchQuery,
        page: 1,
        limit: pagination.limit,
      })
      setPatients(response.data || [])
      setPagination(response.pagination || pagination)
      toast.success(`Tìm thấy ${response.data?.length || 0} bệnh nhân`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể tìm kiếm bệnh nhân")
    } finally {
      setIsSearching(false)
    }
  }

  const clearAdvancedSearch = () => {
    setAdvancedFilters({
      keyword: "",
      profileKeyword: "",
      gender: "all",
      isActive: undefined,
      dateOfBirthFrom: "",
      dateOfBirthTo: "",
      createdFrom: "",
      createdTo: "",
    })
    fetchPatients()
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const getPatientPhone = (patient: Patient) => {
    const phoneProfile = patient.profiles?.find((p) => p.type === "phone")
    return phoneProfile?.value || patient.phone || "N/A"
  }

  const getPatientEmail = (patient: Patient) => {
    const emailProfile = patient.profiles?.find((p) => p.type === "email")
    return emailProfile?.value || patient.email || "N/A"
  }

  return (
    <ReceptionistSidebar>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Patient Management</h1>
          <p className="text-slate-600">Search, view, and manage patient records</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg shadow-blue-500/5 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Patients</CardTitle>
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-slate-900 mb-1">{stats.total || 0}</div>
              <p className="text-xs text-slate-500">Registered patients</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg shadow-emerald-500/5 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 bg-gradient-to-br from-white to-emerald-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Active Patients</CardTitle>
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-slate-900 mb-1">{stats.active || 0}</div>
              <p className="text-xs text-slate-500">Currently active</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg shadow-violet-500/5 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300 bg-gradient-to-br from-white to-violet-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Search Results</CardTitle>
              <div className="h-10 w-10 rounded-full bg-violet-500/10 flex items-center justify-center">
                <Search className="h-5 w-5 text-violet-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-slate-900 mb-1">{patients.length}</div>
              <p className="text-xs text-slate-500">Current view</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter Section */}
        <Card className="border-0 shadow-xl shadow-slate-900/5">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search by name, patient code, phone, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleQuickSearch()
                    }
                  }}
                  className="pl-10 h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterGender === "all" ? "default" : "outline"}
                  onClick={() => {
                    setFilterGender("all")
                    setPagination({ ...pagination, page: 1 })
                  }}
                  className={filterGender === "all" ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  All
                </Button>
                <Button
                  variant={filterGender === "MALE" ? "default" : "outline"}
                  onClick={() => {
                    setFilterGender("MALE")
                    setPagination({ ...pagination, page: 1 })
                  }}
                  className={filterGender === "MALE" ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  Male
                </Button>
                <Button
                  variant={filterGender === "FEMALE" ? "default" : "outline"}
                  onClick={() => {
                    setFilterGender("FEMALE")
                    setPagination({ ...pagination, page: 1 })
                  }}
                  className={filterGender === "FEMALE" ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  Female
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsAdvancedSearchOpen(true)}
                  className="border-blue-200 hover:bg-blue-50"
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patient List Table */}
        <Card className="border-0 shadow-xl shadow-slate-900/5 overflow-hidden bg-white">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-slate-900">Patient List</CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  Showing {patients.length} of {pagination.total || patients.length} patients
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="py-12 text-center">
                <Loader2 className="h-12 w-12 mx-auto mb-3 text-blue-600 animate-spin" />
                <p className="text-slate-500">Đang tải dữ liệu...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b">
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Patient Info</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Patient Code</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Contact</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Date of Birth</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Status</th>
                      <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-slate-500">
                          <Search className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                          <p className="text-lg font-medium">No patients found</p>
                          <p className="text-sm text-slate-400 mt-1">
                            Try adjusting your search or filters
                          </p>
                        </td>
                      </tr>
                    ) : (
                      patients.map((patient, index) => (
                        <tr
                          key={patient.id}
                          className={`border-b hover:bg-blue-50/30 transition-colors ${
                            index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                          }`}
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div
                                className={`h-12 w-12 rounded-full ${
                                  patient.gender === "MALE"
                                    ? "bg-gradient-to-br from-blue-500 to-blue-600"
                                    : patient.gender === "FEMALE"
                                    ? "bg-gradient-to-br from-pink-500 to-pink-600"
                                    : "bg-gradient-to-br from-purple-500 to-purple-600"
                                } flex items-center justify-center text-white font-semibold shadow-md text-lg`}
                              >
                                {patient.fullName.charAt(0)}
                              </div>
                              <div>
                                <p className="font-semibold text-slate-900">{patient.fullName}</p>
                                <p className="text-sm text-slate-500">
                                  {calculateAge(patient.dateOfBirth)} years • {patient.gender}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              {patient.patientCode}
                            </Badge>
                          </td>
                          <td className="py-4 px-6">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm text-slate-700">
                                <Phone className="h-3.5 w-3.5 text-slate-400" />
                                {getPatientPhone(patient)}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Mail className="h-3.5 w-3.5 text-slate-400" />
                                {getPatientEmail(patient)}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2 text-slate-700">
                              <Calendar className="h-4 w-4 text-slate-400" />
                              <span className="text-sm">{format(new Date(patient.dateOfBirth), "dd/MM/yyyy")}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            {patient.isActive ? (
                              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-200">
                                Active
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-slate-500/10 text-slate-700 border-slate-200">
                                Inactive
                              </Badge>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              asChild
                            >
                              <Link to={`/recep/patients/${patient.id}`}>
                                View Details
                                <ChevronRight className="h-4 w-4 ml-1" />
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
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

        {/* Advanced Search Dialog */}
        <Dialog open={isAdvancedSearchOpen} onOpenChange={setIsAdvancedSearchOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Advanced Search</DialogTitle>
              <DialogDescription>
                Tìm kiếm bệnh nhân với các bộ lọc chi tiết
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="keyword">Keyword</Label>
                  <Input
                    id="keyword"
                    placeholder="Name, patient code..."
                    value={advancedFilters.keyword}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, keyword: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="profileKeyword">Profile Keyword</Label>
                  <Input
                    id="profileKeyword"
                    placeholder="Phone, email, address..."
                    value={advancedFilters.profileKeyword}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, profileKeyword: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    value={advancedFilters.gender}
                    onValueChange={(value) => setAdvancedFilters({ ...advancedFilters, gender: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="isActive">Status</Label>
                  <Select
                    value={advancedFilters.isActive === undefined ? "all" : advancedFilters.isActive.toString()}
                    onValueChange={(value) => setAdvancedFilters({ ...advancedFilters, isActive: value === "all" ? undefined : value === "true" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dateOfBirthFrom">Date of Birth From</Label>
                  <Input
                    id="dateOfBirthFrom"
                    type="date"
                    value={advancedFilters.dateOfBirthFrom}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, dateOfBirthFrom: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirthTo">Date of Birth To</Label>
                  <Input
                    id="dateOfBirthTo"
                    type="date"
                    value={advancedFilters.dateOfBirthTo}
                    onChange={(e) => setAdvancedFilters({ ...advancedFilters, dateOfBirthTo: e.target.value })}
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
    </ReceptionistSidebar>
  )
}
