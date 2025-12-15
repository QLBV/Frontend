import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { 
  Calendar, 
  Settings,
  X,         
} from 'lucide-react';
import Topbar from '@/components/topbar'; // Ensure this matches your file path

interface SidebarLayoutProps {
  children: ReactNode;      // Used for Sidebar Menu Items
  pageContent?: ReactNode;  // Used for Main Dashboard Content
  logoText?: string; 
  userName?: string;
}

const SidebarLayout = ({ 
  children, 
  pageContent, 
  logoText = "Logo Placeholder", 
  userName 
}: SidebarLayoutProps) => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false); // State for desktop collapse

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);   

    return () => clearInterval(timer);
  }, []);

  const formattedDate = `${currentDateTime.getDate().toString().padStart(2, '0')}/${(currentDateTime.getMonth() + 1).toString().padStart(2, '0')}/${currentDateTime.getFullYear()} ${currentDateTime.toLocaleTimeString('en-US')}`;

  // Handle Hamburger Click
  const handleMenuClick = () => {
    // Check if we are on mobile (simplistic check, can be improved with media hooks)
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen(true);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-100 overflow-hidden font-sans">
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* --- SIDEBAR --- */}
      <aside 
        className={
          /* --- KÍCH HOẠT GROUP CHO TAILWIND --- */
          /* Nếu đang đóng thì thêm class 'collapsed' để con nhận biết */
          `group 
          ${isCollapsed ? 'collapsed' : ''}
          fixed md:relative z-50
          bg-white shadow-xl 
          flex flex-col 
          transition-all duration-300 ease-in-out
          md:overflow-hidden
          h-full inset-y-0 left-0
          /* Mobile: Slide in/out logic */
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          /* Desktop: Dynamic width based on collapsed state */
          md:translate-x-0 md:h-[calc(100vh-2rem)] md:m-4 md:rounded-[20px] md:border md:border-gray-100
          ${isCollapsed ? 'md:w-0' : 'md:w-72'} 
        `}
      >
        {/* Mobile Close Button */}
        <button 
          onClick={() => setIsMobileMenuOpen(false)}
          className="absolute top-4 right-4 p-2 md:hidden text-gray-500"
        >
          <X size={20} />
        </button>

        {/* Top Section */}
        <div className={`p-6 flex-1 overflow-y-auto overflow-x-hidden ${isCollapsed ? 'px-2' : ''}`}>
          
          {/* Logo Desktop */}
          <div className='flex items-center gap-3 mb-3'>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <svg className="h-6 w-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-xl font-semibold">HealthCare</span>
          </div>
          {/* Logo Mobile (inside menu) */}
          <div className="mb-8 md:hidden mt-8">
            <h1 className="text-xl font-bold text-black uppercase tracking-wide">
              Menu
            </h1>
          </div>

          {/* === CHILD CONTENT (Menu Items) === */}
          {/* Note: Ensure your menu items handle the collapsed width (e.g. hide text) or they will overflow */}
          <div className="space-y-6">
             {children}
          </div>
        </div>

        {/* Bottom Section (Fixed) */}
        <div className={`
          bg-white mt-auto border-t md:border-none border-gray-100 transition-all
          ${isCollapsed ? 'p-4 flex flex-col items-center' : 'p-6 pb-8'}
        `}>
          
          {/* Date Section */}
          {!isCollapsed && (
            <div className="flex items-center gap-3 mb-6 whitespace-nowrap overflow-hidden">
              <Calendar className="text-gray-800 min-w-[24px]" size={24} strokeWidth={2} />
              <span className="text-sm font-bold text-black">
                {formattedDate}
              </span>
            </div>
          )}

          {/* Settings Button */}
          <button className={`
            flex items-center gap-3 text-left hover:bg-gray-50 p-2 rounded-lg transition-colors
            ${isCollapsed ? 'justify-center w-full' : 'w-full -ml-2'}
          `}>
            <Settings className="text-black" size={32} strokeWidth={2} />
            {!isCollapsed && (
              <span className="font-extrabold text-2xl text-black">
                Settings
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA (Includes Topbar) --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 md:pl-0"> 
          {/* md:pl-0 because the sidebar has margin, keeping visual balance */}
          
          {/* Integrate Topbar here */}
          <Topbar 
            onMenuClick={handleMenuClick} 
            userName={userName}
          />

          {/* Render the actual Dashboard/Page Content */}
          <div className="mt-2">
            {pageContent}
          </div>
        </div>
      </main>

    </div>
  );
};

export default SidebarLayout;