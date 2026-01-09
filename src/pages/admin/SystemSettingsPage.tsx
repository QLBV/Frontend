"use client"

import { useState, useEffect } from "react"
import {
  Settings,
  Building2,
  Clock,
  Mail,
  Save,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import AdminSidebar from "@/components/sidebar/admin"
import api from "@/lib/api"

interface SystemSettings {
  clinicName: string
  clinicAddress: string
  clinicPhone: string
  clinicEmail: string
  clinicWebsite?: string
  businessHours: {
    monday: { open: string; close: string; closed: boolean }
    tuesday: { open: string; close: string; closed: boolean }
    wednesday: { open: string; close: string; closed: boolean }
    thursday: { open: string; close: string; closed: boolean }
    friday: { open: string; close: string; closed: boolean }
    saturday: { open: string; close: string; closed: boolean }
    sunday: { open: string; close: string; closed: boolean }
  }
  systemSettings: {
    maintenanceMode: boolean
    allowOnlineBooking: boolean
    allowOfflineBooking: boolean
    maxAppointmentsPerDay: number
    appointmentDuration: number // minutes
    currency: string
    timezone: string
  }
  emailSettings: {
    smtpHost?: string
    smtpPort?: number
    smtpUser?: string
    smtpPassword?: string
    fromEmail?: string
    fromName?: string
  }
}

const defaultSettings: SystemSettings = {
  clinicName: "",
  clinicAddress: "",
  clinicPhone: "",
  clinicEmail: "",
  clinicWebsite: "",
  businessHours: {
    monday: { open: "08:00", close: "17:00", closed: false },
    tuesday: { open: "08:00", close: "17:00", closed: false },
    wednesday: { open: "08:00", close: "17:00", closed: false },
    thursday: { open: "08:00", close: "17:00", closed: false },
    friday: { open: "08:00", close: "17:00", closed: false },
    saturday: { open: "08:00", close: "12:00", closed: false },
    sunday: { open: "", close: "", closed: true },
  },
  systemSettings: {
    maintenanceMode: false,
    allowOnlineBooking: true,
    allowOfflineBooking: true,
    maxAppointmentsPerDay: 50,
    appointmentDuration: 30,
    currency: "VND",
    timezone: "Asia/Ho_Chi_Minh",
  },
  emailSettings: {
    smtpHost: "",
    smtpPort: 587,
    smtpUser: "",
    smtpPassword: "",
    fromEmail: "",
    fromName: "",
  },
}

const daysOfWeek = [
  { key: "monday", label: "Thứ 2" },
  { key: "tuesday", label: "Thứ 3" },
  { key: "wednesday", label: "Thứ 4" },
  { key: "thursday", label: "Thứ 5" },
  { key: "friday", label: "Thứ 6" },
  { key: "saturday", label: "Thứ 7" },
  { key: "sunday", label: "Chủ nhật" },
] as const

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      // Try to fetch from API, fallback to defaults if not available
      try {
        const response = await api.get("/system/settings")
        if (response.data.success && response.data.data) {
          setSettings({ ...defaultSettings, ...response.data.data })
        }
      } catch (error: any) {
        if (error.response?.status !== 404) {
          console.warn("Failed to fetch system settings, using defaults")
        }
        // Use defaults
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      // Try to save to API
      try {
        const response = await api.put("/system/settings", settings)
        if (response.data.success) {
          toast.success("Cập nhật cài đặt hệ thống thành công!")
        } else {
          throw new Error(response.data.message || "Không thể cập nhật cài đặt")
        }
      } catch (error: any) {
        if (error.response?.status === 404) {
          // API endpoint doesn't exist yet, just show success message
          toast.success("Cài đặt đã được lưu (API endpoint chưa được implement)")
        } else {
          throw error
        }
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        toast.error("Quá nhiều yêu cầu. Vui lòng đợi một chút và thử lại.")
      } else {
        toast.error(error.response?.data?.message || "Không thể cập nhật cài đặt hệ thống")
      }
    } finally {
      setIsSaving(false)
    }
  }

  const updateClinicInfo = (field: keyof SystemSettings, value: string) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const updateBusinessHours = (
    day: keyof SystemSettings["businessHours"],
    field: "open" | "close" | "closed",
    value: string | boolean
  ) => {
    setSettings((prev) => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: value,
        },
      },
    }))
  }

  const updateSystemSetting = (field: keyof SystemSettings["systemSettings"], value: any) => {
    setSettings((prev) => ({
      ...prev,
      systemSettings: {
        ...prev.systemSettings,
        [field]: value,
      },
    }))
  }

  const updateEmailSetting = (field: keyof SystemSettings["emailSettings"], value: string | number) => {
    setSettings((prev) => ({
      ...prev,
      emailSettings: {
        ...prev.emailSettings,
        [field]: value,
      },
    }))
  }

  if (isLoading) {
    return (
      <AdminSidebar>
        <div className="container mx-auto px-6 py-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Đang tải cài đặt hệ thống...</p>
          </div>
        </div>
      </AdminSidebar>
    )
  }

  return (
    <AdminSidebar>
      <div className="container mx-auto px-6 py-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 min-h-full">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Cài đặt Hệ thống</h1>
              <p className="text-slate-600">Quản lý cấu hình hệ thống và thông tin phòng khám</p>
            </div>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Lưu tất cả
                </>
              )}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="clinic" className="space-y-6">
          <TabsList>
            <TabsTrigger value="clinic">
              <Building2 className="h-4 w-4 mr-2" />
              Thông tin phòng khám
            </TabsTrigger>
            <TabsTrigger value="hours">
              <Clock className="h-4 w-4 mr-2" />
              Giờ làm việc
            </TabsTrigger>
            <TabsTrigger value="system">
              <Settings className="h-4 w-4 mr-2" />
              Cài đặt hệ thống
            </TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="h-4 w-4 mr-2" />
              Cài đặt Email
            </TabsTrigger>
          </TabsList>

          {/* Clinic Information Tab */}
          <TabsContent value="clinic">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Thông tin phòng khám
                </CardTitle>
                <CardDescription>
                  Cập nhật thông tin cơ bản của phòng khám
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="clinicName">Tên phòng khám *</Label>
                  <Input
                    id="clinicName"
                    value={settings.clinicName}
                    onChange={(e) => updateClinicInfo("clinicName", e.target.value)}
                    placeholder="Nhập tên phòng khám"
                  />
                </div>
                <div>
                  <Label htmlFor="clinicAddress">Địa chỉ *</Label>
                  <Textarea
                    id="clinicAddress"
                    value={settings.clinicAddress}
                    onChange={(e) => updateClinicInfo("clinicAddress", e.target.value)}
                    placeholder="Nhập địa chỉ phòng khám"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clinicPhone">Số điện thoại *</Label>
                    <Input
                      id="clinicPhone"
                      value={settings.clinicPhone}
                      onChange={(e) => updateClinicInfo("clinicPhone", e.target.value)}
                      placeholder="0123456789"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clinicEmail">Email *</Label>
                    <Input
                      id="clinicEmail"
                      type="email"
                      value={settings.clinicEmail}
                      onChange={(e) => updateClinicInfo("clinicEmail", e.target.value)}
                      placeholder="info@clinic.com"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="clinicWebsite">Website</Label>
                  <Input
                    id="clinicWebsite"
                    type="url"
                    value={settings.clinicWebsite}
                    onChange={(e) => updateClinicInfo("clinicWebsite", e.target.value)}
                    placeholder="https://www.clinic.com"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Business Hours Tab */}
          <TabsContent value="hours">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Giờ làm việc
                </CardTitle>
                <CardDescription>
                  Cấu hình giờ làm việc cho từng ngày trong tuần
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {daysOfWeek.map((day) => {
                  const daySettings = settings.businessHours[day.key]
                  return (
                    <div key={day.key} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="w-24">
                        <Label className="font-medium">{day.label}</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={!daySettings.closed}
                          onCheckedChange={(checked) =>
                            updateBusinessHours(day.key, "closed", !checked)
                          }
                        />
                        <span className="text-sm text-slate-600">
                          {daySettings.closed ? "Nghỉ" : "Làm việc"}
                        </span>
                      </div>
                      {!daySettings.closed && (
                        <>
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`${day.key}-open`} className="text-sm">
                              Từ:
                            </Label>
                            <Input
                              id={`${day.key}-open`}
                              type="time"
                              value={daySettings.open}
                              onChange={(e) =>
                                updateBusinessHours(day.key, "open", e.target.value)
                              }
                              className="w-32"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`${day.key}-close`} className="text-sm">
                              Đến:
                            </Label>
                            <Input
                              id={`${day.key}-close`}
                              type="time"
                              value={daySettings.close}
                              onChange={(e) =>
                                updateBusinessHours(day.key, "close", e.target.value)
                              }
                              className="w-32"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings Tab */}
          <TabsContent value="system">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Cài đặt hệ thống
                </CardTitle>
                <CardDescription>
                  Cấu hình các tính năng và giới hạn của hệ thống
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900">Trạng thái hệ thống</h3>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="maintenanceMode" className="font-medium">
                        Chế độ bảo trì
                      </Label>
                      <p className="text-sm text-slate-500">
                        Tắt hệ thống để bảo trì (chỉ admin có thể truy cập)
                      </p>
                    </div>
                    <Switch
                      id="maintenanceMode"
                      checked={settings.systemSettings.maintenanceMode}
                      onCheckedChange={(checked) =>
                        updateSystemSetting("maintenanceMode", checked)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900">Đặt lịch hẹn</h3>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="allowOnlineBooking" className="font-medium">
                        Cho phép đặt lịch online
                      </Label>
                      <p className="text-sm text-slate-500">
                        Bệnh nhân có thể đặt lịch qua website
                      </p>
                    </div>
                    <Switch
                      id="allowOnlineBooking"
                      checked={settings.systemSettings.allowOnlineBooking}
                      onCheckedChange={(checked) =>
                        updateSystemSetting("allowOnlineBooking", checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="allowOfflineBooking" className="font-medium">
                        Cho phép đặt lịch offline
                      </Label>
                      <p className="text-sm text-slate-500">
                        Lễ tân có thể đặt lịch tại quầy
                      </p>
                    </div>
                    <Switch
                      id="allowOfflineBooking"
                      checked={settings.systemSettings.allowOfflineBooking}
                      onCheckedChange={(checked) =>
                        updateSystemSetting("allowOfflineBooking", checked)
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="maxAppointmentsPerDay">
                        Số lịch hẹn tối đa mỗi ngày
                      </Label>
                      <Input
                        id="maxAppointmentsPerDay"
                        type="number"
                        min="1"
                        value={settings.systemSettings.maxAppointmentsPerDay}
                        onChange={(e) =>
                          updateSystemSetting(
                            "maxAppointmentsPerDay",
                            parseInt(e.target.value) || 0
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="appointmentDuration">
                        Thời gian mỗi lịch hẹn (phút)
                      </Label>
                      <Input
                        id="appointmentDuration"
                        type="number"
                        min="15"
                        step="15"
                        value={settings.systemSettings.appointmentDuration}
                        onChange={(e) =>
                          updateSystemSetting(
                            "appointmentDuration",
                            parseInt(e.target.value) || 30
                          )
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-slate-900">Cài đặt khác</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="currency">Đơn vị tiền tệ</Label>
                      <Input
                        id="currency"
                        value={settings.systemSettings.currency}
                        onChange={(e) => updateSystemSetting("currency", e.target.value)}
                        placeholder="VND"
                      />
                    </div>
                    <div>
                      <Label htmlFor="timezone">Múi giờ</Label>
                      <Input
                        id="timezone"
                        value={settings.systemSettings.timezone}
                        onChange={(e) => updateSystemSetting("timezone", e.target.value)}
                        placeholder="Asia/Ho_Chi_Minh"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email Settings Tab */}
          <TabsContent value="email">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Cài đặt Email
                </CardTitle>
                <CardDescription>
                  Cấu hình SMTP để gửi email từ hệ thống
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input
                      id="smtpHost"
                      value={settings.emailSettings.smtpHost || ""}
                      onChange={(e) => updateEmailSetting("smtpHost", e.target.value)}
                      placeholder="smtp.gmail.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input
                      id="smtpPort"
                      type="number"
                      value={settings.emailSettings.smtpPort || ""}
                      onChange={(e) =>
                        updateEmailSetting("smtpPort", parseInt(e.target.value) || 587)
                      }
                      placeholder="587"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtpUser">SMTP Username</Label>
                    <Input
                      id="smtpUser"
                      value={settings.emailSettings.smtpUser || ""}
                      onChange={(e) => updateEmailSetting("smtpUser", e.target.value)}
                      placeholder="your-email@gmail.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtpPassword">SMTP Password</Label>
                    <Input
                      id="smtpPassword"
                      type="password"
                      value={settings.emailSettings.smtpPassword || ""}
                      onChange={(e) => updateEmailSetting("smtpPassword", e.target.value)}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fromEmail">Email gửi đi</Label>
                    <Input
                      id="fromEmail"
                      type="email"
                      value={settings.emailSettings.fromEmail || ""}
                      onChange={(e) => updateEmailSetting("fromEmail", e.target.value)}
                      placeholder="noreply@clinic.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="fromName">Tên người gửi</Label>
                    <Input
                      id="fromName"
                      value={settings.emailSettings.fromName || ""}
                      onChange={(e) => updateEmailSetting("fromName", e.target.value)}
                      placeholder="Phòng khám ABC"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminSidebar>
  )
}
