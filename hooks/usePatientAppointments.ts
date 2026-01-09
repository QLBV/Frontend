import { useState, useMemo, useEffect } from "react";
import type { IAppointment } from "../src/types/appointment";
import { getMyAppointments, cancelAppointment as cancelAppointmentAPI, type Appointment } from "../src/services/appointment.service";
import { toast } from "sonner";

export function usePatientAppointments() {
  // --- STATE MANAGEMENT ---
  const [appointments, setAppointments] = useState<{ upcoming: IAppointment[]; past: IAppointment[] }>({
    upcoming: [],
    past: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<IAppointment | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // --- FETCH APPOINTMENTS FROM API ---
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'usePatientAppointments.ts:19',message:'Fetching appointments from API',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'B'})}).catch(()=>{});
        // #endregion

        setIsLoading(true);
        const data = await getMyAppointments();

        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'usePatientAppointments.ts:26',message:'Appointments fetched',data:{count:data.length},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'B'})}).catch(()=>{});
        // #endregion

        // Convert API format to IAppointment format
        const now = new Date();
        const upcoming: IAppointment[] = [];
        const past: IAppointment[] = [];

        data.forEach((apt: Appointment) => {
          const aptDate = new Date(apt.date);
          const isUpcoming = aptDate >= now && apt.status === "WAITING";

          const convertedAppointment: IAppointment = {
            id: apt.id.toString(),
            date: aptDate.toISOString().split('T')[0],
            time: apt.shift?.startTime || "N/A",
            doctor: {
              id: apt.doctorId,
              name: apt.doctor?.fullName || "Unknown Doctor",
              specialty: apt.doctor?.specialty?.name || "General",
              image: "/placeholder.svg"
            },
            type: apt.bookingType === "ONLINE" ? "Online" : "In-person",
            location: "Clinic",
            reason: apt.symptomInitial || "No reason provided",
            status: apt.status === "WAITING" ? "Confirmed" : 
                    apt.status === "COMPLETED" ? "Completed" :
                    apt.status === "CANCELLED" ? "Cancelled" : apt.status
          };

          if (isUpcoming) {
            upcoming.push(convertedAppointment);
          } else {
            past.push(convertedAppointment);
          }
        });

        setAppointments({ upcoming, past });
      } catch (error: any) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'usePatientAppointments.ts:60',message:'Error fetching appointments',data:{error:error.message},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'B'})}).catch(()=>{});
        // #endregion

        console.error("Error fetching appointments:", error);
        toast.error(error.response?.data?.message || "Không thể tải danh sách lịch hẹn");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, []);

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
  const cancelAppointment = async (id: string, reason: string) => {
    try {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'usePatientAppointments.ts:78',message:'Cancelling appointment',data:{appointmentId:id,reason},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'B'})}).catch(()=>{});
      // #endregion

      await cancelAppointmentAPI(Number(id));

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'usePatientAppointments.ts:83',message:'Appointment cancelled successfully',data:{appointmentId:id},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'B'})}).catch(()=>{});
      // #endregion

      // Update local state optimistically
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

      toast.success("Hủy lịch hẹn thành công!");
    } catch (error: any) {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/5d460a2c-0770-476c-bcfe-75b1728b43da',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'usePatientAppointments.ts:104',message:'Error cancelling appointment',data:{error:error.message,appointmentId:id},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'B'})}).catch(()=>{});
      // #endregion

      console.error("Error cancelling appointment:", error);
      toast.error(error.response?.data?.message || "Không thể hủy lịch hẹn");
    }
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
    isLoading,
  };
}