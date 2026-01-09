"use client"

import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "@/auth/authContext"
import { setAccessToken, setRefreshToken } from "@/lib/axiosAuth"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/api"

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { loginWithToken, user } = useAuth()
  const [isProcessing, setIsProcessing] = useState(true)
  const [hasProcessed, setHasProcessed] = useState(false)

  useEffect(() => {
    const handleOAuthCallback = async () => {
      // Prevent re-processing if already processed or if user is already logged in
      if (hasProcessed || user) {
        return
      }

      try {
        // Check if we have token in URL params (from backend redirect)
        const token = searchParams.get("token")
        const refreshToken = searchParams.get("refreshToken")
        const error = searchParams.get("error")

        if (error) {
          toast.error("Đăng nhập với Google thất bại")
          navigate("/login")
          return
        }

        if (token) {
          // Mark as processed to prevent re-processing
          setHasProcessed(true)

          // Use loginWithToken to properly set user in context
          // Pass refreshToken if available
          await loginWithToken(token, refreshToken || undefined)

          // Clear token from URL to prevent re-processing
          window.history.replaceState({}, '', window.location.pathname)

          toast.success("Đăng nhập với Google thành công")
          
          // Wait a bit for user state to update, then navigate based on role
          setTimeout(() => {
            // Get user role from token to navigate to correct dashboard
            try {
              const tokenPayload = JSON.parse(atob(token.split('.')[1]))
              const roleId = tokenPayload.roleId
              
              // Navigate to appropriate dashboard based on role
              // roleId: 1=Admin, 2=Doctor, 3=Patient, 4=Receptionist
              if (roleId === 1) {
                // Admin
                navigate("/admin/dashboard", { replace: true })
              } else if (roleId === 4) {
                // Doctor - roleId: 1=Admin, 2=Receptionist, 3=Patient, 4=Doctor (theo enum RoleCode)
                navigate("/doctor/dashboard", { replace: true })
              } else if (roleId === 3) {
                // Patient
                navigate("/patient/dashboard", { replace: true })
              } else if (roleId === 2) {
                // Receptionist
                navigate("/receptionist/dashboard", { replace: true })
              } else {
                // Default fallback
                navigate("/", { replace: true })
              }
            } catch (error) {
              // If can't parse token, just navigate to home
              console.error("Error parsing token:", error)
              navigate("/", { replace: true })
            }
          }, 100) // Small delay to ensure state is updated
          return
        }

        // No token in URL - error
        toast.error("Không nhận được token từ Google")
        navigate("/login")
      } catch (error: any) {
        console.error("OAuth callback error:", error)
        const errorMessage = error.response?.data?.message || error.message || "Có lỗi xảy ra khi xử lý đăng nhập Google"
        toast.error(errorMessage)
        navigate("/login")
      } finally {
        setIsProcessing(false)
      }
    }

    handleOAuthCallback()
  }, [searchParams, navigate, loginWithToken, hasProcessed, user])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
        <h2 className="text-xl font-semibold mb-2">Đang xử lý đăng nhập...</h2>
        <p className="text-gray-600">Vui lòng đợi trong giây lát</p>
      </div>
    </div>
  )
}
