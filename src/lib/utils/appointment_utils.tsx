import { CheckCircle, AlertCircle, Clock, XCircle } from "lucide-react";

export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "confirmed": return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "pending": return "bg-amber-50 text-amber-700 border-amber-200";
    case "completed": return "bg-blue-50 text-blue-700 border-blue-200";
    case "cancelled": return "bg-red-50 text-red-700 border-red-200";
    default: return "bg-slate-50 text-slate-700 border-slate-200";
  }
};

export const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "confirmed": return <CheckCircle className="h-4 w-4" />;
    case "pending": return <AlertCircle className="h-4 w-4" />;
    case "completed": return <CheckCircle className="h-4 w-4" />;
    case "cancelled": return <XCircle className="h-4 w-4" />;
    default: return <Clock className="h-4 w-4" />;
  }
};