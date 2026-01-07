import React, { type ReactNode } from 'react';
import { useLocation, Link } from 'react-router-dom'; 
import SidebarLayout from "@/components/sidebar_layout";
import { 
  LayoutDashboard, 
  ClipboardList,   
  CalendarDays,    
  FileText         
} from 'lucide-react';

interface ReceptionistLayoutProps {
  children?: ReactNode;
}

const ReceptionistSidebar = ({ children }: ReceptionistLayoutProps) => {
  const location = useLocation(); 

  const receptionistMenu = [
    {
      title: "Dashboard",
      items: [
        { label: "Dashboard", href: "/receptionist/dashboard", icon: <LayoutDashboard size={24} strokeWidth={2.5} /> }
      ]
    },
    {
      title: "Patient",
      items: [
        
        { label: "Patient List", href: "/recep/patients", icon: <ClipboardList size={24} strokeWidth={2.5} /> }
      ]
    },
    {
      title: "Appointment",
      items: [
        { label: "Appointment", href: "/appointments", icon: <CalendarDays size={24} strokeWidth={2.5} /> }
      ]
    },
    {
      title: "Payment",
      items: [
        { label: "Invoice", href: "/invoices", icon: <FileText size={24} strokeWidth={2.5} /> }
      ]
    }
  ];

  return (
    <SidebarLayout 
      logoText="HealthCare"
      userName="Receptionist"
      pageContent={
        <div className="h-full space-y-6">
          {children} 
        </div>
      }
    >
      {receptionistMenu.map((group, index) => (
        <div key={index}>
          <h2 className="text-blue-500 font-bold text-lg mb-3 mt-4 first:mt-0">
            {group.title}
          </h2>
          <div className="space-y-3">
            {group.items.map((item, itemIndex) => {
              const isActive = location.pathname === item.href;

              return (
                <Link 
                  to={item.href}
                  key={itemIndex}
                  className={`
                    flex items-center gap-3 w-full text-left group p-2 rounded-lg transition-colors -ml-2
                    ${isActive 
                      ? "bg-blue-50 text-blue-600"  
                      : "hover:bg-gray-50 text-gray-500" 
                    }
                  `}
                >
                  <span className={`transition-colors ${isActive ? "text-blue-600" : "group-hover:text-blue-600"}`}>
                    {item.icon}
                  </span>
                  <span className={`font-bold text-base transition-colors ${isActive ? "text-blue-700" : "text-gray-700 group-hover:text-black"}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </SidebarLayout>
  );
};

export default ReceptionistSidebar;