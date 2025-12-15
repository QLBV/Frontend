import { Routes, Route } from "react-router-dom"
import HomePage from "@/pages/LandingPage"
import BookAppointmentPage from "@/pages/patient/BookAppointmentPage"
import LoginPage from "@/pages/LoginPage"
import SignUpPage from "@/pages/patient/SignupPage"
import RecepDashboard from "@/pages/recep/dashboard"
import RecepPatientsPage from "@/pages/recep/patient_list"
import PatientDetailPage from "@/pages/recep/patient_detail"
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
    </Routes>
  )
}

export default App
