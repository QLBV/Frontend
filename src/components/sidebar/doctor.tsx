import SidebarLayout from "@/components/sidebar_layout";
import { useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard,
  ClipboardList,
  HeartPulse,
  Pill,
  ScrollText,
} from 'lucide-react';
import type { ReactNode } from 'react';

interface DoctorSidebarProps {
  children: ReactNode;
}

const DoctorSidebar = ({ children }: DoctorSidebarProps) => {
  const location = useLocation();

  const doctorMenu = [
    {
      title: "Dashboard",
      items: [
        { label: "Dashboard", href: "/doctor/dashboard", icon: <LayoutDashboard size={24} strokeWidth={2.5} /> }
      ]
    },
    {
      title: "Examination",
      items: [
        { label: "Patient List", href: "/doctor/medicalList", icon: <ClipboardList size={24} strokeWidth={2.5} /> },
        { label: "Diagnose", href: "/doctor/diagnose", icon: <HeartPulse size={24} strokeWidth={2.5} /> }
      ]
    },
    {
      title: "Prescription",
      items: [
        { label: "Prescription", href: "/doctor/prescriptions", icon: <Pill size={24} strokeWidth={2.5} /> }
      ]
    },
    {
      title: "Payment",
      items: [
        { label: "Invoice List", href: "/doctor/invoices", icon: <ScrollText size={24} strokeWidth={2.5} /> }
      ]
    }
  ];

  return (
    <SidebarLayout 
      logoText="HealthCare Doctor"
      userName="Doctor"
      pageContent={children}
    >
      {doctorMenu.map((group, index) => (
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

export default DoctorSidebar;