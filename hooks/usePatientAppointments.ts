import { useState, useMemo } from "react";
import type { IAppointment } from "../src/types/appointment"; 

// --- MOCK DATA ---
const MOCK_DATA: { upcoming: IAppointment[]; past: IAppointment[] } = {
  upcoming: [
    {
      id: "1",
      date: "2025-12-20",
      time: "09:00 AM",
      doctor: { id: 1, name: "Dr. Sarah Johnson", specialty: "Cardiology", image: "/female-doctor.png" },
      type: "In-person",
      location: "Room 203, Building A",
      reason: "Follow-up consultation",
      status: "Confirmed",
    },
    {
      id: "2",
      date: "2025-12-22",
      time: "02:30 PM",
      doctor: { id: 2, name: "Dr. Mark Wilson", specialty: "Dermatology", image: "/male-doctor.png" },
      type: "Video Call",
      location: "Online",
      reason: "Skin allergy check",
      status: "Pending", 
    },
  ],
  past: [
    {
        id: "3",
        date: "2025-11-15",
        time: "10:00 AM",
        doctor: { id: 1, name: "Dr. Sarah Johnson", specialty: "Cardiology", image: "/female-doctor.png" },
        type: "In-person",
        location: "Room 203, Building A",
        reason: "Regular heart checkup",
        status: "Completed",
        diagnosis: "Normal rhythm",
        prescription: "None",
        nextSteps: "Maintain healthy diet"
    },
    {
        id: "4",
        date: "2025-10-05",
        time: "04:00 PM",
        doctor: { id: 3, name: "Dr. Emily Chen", specialty: "Pediatrics", image: "/female-doctor-2.png" },
        type: "In-person",
        location: "Room 101, Building B",
        reason: "Flu symptoms",
        status: "Cancelled",
        notes: "Cancelled by Patient: Feeling better, no longer needed."
    },
    {
        id: "5",
        date: "2025-09-20",
        time: "09:00 AM",
        doctor: { id: 2, name: "Dr. Mark Wilson", specialty: "Dermatology", image: "/male-doctor.png" },
        type: "In-person",
        location: "Room 405, Building C",
        reason: "Annual Skin Screening",
        status: "Completed",
        diagnosis: "Benign mole removed",
        nextSteps: "Apply sunscreen daily"
    }
  ],
};

export function usePatientAppointments() {
  // --- STATE MANAGEMENT ---
  const [appointments, setAppointments] = useState<{ upcoming: IAppointment[]; past: IAppointment[] }>(MOCK_DATA);
  const [selectedAppointment, setSelectedAppointment] = useState<IAppointment | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // --- STATISTICS ---
  const stats = useMemo(() => {
    const all = [...appointments.upcoming, ...appointments.past];
    return {
      total: all.length,
      upcoming: appointments.upcoming.length,
      completed: all.filter(a => a.status === "Completed").length,
      cancelled: all.filter(a => a.status === "Cancelled").length,
    };
  }, [appointments]);

  // --- ACTIONS ---
  const cancelAppointment = (id: string, reason: string) => {
    setAppointments((prev) => {
      const aptToCancel = prev.upcoming.find((a) => a.id === id);
      if (!aptToCancel) return prev;

      const cancelledApt: IAppointment = {
        ...aptToCancel,
        status: "Cancelled",
        notes: `Reason: ${reason}`,
      };

      return {
        upcoming: prev.upcoming.filter((a) => a.id !== id),
        past: [cancelledApt, ...prev.past], 
      };
    });
  };

  const viewDetails = (apt: IAppointment) => {
    setSelectedAppointment(apt);
    setIsDetailOpen(true);
  };

  const closeDetails = () => {
    setIsDetailOpen(false);
    setTimeout(() => setSelectedAppointment(null), 200); 
  };

  return {
    appointments,
    stats,
    selectedAppointment,
    isDetailOpen,
    setIsDetailOpen, 
    viewDetails,
    closeDetails,
    cancelAppointment,
  };
}