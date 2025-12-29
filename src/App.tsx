import { Routes, Route } from "react-router-dom"
import { AuthProvider } from "@/auth/authContext"
import { Toaster } from "@/components/ui/sonner"
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
import DoctorsShiftPage from "./pages/admin/doctorShift"
import MedicalListPage from "./pages/doctor/medicalList"
import FormMedicalPage from "./pages/doctor/formMedical"
import PrescribeMedPage from "./pages/doctor/prescribeMed"
import DoctorShiftPage from "./pages/doctor/doctorShift"
import UiQuanLyDT from "./pages/doctor/QuanlyDonThuoc"
import PrescriptionDetailPage from "./pages/doctor/prescriptionDetail"
import PharmacyPage from "./pages/PharmacyPage"
import PharmacyImportPage from "./pages/admin/PharmacyImportPage"
import PharmacyDetailPage from "./pages/PharmacyDetailPage"
import InvoicesPage from "./pages/recep/InvoicesPage"
import InvoiceDetailPage from "./pages/recep/InvoiceDetailPage"
import SalaryPage from "./pages/admin/SalaryPage"
import AdminDashboardPage from "./pages/admin/DashboardPage"
import DoctorDashboardPage from "./pages/doctor/DashboardPage"
import ReceptionistDashboardPage from "./pages/recep/DashboardPage"

function App() {
  return (
    <AuthProvider>
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
        <Route path="/admin/doctors/:id/shift" element={<DoctorsShiftPage />} />
        <Route path="/doctor/medicalList" element={<MedicalListPage />} />
        <Route path="/doctor/shift" element={<DoctorShiftPage />} />
        <Route path="/doctor/patients/:id" element={<FormMedicalPage />} />
        <Route path="/doctor/patients/:id/examination" element={<FormMedicalPage />} />
        <Route path="/doctor/patients/:id/prescription" element={<PrescribeMedPage />} />
        <Route path="/doctor/prescriptions" element={<UiQuanLyDT />} />
        <Route path="/doctor/prescriptions/:id/edit" element={<PrescriptionDetailPage />} />
        <Route path="/pharmacy" element={<PharmacyPage />} />
        <Route path="/admin/pharmacy/import" element={<PharmacyImportPage />} />
        <Route path="/pharmacy/:id" element={<PharmacyDetailPage />} />
        <Route path="/invoices" element={<InvoicesPage />} />
        <Route path="/invoices/:id" element={<InvoiceDetailPage />} />
        <Route path="/salary" element={<SalaryPage />} />
        <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboardPage />} />
        <Route path="/receptionist-dashboard" element={<ReceptionistDashboardPage />} />
      </Routes>
      <Toaster />
    </AuthProvider>
  )
}

export default App
