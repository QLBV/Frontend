import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { BookingForm } from "@/components/BookingForm"
import { useAuth } from "@/auth/authContext"
import { toast } from "sonner"
import PatientSidebar from "@/components/sidebar/patient"
import { getPatientById } from "@/services/patient.service"
import { Skeleton } from "@/components/ui/skeleton"

export default function BookAppointmentPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [patientCode, setPatientCode] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is authenticated
    if (isAuthenticated && user) {
      // If user doesn't have patientId, redirect to setup page
      if (!user.patientId) {
        toast.info("Vui lòng thiết lập hồ sơ bệnh nhân trước khi đặt lịch")
        navigate("/patient/setup")
        return
      }

      // Fetch patient profile for patient code
      const fetchPatientCode = async () => {
        try {
          if (user.patientId) {
            const patient = await getPatientById(user.patientId)
            setPatientCode(patient.patientCode || "")
          }
        } catch (error) {
          console.error("Error fetching patient profile:", error)
        } finally {
          setIsLoading(false)
        }
      }
      fetchPatientCode()
    } else {
      setIsLoading(false)
    }
  }, [user, isAuthenticated, navigate])

  if (isLoading) {
    return (
      <PatientSidebar 
        userName={user?.fullName || user?.email}
        patientCode={patientCode}
      >
        <div className="space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-6 w-96" />
          <Skeleton className="h-96 w-full" />
        </div>
      </PatientSidebar>
    )
  }

  return (
    <PatientSidebar 
      userName={user?.fullName || user?.email}
      patientCode={patientCode}
    >
      <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Đặt lịch hẹn
            </h1>
            <p className="text-gray-600">
              Chọn bác sĩ, ngày và giờ phù hợp với bạn
            </p>
          </div>
          <BookingForm />
        </div>
    </PatientSidebar>
  )
}
