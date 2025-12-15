import React, { useState } from "react"
import ReceptionistSidebar from '@/components/sidebar/recep'; // Import Sidebar
import { Search, UserPlus, Phone, Mail, Calendar, ChevronRight, Activity, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

// --- Interfaces & Data ---
interface Patient {
  id: string
  name: string
  age: number
  gender: "Male" | "Female"
  phone: string
  email: string
  lastVisit: string
  status: "active" | "inactive"
  medicalId: string
}

const patients: Patient[] = [
  { id: "1", name: "Nguyễn Văn A", age: 45, gender: "Male", phone: "+84 123 456 789", email: "nguyenvana@email.com", lastVisit: "2025-11-28", status: "active", medicalId: "MED001" },
  { id: "2", name: "Trần Thị B", age: 32, gender: "Female", phone: "+84 987 654 321", email: "tranthib@email.com", lastVisit: "2025-11-25", status: "active", medicalId: "MED002" },
  { id: "3", name: "Lê Văn C", age: 58, gender: "Male", phone: "+84 456 789 123", email: "levanc@email.com", lastVisit: "2025-11-20", status: "inactive", medicalId: "MED003" },
  { id: "4", name: "Phạm Thị D", age: 27, gender: "Female", phone: "+84 321 654 987", email: "phamthid@email.com", lastVisit: "2025-11-29", status: "active", medicalId: "MED004" },
  { id: "5", name: "Hoàng Văn E", age: 41, gender: "Male", phone: "+84 789 123 456", email: "hoangvane@email.com", lastVisit: "2025-11-15", status: "active", medicalId: "MED005" },
  { id: "6", name: "Vũ Thị F", age: 35, gender: "Female", phone: "+84 654 321 789", email: "vuthif@email.com", lastVisit: "2025-11-22", status: "inactive", medicalId: "MED006" },
]

export default function RecepPatients() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterGender, setFilterGender] = useState<"all" | "Male" | "Female">("all")

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.medicalId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone.includes(searchQuery) ||
      patient.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesGender = filterGender === "all" || patient.gender === filterGender

    return matchesSearch && matchesGender
  })

  const activePatients = patients.filter((p) => p.status === "active").length
  const totalPatients = patients.length

  return (
    // BỌC TRONG SIDEBAR
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
              <div className="text-4xl font-bold text-slate-900 mb-1">{totalPatients}</div>
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
              <div className="text-4xl font-bold text-slate-900 mb-1">{activePatients}</div>
              <p className="text-xs text-slate-500">Currently active</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg shadow-violet-500/5 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300 bg-gradient-to-br from-white to-violet-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">New This Month</CardTitle>
              <div className="h-10 w-10 rounded-full bg-violet-500/10 flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-violet-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-slate-900 mb-1">8</div>
              <p className="text-xs text-slate-500">+2 from last month</p>
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
                  placeholder="Search by name, medical ID, phone, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterGender === "all" ? "default" : "outline"}
                  onClick={() => setFilterGender("all")}
                  className={filterGender === "all" ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  All
                </Button>
                <Button
                  variant={filterGender === "Male" ? "default" : "outline"}
                  onClick={() => setFilterGender("Male")}
                  className={filterGender === "Male" ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  Male
                </Button>
                <Button
                  variant={filterGender === "Female" ? "default" : "outline"}
                  onClick={() => setFilterGender("Female")}
                  className={filterGender === "Female" ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  Female
                </Button>
              </div>
              <Button
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/30 text-white"
              >
                <UserPlus className="h-5 w-5 mr-2" />
                Add Patient
              </Button>
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
                  Showing {filteredPatients.length} of {totalPatients} patients
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Patient Info</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Medical ID</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Contact</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Last Visit</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        <Search className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                        <p className="text-lg font-medium">No patients found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredPatients.map((patient, index) => (
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
                                patient.gender === "Male"
                                  ? "bg-gradient-to-br from-blue-500 to-blue-600"
                                  : "bg-gradient-to-br from-pink-500 to-pink-600"
                              } flex items-center justify-center text-white font-semibold shadow-md text-lg`}
                            >
                              {patient.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{patient.name}</p>
                              <p className="text-sm text-slate-500">
                                {patient.age} years • {patient.gender}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {patient.medicalId}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-slate-700">
                              <Phone className="h-3.5 w-3.5 text-slate-400" />
                              {patient.phone}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Mail className="h-3.5 w-3.5 text-slate-400" />
                              {patient.email}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2 text-slate-700">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <span className="text-sm">{patient.lastVisit}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {patient.status === "active" ? (
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
                          <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">
                            View
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </ReceptionistSidebar>
  )
}