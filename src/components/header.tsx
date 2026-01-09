"use client"

import { Button } from "@/components/ui/button"
import { 
  Menu, 
  X, 
  User, 
  Home, 
  Calendar, 
  LogOut 
} from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/auth/authContext"
import { logError } from "@/utils/logger"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const profileRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate();

  // Lấy user & hàm logout từ AuthContext
  const { user, logout } = useAuth(); 
  
  // Xác định tên hiển thị (ưu tiên fullName, nếu không có thì lấy email)
  const patientName = user?.fullName || user?.email?.split('@')[0] || "Patient";

  const handleLogout = async () => {
    try {
      await logout();
      setIsProfileOpen(false);
      navigate("/login"); // Quay về trang login sau khi đăng xuất
    } catch (error) {
      logError("Failed to log out", error);
    }
  };

  // Tự động đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <svg className="h-6 w-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-xl font-semibold">HealthCare</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#services" className="text-sm font-medium transition-colors hover:text-primary">Services</a>
            <a href="#about" className="text-sm font-medium transition-colors hover:text-primary">About Us</a>
            <a href="#providers" className="text-sm font-medium transition-colors hover:text-primary">Providers</a>
            <a href="#contact" className="text-sm font-medium transition-colors hover:text-primary">Contact</a>
          </nav>

          {/* Right Side Actions (Login / Profile) */}
          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              // === TRẠNG THÁI ĐÃ ĐĂNG NHẬP ===
              <div className="relative" ref={profileRef}>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className={`flex items-center gap-3 rounded-full border border-border p-1 pl-4 pr-1 transition-all hover:bg-muted ${isProfileOpen ? 'ring-2 ring-primary/20' : ''}`}
                >
                  <span className="text-sm font-semibold text-foreground">{patientName}</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                    <User size={18} />
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 top-full mt-3 w-64 origin-top-right rounded-2xl border border-border bg-card p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-3 mb-1 border-b border-border/40">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">My Account</p>
                      <p className="text-xs text-foreground truncate mt-1">{user.email}</p>
                    </div>

                    <div className="space-y-1 p-1">
                      <Link 
                        to="/" 
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <Home size={20} /> Home
                      </Link>
                      <Link 
                        to="/patient/appointments" 
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        <Calendar size={20} /> Appointments
                      </Link>
                      
                      <div className="my-1 h-px bg-border/50" />

                      <button 
                        onClick={handleLogout} 
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut size={20} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // === TRẠNG THÁI CHƯA ĐĂNG NHẬP ===
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu Content */}
        {mobileMenuOpen && (
          <div className="border-t py-4 md:hidden animate-in slide-in-from-top-5">
            <nav className="flex flex-col gap-4">
              <a href="#services" className="text-sm font-medium">Services</a>
              <a href="#about" className="text-sm font-medium">About Us</a>
              <a href="#providers" className="text-sm font-medium">Providers</a>
              <a href="#contact" className="text-sm font-medium">Contact</a>
              
              <div className="border-t border-border/50 my-2"></div>
              
              {user ? (
                <>
                   <div className="px-2 py-2 text-sm text-muted-foreground">Signed in as <span className="font-bold text-foreground">{patientName}</span></div>
                   <Link to="/dashboard" className="flex items-center gap-2 text-sm font-medium px-2 py-1">
                      <Home size={16} /> Dashboard
                   </Link>
                   <Link to="/appointments" className="flex items-center gap-2 text-sm font-medium px-2 py-1">
                      <Calendar size={16} /> Appointments
                   </Link>
                   <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-medium text-destructive mt-2 px-2 py-1">
                      <LogOut size={16} /> Sign Out
                   </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-2">
                  <Link to="/login">
                    <Button variant="ghost" size="sm" className="w-full justify-start">Login</Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}