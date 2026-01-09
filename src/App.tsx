import { Routes, Route, Navigate } from "react-router-dom"
import { Suspense, lazy } from "react"
import { AuthProvider } from "@/auth/authContext"
import { Toaster } from "@/components/ui/sonner"
import ProtectedRoute from "@/components/ProtectedRoute"

// Public pages - No lazy loading needed (small, frequently accessed)
import HomePage from "@/pages/LandingPage"
import LoginPage from "@/pages/LoginPage"
import SignUpPage from "@/pages/patient/SignupPage"
import BookAppointmentPage from "@/pages/patient/BookAppointmentPage"
import ForgotPasswordPage from "@/pages/ForgotPasswordPage"
import ResetPasswordPage from "@/pages/ResetPasswordPage"
import OAuthCallbackPage from "@/pages/OAuthCallbackPage"
import OAuthErrorPage from "@/pages/OAuthErrorPage"
const ProfilePage = lazy(() => import("./pages/ProfilePage"))

// Lazy load profile pages for each role
const AdminProfilePage = lazy(() => import("./pages/admin/ProfilePage"))
const DoctorProfilePage = lazy(() => import("./pages/doctor/ProfilePage"))
const PatientProfilePage = lazy(() => import("./pages/patient/ProfilePage"))
const PatientUpdateHealthInfoPage = lazy(() => import("./pages/patient/UpdateHealthInfoPage"))
const ReceptionistProfilePage = lazy(() => import("./pages/receptionist/ProfilePage"))

// Lazy load admin pages
const AdminDashboardPage = lazy(() => import("./pages/admin/DashboardPage"))
const DoctorListPage = lazy(() => import("./pages/admin/doctorList"))
const DoctorDetailPage = lazy(() => import("./pages/admin/doctorDetail"))
const DoctorAddPage = lazy(() => import("./pages/admin/doctorAdd"))
const DoctorSchedulePage = lazy(() => import("./pages/admin/doctorSchedule"))
const DoctorsShiftPage = lazy(() => import("./pages/admin/doctorShift"))
const PharmacyImportPage = lazy(() => import("./pages/admin/PharmacyImportPage"))
const CreateMedicinePage = lazy(() => import("./pages/admin/CreateMedicinePage"))
const MedicineImportsPage = lazy(() => import("./pages/admin/MedicineImportsPage"))
const MedicineExportsPage = lazy(() => import("./pages/admin/MedicineExportsPage"))
const SalaryPage = lazy(() => import("./pages/admin/SalaryPage"))
const RevenueReportPage = lazy(() => import("./pages/admin/revenueReport"))
const ExpenseReportPage = lazy(() => import("./pages/admin/expenseReport"))
const ProfitReportPage = lazy(() => import("./pages/admin/profitReport"))
const AppointmentReportPage = lazy(() => import("./pages/admin/appointmentReport"))
const PatientStatisticsReportPage = lazy(() => import("./pages/admin/patientStatisticsReport"))
const MedicineAlertsReportPage = lazy(() => import("./pages/admin/medicineAlertsReport"))
const MedicineReportPage = lazy(() => import("./pages/admin/medicineReport"))
const GenderReportPage = lazy(() => import("./pages/admin/genderReport"))
const UserManagementPage = lazy(() => import("./pages/admin/UserManagementPage"))
const UserDetailPage = lazy(() => import("./pages/admin/UserDetailPage"))
const SettingsPage = lazy(() => import("./pages/SettingsPage"))
const AuditLogPage = lazy(() => import("./pages/admin/AuditLogPage"))
const PermissionPage = lazy(() => import("./pages/admin/PermissionPage"))
const EditMedicinePage = lazy(() => import("./pages/admin/EditMedicinePage"))
const PayrollDetailPage = lazy(() => import("./pages/admin/PayrollDetailPage"))
const InventoryPage = lazy(() => import("./pages/admin/InventoryPage"))
const SpecialtiesPage = lazy(() => import("./pages/admin/SpecialtiesPage"))
const ShiftsPage = lazy(() => import("./pages/admin/ShiftsPage"))
const SystemSettingsPage = lazy(() => import("./pages/admin/SystemSettingsPage"))
const AttendanceManagementPage = lazy(() => import("./pages/admin/AttendanceManagementPage"))
const PayrollStatisticsPage = lazy(() => import("./pages/admin/PayrollStatisticsPage"))
const MyPayrollsPage = lazy(() => import("./pages/MyPayrollsPage"))
const MyPayrollDetailPage = lazy(() => import("./pages/MyPayrollDetailPage"))

