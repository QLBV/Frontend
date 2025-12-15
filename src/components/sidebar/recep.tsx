import React, { type ReactNode } from 'react';
import SidebarLayout from "@/components/sidebar_layout";
import { 
  LayoutDashboard, 
  ClipboardList,   
  CalendarDays,    
  FileText         
} from 'lucide-react';

// 1. Add an interface to accept "children" (The dashboard content)
interface ReceptionistLayoutProps {
  children?: ReactNode;
}

const ReceptionistSidebar = ({ children }: ReceptionistLayoutProps) => {
  
  const receptionistMenu = [
    {
      title: "Dashboard",
      items: [
        { label: "Dashboard", icon: <LayoutDashboard size={24} strokeWidth={2.5} /> }
      ]
    },
    {
      title: "Patient",
      items: [
        { label: "Patient List", icon: <ClipboardList size={24} strokeWidth={2.5} /> }
      ]
    },
    {
      title: "Appointment",
      items: [
        { label: "Appointment", icon: <CalendarDays size={24} strokeWidth={2.5} /> }
      ]
    },
    {
      title: "Payment",
      items: [
        { label: "Invoice", icon: <FileText size={24} strokeWidth={2.5} /> }
      ]
    }
  ];

  return (
    <SidebarLayout 
      logoText="HealthCare"
      userName="Receptionist" 
      // 2. Pass the children (Dashboard content) into the pageContent prop
      pageContent={
        <div className="p-2">
          {children} 
        </div>
      }
    >
      {/* 3. Render the Menu Items */}
      {receptionistMenu.map((group, index) => (
        <div key={index}>
          <h2 className="text-blue-500 font-bold text-lg mb-3 mt-4 first:mt-0">
            {group.title}
          </h2>
          <div className="space-y-3">
            {group.items.map((item, itemIndex) => (
              <button 
                key={itemIndex}
                className="flex items-center gap-3 w-full text-left group hover:bg-gray-50 p-2 rounded-lg transition-colors -ml-2"
              >
                <span className="text-gray-500 group-hover:text-blue-600 transition-colors">
                  {item.icon}
                </span>
                <span className="font-bold text-gray-700 group-hover:text-black text-base transition-colors">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </SidebarLayout>
  );
};

export default ReceptionistSidebar;