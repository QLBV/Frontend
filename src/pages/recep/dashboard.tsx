import React from 'react';
import ReceptionistSidebar from '@/components/sidebar/recep';
import { 
  Calendar, 
  Users, 
  TrendingUp, 
  Clock, 
  ChevronRight, 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// --- 1. Define Data & Interfaces ---
interface Appointment {
  id: string
  patientName: string
  time: string
  doctor: string
  status: "arrived" | "examining" | "cancelled" | "waiting"
}

const appointments: Appointment[] = [
  { id: "1", patientName: "Vũ A", time: "10:00", doctor: "BS.Nguyễn A", status: "arrived" },
  { id: "2", patientName: "Vũ B", time: "11:00", doctor: "BS.Nguyễn B", status: "examining" },
  { id: "3", patientName: "Vũ C", time: "15:00", doctor: "BS.Nguyễn C", status: "cancelled" },
  { id: "4", patientName: "Vũ D", time: "09:30", doctor: "BS.Nguyễn A", status: "waiting" },
  { id: "5", patientName: "Vũ E", time: "14:00", doctor: "BS.Nguyễn D", status: "arrived" },
];

export default function RecepDashboard() {
  
  // --- 2. Helper Function for Badges ---
  const getStatusBadge = (status: Appointment["status"]) => {
    const statusConfig = {
      arrived: {
        label: "Đã đến",
        className: "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 border-emerald-200",
      },
      examining: { label: "Đang khám", className: "bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 border-blue-200" },
      cancelled: { label: "Hủy", className: "bg-red-500/10 text-red-700 hover:bg-red-500/20 border-red-200" },
      waiting: {
        label: "Chờ khám",
        className: "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border-amber-200",
      },
    }

    const config = statusConfig[status]
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    )
  }

  return (
    // --- 3. WRAP EVERYTHING IN THE SIDEBAR ---
    <ReceptionistSidebar>
      
      {/* Đây là nội dung chính (Page Content) */}
      <div className="space-y-8">
        
        {/* Page Header Section */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard Overview</h1>
          <p className="text-slate-600 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Sunday, 30 November 2025
          </p>
        </div>

        {/* Stats Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Today's Appointments */}
          <Card className="border-0 shadow-lg shadow-blue-500/5 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 bg-gradient-to-br from-white to-blue-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Lịch hẹn hôm nay</CardTitle>
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-slate-900 mb-1">20</div>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +12% from yesterday
              </p>
            </CardContent>
          </Card>

          {/* Card 2: Patients Waiting */}
          <Card className="border-0 shadow-lg shadow-emerald-500/5 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 bg-gradient-to-br from-white to-emerald-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Bệnh nhân chờ khám</CardTitle>
              <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-slate-900 mb-1">12</div>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Average wait: 15 mins
              </p>
            </CardContent>
          </Card>

          {/* Card 3: Revenue */}
          <Card className="border-0 shadow-lg shadow-violet-500/5 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300 bg-gradient-to-br from-white to-violet-50/30">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Doanh thu tạm tính</CardTitle>
              <div className="h-10 w-10 rounded-full bg-violet-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-violet-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900 mb-1">30.000.000 đ</div>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +8% from last week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Waiting List Table Section */}
        <Card className="border-0 shadow-xl shadow-slate-900/5 overflow-hidden bg-white">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/50 border-b p-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-slate-900">Danh sách đợi</CardTitle>
                <p className="text-sm text-slate-600 mt-1">Quản lý và theo dõi trạng thái bệnh nhân</p>
              </div>
              <Button
                size="sm"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/30 text-white"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Thêm lịch hẹn
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Tên bệnh nhân</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Thời gian</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Bác sĩ</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Trạng thái</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment, index) => (
                    <tr
                      key={appointment.id}
                      className={`border-b hover:bg-blue-50/30 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold shadow-md">
                            {appointment.patientName.charAt(0)}
                          </div>
                          <span className="font-medium text-slate-900">{appointment.patientName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-slate-700">
                          <Clock className="h-4 w-4 text-slate-400" />
                          {appointment.time}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-700">{appointment.doctor}</td>
                      <td className="py-4 px-6">{getStatusBadge(appointment.status)}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {appointment.status === "arrived" ? (
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all text-white"
                            >
                              Check-in
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              Chi tiết
                              <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </ReceptionistSidebar>
  );
}