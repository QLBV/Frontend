export type AppointmentStatus =
  | "Confirmed"
  | "Pending"
  | "Checked-in"
  | "In Progress"
  | "Completed"
  | "Cancelled";

export interface IDoctor {
  id: number;
  name: string;
  specialty: string;
  image: string;
}

export interface IAppointment {
  id: string;
  date: string;
  time: string;
  doctor: IDoctor;
  type: string;
  location: string;
  reason: string;
  status: AppointmentStatus;
  displayStatus?: string;
  rawStatus?: string;
  notes?: string;
  diagnosis?: string;
  prescription?: string;
  nextSteps?: string;
}
