# 🔗 API ENDPOINT MAPPING - BACKEND ↔ FRONTEND

## 📋 Mapping Table: Backend APIs → Frontend Pages/Components

### 🔐 AUTHENTICATION (`/api/auth`)

| Backend Endpoint | Method | Frontend Page/Component | Status |
|-----------------|--------|------------------------|--------|
| `/api/auth/register` | POST | `src/pages/RegisterPage.tsx` | ✅ |
| `/api/auth/login` | POST | `src/pages/LoginPage.tsx` | ✅ |
| `/api/auth/refresh-token` | POST | `src/lib/axiosAuth.ts` | ✅ |
| `/api/auth/logout` | POST | `src/auth/authContext.tsx` | ✅ |
| `/api/auth/forgot-password` | POST | `src/pages/ForgotPasswordPage.tsx` | ✅ |
| `/api/auth/reset-password` | POST | `src/pages/ResetPasswordPage.tsx` | ✅ |
| `/api/auth/oauth/google` | GET | `src/pages/OAuthCallbackPage.tsx` | ✅ |

---

### 👤 PROFILE (`/api/profile`)

| Backend Endpoint | Method | Frontend Page/Component | Status |
|-----------------|--------|------------------------|--------|
| `/api/profile` | GET | `src/pages/ProfilePage.tsx` | ✅ |
| `/api/profile` | PUT | `src/pages/ProfilePage.tsx` | ✅ |
| `/api/profile/password` | PUT | `src/pages/ProfilePage.tsx` | ✅ |
| `/api/profile/avatar` | POST | `src/pages/ProfilePage.tsx` | ✅ |

---

### 👥 USER MANAGEMENT (`/api/users`)

| Backend Endpoint | Method | Frontend Page/Component | Status |
|-----------------|--------|------------------------|--------|
| `/api/users` | GET | `src/pages/admin/UserManagementPage.tsx` | ✅ |
| `/api/users/:id` | GET | `src/pages/admin/UserDetailPage.tsx` | ✅ |
| `/api/users` | POST | `src/pages/admin/UserManagementPage.tsx` | ✅ |
| `/api/users/:id` | PUT | `src/pages/admin/UserDetailPage.tsx` | ✅ |
| `/api/users/:id/avatar` | PUT | `src/pages/admin/UserDetailPage.tsx` | ✅ |
| `/api/users/:id/role` | PUT | `src/pages/admin/UserManagementPage.tsx` | ✅ |
| `/api/users/:id` | DELETE | `src/pages/admin/UserManagementPage.tsx` | ✅ |
| `/api/users/me/notification-settings` | GET | `src/pages/SettingsPage.tsx` | ✅ |
| `/api/users/me/notification-settings` | PUT | `src/pages/SettingsPage.tsx` | ✅ |

---

### 🏥 PATIENT MANAGEMENT (`/api/patients`)

| Backend Endpoint | Method | Frontend Page/Component | Status |
|-----------------|--------|------------------------|--------|
| `/api/patients/setup` | POST | `src/pages/patient/SignupPage.tsx` | ✅ |
| `/api/patients` | GET | `src/pages/recep/patient_list.tsx` | ✅ |
| `/api/patients/:id` | GET | `src/pages/recep/patient_detail.tsx` | ✅ |
| `/api/patients/:id` | PUT | `src/pages/recep/patient_detail.tsx` | ✅ |
| `/api/patients/:id` | DELETE | `src/pages/recep/patient_list.tsx` | ✅ |
| `/api/patients/:id/avatar` | POST | `src/pages/recep/patient_detail.tsx` | ✅ |
| `/api/patients/:id/medical-history` | GET | `src/pages/recep/patient_detail.tsx` | ✅ |
| `/api/patients/:id/prescriptions` | GET | `src/pages/recep/patient_detail.tsx` | ✅ |

---

### 📅 APPOINTMENT MANAGEMENT (`/api/appointments`)