// Lazy load doctor pages
const DoctorDashboardPage = lazy(() => import("./pages/doctor/DashboardPage"))
const MedicalListPage = lazy(() => import("./pages/doctor/medicalList"))
const FormMedicalPage = lazy(() => import("./pages/doctor/formMedical"))
const PrescribeMedPage = lazy(() => import("./pages/doctor/prescribeMed"))
const DoctorShiftPage = lazy(() => import("./pages/doctor/doctorShift"))
const UiQuanLyDT = lazy(() => import("./pages/doctor/QuanlyDonThuoc"))
const PrescriptionDetailPage = lazy(() => import("./pages/doctor/prescriptionDetail"))
const EditPrescriptionPage = lazy(() => import("./pages/doctor/EditPrescriptionPage"))

// Lazy load receptionist pages
const ReceptionistDashboardPage = lazy(() => import("./pages/recep/DashboardPage"))
const RecepPatientsPage = lazy(() => import("./pages/recep/patient_list"))
const PatientDetailPage = lazy(() => import("./pages/recep/patient_detail"))
const InvoicesPage = lazy(() => import("./pages/recep/InvoicesPage"))
const InvoiceDetailPage = lazy(() => import("./pages/recep/InvoiceDetailPage"))
const CreateInvoicePage = lazy(() => import("./pages/recep/CreateInvoicePage"))
const InvoiceStatisticsPage = lazy(() => import("./pages/admin/InvoiceStatisticsPage"))
const OfflineAppointmentPage = lazy(() => import("./pages/recep/OfflineAppointmentPage"))
const ReceptionistAppointmentsPage = lazy(() => import("./pages/recep/AppointmentsPage"))

// Lazy load patient pages
const PatientAppointmentsPage = lazy(() => import("./pages/patient/Appointments"))
const PatientDashboardPage = lazy(() => import("./pages/patient/DashboardPage"))
const PatientMedicalHistoryPage = lazy(() => import("./pages/patient/MedicalHistoryPage"))
const PatientPrescriptionsPage = lazy(() => import("./pages/patient/PrescriptionsPage"))
const PatientInvoicesPage = lazy(() => import("./pages/patient/InvoicesPage"))
const PatientSettingsPage = lazy(() => import("./pages/patient/PatientSettingsPage"))
const SetupPatientProfilePage = lazy(() => import("./pages/patient/SetupPatientProfilePage"))

// Lazy load shared pages
const AppointmentDetailPage = lazy(() => import("./pages/AppointmentDetailPage"))
const VisitDetailPage = lazy(() => import("./pages/doctor/VisitDetailPage"))
const AttendancePage = lazy(() => import("./pages/AttendancePage"))
const HelpCenterPage = lazy(() => import("./pages/HelpCenterPage"))

