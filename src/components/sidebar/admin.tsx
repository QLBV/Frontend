import SidebarLayout from "@/components/sidebar_layout";
import { useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard,
  ClipboardList,
  CalendarDays,
  FileText,
  UsersRound,
  Banknote,
  Blocks,
  Component,
  Bell,
} from 'lucide-react';
import type { ReactNode } from 'react';

interface AdminSidebarProps {
  children: ReactNode;
}

const AdminSidebar = ({ children }: AdminSidebarProps) => {
  const location = useLocation();

  const adminMenu = [
    {
      title: "Dashboard",
      items: [
        { label: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard size={24} strokeWidth={2.5} /> }
      ]
    },
    {
      title: "Management",
      items: [
        { label: "Employee", href: "/admin/doctors", icon: <UsersRound size={24} strokeWidth={2.5} /> },
        { label: "Schedule", href: "/admin/schedule", icon: <CalendarDays size={24} strokeWidth={2.5} /> },
        { label: "Inventory", href: "/admin/inventory", icon: <ClipboardList size={24} strokeWidth={2.5} /> },
        { label: "Salary", href: "/admin/salary", icon: <Banknote size={24} strokeWidth={2.5} /> }
      ]
    },
    {
      title: "Report",
      items: [
        { label: "Revenue", href: "/admin/revenue", icon: <FileText size={24} strokeWidth={2.5} /> },
        { label: "Expense", href: "/admin/expense", icon: <Blocks size={24} strokeWidth={2.5} /> }
      ]
    },
    {
      title: "Settings",
      items: [
        { label: "General", href: "/admin/general", icon: <Component size={24} strokeWidth={2.5} /> },
        { label: "Notification", href: "/admin/notification", icon: <Bell size={24} strokeWidth={2.5} /> }
      ]
    }
  ];

  return (
    <SidebarLayout 
      logoText="HealthCare Admin"
      userName="Admin"
      pageContent={children}
    >
      {adminMenu.map((group, index) => (
        <div key={index}>
          <h2 className="text-blue-500 font-bold text-lg mb-3 mt-4 first:mt-0">
            {group.title}
          </h2>
          <div className="space-y-3">
            {group.items.map((item, itemIndex) => {
              // Kiểm tra xem mục này có đang active không
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

export default AdminSidebar;