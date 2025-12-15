import SidebarLayout from "@/components/sidebar_layout";
import { 

  LayoutDashboard, // Icon: Dashboard
  ClipboardList,   // Icon: Patient List
  HeartPulse,    // Icon: Diagnose
  Pill,    // Icon: Prescription
  ScrollText,     // Icon: Invoice List
} from 'lucide-react';

const PatientSidebar = () => {
  // Dữ liệu menu đã được cập nhật đúng theo yêu cầu
  const DoctorMenu = [
    {
      title: "Dashboard",
      items: [
        { label: "Dashboard", icon: <LayoutDashboard size={24} strokeWidth={2.5} /> }
      ]
    },
    {
      title: "Examination",
      items: [
        { label: "Patient List", icon: <ClipboardList size={24} strokeWidth={2.5} /> },
        { label: "Diagnose", icon: <HeartPulse size={24} strokeWidth={2.5} /> }
      ]
    },
    {
      title: "Prescription",
      items: [
        { label: "Cre.Prescription", icon: <Pill size={24} strokeWidth={2.5} /> }
      ]
    },
    {
      title: "Payment",
      items: [
        { label: "Invoice List", icon: <ScrollText size={24} strokeWidth={2.5} /> }
      ]
    }
  ];

  return (
    <SidebarLayout logoText="Logo Placeholder">
      {DoctorMenu.map((group, index) => (
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

export default PatientSidebar;