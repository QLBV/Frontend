"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppointmentCard } from "@/components/appointment/AppointmentCard"; 
import { AppointmentDetailModal } from "@/components/appointment/AppointmentDetailModal"; 
import { AppointmentStats } from "@/components/appointment/AppointmentStats"; 
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, FileText } from "lucide-react";

import { usePatientAppointments } from "@/hooks/usePatientAppointments";
import { Skeleton } from "@/components/ui/skeleton";

import PatientSidebar from "@/components/sidebar/patient";
import { useAuth } from "@/auth/authContext";

export default function PatientAppointmentsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // --- HOOK INTEGRATION ---
  const { 
    appointments, 
    stats,
    selectedAppointment, 
    isDetailOpen, 
    setIsDetailOpen, 
    viewDetails, 
    cancelAppointment,
    isLoading
  } = usePatientAppointments();

  // --- LOCAL STATE ---
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  // --- EVENT HANDLERS ---
  const onInitiateCancel = (id: string) => {
    setCancelTargetId(id);
    setCancelReason("");
    setIsCancelDialogOpen(true);
  };

  const onConfirmCancel = () => {
    if (cancelTargetId && cancelReason.trim()) {
      cancelAppointment(cancelTargetId, cancelReason);
      setIsCancelDialogOpen(false);
    }
  };

  const onBookFollowUp = (doctorId: number) => {
    navigate("/patient/book-appointment", { state: { selectedDoctorId: doctorId } });
  };

  // --- RENDER ---
  return (
    <PatientSidebar 
      userName={user?.fullName || user?.email}
    >
      <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">My Appointments</h1>
            <p className="text-muted-foreground mt-1">
              Xem và quản lý các lịch hẹn của bạn
            </p>
          </div>

        {/* STATS SECTION */}
        <AppointmentStats stats={stats} />

        {/* TABS SECTION */}
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="bg-white p-1 border shadow-sm rounded-lg h-auto">
            <TabsTrigger value="upcoming" className="px-6 py-2">Upcoming</TabsTrigger>
            <TabsTrigger value="past" className="px-6 py-2">History</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4 animate-in fade-in-50">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="border-0 shadow-lg bg-white">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-6">
                        <Skeleton className="h-20 w-20 rounded-full" />
                        <div className="flex-1 space-y-3">
                          <div className="flex justify-between">
                            <div className="space-y-2">
                              <Skeleton className="h-6 w-48" />
                              <Skeleton className="h-4 w-32" />
                            </div>
                            <Skeleton className="h-6 w-24" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                          </div>
                          <div className="flex gap-3">
                            <Skeleton className="h-9 w-24" />
                            <Skeleton className="h-9 w-20" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : appointments.upcoming.length > 0 ? (
              appointments.upcoming.map((apt) => (
                <AppointmentCard
                  key={apt.id}
                  appointment={apt}
                  onViewDetails={viewDetails}
                  onCancel={onInitiateCancel}
                />
              ))
            ) : (
               <div className="text-center py-12 bg-white rounded-xl border border-dashed">
                 <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                 <p className="text-slate-600 font-medium mb-2">No upcoming appointments</p>
                 <p className="text-sm text-slate-500 mb-6">You don't have any scheduled appointments yet.</p>
                 <Button onClick={() => navigate("/patient/book-appointment")}>
                   Book New Appointment
                 </Button>
               </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4 animate-in fade-in-50">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <Card key={i} className="border-0 shadow-lg bg-white">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-6">
                        <Skeleton className="h-20 w-20 rounded-full" />
                        <div className="flex-1 space-y-3">
                          <div className="flex justify-between">
                            <div className="space-y-2">
                              <Skeleton className="h-6 w-48" />
                              <Skeleton className="h-4 w-32" />
                            </div>
                            <Skeleton className="h-6 w-24" />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                          </div>
                          <div className="flex gap-3">
                            <Skeleton className="h-9 w-24" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : appointments.past.length > 0 ? (
                appointments.past.map((apt) => (
                <AppointmentCard
                    key={apt.id}
                    appointment={apt}
                    onViewDetails={viewDetails}
                    onFollowUp={onBookFollowUp}
                />
                ))
            ) : (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                  <p className="text-slate-600 font-medium mb-2">No appointment history</p>
                  <p className="text-sm text-slate-500 mb-6">Your past appointments will appear here.</p>
                  <Button onClick={() => navigate("/patient/book-appointment")}>
                    Book New Appointment
                  </Button>
                </div>
            )}
          </TabsContent>
        </Tabs>

          {/* --- MODALS --- */}
          
          <AppointmentDetailModal 
            isOpen={isDetailOpen} 
            onOpenChange={setIsDetailOpen} 
            appointment={selectedAppointment} 
          />
          
          <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cancel Appointment</DialogTitle>
                <DialogDescription>
                  Are you sure? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label className="mb-2 block">Reason</Label>
                <Textarea 
                  value={cancelReason} 
                  onChange={(e) => setCancelReason(e.target.value)} 
                  placeholder="Why are you cancelling?"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>Back</Button>
                <Button variant="destructive" onClick={onConfirmCancel} disabled={!cancelReason.trim()}>Confirm Cancel</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
    </PatientSidebar>
  );
}