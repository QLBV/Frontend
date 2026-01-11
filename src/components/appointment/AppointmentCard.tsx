import { Calendar, Clock, MapPin, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { IAppointment } from "@/types/appointment"; 
import { getStatusColor, getStatusIcon } from "@/lib/utils/appointmentUtils";

interface AppointmentCardProps {
  appointment: IAppointment;
  onViewDetails: (apt: IAppointment) => void; 
  onCancel?: (id: string) => void;
  onFollowUp?: (doctorId: number) => void;
}

export function AppointmentCard({ 
  appointment, 
  onViewDetails, 
  onCancel, 
  onFollowUp 
}: AppointmentCardProps) {
  
  const isPast = ["Completed", "Cancelled"].includes(appointment.status);

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white">
      <CardContent className="p-6">
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center overflow-hidden">
              <img
                src={appointment.doctor.image || "/placeholder.svg"}
                alt={appointment.doctor.name}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">
                  {appointment.doctor.name}
                </h3>
                <p className="text-sm text-slate-600">{appointment.doctor.specialty}</p>
              </div>
              
              <Badge variant="outline" className={getStatusColor(appointment.status)}>
                {getStatusIcon(appointment.status)}
                <span className="ml-1">{appointment.displayStatus || appointment.status}</span>
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <InfoItem icon={<Calendar />} text={appointment.date} />
              <InfoItem icon={<Clock />} text={appointment.time} />
              <InfoItem icon={<MapPin />} text={appointment.location} />
              <InfoItem icon={<FileText />} text={appointment.reason} />
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => onViewDetails(appointment)}>
                View Details
              </Button>

              {onCancel && !isPast && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => onCancel(appointment.id)}
                >
                  Cancel
                </Button>
              )}

              {onFollowUp && appointment.status === "Completed" && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  onClick={() => onFollowUp(appointment.doctor.id)}
                >
                  Book Follow-up
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const InfoItem = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <div className="flex items-center gap-2 text-slate-600">
    <div className="h-4 w-4 text-blue-600 [&>svg]:h-full [&>svg]:w-full">{icon}</div>
    <span className="text-sm">{text}</span>
  </div>
);
