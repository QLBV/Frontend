"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/header";
import { AppointmentCard } from "@/components/appointment/Appointment_card"; 
import { AppointmentDetailModal } from "@/components/appointment/Appointment_detail_modal"; 
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

import { usePatientAppointments } from "../../../hooks/usePatientAppointments"; 

export default function PatientAppointmentsPage() {
  const navigate = useNavigate();
  
  // --- HOOK INTEGRATION ---
  const { 
    appointments, 
    stats,
    selectedAppointment, 
    isDetailOpen, 
    setIsDetailOpen, 
    viewDetails, 
    cancelAppointment 
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
    navigate("/book-appointment", { state: { selectedDoctorId: doctorId } });
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header />

      <div className="container mx-auto px-4 md:px-6 py-8">
        <div className="flex justify-between items-end mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">My Appointments</h1>
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
            {appointments.upcoming.length > 0 ? (
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
                 <p className="text-slate-500">No upcoming appointments.</p>
               </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="space-y-4 animate-in fade-in-50">
            {appointments.past.length > 0 ? (
                appointments.past.map((apt) => (
                <AppointmentCard
                    key={apt.id}
                    appointment={apt}
                    onViewDetails={viewDetails}
                    onFollowUp={onBookFollowUp}
                />
                ))
            ) : (
                <p className="text-slate-500 text-center py-10">No history found.</p>
            )}
          </TabsContent>
        </Tabs>
      </div>

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
  );
}