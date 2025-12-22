import { Routes, Route } from "react-router-dom"
import HomePage from "@/pages/LandingPage"
import BookAppointmentPage from "@/pages/patient/BookAppointmentPage"
import LoginPage from "@/pages/LoginPage"
import SignUpPage from "@/pages/patient/SignupPage"
import RecepDashboard from "@/pages/recep/dashboard"
import RecepPatientsPage from "@/pages/recep/patient_list"
import PatientDetailPage from "@/pages/recep/patient_detail"
import PatientAppointmentsPage from "@/pages/patient/Appointments"
import DoctorListPage from "./pages/admin/doctorList"
import DoctorDetailPage from "./pages/admin/doctorDetail"
import DoctorAddPage from "./pages/admin/doctorAdd"
import DoctorSchedulePage from "./pages/admin/doctorSchedule"
import DoctorShilfPage from "./pages/admin/doctorShilf"
import MedicalListPage from "./pages/doctor/medicalList"
import FormMedicalPage from "./pages/doctor/formMedical"
function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/book-appointment" element={<BookAppointmentPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<SignUpPage />} />
      <Route path="/recep/dashboard" element={<RecepDashboard />} />
      <Route path="/recep/patients" element={<RecepPatientsPage />} />
      <Route path="/recep/patients/:id" element={<PatientDetailPage />} />
      <Route path="/patient/appointments" element={<PatientAppointmentsPage />} />
      <Route path="/admin/doctors" element={<DoctorListPage />} />
      <Route path="/admin/doctors/:id" element={<DoctorDetailPage />} />
      <Route path="/admin/doctors/add" element={<DoctorAddPage />} />
      <Route path="/admin/schedule" element={<DoctorSchedulePage />} />
      <Route path="/admin/doctors/:id/shilf" element={<DoctorShilfPage />} />
      <Route path="/doctor/medicalList" element={<MedicalListPage />} />
      <Route path="/doctor/patients/:id" element={<FormMedicalPage />} />
      <Route path="/doctor/patients/:id/examination" element={<FormMedicalPage />} />
    </Routes>
  )
}

export default App
