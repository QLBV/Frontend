import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/auth/authContext"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "admin" | "doctor" | "patient" | "receptionist" | string[]
  requireAuth?: boolean
}

/**
 * ProtectedRoute component - Bảo vệ routes với authentication và authorization
 * 
 * @param children - Component cần được bảo vệ
 * @param requiredRole - Role hoặc array of roles được phép truy cập
 * @param requireAuth - Nếu true, yêu cầu authentication (default: true)
 */
export default function ProtectedRoute({
  children,
  requiredRole,
  requireAuth = true,
}: ProtectedRouteProps) {
  try {
    const { user, isAuthenticated, loading } = useAuth()
    const location = useLocation()
    // Show loading state while checking auth
    // Wait longer to ensure restore process completes
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )
    }

    // Check if we have refresh token - if yes, wait for restore to complete
    const hasRefreshToken = localStorage.getItem('refreshToken')
    if (requireAuth && !isAuthenticated && hasRefreshToken && !user) {
      // Still restoring, show loading and wait up to 5 seconds for restore
      // This prevents premature redirect to login
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )
    }

    // Nếu yêu cầu auth nhưng chưa đăng nhập (và không có refresh token)
    if (requireAuth && !isAuthenticated && !hasRefreshToken) {
      // Redirect to login với returnUrl
      return <Navigate to="/login" state={{ from: location }} replace />
    }

    // Nếu có yêu cầu role
    if (requiredRole && user) {
    const userRole = getUserRole(user)
    // Ensure requiredRole is converted to array of strings
    const allowedRoles = Array.isArray(requiredRole) 
      ? requiredRole.map(r => typeof r === 'string' ? r : String(r))
      : [typeof requiredRole === 'string' ? requiredRole : String(requiredRole)]
    
    // Map role names to role IDs
    // roleId: 1=Admin, 2=Receptionist, 3=Patient, 4=Doctor (theo enum RoleCode)
    const roleMap: Record<string, string[]> = {
      admin: ["admin", "1", "administrator"],
      receptionist: ["receptionist", "2", "staff"],
      patient: ["patient", "3"],
      doctor: ["doctor", "4"],
    }
    // Check if user has required role
    const hasAccess = allowedRoles.some((role) => {
      // Ensure role is a string
      const roleStr = typeof role === 'string' ? role : String(role)
      const roleVariants = roleMap[roleStr] || [roleStr]
      try {
        // Ensure userRole is a string before calling toLowerCase
        const userRoleStr = typeof userRole === 'string' ? userRole : String(userRole)
        const userRoleLower = userRoleStr.toLowerCase()
        return roleVariants.includes(userRoleLower)
      } catch (error: any) {
        return false
      }
    })

    if (!hasAccess) {
      // Redirect to appropriate dashboard based on user role
      const dashboardPath = getDashboardPath(userRole)
      return <Navigate to={dashboardPath} replace />
    }
  }

    return <>{children}</>
  } catch (error: any) {
    console.error('ProtectedRoute error:', error)
    // Fallback: redirect to login
    return <Navigate to="/login" replace />
  }
}

/**
 * Get user role from user object
 */
function getUserRole(user: any): string {
  // Try different possible role fields
  if (user.roleId !== undefined && user.roleId !== null) {
    const roleIdStr = String(user.roleId)
    return roleIdStr
  }
  if (user.role !== undefined && user.role !== null) {
    const roleStr = String(user.role)
    return roleStr
  }
  return "patient" // Default
}

/**
 * Get dashboard path based on user role
 */
function getDashboardPath(role: string): string {
  const roleLower = role.toLowerCase()
  if (roleLower === "admin" || roleLower === "1" || roleLower === "administrator") {
    return "/admin/dashboard"
  }
  if (roleLower === "receptionist" || roleLower === "2" || roleLower === "staff") {
    return "/receptionist/dashboard"
  }
  if (roleLower === "patient" || roleLower === "3") {
    return "/patient/dashboard"
  }
  if (roleLower === "doctor" || roleLower === "4") {
    return "/doctor/dashboard"
  }
  return "/" // Default fallback
}
