"use client"

import { useState } from "react"
import { DollarSign, Users, Calendar, Activity, Search, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Link } from "react-router-dom"
import { Label } from "@/components/ui/label"

interface SalaryRecord {
  id: string
  employeeId: string
  employeeName: string
  role: "doctor" | "receptionist"
  baseSalary: number
  coefficient: number
  experience: number
  commission?: number
  totalAppointments?: number
  month: string
  totalSalary: number
}

const mockSalaries: SalaryRecord[] = [
  {
    id: "1",
    employeeId: "DOC001",
    employeeName: "BS. Trần Thị B",
    role: "doctor",
    baseSalary: 15000000,
    coefficient: 2.5,
    experience: 5,
    commission: 1500000,
    totalAppointments: 60,
    month: "2025-11",
    totalSalary: 39000000,
  },
  {
    id: "2",
    employeeId: "DOC002",
    employeeName: "BS. Nguyễn Văn D",
    role: "doctor",
    baseSalary: 15000000,
    coefficient: 2.0,
    experience: 3,
    commission: 1200000,
    totalAppointments: 48,
    month: "2025-11",
    totalSalary: 31200000,
  },
  {
    id: "3",
    employeeId: "REC001",
    employeeName: "Lê Thị E",
    role: "receptionist",
    baseSalary: 8000000,
    coefficient: 1.5,
    experience: 2,
    month: "2025-11",
    totalSalary: 12200000,
  },
]

export default function SalaryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedMonth, setSelectedMonth] = useState("2025-11")
  const [baseSalaryDoctor, setBaseSalaryDoctor] = useState(15000000)
  const [baseSalaryReceptionist, setBaseSalaryReceptionist] = useState(8000000)

  const filteredSalaries = mockSalaries.filter(
    (salary) =>
      (salary.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        salary.employeeId.toLowerCase().includes(searchQuery.toLowerCase())) &&
      salary.month === selectedMonth,
  )

  const totalSalaryPayout = filteredSalaries.reduce((sum, s) => sum + s.totalSalary, 0)
  const totalDoctors = filteredSalaries.filter((s) => s.role === "doctor").length
  const totalReceptionists = filteredSalaries.filter((s) => s.role === "receptionist").length

  const calculateSalary = (record: SalaryRecord) => {
    const experienceBonus = record.experience * 500000
    const baseSalary = record.baseSalary * record.coefficient
    const commission = record.commission || 0
    return baseSalary + experienceBonus + commission
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                HealthCare Plus
              </span>
            </Link>
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Quản lý lương</h1>
          <p className="text-slate-600">Tính lương nhân viên và theo dõi hoa hồng</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-emerald-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Tổng chi lương</CardTitle>
              <DollarSign className="h-5 w-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{totalSalaryPayout.toLocaleString()} VND</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Bác sĩ</CardTitle>
              <Users className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{totalDoctors}</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-violet-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Lễ tân</CardTitle>
              <Users className="h-5 w-5 text-violet-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{totalReceptionists}</div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-amber-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Tháng</CardTitle>
              <Calendar className="h-5 w-5 text-amber-600" />
            </CardHeader>
            <CardContent>
              <Input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
            </CardContent>
          </Card>
        </div>

        {/* Base Salary Config (Admin Only) */}
        <Card className="border-0 shadow-xl mb-6">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b">
            <CardTitle className="text-xl">Cấu hình lương cơ bản (Admin)</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="doctor-salary">Lương cơ bản bác sĩ</Label>
                <Input
                  id="doctor-salary"
                  type="number"
                  value={baseSalaryDoctor}
                  onChange={(e) => setBaseSalaryDoctor(Number(e.target.value))}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="receptionist-salary">Lương cơ bản lễ tân</Label>
                <Input
                  id="receptionist-salary"
                  type="number"
                  value={baseSalaryReceptionist}
                  onChange={(e) => setBaseSalaryReceptionist(Number(e.target.value))}
                  className="mt-2"
                />
              </div>
            </div>
            <p className="text-sm text-slate-600 mt-4">
              Công thức:{" "}
              <strong>Lương = (Lương cơ bản × Hệ số) + (Kinh nghiệm × 500,000) + Hoa hồng (5% bác sĩ)</strong>
            </p>
          </CardContent>
        </Card>

        {/* Search */}
        <Card className="border-0 shadow-xl mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Tìm kiếm theo tên hoặc mã nhân viên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Salary List */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b">
            <CardTitle className="text-2xl">Bảng lương tháng {selectedMonth}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Mã NV</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Họ tên</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Chức vụ</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Hệ số</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Kinh nghiệm</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Hoa hồng</th>
                    <th className="text-right py-4 px-6 text-sm font-semibold text-slate-700">Tổng lương</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSalaries.map((salary, index) => (
                    <tr
                      key={salary.id}
                      className={`border-b hover:bg-blue-50/30 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                      }`}
                    >
                      <td className="py-4 px-6 font-medium text-blue-600">{salary.employeeId}</td>
                      <td className="py-4 px-6 text-slate-900 font-medium">{salary.employeeName}</td>
                      <td className="py-4 px-6">
                        <Badge
                          variant="outline"
                          className={salary.role === "doctor" ? "border-blue-300" : "border-violet-300"}
                        >
                          {salary.role === "doctor" ? "Bác sĩ" : "Lễ tân"}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-slate-700">{salary.coefficient}</td>
                      <td className="py-4 px-6 text-slate-700">{salary.experience} năm</td>
                      <td className="py-4 px-6 text-slate-700">
                        {salary.commission ? `${salary.commission.toLocaleString()} VND` : "-"}
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-emerald-600">
                        {salary.totalSalary.toLocaleString()} VND
                      </td>
                      <td className="py-4 px-6">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/salary/${salary.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
