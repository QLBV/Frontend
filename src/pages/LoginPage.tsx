"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

// Thêm Eye và EyeOff vào import
import { Lock, Mail, Heart, Eye, EyeOff } from "lucide-react"

import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import api from "@/lib/api"

const API_URL = "http://localhost:3000/api/auth/login"

const loginSchema = yup.object({
  email: yup
    .string()
    .required("Email bắt buộc nhập")
    .email("Định dạng email không hợp lệ"),
  password: yup
    .string()
    .required("Mật khẩu bắt buộc nhập")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
})

type LoginFormValues = yup.InferType<typeof loginSchema>

export default function Login() {
  const { login } = useAuth()
  const [error, setError] = useState("")
  // State để điều khiển ẩn/hiện mật khẩu
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    setError("")
    try {
      const response = await api.post("/api/auth/login", {
        email: data.email,
        password: data.password,
      })

      const result = response.data

      login(result.user, result.accessToken)
      if (result.message) {
        console.log("Login Success Message:", result.message)
      }
      const rawRole = result.user?.roleId || result.user?.role || "patient";
      const userRole = String(rawRole).toLowerCase();
      console.log("Role sau khi xử lý:", userRole);
      
      switch (userRole) {
        case "admin":
        case "1":
          navigate("/admin/dashboard")
          break
        
        case "doctor":
        case "2":
          navigate("/doctor/dashboard")
          break
        
        case "receptionist":
        case "4":
          navigate("/receptionist/dashboard")
          break
        
        case "patient":
        case "3":
        default:
          navigate("/") 
          break
      }

    } catch (err: any) {
      console.error("Login Error:", err)
      setError(err.message || "Đã có lỗi xảy ra.")
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header /> 

      <main className="flex-1 flex items-center justify-center py-12 px-4 bg-linear-to-br from-blue-50 via-white to-blue-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
              <Heart className="w-8 h-8 text-white fill-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Chào mừng trở lại
            </h1>
            <p className="text-gray-600">
              Đăng nhập để truy cập hệ thống HealthCare
            </p>
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader className="space-y-1 pb-4 text-center">
              <CardTitle className="text-2xl">
                Đăng Nhập
              </CardTitle>
              <CardDescription>
                Nhập email và mật khẩu của bạn để tiếp tục
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {error && (
                  <div className="text-red-500 text-sm text-center bg-red-50 p-2 rounded border border-red-100">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className="pl-10"
                      {...register("email")}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Mật khẩu</Label>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-primary hover:underline"
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      // Thay đổi type dựa trên state showPassword
                      type={showPassword ? "text" : "password"}
                      placeholder="Nhập mật khẩu"
                      // Thêm pr-10 để chữ không đè lên icon mắt
                      className="pl-10 pr-10"
                      {...register("password")}
                    />
                    {/* Nút ẩn hiện mật khẩu */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  {errors.password && (
                    <p className="text-sm text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="remember"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Ghi nhớ đăng nhập 30 ngày
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-base"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang xử lý..." : "Đăng Nhập"}
                </Button>

                <div className="text-center pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    Chưa có tài khoản?{" "}
                    <Link
                      to="/register"
                      className="text-primary font-medium hover:underline"
                    >
                      Đăng ký ngay
                    </Link>
                  </p>
                </div>

              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}