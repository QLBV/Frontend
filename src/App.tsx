import { Routes, Route } from "react-router-dom"
import HomePage from "@/pages/LandingPage"
import BookAppointmentPage from "@/pages/BookAppointmentPage"
import LoginPage from "@/pages/Loginpage"
function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/book-appointment" element={<BookAppointmentPage />} />
      <Route path="/login" element={<LoginPage />} />
    </Routes>
  )
}

export default App
