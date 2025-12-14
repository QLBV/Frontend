import SidebarLayout from "@/components/sidebar_layout";
import { 

  House, // Icon: Home
  ClipboardClock,   // Icon: Appointment
  SquareActivity,    // Icon: Medical History
} from 'lucide-react';

const PatientSidebar = () => {
  // Dữ liệu menu đã được cập nhật đúng theo yêu cầu
  const PatientMenu = [
    {
      title: "Dashboard",
      items: [
        { label: "Dashboard", icon: <House size={24} strokeWidth={2.5} /> },
        { label: "Appointment", icon: <ClipboardClock size={24} strokeWidth={2.5} /> },
        { label: "Medical History", icon: <SquareActivity size={24} strokeWidth={2.5} /> }
      ]
    },
  ];

  return (
    <SidebarLayout logoText="Logo Placeholder">
      {PatientMenu.map((group, index) => (
        <div key={index}>
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

export default PatientSidebar;