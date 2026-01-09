"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {type AuthContextType, type User } from "./types";
import { loginApi, logoutApi, refreshApi, registerApi } from "./auth.service";
import { setAccessToken, clearAccessToken, setRefreshToken, clearRefreshToken } from "@/lib/axiosAuth";
import api from "@/lib/api";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Track user state changes
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authContext.tsx:22',message:'USER_STATE_CHANGED',data:{userId:user?.id,email:user?.email,isAuthenticated:!!user,roleId:user?.roleId,currentPath:window.location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
  }, [user]);

  // ===== restore login khi F5 =====
  useEffect(() => {
    let isMounted = true;
    let restoreAttempted = false;
    
    const restore = async () => {
      // Prevent multiple restore attempts
      if (restoreAttempted) return;
      
      // If currently logging in, don't restore
      if (isLoggingIn) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }
      
      // Check if we're on login/register page - NEVER auto-restore on auth pages
      const currentPath = window.location.pathname;
      const isAuthPage = currentPath === '/login' || 
                         currentPath === '/register' || 
                         currentPath === '/forgot-password' || 
                         currentPath === '/reset-password' ||
                         currentPath === '/auth/oauth/callback';
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authContext.tsx:38',message:'RESTORE_CHECK',data:{currentPath,isAuthPage,isLoggingIn},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      
      // If on auth page, NEVER auto-restore to avoid rate limiting
      if (isAuthPage) {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }
      
      restoreAttempted = true;
      
      // Small delay to avoid immediate API call (500ms instead of 2s)
      // This allows React to render first, but doesn't delay too long
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Triple check if still not logging in after delay
      if (isLoggingIn) {
        restoreAttempted = false;
        if (isMounted) {
          setLoading(false);
        }
        return;
      }
      
      // Final check - still not on auth page?
      const finalPath = window.location.pathname;
      const stillOnAuthPage = finalPath === '/login' || 
                               finalPath === '/register' || 
                               finalPath === '/forgot-password' || 
                               finalPath === '/reset-password' ||
                               finalPath === '/auth/oauth/callback';
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authContext.tsx:82',message:'RESTORE_FINAL_CHECK',data:{finalPath,stillOnAuthPage,isLoggingIn,hasUser:!!user},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      
      if (stillOnAuthPage) {
        if (isMounted) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authContext.tsx:89',message:'RESTORE_CLEAR_USER_ON_AUTH_PAGE',data:{finalPath,reason:'stillOnAuthPage'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
          // #endregion
          setUser(null);
          setLoading(false);
        }
        return;
      }
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const accessToken = localStorage.getItem('accessToken');
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authContext.tsx:98',message:'RESTORE_ATTEMPT',data:{hasRefreshToken:!!refreshToken,hasAccessToken:!!accessToken,isLoggingIn,stillOnAuthPage,currentPath:window.location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        
        // Only try to restore if we have a refresh token and not currently logging in
        // AND not on auth pages
        if (refreshToken && !isLoggingIn && !stillOnAuthPage) {
          try {
            const user = await refreshApi();
            
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authContext.tsx:107',message:'RESTORE_SUCCESS',data:{userId:user?.id,patientId:user?.patientId,doctorId:user?.doctorId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
            
            if (isMounted && !isLoggingIn) {
              setUser(user);
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authContext.tsx:115',message:'RESTORE_USER_SET',data:{userId:user?.id,patientId:user?.patientId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
              // #endregion
              // Set loading to false after user is set
              setLoading(false);
            }
          } catch (error: any) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authContext.tsx:82',message:'RESTORE_ERROR',data:{error:error.message,status:error.response?.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
            
            // Handle 429 rate limit error - don't retry immediately
            if (error.response?.status === 429) {
              console.warn('Rate limited during token restore. Skipping restore to avoid further rate limits.');
              // Don't retry immediately - let user login manually
              if (isMounted) {
                setUser(null);
                // Keep tokens but don't auto-restore
                setLoading(false);
              }
              return;
            }
            
            // Token restore failed - user needs to login again
            if (isMounted) {
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authContext.tsx:139',message:'RESTORE_FAILED_CLEARING_USER',data:{error:error.message,status:error.response?.status,currentPath:window.location.pathname,hasUser:!!user},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
              // #endregion
              setUser(null);
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('accessToken');
              setLoading(false);
            }
          }
        } else {
          // No refresh token - check if we have accessToken (OAuth login)
          if (accessToken) {
            // #region agent log
            fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authContext.tsx:158',message:'OAUTH_ACCESS_TOKEN_FOUND',data:{hasAccessToken:true,hasUser:!!user,currentPath:window.location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
            // #endregion
            
            if (user) {
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authContext.tsx:163',message:'OAUTH_USER_KEEP',data:{hasAccessToken:true,hasUser:true,userId:user.id,currentPath:window.location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
              // #endregion
              // OAuth login - keep user since we have accessToken and user is already set
              setLoading(false);
            } else {
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authContext.tsx:172',message:'OAUTH_FETCH_USER',data:{hasAccessToken:true,hasUser:false,currentPath:window.location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
              // #endregion
              // OAuth login but user not set - try to fetch user profile
              try {
                const response = await api.get("/profile");
                if (response.data.success) {
                  const userData = response.data.data || response.data.user;
                  const restoredUser: User = {
                    id: userData.id,
                    email: userData.email || '',
                    fullName: userData.fullName || '',
                    role: userData.roleId?.toString() || '',
                    roleId: userData.roleId || 3,
                    patientId: userData.patientId || null,
                    doctorId: userData.doctorId || null,
                  };
                  if (isMounted) {
                    setUser(restoredUser);
                    setLoading(false);
                  }
                } else {
                  throw new Error("Failed to get user information");
                }
              } catch (error: any) {
                // #region agent log
                fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authContext.tsx:196',message:'OAUTH_FETCH_USER_FAILED',data:{error:error.message,status:error.response?.status,currentPath:window.location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
                // #endregion
                // Failed to fetch user - clear tokens and user
                if (isMounted) {
                  setUser(null);
                  localStorage.removeItem('accessToken');
                  setLoading(false);
                }
              }
            }
          } else {
            // No tokens at all - user needs to login
            if (isMounted) {
              // #region agent log
              fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authContext.tsx:192',message:'NO_TOKENS_CLEARING_USER',data:{hasAccessToken:false,hasRefreshToken:false,currentPath:window.location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
              // #endregion
              setUser(null);
              setLoading(false);
            }
          }
        }
      } catch (error) {
        // Unexpected error
        if (isMounted) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authContext.tsx:154',message:'UNEXPECTED_ERROR_CLEARING_USER',data:{error:error instanceof Error ? error.message : String(error),currentPath:window.location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
          // #endregion
          setUser(null);
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('accessToken');
          setLoading(false);
        }
      } finally {
        // Only set loading to false if restore was not attempted
        // If restore was attempted, loading will be set in restore handlers
        if (isMounted && !restoreAttempted) {
          setLoading(false);
        }
      }
    };
    
    // Check current path immediately
    const currentPathCheck = window.location.pathname;
    const isAuthPageCheck = currentPathCheck === '/login' || 
                       currentPathCheck === '/register' || 
                       currentPathCheck === '/forgot-password' || 
                       currentPathCheck === '/reset-password' ||
                       currentPathCheck === '/auth/oauth/callback';
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authContext.tsx:133',message:'RESTORE_EFFECT_START',data:{currentPath:currentPathCheck,isAuthPage:isAuthPageCheck,isLoggingIn,hasUser:!!user},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    
    // NEVER restore on auth pages - this is the key fix
    if (isAuthPageCheck) {
      // On auth pages, immediately set loading to false and don't restore
      if (isMounted) {
        setUser(null);
        setLoading(false);
      }
      return;
    }
    
    // Only restore if not currently logging in and not on auth pages
    if (!isLoggingIn && !isAuthPageCheck) {
      // Small delay before restore to allow React to render first (300ms)
      const restoreTimeout = setTimeout(() => {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authContext.tsx:154',message:'RESTORE_TIMEOUT_CALLBACK',data:{isMounted,isLoggingIn,checkPath:window.location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        
        if (isMounted && !isLoggingIn) {
          // Double check path hasn't changed
          const checkPath = window.location.pathname;
          const stillNotAuthPage = checkPath !== '/login' && 
                                    checkPath !== '/register' && 
                                    checkPath !== '/forgot-password' && 
                                    checkPath !== '/reset-password' &&
                                    checkPath !== '/auth/oauth/callback';
          
          if (stillNotAuthPage) {
            restore();
          } else {
            if (isMounted) {
              setLoading(false);
            }
          }
        }
      }, 300);
      
      return () => {
        isMounted = false;
        clearTimeout(restoreTimeout);
      };
    } else {
      // On auth pages or logging in, just set loading to false
      if (isMounted) {
        setLoading(false);
      }
    }
    
    return () => {
      isMounted = false;
    };
  }, [isLoggingIn]);

  const login = async (email: string, password: string) => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authContext.tsx:190',message:'LOGIN_START',data:{email,isLoggingIn},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    
    // Prevent multiple simultaneous login attempts
    if (isLoggingIn) {
      throw new Error("Đang xử lý đăng nhập. Vui lòng đợi...");
    }
    
    setIsLoggingIn(true);
    try {
      // Clear any existing tokens before login to avoid conflicts
      // This prevents any stale tokens from interfering
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('accessToken');
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authContext.tsx:201',message:'TOKENS_CLEARED',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      // Small delay to ensure tokens are cleared
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const user = await loginApi(email, password);
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authContext.tsx:207',message:'LOGIN_API_SUCCESS',data:{userId:user?.id,email:user?.email,hasAccessToken:!!localStorage.getItem('accessToken'),hasRefreshToken:!!localStorage.getItem('refreshToken')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      setUser(user);
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authContext.tsx:210',message:'USER_SET',data:{userId:user?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      // Return user so caller can use it immediately for navigation
      return user;
    } catch (error: any) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authContext.tsx:212',message:'LOGIN_ERROR',data:{error:error.message,status:error.response?.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      
      // Handle 429 rate limit error with better message
      if (error.response?.status === 429) {
        const retryAfter = error.response?.headers?.['retry-after'] || 
                          error.response?.headers?.['Retry-After'] ||
                          error.response?.data?.retryAfter;
        const waitTime = retryAfter ? `${retryAfter} giây` : "30-60 giây";
        throw new Error(`Quá nhiều yêu cầu đăng nhập. Vui lòng đợi ${waitTime} và thử lại.`);
      }
      throw error;
    } finally {
      // Add delay before allowing next login attempt (1 second)
      setTimeout(() => {
        setIsLoggingIn(false);
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authContext.tsx:225',message:'LOGIN_FINALLY',data:{isLoggingIn:false},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
      }, 1000);
    }
  };

  const register = async (email: string, password: string, fullName: string) => {
    const user = await registerApi(email, password, fullName);
    setUser(user);
    return user;
  };

  const logout = async () => {
    await logoutApi();
    setUser(null);
  };

  const loginWithToken = async (token: string, refreshToken?: string) => {
    try {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authContext.tsx:320',message:'LOGIN_WITH_TOKEN_START',data:{tokenLength:token.length,hasRefreshToken:!!refreshToken,currentPath:window.location.pathname,isLoggingIn},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      setIsLoggingIn(true);
      // Set the access token
      setAccessToken(token);
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authContext.tsx:324',message:'TOKEN_SET',data:{hasToken:!!localStorage.getItem('accessToken'),hasRefreshToken:!!refreshToken},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      
      // Set refresh token if provided (from OAuth flow)
      if (refreshToken) {
        setRefreshToken(refreshToken);
      }
      
      // Fetch user profile
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authContext.tsx:332',message:'BEFORE_FETCH_PROFILE',data:{hasToken:!!localStorage.getItem('accessToken')},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      const response = await api.get("/profile");
      
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authContext.tsx:333',message:'AFTER_FETCH_PROFILE',data:{success:response.data.success,hasData:!!response.data.data,hasUser:!!response.data.user,status:response.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      
      if (response.data.success) {
        const userData = response.data.data || response.data.user;
        // Extract patientId and doctorId from top level or profileDetails
        // Backend now returns patientId/doctorId at top level, but fallback to profileDetails.id for backward compatibility
        const extractedPatientId = userData.patientId || (userData.roleId === 3 ? userData.profileDetails?.id : null) || null;
        const extractedDoctorId = userData.doctorId || (userData.roleId === 4 ? userData.profileDetails?.id : null) || null;
        
        const user: User = {
          id: userData.id,
          email: userData.email || '',
          fullName: userData.fullName || '',
          role: userData.roleId?.toString() || '',
          roleId: userData.roleId || 3,
          patientId: extractedPatientId,
          doctorId: extractedDoctorId,
        };
        setUser(user);
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authContext.tsx:344',message:'USER_SET_IN_CONTEXT',data:{userId:user.id,roleId:user.roleId,patientId:user.patientId,doctorId:user.doctorId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
      } else {
        throw new Error("Failed to get user information");
      }
    } catch (error: any) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authContext.tsx:348',message:'LOGIN_WITH_TOKEN_ERROR',data:{error:error.message,status:error.response?.status,hasResponse:!!error.response,currentPath:window.location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      // Clear token on error
      clearAccessToken();
      if (refreshToken) {
        clearRefreshToken();
      }
      throw error;
    } finally {
      setIsLoggingIn(false);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authContext.tsx:357',message:'LOGIN_WITH_TOKEN_FINALLY',data:{isLoggingIn:false,hasUser:!!user},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
    }
  };

  const refreshUser = async () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authContext.tsx:337',message:'REFRESH_USER_START',data:{currentPatientId:user?.patientId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H3'})}).catch(()=>{});
    // #endregion
    
    try {
      const response = await api.get("/profile");
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authContext.tsx:342',message:'REFRESH_USER_API_RESPONSE',data:{hasResponse:!!response,hasData:!!response?.data,hasSuccess:!!response?.data?.success,responseKeys:Object.keys(response?.data || {})},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H3'})}).catch(()=>{});
      // #endregion
      
      if (response.data.success) {
        const userData = response.data.data || response.data.user;
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authContext.tsx:348',message:'REFRESH_USER_DATA',data:{userId:userData?.id,patientId:userData?.patientId,doctorId:userData?.doctorId,profileDetailsId:userData?.profileDetails?.id,oldPatientId:user?.patientId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H3'})}).catch(()=>{});
        // #endregion
        
        // Extract patientId and doctorId from top level or profileDetails
        // Backend now returns patientId/doctorId at top level, but fallback to profileDetails.id for backward compatibility
        const extractedPatientId = userData.patientId || (userData.roleId === 3 ? userData.profileDetails?.id : null) || null;
        const extractedDoctorId = userData.doctorId || (userData.roleId === 4 ? userData.profileDetails?.id : null) || null;
        
        const updatedUser: User = {
          id: userData.id,
          email: userData.email || '',
          fullName: userData.fullName || '',
          role: userData.roleId?.toString() || '',
          roleId: userData.roleId || 3,
          patientId: extractedPatientId,
          doctorId: extractedDoctorId,
        };
        
        console.log("🔄 Refreshed user:", {
          userId: updatedUser.id,
          roleId: updatedUser.roleId,
          patientId: updatedUser.patientId,
          doctorId: updatedUser.doctorId,
        });
        setUser(updatedUser);
        
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authContext.tsx:360',message:'REFRESH_USER_SET',data:{newPatientId:updatedUser.patientId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H3'})}).catch(()=>{});
        // #endregion
        
        return updatedUser;
      } else {
        throw new Error("Failed to get user information");
      }
    } catch (error: any) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'authContext.tsx:368',message:'REFRESH_USER_ERROR',data:{error:error.message,status:error.response?.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H3'})}).catch(()=>{});
      // #endregion
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        loginWithToken,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ===== custom hook =====
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // Return a safe default instead of throwing to prevent crashes
    // This can happen during SSR or if component is rendered outside AuthProvider
    console.warn("useAuth called outside AuthProvider, returning default values");
    return {
      user: null,
      isAuthenticated: false,
      loading: false,
      login: async () => {
        throw new Error("Not authenticated");
      },
      logout: async () => {},
      register: async () => {
        throw new Error("Not authenticated");
      },
      loginWithToken: async () => {},
      refreshUser: async () => {
        throw new Error("Not authenticated");
      },
    } as AuthContextType;
  }
  return ctx;
};
