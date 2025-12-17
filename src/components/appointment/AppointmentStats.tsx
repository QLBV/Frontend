import { Calendar, CheckCircle, XCircle, Clock } from "lucide-react";

interface StatsProps {
  total: number;
  upcoming: number;
  completed: number;
  cancelled: number;
}

export function AppointmentStats({ stats }: { stats: StatsProps }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <StatCard 
        label="Total Appointments" 
        value={stats.total} 
        icon={<Calendar className="w-5 h-5 text-indigo-600" />} 
        bgColor="bg-indigo-50"
        borderColor="border-indigo-100"
      />
      <StatCard 
        label="Upcoming" 
        value={stats.upcoming} 
        icon={<Clock className="w-5 h-5 text-blue-600" />} 
        bgColor="bg-blue-50"
        borderColor="border-blue-100"
      />
      <StatCard 
        label="Completed" 
        value={stats.completed} 
        icon={<CheckCircle className="w-5 h-5 text-emerald-600" />} 
        bgColor="bg-emerald-50"
        borderColor="border-emerald-100"
      />
      <StatCard 
        label="Cancelled" 
        value={stats.cancelled} 
        icon={<XCircle className="w-5 h-5 text-red-600" />} 
        bgColor="bg-red-50"
        borderColor="border-red-100"
      />
    </div>
  );
}

// --- INTERNAL COMPONENT ---
function StatCard({ label, value, icon, bgColor, borderColor }: any) {
  return (
    <div className={`${bgColor} border ${borderColor} rounded-xl p-4 flex items-center justify-between shadow-sm`}>
      <div>
        <p className="text-sm font-medium text-slate-600">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
      </div>
      <div className="p-2 bg-white rounded-full shadow-sm">
        {icon}
      </div>
    </div>
  );
}