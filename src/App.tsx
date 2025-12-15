import { Routes, Route } from "react-router-dom"
import HomePage from "@/pages/LandingPage"
import BookAppointmentPage from "@/pages/patient/BookAppointmentPage"
import LoginPage from "@/pages/LoginPage"
import SignUpPage from "@/pages/patient/SignupPage"
import RecepDashboard from "@/pages/recep/dashboard"

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/book-appointment" element={<BookAppointmentPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<SignUpPage />} />
      <Route path="/recep/dashboard" element={<RecepDashboard />} />
    </Routes>
  )
}

export default App
