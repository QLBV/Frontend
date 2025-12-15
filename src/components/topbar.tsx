import React from 'react';
import { Menu, Bell } from 'lucide-react';

interface TopbarProps {
  onMenuClick: () => void;
  userName?: string; // Để dynamic tên người dùng
}

const Topbar = ({ onMenuClick, userName = "Pendragon" }: TopbarProps) => {
  return (
    <div className="bg-white rounded-[20px] px-6 py-4 flex items-center justify-between shadow-sm mb-6 border border-gray-100">
      <div className="flex items-center gap-4">
        {/* Nút Hamburger */}
        <button 
          onClick={onMenuClick}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
        >
          <Menu size={24} />
        </button>

        {/* Text Chào mừng */}
        <div className="flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 leading-tight">
            Good morning, {userName}
          </h2>
          <span className="text-xs font-bold text-gray-500 mt-0.5">
            Welcome back, great to see you again!
          </span>
        </div>
      </div>

      {/* Icon Chuông thông báo */}
      <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
        <Bell size={24} className="text-black font-bold" strokeWidth={2.5} />
        <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
      </button>
    </div>
  );
};

export default Topbar;