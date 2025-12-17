import { useState, useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import AdminSidebar from '@/components/sidebar/admin';
import { 
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

// --- 1. Define Data & Interfaces ---
interface Doctor {
  id: string
  name: string
  specialty: string
  doctorId: string
  experience: string
  status: "Active" | "On Leave" | "Inactive"
  avatar: string
}

const doctors: Doctor[] = [
  {
    id: "1",
    name: "Nguyen A",
    specialty: "Cardiology",
    doctorId: "D-738491",
    experience: "12 Years",
    status: "Active",
    avatar: "NA"
  },
  {
    id: "2", 
    name: "Vu B",
    specialty: "Pediatrics",
    doctorId: "D-629502",
    experience: "8 Years",
    status: "Active",
    avatar: "VB"
  },
  {
    id: "3",
    name: "Tran C",
    specialty: "Neurology", 
    doctorId: "D-847261",
    experience: "15 Years",
    status: "On Leave",
    avatar: "TC"
  },
  {
    id: "4",
    name: "Ngo D",
    specialty: "Dermatology",
    doctorId: "D-391047",
    experience: "5 Years", 
    status: "Active",
    avatar: "ND"
  },
  {
    id: "5",
    name: "Chu E",
    specialty: "Orthopedics",
    doctorId: "D-510283",
    experience: "20 Years",
    status: "Inactive",
    avatar: "CE"
  }
];

type SortOption = "name" | "experience"

export default function DoctorList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const getStatusBadge = (status: Doctor["status"]) => {
    const statusConfig = {
      "Active": "bg-green-100 text-green-800 border-green-200",
      "On Leave": "bg-yellow-100 text-yellow-800 border-yellow-200", 
      "Inactive": "bg-red-100 text-red-800 border-red-200"
    }
    
    return (
      <Badge variant="outline" className={statusConfig[status]}>
        {status}
      </Badge>
    )
  }

  const getAvatarColor = (avatar: string) => {
    const colors = {
      "NA": "bg-blue-500",
      "VB": "bg-purple-500", 
      "TC": "bg-orange-500",
      "ND": "bg-green-500",
      "CE": "bg-gray-500"
    }
    return colors[avatar as keyof typeof colors] || "bg-blue-500"
  }

  const getSortValue = (doctor: Doctor, sortBy: SortOption) => {
    switch (sortBy) {
      case "name":
        return doctor.name.toLowerCase()
      case "experience":
        return parseInt(doctor.experience.split(" ")[0])
      default:
        return doctor.name.toLowerCase()
    }
  }

  const sortedAndFilteredDoctors = doctors
    .filter(doctor => {
      return doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             doctor.doctorId.toLowerCase().includes(searchQuery.toLowerCase()) ||
             doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase())
    })
    .sort((a, b) => {
      const aValue = getSortValue(a, sortBy)
      const bValue = getSortValue(b, sortBy)
      
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue
      }
      
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc" 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }
      
      return 0
    })

  const handleSortChange = (newSortBy: SortOption) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(newSortBy)
      setSortOrder("asc")
    }
    setShowSortDropdown(false)
  }

  const getSortLabel = (sortBy: SortOption) => {
    const labels = {
      name: "Name",
      experience: "Experience", 
      specialty: "Chuyên khoa",
      status: "Trạng thái"
    }
    return labels[sortBy]
  }

  return (
    <AdminSidebar>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Doctor Records</h1>
          
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search by Name, ID, or Specialty..."
              className="pl-10 h-12 text-base bg-white border-gray-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filters and Add Doctor Button */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {/* Sort By */}
              <div className="flex items-center gap-2 relative" ref={dropdownRef}>
                <span className="text-sm text-gray-600">Sắp xếp theo:</span>
                <Button 
                  variant="outline" 
                  className="h-10"
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                >
                  {getSortLabel(sortBy)} {sortOrder === "asc" ? "↑" : "↓"}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
                
                {showSortDropdown && (
                  <div className="absolute top-12 left-0 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[150px]">
                    <div className="py-1">
                      <button
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center justify-between"
                        onClick={() => handleSortChange("name")}
                      >
                        Name
                        {sortBy === "name" && <span>{sortOrder === "asc" ? "↑" : "↓"}</span>}
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center justify-between"
                        onClick={() => handleSortChange("experience")}
                      >
                        Experience
                        {sortBy === "experience" && <span>{sortOrder === "asc" ? "↑" : "↓"}</span>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Add Doctor Button */}
            <Button className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-6">
              Add Doctor
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <span className="text-sm text-gray-600">Hiển thị {sortedAndFilteredDoctors.length} trong tổng số {doctors.length} bác sĩ</span>
        </div>

        {/* Doctor Table */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">
                      DOCTOR
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">
                      EXPERIENCE
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">
                      STATUS
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500 uppercase tracking-wider">
                      ACTION
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAndFilteredDoctors.map((doctor, index) => (
                    <tr key={doctor.id} className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full ${getAvatarColor(doctor.avatar)} flex items-center justify-center text-white font-semibold text-sm`}>
                            {doctor.avatar}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{doctor.name}</div>
                            <div className="text-sm text-gray-500">{doctor.specialty}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-900 font-mono">{doctor.doctorId}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-gray-600">{doctor.experience}</span>
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(doctor.status)}
                      </td>
                      <td className="py-4 px-6">
                        <Link to={`/admin/doctors/${doctor.id}`}>
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800">
                            Chi tiết
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <Button variant="ghost" className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            <Button variant="default" size="sm" className="bg-blue-600 text-white">1</Button>
            <Button variant="ghost" size="sm">2</Button>
            <Button variant="ghost" size="sm">3</Button>
            <span className="text-gray-500">...</span>
            <Button variant="ghost" size="sm">5</Button>
          </div>
          
          <Button variant="ghost" className="flex items-center gap-2">
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </AdminSidebar>
  );
}