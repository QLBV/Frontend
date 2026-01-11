import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, MapPin, Activity, Pill } from "lucide-react";
import type { IAppointment } from "@/types/appointment";
import { getStatusColor } from "@/lib/utils/appointmentUtils";

interface AppointmentDetailModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: IAppointment | null;
}

export function AppointmentDetailModal({ isOpen, onOpenChange, appointment }: AppointmentDetailModalProps) {
  if (!appointment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex justify-between items-center mr-6">
            <DialogTitle className="text-2xl">Appointment Details</DialogTitle>
            <Badge className={getStatusColor(appointment.status)} variant="outline">
              {appointment.displayStatus || appointment.status}
            </Badge>
          </div>
          <DialogDescription>ID: {appointment.id}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Section 1: Doctor & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
            <div className="flex items-center gap-3">
               <div className="h-12 w-12 rounded-full overflow-hidden bg-blue-100">
                  <img src={appointment.doctor.image} alt="doc" className="object-cover w-full h-full"/>
               </div>
               <div>
                 <p className="font-semibold">{appointment.doctor.name}</p>
                 <p className="text-sm text-slate-500">{appointment.doctor.specialty}</p>
               </div>
            </div>
            <div className="space-y-2 text-sm">
               <div className="flex items-center gap-2 text-slate-700">
                 <Calendar className="w-4 h-4 text-blue-500"/> {appointment.date}
               </div>
               <div className="flex items-center gap-2 text-slate-700">
                 <Clock className="w-4 h-4 text-blue-500"/> {appointment.time}
               </div>
               <div className="flex items-center gap-2 text-slate-700">
                 <MapPin className="w-4 h-4 text-blue-500"/> {appointment.location}
               </div>
            </div>
          </div>

          <Separator />

          {/* Section 2: Medical Info */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Activity className="w-4 h-4 text-red-500"/> Medical Information
            </h4>
            
            <div className="grid grid-cols-1 gap-4 pl-6">
               <div>
                  <span className="font-semibold text-sm text-slate-900 block">Reason for Visit</span>
                  <p className="text-slate-600">{appointment.reason}</p>
               </div>

               {appointment.diagnosis && (
                 <div>
                    <span className="font-semibold text-sm text-slate-900 block">Diagnosis</span>
                    <p className="text-slate-600 bg-blue-50 p-2 rounded border border-blue-100">{appointment.diagnosis}</p>
                 </div>
               )}

               {appointment.prescription && (
                 <div>
                    <span className="font-semibold text-sm text-slate-900 block flex items-center gap-2">
                       <Pill className="w-3 h-3"/> Prescription
                    </span>
                    <p className="text-slate-600">{appointment.prescription}</p>
                 </div>
               )}

               {appointment.nextSteps && (
                 <div>
                    <span className="font-semibold text-sm text-slate-900 block">Doctor's Note / Next Steps</span>
                    <p className="text-slate-600 italic">{appointment.nextSteps}</p>
                 </div>
               )}
               
               {appointment.status === 'Cancelled' && appointment.notes && (
                 <div className="bg-red-50 p-3 rounded border border-red-100">
                    <span className="font-semibold text-red-700 block">Cancellation Reason</span>
                    <p className="text-red-600">{appointment.notes}</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
