import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { 
  Calendar, 
  Settings,
  Menu,
  X,         
} from 'lucide-react';


interface SidebarLayoutProps {
  children: ReactNode;
  logoText?: string; 
}

const SidebarLayout = ({ children, logoText = "Logo Placeholder" }: SidebarLayoutProps) => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);   

    return () => clearInterval(timer);
  }, []);

  const formattedDate = `${currentDateTime.getDate().toString().padStart(2, '0')}/${(currentDateTime.getMonth() + 1).toString().padStart(2, '0')}/${currentDateTime.getFullYear()} ${currentDateTime.toLocaleTimeString('en-US')}`;

  return (
    <div className="flex h-screen w-full bg-gray-100 overflow-hidden font-sans">
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white z-30 px-4 flex items-center justify-between shadow-sm">
        <div className="font-bold text-lg">{logoText}</div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed md:relative z-50
          w-72 bg-white shadow-xl 
          flex flex-col 
          transition-transform duration-300 ease-in-out
          md:overflow-hidden
          h-full inset-y-0 left-0
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:h-[calc(100vh-2rem)] md:m-4 md:rounded-[20px] md:border md:border-gray-100
        `}
      >
        <button 
          onClick={() => setIsMobileMenuOpen(false)}
          className="absolute top-4 right-4 p-2 md:hidden text-gray-500"
        >
          <X size={20} />
        </button>

        {/* Top Section */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Logo Desktop */}
          <div className="mb-8 hidden md:block">
            <h1 className="text-xl font-bold text-black uppercase tracking-wide">
              {logoText}
            </h1>
          </div>
          
          {/* Logo Mobile (inside menu) */}
          <div className="mb-8 md:hidden mt-8">
            <h1 className="text-xl font-bold text-black uppercase tracking-wide">
              Menu
            </h1>
          </div>

          {/* === CHILD CONTENT === */}
          <div className="space-y-6">
             {children}
          </div>
        </div>

        {/* Bottom Section (Fixed) */}
        <div className="p-6 pb-8 bg-white mt-auto border-t md:border-none border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="text-gray-800" size={24} strokeWidth={2} />
            <span className="text-sm font-bold text-black">
              {formattedDate}
            </span>
          </div>

          <button className="flex items-center gap-3 w-full text-left hover:bg-gray-50 p-2 rounded-lg transition-colors -ml-2">
            <Settings className="text-black" size={32} strokeWidth={2} />
            <span className="font-extrabold text-2xl text-black">
              Settings
            </span>
          </button>
        </div>
      </aside>
    </div>
  );
};

export default SidebarLayout;