| Backend Endpoint | Method | Frontend Page/Component | Status |
|-----------------|--------|------------------------|--------|
| `/api/appointments` | POST | `src/pages/patient/BookAppointmentPage.tsx` | ✅ |
| `/api/appointments/offline` | POST | `src/pages/recep/OfflineAppointmentPage.tsx` | ✅ |
| `/api/appointments` | GET | `src/pages/patient/Appointments.tsx` | ✅ |
| `/api/appointments/my` | GET | `src/pages/patient/Appointments.tsx` | ✅ |
| `/api/appointments/upcoming` | GET | `src/components/UpcomingAppointmentsWidget.tsx` | ✅ |
| `/api/appointments/:id` | GET | `src/pages/AppointmentDetailPage.tsx` | ✅ |
| `/api/appointments/:id` | PUT | `src/pages/AppointmentDetailPage.tsx` | ✅ |
| `/api/appointments/:id/cancel` | PUT | `src/pages/patient/Appointments.tsx` | ✅ |
| `/api/appointments/:id/no-show` | PUT | `src/pages/AppointmentDetailPage.tsx` | ✅ |

---

### 🏥 VISIT MANAGEMENT (`/api/visits`)

| Backend Endpoint | Method | Frontend Page/Component | Status |
|-----------------|--------|------------------------|--------|
| `/api/visits/checkin/:appointmentId` | POST | `src/pages/recep/AppointmentsPage.tsx` | ✅ |
| `/api/visits/:id/complete` | PUT | `src/pages/doctor/formMedical.tsx` | ✅ |
| `/api/visits` | GET | `src/pages/doctor/medicalList.tsx` | ✅ |
| `/api/visits/patient/:patientId` | GET | `src/pages/recep/patient_detail.tsx` | ✅ |
| `/api/visits/:id` | GET | `src/pages/doctor/VisitDetailPage.tsx` | ✅ |

---

### 💊 PRESCRIPTION MANAGEMENT (`/api/prescriptions`)

| Backend Endpoint | Method | Frontend Page/Component | Status |
|-----------------|--------|------------------------|--------|
| `/api/prescriptions` | POST | `src/pages/doctor/prescribeMed.tsx` | ✅ |
| `/api/prescriptions/:id` | PUT | `src/pages/doctor/prescriptionDetail.tsx` | ✅ |
| `/api/prescriptions/:id/cancel` | POST | `src/pages/doctor/prescriptionDetail.tsx` | ✅ |
| `/api/prescriptions/:id/dispense` | PUT | `src/pages/doctor/prescriptionDetail.tsx` | ✅ |
| `/api/prescriptions/:id` | GET | `src/pages/doctor/prescriptionDetail.tsx` | ✅ |
| `/api/prescriptions/visit/:visitId` | GET | `src/pages/doctor/prescribeMed.tsx` | ✅ |
| `/api/prescriptions/patient/:patientId` | GET | `src/pages/recep/patient_detail.tsx` | ✅ |
| `/api/prescriptions/:id/pdf` | GET | `src/pages/doctor/prescriptionDetail.tsx` | ✅ |

---

### 💰 INVOICE MANAGEMENT (`/api/invoices`)

| Backend Endpoint | Method | Frontend Page/Component | Status |
|-----------------|--------|------------------------|--------|
| `/api/invoices` | POST | `src/pages/recep/CreateInvoicePage.tsx` | ✅ |
| `/api/invoices` | GET | `src/pages/recep/InvoicesPage.tsx` | ✅ |
| `/api/invoices/:id` | GET | `src/pages/recep/InvoiceDetailPage.tsx` | ✅ |
| `/api/invoices/:id` | PUT | `src/pages/recep/InvoiceDetailPage.tsx` | ✅ |
| `/api/invoices/patient/:patientId` | GET | `src/pages/recep/patient_detail.tsx` | ✅ |
| `/api/invoices/statistics` | GET | `src/pages/admin/InvoiceStatisticsPage.tsx` | ✅ |
| `/api/invoices/unpaid` | GET | `src/services/invoice.service.ts` | ✅ |
| `/api/invoices/:id/payments` | POST | `src/pages/recep/InvoiceDetailPage.tsx` | ✅ |
| `/api/invoices/:id/payments` | GET | `src/services/invoice.service.ts` | ✅ |
| `/api/invoices/:id/pdf` | GET | `src/pages/recep/InvoiceDetailPage.tsx` | ✅ |

---

