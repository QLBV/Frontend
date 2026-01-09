import React, { useState, useRef, useEffect } from 'react';
import { Menu, User as UserIcon, LogOut } from 'lucide-react';
import NotificationBell from './NotificationBell';
import SearchBar from './SearchBar';
import { useAuth } from '@/auth/authContext';
import { useNavigate } from 'react-router-dom';

interface TopbarProps {
  onMenuClick: () => void;
  userName?: string;
  userRole?: string;
  patientCode?: string;
}

const Topbar = ({ onMenuClick, userName, userRole, patientCode }: TopbarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const displayName = userName || user?.fullName || "User";
  
  // Determine role label if not provided
  const getRoleLabel = () => {
    if (userRole) return userRole; // Use provided role if available
    
    const roleId = user?.roleId;
    switch (roleId) {
      case 1:
        return "Quản trị viên";
      case 2:
        return "Lễ tân";
      case 3:
        return "Bệnh nhân";
      case 4:
        return "Bác sĩ";
      default:
        return "";
    }
  };
  
  const displayRole = getRoleLabel();
  const displayCode = patientCode || "";

  // Get role-based profile route
  const getProfileRoute = () => {
    switch (user?.roleId) {
      case 1: return '/admin/profile';
      case 2: return '/receptionist/profile';
      case 3: return '/patient/profile';
      case 4: return '/doctor/profile';
      default: return '/patient/profile';
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setIsDropdownOpen(false);
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    navigate(getProfileRoute());
  };

  return (
    <div className="bg-white rounded-[20px] px-6 py-4 flex items-center justify-between shadow-sm mb-6 border border-gray-100">
      {/* Left: Hamburger Menu Button */}
      <button
        onClick={onMenuClick}
        className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary hover:bg-primary/90 transition-colors cursor-pointer"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-6 w-6 text-primary-foreground" />
      </button>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-md mx-8">
        <SearchBar />
      </div>

      {/* Right: Role, Notification, User Info */}
      <div className="flex items-center gap-4">
        {/* Role Indicator */}
        {displayRole && (
          <span className="text-sm font-medium text-gray-600 px-3 py-1 bg-gray-100 rounded-full">
            {displayRole}
          </span>
        )}

        {/* Notification Bell */}
        <NotificationBell />

        {/* User Info with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
          >
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">{displayName}</div>
              {displayCode && (
                <div className="text-xs text-gray-500">{displayCode}</div>
              )}
            </div>
            {/* Avatar */}
            <div
              className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold"
              title="Mở menu tài khoản"
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 origin-top-right rounded-xl border border-gray-200 bg-white shadow-lg ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200 z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tài khoản
                </p>
                <p className="text-sm font-semibold text-gray-900 mt-1">{displayName}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>

              <div className="py-2">
                <button
                  onClick={handleProfileClick}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <UserIcon size={18} />
                  Thông tin cá nhân
                </button>

                <div className="my-1 h-px bg-gray-100" />

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={18} />
                  Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Topbar;