"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "@/auth/authContext"
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
import { logError } from "@/utils/logger"

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
  const { login, user, isAuthenticated } = useAuth()
  const [error, setError] = useState("")
  // State để điều khiển ẩn/hiện mật khẩu
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmittingForm, setIsSubmittingForm] = useState(false)
  const [hasNavigated, setHasNavigated] = useState(false) // Track if navigation already happened
  const navigate = useNavigate()
  const location = useLocation()
  
  // Get return URL from location state or default to dashboard
  const from = (location.state as any)?.from?.pathname || "/"

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(loginSchema),
  })

  // Navigate after successful login
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LoginPage.tsx:65',message:'NAVIGATION_CHECK',data:{isAuthenticated,hasUser:!!user,pathname:location.pathname,from,hasNavigated},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    
    // Only navigate if user is authenticated, we're on login page, and haven't navigated yet
    if (isAuthenticated && user && location.pathname === "/login" && !hasNavigated) {
      const rawRole = user.roleId || user.role || "patient"
      const userRole = String(rawRole).toLowerCase()
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LoginPage.tsx:69',message:'DETERMINING_ROLE',data:{rawRole,userRole,roleId:user.roleId,role:user.role},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      
      // Navigate based on role
      // roleId: 1=Admin, 2=Doctor, 3=Patient, 4=Receptionist
      let targetPath = "/"
      switch (userRole) {
        case "admin":
        case "1":
          targetPath = "/admin/dashboard"
          break
        
        case "doctor":
        case "2":
          targetPath = "/doctor/dashboard"
          break
        
        case "patient":
        case "3":
          targetPath = "/patient/dashboard"
          break
        
        case "receptionist":
        case "4":
        case "staff":
          targetPath = "/receptionist/dashboard"
          break
        default:
          // If user has a return URL (not "/" or "/login"), use it. Otherwise go to patient dashboard
          targetPath = from && from !== "/" && from !== "/login" ? from : "/patient/dashboard"
          break
      }
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LoginPage.tsx:99',message:'NAVIGATING',data:{targetPath,userRole,from,isAuthenticated,hasUser:!!user},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LoginPage.tsx:101',message:'CALLING_NAVIGATE',data:{targetPath,replace:true,currentPath:location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      
      try {
        // Mark as navigated before calling navigate to prevent multiple navigations
        setHasNavigated(true)
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LoginPage.tsx:112',message:'BEFORE_NAVIGATE',data:{targetPath,hasNavigated:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        
        navigate(targetPath, { replace: true })
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LoginPage.tsx:118',message:'NAVIGATE_CALLED',data:{targetPath,newPathname:window.location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
      } catch (navError: any) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LoginPage.tsx:122',message:'NAVIGATE_ERROR',data:{error:navError.message,targetPath},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        console.error("Navigation error:", navError)
        setHasNavigated(false) // Reset on error
      }
    }
  }, [isAuthenticated, user, navigate, from, location.pathname, hasNavigated])

  const onSubmit = async (data: LoginFormValues) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LoginPage.tsx:104',message:'ONSUBMIT_CALLED',data:{email:data.email,isSubmittingForm},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    // Prevent double submission
    if (isSubmittingForm) {
      return;
    }
    
    setError("")
    setIsSubmittingForm(true)
    
    try {
      // Clear any stale tokens before login attempt
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('accessToken');
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LoginPage.tsx:116',message:'BEFORE_LOGIN_CALL',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      // Small delay to ensure cleanup
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const loggedInUser = await login(data.email, data.password)
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LoginPage.tsx:133',message:'AFTER_LOGIN_SUCCESS',data:{hasLoggedInUser:!!loggedInUser,email:data.email,roleId:loggedInUser?.roleId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      // Navigate immediately after login if we have user data
      if (loggedInUser) {
        const rawRole = loggedInUser.roleId || loggedInUser.role || "patient"
        const userRole = String(rawRole).toLowerCase()
        
        let targetPath = "/"
        // roleId: 1=Admin, 2=Doctor, 3=Patient, 4=Receptionist
        switch (userRole) {
          case "admin":
          case "1":
            targetPath = "/admin/dashboard"
            break
          case "doctor":
          case "2":
            targetPath = "/doctor/dashboard"
            break
          case "patient":
          case "3":
            targetPath = "/patient/dashboard"
            break
          case "receptionist":
          case "4":
          case "staff":
          default:
            targetPath = from && from !== "/" && from !== "/login" ? from : "/receptionist/dashboard"
            break
        }
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LoginPage.tsx:156',message:'IMMEDIATE_NAVIGATION',data:{targetPath,userRole,from},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        
        setHasNavigated(true)
        navigate(targetPath, { replace: true })
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LoginPage.tsx:196',message:'IMMEDIATE_NAVIGATE_CALLED',data:{targetPath,currentPath:window.location.pathname,hasNavigated},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
      } else {
        // If user not immediately available, useEffect will handle navigation
        setHasNavigated(false)
      }
    } catch (err: any) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'LoginPage.tsx:128',message:'ONSUBMIT_ERROR',data:{error:err.message,status:err.response?.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      logError("Login Error", err)
      // Handle 429 rate limit error specifically
      if (err.response?.status === 429 || err.message?.includes("Quá nhiều yêu cầu")) {
        const retryAfter = err.response?.headers?.['retry-after'] || 
                         err.response?.headers?.['Retry-After'] ||
                         err.response?.data?.retryAfter;
        const waitTime = retryAfter ? `${retryAfter} giây` : "30-60 giây";
        const errorMessage = `Quá nhiều yêu cầu đăng nhập. Vui lòng đợi ${waitTime} và thử lại.`
        setError(errorMessage)
        // Disable form for longer period on rate limit (60 seconds)
        setTimeout(() => {
          setIsSubmittingForm(false)
        }, 60000) // 60 seconds delay for rate limit
        return
      } else if (err.message?.includes("Đang xử lý đăng nhập")) {
        setError(err.message)
      } else {
        setError(err.message || "Đã có lỗi xảy ra.")
      }
    } finally {
      // Add delay before allowing resubmission to prevent rapid clicks
      // Longer delay for rate limit errors (handled above)
      const currentError = error || "";
      if (!currentError.includes("Quá nhiều yêu cầu")) {
        setTimeout(() => {
          setIsSubmittingForm(false)
        }, 1500) // 1.5 seconds delay for normal errors
      }
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
                  disabled={isSubmitting || isSubmittingForm}
                >
                  {isSubmitting || isSubmittingForm ? "Đang xử lý..." : "Đăng Nhập"}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">
                      Hoặc tiếp tục với
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    // Redirect to backend OAuth endpoint
                    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/oauth/google`
                  }}
                >
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Đăng nhập với Google
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