### 💊 MEDICINE MANAGEMENT (`/api/medicines`)

| Backend Endpoint | Method | Frontend Page/Component | Status |
|-----------------|--------|------------------------|--------|
| `/api/medicines` | GET | `src/pages/PharmacyPage.tsx` | ✅ |
| `/api/medicines/:id` | GET | `src/pages/PharmacyDetailPage.tsx` | ✅ |
| `/api/medicines` | POST | `src/pages/admin/CreateMedicinePage.tsx` | ✅ |
| `/api/medicines/:id` | PUT | `src/pages/admin/EditMedicinePage.tsx` | ✅ |
| `/api/medicines/:id` | DELETE | `src/pages/PharmacyDetailPage.tsx` | ✅ |
| `/api/medicines/:id/import` | POST | `src/pages/admin/PharmacyImportPage.tsx` | ✅ |
| `/api/medicines/low-stock` | GET | `src/pages/admin/DashboardPage.tsx` | ✅ |
| `/api/medicines/expiring` | GET | `src/pages/admin/DashboardPage.tsx` | ✅ |
| `/api/medicines/imports` | GET | `src/pages/admin/MedicineImportsPage.tsx` | ✅ |
| `/api/medicines/exports` | GET | `src/pages/admin/MedicineExportsPage.tsx` | ✅ |
| `/api/medicines/:id/imports` | GET | `src/pages/PharmacyDetailPage.tsx` | ✅ |
| `/api/medicines/:id/exports` | GET | `src/pages/PharmacyDetailPage.tsx` | ✅ |

---

### 👨‍⚕️ DOCTOR MANAGEMENT (`/api/doctors`)

| Backend Endpoint | Method | Frontend Page/Component | Status |
|-----------------|--------|------------------------|--------|
| `/api/doctors` | GET | `src/pages/admin/doctorList.tsx` | ✅ |
| `/api/doctors/:id` | GET | `src/pages/admin/doctorDetail.tsx` | ✅ |
| `/api/doctors` | POST | `src/pages/admin/doctorAdd.tsx` | ✅ |
| `/api/doctors/:id` | PUT | `src/pages/admin/doctorDetail.tsx` | ✅ |
| `/api/doctors/:id` | DELETE | `src/pages/admin/doctorList.tsx` | ✅ |
| `/api/doctors/:doctorId/shifts` | GET | `src/pages/admin/doctorDetail.tsx` | ✅ |

---

### 📅 DOCTOR SHIFT MANAGEMENT (`/api/doctor-shifts`)

| Backend Endpoint | Method | Frontend Page/Component | Status |
|-----------------|--------|------------------------|--------|
| `/api/doctor-shifts/on-duty` | GET | `src/services/shift.service.ts` | ✅ |
| `/api/doctor-shifts/available` | GET | `src/services/shift.service.ts` | ✅ |
| `/api/doctor-shifts` | POST | `src/pages/admin/doctorSchedule.tsx` | ✅ |
| `/api/doctor-shifts/doctor/:doctorId` | GET | `src/pages/admin/doctorSchedule.tsx` | ✅ |
| `/api/doctor-shifts/:id` | DELETE | `src/pages/admin/doctorSchedule.tsx` | ✅ |
| `/api/doctor-shifts/:id/cancel` | PUT | `src/pages/admin/doctorSchedule.tsx` | ✅ |
| `/api/doctor-shifts/:id/restore` | POST | `src/pages/admin/doctorSchedule.tsx` | ✅ |

---

### 📊 DASHBOARD (`/api/dashboard`)

| Backend Endpoint | Method | Frontend Page/Component | Status |
|-----------------|--------|------------------------|--------|
| `/api/dashboard/stats` | GET | `src/pages/admin/DashboardPage.tsx` | ✅ |
| `/api/dashboard/appointments/:date` | GET | `src/pages/admin/DashboardPage.tsx` | ✅ |
| `/api/dashboard/overview` | GET | `src/pages/admin/DashboardPage.tsx` | ✅ |
| `/api/dashboard/recent-activities` | GET | `src/pages/admin/DashboardPage.tsx` | ✅ |
| `/api/dashboard/quick-stats` | GET | `src/pages/admin/DashboardPage.tsx` | ✅ |
| `/api/dashboard/alerts` | GET | `src/pages/admin/DashboardPage.tsx` | ✅ |
| `/api/dashboard` | GET | `src/pages/admin/DashboardPage.tsx` | ✅ |