// Lazy load pharmacy pages
const PharmacyPage = lazy(() => import("./pages/PharmacyPage"))
const PharmacyDetailPage = lazy(() => import("./pages/PharmacyDetailPage"))

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
)

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/auth/oauth/callback" element={<OAuthCallbackPage />} />
          <Route path="/auth/oauth/error" element={<OAuthErrorPage />} />
          {/* Redirect old booking route to new patient route */}
          <Route path="/book-appointment" element={<Navigate to="/patient/book-appointment" replace />} />

          {/* Patient Routes */}
          <Route
            path="/patient/book-appointment"
            element={
              <ProtectedRoute requiredRole="patient">
                <BookAppointmentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/setup"
            element={
              <ProtectedRoute requiredRole="patient">
                <SetupPatientProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute requiredRole="patient">
                <PatientDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/appointments"
            element={
              <ProtectedRoute requiredRole="patient">
                <PatientAppointmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/medical-history"
            element={
              <ProtectedRoute requiredRole="patient">
                <PatientMedicalHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/prescriptions"
            element={
              <ProtectedRoute requiredRole="patient">
                <PatientPrescriptionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/invoices"
            element={
              <ProtectedRoute requiredRole="patient">
                <PatientInvoicesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/settings"
            element={
              <ProtectedRoute requiredRole="patient">
                <PatientSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/profile"
            element={
              <ProtectedRoute requiredRole="patient">
                <PatientProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/update-health-info"
            element={
              <ProtectedRoute requiredRole="patient">
                <PatientUpdateHealthInfoPage />
              </ProtectedRoute>
            }
          />

          {/* Appointment Detail - All roles */}
          <Route
            path="/appointments/:id"
            element={
              <ProtectedRoute>
                <AppointmentDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Visit Detail - All roles */}
          <Route
            path="/visits/:id"
            element={
              <ProtectedRoute>
                <VisitDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Profile Route - All authenticated users */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Help Center - All authenticated users */}
          <Route
            path="/help"
            element={
              <ProtectedRoute>
                <HelpCenterPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/profile"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/doctors"
            element={
              <ProtectedRoute requiredRole="admin">
                <DoctorListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/doctors/:id"
            element={
              <ProtectedRoute requiredRole="admin">
                <DoctorDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/doctors/add"
            element={
              <ProtectedRoute requiredRole="admin">
                <DoctorAddPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/schedule"
            element={
              <ProtectedRoute requiredRole="admin">
                <DoctorSchedulePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/doctors/:id/shift"
            element={
              <ProtectedRoute requiredRole="admin">
                <DoctorsShiftPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/pharmacy/import"
            element={
              <ProtectedRoute requiredRole="admin">
                <PharmacyImportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/medicines/create"
            element={
              <ProtectedRoute requiredRole="admin">
                <CreateMedicinePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/medicines/imports"
            element={
              <ProtectedRoute requiredRole="admin">
                <MedicineImportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/medicines/exports"
            element={
              <ProtectedRoute requiredRole="admin">
                <MedicineExportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/inventory"
            element={
              <ProtectedRoute requiredRole="admin">
                <InventoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/medicines/:id/edit"
            element={
              <ProtectedRoute requiredRole="admin">
                <EditMedicinePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/salary"
            element={
              <ProtectedRoute requiredRole="admin">
                <SalaryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/salary/:id"
            element={
              <ProtectedRoute requiredRole="admin">
                <PayrollDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/invoices/statistics"
            element={
              <ProtectedRoute requiredRole="admin">
                <InvoiceStatisticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/revenue"
            element={
              <ProtectedRoute requiredRole="admin">
                <RevenueReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/expense"
            element={
              <ProtectedRoute requiredRole="admin">
                <ExpenseReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/profit"
            element={
              <ProtectedRoute requiredRole="admin">
                <ProfitReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports/appointments"
            element={
              <ProtectedRoute requiredRole="admin">
                <AppointmentReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports/patient-statistics"
            element={
              <ProtectedRoute requiredRole="admin">
                <PatientStatisticsReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports/medicine-alerts"
            element={
              <ProtectedRoute requiredRole="admin">
                <MedicineAlertsReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports/medicines"
            element={
              <ProtectedRoute requiredRole="admin">
                <MedicineReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports/gender"
            element={
              <ProtectedRoute requiredRole="admin">
                <GenderReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRole="admin">
                <UserManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users/:id"
            element={
              <ProtectedRoute requiredRole="admin">
                <UserDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <AttendancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit-logs"
            element={
              <ProtectedRoute requiredRole="admin">
                <AuditLogPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/permissions"
            element={
              <ProtectedRoute requiredRole="admin">
                <PermissionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/specialties"
            element={
              <ProtectedRoute requiredRole="admin">
                <SpecialtiesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/shifts"
            element={
              <ProtectedRoute requiredRole="admin">
                <ShiftsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute requiredRole="admin">
                <SystemSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/attendance"
            element={
              <ProtectedRoute requiredRole="admin">
                <AttendanceManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/payroll-statistics"
            element={
              <ProtectedRoute requiredRole="admin">
                <PayrollStatisticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-payrolls"
            element={
              <ProtectedRoute>
                <MyPayrollsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-payrolls/:id"
            element={
              <ProtectedRoute>
                <MyPayrollDetailPage />
              </ProtectedRoute>
            }
          />

          {/* Doctor Routes */}
          <Route
            path="/doctor/profile"
            element={
              <ProtectedRoute requiredRole="doctor">
                <DoctorProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedRoute requiredRole="doctor">
                <DoctorDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/medicalList"
            element={
              <ProtectedRoute requiredRole="doctor">
                <MedicalListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/shift"
            element={
              <ProtectedRoute requiredRole="doctor">
                <DoctorShiftPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/patients/:id/prescription"
            element={
              <ProtectedRoute requiredRole="doctor">
                <PrescribeMedPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/patients/:id/examination"
            element={
              <ProtectedRoute requiredRole="doctor">
                <FormMedicalPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/patients/:id"
            element={
              <ProtectedRoute requiredRole="doctor">
                <FormMedicalPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/prescriptions"
            element={
              <ProtectedRoute requiredRole="doctor">
                <UiQuanLyDT />
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/prescriptions/:id/edit"
            element={
              <ProtectedRoute requiredRole="doctor">
                <EditPrescriptionPage />
              </ProtectedRoute>
            }
          />

          {/* Receptionist Routes */}
          <Route
            path="/receptionist/profile"
            element={
              <ProtectedRoute requiredRole="receptionist">
                <ReceptionistProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/receptionist/dashboard"
            element={
              <ProtectedRoute requiredRole="receptionist">
                <ReceptionistDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recep/patients"
            element={
              <ProtectedRoute requiredRole="receptionist">
                <RecepPatientsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recep/patients/:id"
            element={
              <ProtectedRoute requiredRole="receptionist">
                <PatientDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoices"
            element={
              <ProtectedRoute requiredRole={["admin", "receptionist"]}>
                <InvoicesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoices/:id"
            element={
              <ProtectedRoute requiredRole={["admin", "receptionist", "patient"]}>
                <InvoiceDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recep/invoices/create"
            element={
              <ProtectedRoute requiredRole={["admin", "receptionist"]}>
                <CreateInvoicePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recep/appointments/offline"
            element={
              <ProtectedRoute requiredRole="receptionist">
                <OfflineAppointmentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/appointments"
            element={
              <ProtectedRoute requiredRole={["admin", "receptionist"]}>
                <ReceptionistAppointmentsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recep/appointments"
            element={
              <ProtectedRoute requiredRole="receptionist">
                <ReceptionistAppointmentsPage />
              </ProtectedRoute>
            }
          />

          {/* Pharmacy Routes - Accessible by multiple roles */}
          <Route
            path="/pharmacy"
            element={
              <ProtectedRoute requiredRole={["admin", "receptionist", "doctor"]}>
                <PharmacyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pharmacy/:id"
            element={
              <ProtectedRoute requiredRole={["admin", "receptionist", "doctor"]}>
                <PharmacyDetailPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
      <Toaster />
    </AuthProvider>
  )
}

export default App
