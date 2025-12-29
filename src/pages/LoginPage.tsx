import type React from "react"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, Mail, Heart } from "lucide-react"
import { loginApi } from "@/auth/auth.service"
import { useAuth } from "@/auth/authContext" 

// type LoginType = "patient" | "staff"

//  ***Login Accounts for testing: testid@gmail.com / 11032005***

export default function LoginPage() {
  // const [loginType, setLoginType] = useState<LoginType>("patient")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Sử dụng auth context login function
      await login(email, password)
      
      // Gọi API để lấy thông tin user và xác định role
      const user = await loginApi(email, password)
      
      console.log("Login successful for user with roleId:", user.roleId)

      // Route dựa trên roleId từ API response
      switch (user.roleId) {
        case 1: // Admin
          navigate("/admin/doctors")
          break
        case 4: // Receptionist
          navigate("/recep/dashboard")
          break
        case 3: // Patient
          navigate("/patient/appointments")
          break
        case 2: // Doctor
          navigate("/doctor/medicalList")
          break
        default:
          // Fallback to patient dashboard
          navigate("/")
      }
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4 bg-linear-to-br from-blue-50 via-white to-blue-50">
        <div className="w-full max-w-md">
          {/* Logo Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
              <Heart className="w-8 h-8 text-white fill-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Chào mừng trở lại</h1>
            <p className="text-gray-600">Đăng nhập để truy cập tài khoản y tế của bạn</p>
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader className="space-y-1 pb-4">
              {/* Login Type Tabs */}
              <div className="flex gap-2 p-1 bg-gray-100 rounded-lg mb-4">
                {/* <button
                  type="button"
                  onClick={() => setLoginType("patient")}
                  className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-all ${
                    loginType === "patient" ? "bg-white text-primary shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Bệnh nhân
                </button>
                <button
                  type="button"
                  onClick={() => setLoginType("staff")}
                  className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-md transition-all ${
                    loginType === "staff" ? "bg-white text-primary shadow-sm" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Nhân viên
                </button> */}
              </div>

              {/* <CardTitle className="text-2xl">{loginType === "patient" ? "Cổng thông tin bệnh nhân" : "Cổng thông tin nhân viên"}</CardTitle> */}
              <CardDescription>
                  Truy cập hồ sơ y tế, lịch hẹn và đơn thuốc của bạn
                  
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="text-red-500 text-sm text-center">{error}</div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Mật khẩu</Label>
                    <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                      Quên mật khẩu?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Nhập mật khẩu của bạn"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                    Ghi nhớ đăng nhập trong 30 ngày
                  </Label>
                </div>

                <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                  {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                </Button>

                
                  <div className="text-center pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      Chưa có tài khoản?{" "}
                      <Link to="/register" className="text-primary font-medium hover:underline">
                        Đăng ký ngay
                      </Link>
                    </p>
                  </div>
                

                {/* {loginType === "staff" && (
                  <div className="text-center pt-4">
                    <p className="text-xs text-gray-500">Đăng nhập nhân viên có giới hạn. Liên hệ IT để được hỗ trợ.</p>
                  </div>
                )} */}
              </form>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Cần hỗ trợ? Liên hệ với chúng tôi tại{" "}
              <a href="tel:+84123456789" className="text-primary hover:underline">
                (84) 123-456-789
              </a>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