---

### 📈 REPORTS (`/api/reports`)

| Backend Endpoint | Method | Frontend Page/Component | Status |
|-----------------|--------|------------------------|--------|
| `/api/reports/revenue` | GET | `src/pages/admin/revenueReport.tsx` | ✅ |
| `/api/reports/expense` | GET | `src/pages/admin/expenseReport.tsx` | ✅ |
| `/api/reports/profit` | GET | `src/pages/admin/profitReport.tsx` | ✅ |
| `/api/reports/top-medicines` | GET | `src/pages/admin/medicineReport.tsx` | ✅ |
| `/api/reports/patients-by-gender` | GET | `src/pages/admin/genderReport.tsx` | ✅ |
| `/api/reports/appointments` | GET | `src/pages/admin/appointmentReport.tsx` | ✅ |
| `/api/reports/patient-statistics` | GET | `src/pages/admin/patientStatisticsReport.tsx` | ✅ |
| `/api/reports/medicine-alerts` | GET | `src/pages/admin/medicineAlertsReport.tsx` | ✅ |
| `/api/reports/*/pdf` | GET | ✅ Đã implement cho tất cả reports | ✅ |

---

### 💼 PAYROLL MANAGEMENT (`/api/payrolls`)

| Backend Endpoint | Method | Frontend Page/Component | Status |
|-----------------|--------|------------------------|--------|
| `/api/payrolls/calculate` | POST | `src/pages/admin/SalaryPage.tsx` | ✅ |
| `/api/payrolls` | GET | `src/pages/admin/SalaryPage.tsx` | ✅ |
| `/api/payrolls/:id` | GET | `src/pages/admin/PayrollDetailPage.tsx` | ✅ |
| `/api/payrolls/employee/:employeeId` | GET | `src/services/payroll.service.ts` | ✅ |
| `/api/payrolls/month/:month` | GET | `src/pages/admin/SalaryPage.tsx` | ✅ |
| `/api/payrolls/:id/approve` | PUT | `src/pages/admin/PayrollDetailPage.tsx` | ✅ |
| `/api/payrolls/:id/pay` | PUT | `src/pages/admin/PayrollDetailPage.tsx` | ✅ |
| `/api/payrolls/:id/pdf` | GET | `src/pages/admin/PayrollDetailPage.tsx` | ✅ |

---

### 🔔 NOTIFICATIONS (`/api/notifications`)

| Backend Endpoint | Method | Frontend Page/Component | Status |
|-----------------|--------|------------------------|--------|
| `/api/notifications` | GET | `src/components/NotificationDropdown.tsx` | ✅ |
| `/api/notifications/unread-count` | GET | `src/components/NotificationBell.tsx` | ✅ |
| `/api/notifications/read-all` | PUT | `src/components/NotificationDropdown.tsx` | ✅ |
| `/api/notifications/:id/read` | PUT | `src/components/NotificationDropdown.tsx` | ✅ |
| `/api/notifications/:id` | DELETE | `src/components/NotificationDropdown.tsx` | ✅ |

---

### 🔍 SEARCH (`/api/search`)

| Backend Endpoint | Method | Frontend Page/Component | Status |
|-----------------|--------|------------------------|--------|
| `/api/search/patients` | POST | `src/components/SearchBar.tsx` | ✅ |
| `/api/search/doctors` | POST | `src/components/SearchBar.tsx` | ✅ |
| `/api/search/medicines` | POST | `src/components/SearchBar.tsx` | ✅ |

---

### 📜 AUDIT LOGS (`/api/audit-logs`)

| Backend Endpoint | Method | Frontend Page/Component | Status |
|-----------------|--------|------------------------|--------|
| `/api/audit-logs` | GET | `src/pages/admin/AuditLogPage.tsx` | ✅ |
| `/api/audit-logs/user/:userId` | GET | `src/pages/admin/AuditLogPage.tsx` | ✅ |
| `/api/audit-logs/entity/:entityType/:id` | GET | `src/pages/admin/AuditLogPage.tsx` | ✅ |

