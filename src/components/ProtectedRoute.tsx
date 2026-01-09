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

    // #region agent log
    try {
      const logData = {
        hasUser: !!user,
        isAuthenticated,
        loading,
        requiredRole: Array.isArray(requiredRole) ? requiredRole : (requiredRole ? [String(requiredRole)] : []),
        requireAuth,
        userRoleId: user?.roleId,
        userRole: user?.role,
        userRoleIdType: typeof user?.roleId,
        userRoleType: typeof user?.role,
        hasChildren: !!children,
        childrenType: typeof children
      }
      fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProtectedRoute.tsx:17',message:'ProtectedRoute render',data:logData,timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    } catch (logErr) {
      // Ignore log errors
    }
    // #endregion

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
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProtectedRoute.tsx:70',message:'REDIRECT_TO_LOGIN_NO_TOKEN',data:{requireAuth,isAuthenticated,hasRefreshToken,currentPath:location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
      // #endregion
      // Redirect to login với returnUrl
      return <Navigate to="/login" state={{ from: location }} replace />
    }

    // Nếu có yêu cầu role
    if (requiredRole && user) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProtectedRoute.tsx:41',message:'Checking role access',data:{requiredRole:Array.isArray(requiredRole)?requiredRole:[requiredRole],userRoleId:user?.roleId,userRole:user?.role,userRoleIdType:typeof user?.roleId,userRoleType:typeof user?.role,userRoleIdValue:user?.roleId,userRoleValue:user?.role},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    
    const userRole = getUserRole(user)
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProtectedRoute.tsx:45',message:'getUserRole result',data:{userRole,userRoleType:typeof userRole,userRoleValue:userRole},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
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

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProtectedRoute.tsx:roleMap',message:'Role mapping check',data:{userRole,roleMap,userRoleId:user?.roleId},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'FIX'})}).catch(()=>{});
    // #endregion

    // Check if user has required role
    const hasAccess = allowedRoles.some((role) => {
      // Ensure role is a string
      const roleStr = typeof role === 'string' ? role : String(role)
      const roleVariants = roleMap[roleStr] || [roleStr]
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProtectedRoute.tsx:58',message:'Role comparison',data:{role:roleStr,roleVariants,userRole,userRoleType:typeof userRole,attemptingToLowerCase:true},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      
      try {
        // Ensure userRole is a string before calling toLowerCase
        const userRoleStr = typeof userRole === 'string' ? userRole : String(userRole)
        const userRoleLower = userRoleStr.toLowerCase()
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProtectedRoute.tsx:63',message:'toLowerCase success',data:{userRoleLower,roleVariants,includesResult:roleVariants.includes(userRoleLower)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        return roleVariants.includes(userRoleLower)
      } catch (error: any) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProtectedRoute.tsx:68',message:'toLowerCase error',data:{error:error.message,userRole,userRoleType:typeof userRole},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        return false
      }
    })

    if (!hasAccess) {
      // Redirect to appropriate dashboard based on user role
      const dashboardPath = getDashboardPath(userRole)
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProtectedRoute.tsx:128',message:'REDIRECT_NO_ACCESS',data:{hasAccess,userRole,dashboardPath,currentPath:location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      return <Navigate to={dashboardPath} replace />
    }
  }

    return <>{children}</>
  } catch (error: any) {
    // #region agent log
    try {
      fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProtectedRoute.tsx:error',message:'ProtectedRoute error',data:{error:error?.message,errorName:error?.name,errorStack:error?.stack?.substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
    } catch (logErr) {
      // Ignore log errors
    }
    // #endregion
    console.error('ProtectedRoute error:', error)
    // Fallback: redirect to login
    return <Navigate to="/login" replace />
  }
}

/**
 * Get user role from user object
 */
function getUserRole(user: any): string {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProtectedRoute.tsx:getUserRole',message:'getUserRole called',data:{hasRoleId:!!user?.roleId,hasRole:!!user?.role,roleIdType:typeof user?.roleId,roleType:typeof user?.role,roleIdValue:user?.roleId,roleValue:user?.role},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion
  
  // Try different possible role fields
  if (user.roleId !== undefined && user.roleId !== null) {
    const roleIdStr = String(user.roleId)
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProtectedRoute.tsx:getUserRole',message:'Returning roleId as string',data:{roleIdStr,originalRoleId:user.roleId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    return roleIdStr
  }
  if (user.role !== undefined && user.role !== null) {
    const roleStr = String(user.role)
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProtectedRoute.tsx:getUserRole',message:'Returning role as string',data:{roleStr,originalRole:user.role},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    return roleStr
  }
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProtectedRoute.tsx:getUserRole',message:'Returning default patient',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion
  return "patient" // Default
}

/**
 * Get dashboard path based on user role
 */
function getDashboardPath(role: string): string {
  const roleLower = role.toLowerCase()
  
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProtectedRoute.tsx:getDashboardPath',message:'getDashboardPath called',data:{role,roleLower},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'FIX'})}).catch(()=>{});
  // #endregion
  
  if (roleLower === "admin" || roleLower === "1" || roleLower === "administrator") {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProtectedRoute.tsx:getDashboardPath',message:'Returning admin dashboard',data:{role,roleLower},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return "/admin/dashboard"
  }
  if (roleLower === "receptionist" || roleLower === "2" || roleLower === "staff") {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProtectedRoute.tsx:getDashboardPath',message:'Returning receptionist dashboard',data:{role,roleLower},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'FIX'})}).catch(()=>{});
    // #endregion
    return "/receptionist/dashboard"
  }
  if (roleLower === "patient" || roleLower === "3") {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProtectedRoute.tsx:getDashboardPath',message:'Returning patient dashboard',data:{role,roleLower},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return "/patient/dashboard"
  }
  if (roleLower === "doctor" || roleLower === "4") {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProtectedRoute.tsx:getDashboardPath',message:'Returning doctor dashboard',data:{role,roleLower},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'FIX'})}).catch(()=>{});
    // #endregion
    return "/doctor/dashboard"
  }
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ProtectedRoute.tsx:getDashboardPath',message:'Returning default /',data:{role,roleLower},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  return "/" // Default fallback
}
