import SidebarLayout from "@/components/sidebar_layout";
import { 
  LayoutDashboard, // Icon: Dashboard
  ClipboardList,   // Icon: Inventory
  CalendarDays,    // Icon: Schedule
  FileText,         // Icon: Revenue
  UsersRound,    // Icon: Empoyee
  Banknote,         // Icon: Salary
  Blocks,        // Icon: Expense
  Component,    // Icon: General
  Bell,        // Icon: Notification
} from 'lucide-react';

const ReceptionistSidebar = () => {
  // Dữ liệu menu đã được cập nhật đúng theo yêu cầu
  const receptionistMenu = [
    {
      title: "Dashboard",
      items: [
        { label: "Dashboard", icon: <LayoutDashboard size={24} strokeWidth={2.5} /> }
      ]
    },
    {
      title: "Management",
      items: [
        { label: "Employee", icon: <UsersRound size={24} strokeWidth={2.5} /> },
        { label: "Schedule", icon: <CalendarDays size={24} strokeWidth={2.5} /> },
        { label: "Inventory", icon: <ClipboardList size={24} strokeWidth={2.5} /> },
        { label: "Salary", icon: <Banknote size={24} strokeWidth={2.5} /> }
      ]
    },
    {
      title: "Report",
      items: [
        { label: "Revenue", icon: <FileText size={24} strokeWidth={2.5} /> },
        { label: "Expense", icon: <Blocks size={24} strokeWidth={2.5} /> }
      ]
    },
    {
      title: "Settings",
      items: [
        { label: "General", icon: <Component size={24} strokeWidth={2.5} /> },
        { label: "Notification", icon: <Bell size={24} strokeWidth={2.5} /> }
      ]
    }
  ];

  return (
    <SidebarLayout logoText="Logo Placeholder">
      {receptionistMenu.map((group, index) => (
        <div key={index}>
          <h2 className="text-blue-500 font-bold text-lg mb-3">
            {group.title}
          </h2>
          <div className="space-y-3">
            {group.items.map((item, itemIndex) => (
              <button 
                key={itemIndex}
                className="flex items-center gap-3 w-full text-left group hover:bg-gray-50 p-2 rounded-lg transition-colors -ml-2"
              >
                <span className="text-gray-800">
                  {item.icon}
                </span>
                <span className="font-bold text-black text-base">
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