---

### 🔐 PERMISSIONS (`/api/permissions`)

| Backend Endpoint | Method | Frontend Page/Component | Status |
|-----------------|--------|------------------------|--------|
| `/api/permissions` | GET | `src/pages/admin/PermissionPage.tsx` | ✅ |
| `/api/permissions/modules` | GET | `src/pages/admin/PermissionPage.tsx` | ✅ |
| `/api/permissions/role/:roleId` | GET | `src/pages/admin/PermissionPage.tsx` | ✅ |
| `/api/permissions/role/:roleId/assign` | POST | `src/pages/admin/PermissionPage.tsx` | ✅ |
| `/api/permissions` | POST | `src/pages/admin/PermissionPage.tsx` | ✅ |
| `/api/permissions/:id` | DELETE | `src/pages/admin/PermissionPage.tsx` | ✅ |

---

### 🏥 SPECIALTIES (`/api/specialties`)

| Backend Endpoint | Method | Frontend Page/Component | Status |
|-----------------|--------|------------------------|--------|
| `/api/specialties` | GET | `src/services/specialty.service.ts` | ✅ |
| `/api/specialties/:id/doctors` | GET | `src/services/specialty.service.ts` | ✅ |

---

### ⏰ SHIFTS (`/api/shifts`)

| Backend Endpoint | Method | Frontend Page/Component | Status |
|-----------------|--------|------------------------|--------|
| `/api/shifts` | GET | `src/services/shift.service.ts` | ✅ |
| `/api/shifts/schedule` | GET | `src/services/shift.service.ts` | ✅ |
| `/api/shifts/:id` | GET | `src/services/shift.service.ts` | ✅ |
| `/api/shifts` | POST | `src/services/shift.service.ts` | ✅ |
| `/api/shifts/:id` | PUT | `src/services/shift.service.ts` | ✅ |
| `/api/shifts/:id` | DELETE | `src/services/shift.service.ts` | ✅ |

---

## 📊 SUMMARY

### Status Legend:
- ✅ **Implemented** - Đã có và hoạt động
- ⚠️ **Partial/Missing** - Cần hoàn thiện hoặc chưa có
- ❌ **Not Implemented** - Chưa có

### Statistics:
- **Total Endpoints:** ~150+
- **Implemented:** ~100+ (67%)
- **Partial/Missing:** ~50 (33%)

### Priority Areas:
1. **High Priority:** ✅ **COMPLETED**
   - ✅ Forgot/Reset Password
   - ✅ Profile Management
   - ✅ Notification System
   - ✅ Search Functionality

2. **Medium Priority:** ✅ **COMPLETED**
   - ✅ Audit Logs
   - ✅ Permissions Management
   - ✅ Report PDF Exports
   - ✅ Dashboard Enhancements

3. **Low Priority:** ✅ **COMPLETED**
   - ✅ User Management
   - ✅ Settings Page
   - ✅ Advanced Features (Specialties, Shifts Services)

---

**Cập nhật:** 2025-01-03  
**Version:** 2.0.0

### Recent Updates:
- ✅ User Management (UserManagementPage, UserDetailPage)
- ✅ Settings Page (Notification Settings)
- ✅ Audit Logs (AuditLogPage)
- ✅ Search Functionality (SearchBar component)
- ✅ Dashboard Enhancements (Stats, Overview, Activities, Alerts)
- ✅ Reports (Profit, Appointments, Patient Statistics, Medicine Alerts + PDF exports)
- ✅ Profile Management (ProfilePage)
- ✅ Authentication (Forgot/Reset Password, OAuth)
- ✅ Appointment Management (AppointmentDetailPage, OfflineAppointmentPage, no-show)
- ✅ Visit Management (VisitDetailPage, check-in)
- ✅ Prescription Management (dispense, PDF export)
- ✅ Invoice Management (CreateInvoicePage, statistics, unpaid, payments, PDF)
- ✅ Medicine Management (DELETE, imports/exports pages)
- ✅ Permissions Management (PermissionPage)
- ✅ Specialties & Shifts Services
