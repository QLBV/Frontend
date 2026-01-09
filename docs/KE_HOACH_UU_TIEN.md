# 🎯 KẾ HOẠCH ƯU TIÊN HOÀN THIỆN FRONTEND

## 📋 TỔNG QUAN

Dựa trên phân tích Backend APIs và Frontend hiện có, kế hoạch được chia thành 3 mức độ ưu tiên:

- **🔴 High Priority:** Authentication flow, Core CRUD operations, Main business flows
- **🟡 Medium Priority:** Reports, Dashboard enhancements, Search functionality
- **🟢 Low Priority:** Audit logs, Advanced features

---

## 🔴 HIGH PRIORITY - Cần hoàn thiện trước

### 1. Authentication Flow (7 endpoints)

**Mục tiêu:** Hoàn thiện authentication system để user có thể đăng nhập, đăng ký, quên mật khẩu và quản lý profile.

#### ✅ Đã có (4 endpoints)
- [x] `POST /api/auth/register` → `RegisterPage.tsx`
- [x] `POST /api/auth/login` → `LoginPage.tsx`
- [x] `POST /api/auth/refresh-token` → `axiosAuth.ts`
- [x] `POST /api/auth/logout` → `authContext.tsx`

#### ❌ Cần tạo (3 endpoints)
- [ ] `POST /api/auth/forgot-password` → **Cần tạo:** `ForgotPasswordPage.tsx`
  - Form nhập email
  - Validation
  - Success message
  - Link quay lại login

- [ ] `POST /api/auth/reset-password` → **Cần tạo:** `ResetPasswordPage.tsx`
  - Form nhập new password và confirm
  - Token validation từ URL params
  - Success message và redirect

- [ ] `GET /api/auth/oauth/google` → **Cần implement:** Google OAuth button trong `LoginPage.tsx`
  - OAuth button
  - Handle callback
  - Save tokens

**Files cần tạo:**
- `src/pages/ForgotPasswordPage.tsx`
- `src/pages/ResetPasswordPage.tsx`
- Update `src/pages/LoginPage.tsx` (thêm OAuth button)

**Thời gian ước tính:** 3-5 ngày

---

### 2. Profile Management (4 endpoints)

**Mục tiêu:** User có thể xem và cập nhật thông tin profile của mình.

#### ❌ Cần tạo (4 endpoints)
- [ ] `GET /api/profile` → **Cần tạo:** `ProfilePage.tsx`
  - Hiển thị thông tin user hiện tại
  - Form edit profile
  - Upload avatar với preview
  - Change password form
  - Validation và error handling

- [ ] `PUT /api/profile` → **Cần tạo:** `ProfilePage.tsx`
  - Form update profile
  - Validation
  - Success message

- [ ] `PUT /api/profile/password` → **Cần tạo:** `ProfilePage.tsx`
  - Form change password (old, new, confirm)
  - Validation
  - Success message

- [ ] `POST /api/profile/avatar` → **Cần tạo:** `ProfilePage.tsx`
  - File upload input
  - Image preview
  - Upload progress
  - Success message

**Files cần tạo:**
- `src/pages/ProfilePage.tsx`

**Routes cần thêm:**
```typescript
<Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
```

**Thời gian ước tính:** 3-4 ngày

---

### 3. Core CRUD Operations

#### 3.1 Patient CRUD (3 endpoints còn thiếu)

**Mục tiêu:** Hoàn thiện CRUD operations cho Patient management.

#### ✅ Đã có (5 endpoints)
- [x] `POST /api/patients/setup` → `SignupPage.tsx`
- [x] `GET /api/patients` → `patient_list.tsx`
- [x] `GET /api/patients/:id` → `patient_detail.tsx`
- [x] `PUT /api/patients/:id` → `patient_detail.tsx`
- [x] `DELETE /api/patients/:id` → `patient_list.tsx`

#### ⚠️ Cần hoàn thiện (3 endpoints)
- [ ] `POST /api/patients/:id/avatar` → **Cần implement trong:** `patient_detail.tsx`
  - Upload avatar button
  - File upload với preview
  - Success message

- [ ] `GET /api/patients/:id/medical-history` → **Cần implement trong:** `patient_detail.tsx`
  - Tab "Lịch sử khám bệnh"
  - Table hiển thị visits
  - Filter theo date
  - View detail link

- [ ] `GET /api/patients/:id/prescriptions` → **Cần implement trong:** `patient_detail.tsx`
  - Tab "Đơn thuốc"
  - Table hiển thị prescriptions
  - Filter theo date
  - View detail link

**Files cần update:**
- `src/pages/recep/patient_detail.tsx`

**Thời gian ước tính:** 2-3 ngày

---

#### 3.2 Appointment CRUD (5 endpoints còn thiếu)

**Mục tiêu:** Hoàn thiện Appointment management cho tất cả roles.

#### ✅ Đã có (4 endpoints)
- [x] `POST /api/appointments` → `BookAppointmentPage.tsx`
- [x] `GET /api/appointments` → `Appointments.tsx`
- [x] `GET /api/appointments/my` → `Appointments.tsx`
- [x] `PUT /api/appointments/:id/cancel` → `Appointments.tsx`

#### ❌ Cần tạo (5 endpoints)
- [ ] `POST /api/appointments/offline` → **Cần tạo:** `OfflineAppointmentPage.tsx` (Receptionist)
  - Form đặt lịch offline
  - Chọn patient, doctor, shift, date
  - Validation
  - Success message

- [ ] `GET /api/appointments/upcoming` → **Cần implement trong:** `DashboardPage.tsx` (tất cả roles)
  - Widget hiển thị upcoming appointments
  - Link đến appointment detail

- [ ] `GET /api/appointments/:id` → **Cần tạo:** `AppointmentDetailPage.tsx`
  - Hiển thị chi tiết appointment
  - Thông tin patient, doctor, date, time
  - Status badge
  - Actions (cancel, reschedule)

- [ ] `PUT /api/appointments/:id` → **Cần tạo:** `AppointmentDetailPage.tsx`
  - Form reschedule appointment
  - Validation
  - Success message

- [ ] `PUT /api/appointments/:id/no-show` → **Cần tạo:** Button trong `AppointmentsPage.tsx` (Receptionist)
  - Mark no-show button
  - Confirmation dialog
  - Success message

**Files cần tạo:**
- `src/pages/recep/OfflineAppointmentPage.tsx`
- `src/pages/AppointmentDetailPage.tsx`

**Files cần update:**
- `src/pages/admin/DashboardPage.tsx`
- `src/pages/doctor/DashboardPage.tsx`
- `src/pages/recep/DashboardPage.tsx`
- `src/pages/patient/Appointments.tsx`

**Thời gian ước tính:** 4-5 ngày

---

#### 3.3 Visit CRUD (3 endpoints còn thiếu)

**Mục tiêu:** Hoàn thiện Visit management cho Doctor và Receptionist.

#### ✅ Đã có (2 endpoints)
- [x] `PUT /api/visits/:id/complete` → `formMedical.tsx`
- [x] `GET /api/visits` → `medicalList.tsx`

#### ❌ Cần tạo (3 endpoints)
- [ ] `POST /api/visits/checkin/:appointmentId` → **Cần tạo:** Button trong `AppointmentsPage.tsx` (Receptionist)
  - Check-in button
  - Confirmation dialog
  - Success message
  - Auto refresh list

- [ ] `GET /api/visits/patient/:patientId` → **Cần implement trong:** `patient_detail.tsx`
  - Tab "Lịch sử khám"
  - Table hiển thị visits
  - View detail link

- [ ] `GET /api/visits/:id` → **Cần tạo:** `VisitDetailPage.tsx`
  - Hiển thị chi tiết visit
  - Thông tin patient, doctor, date
  - Symptoms, diagnoses
  - Prescription link
  - Invoice link

**Files cần tạo:**
- `src/pages/doctor/VisitDetailPage.tsx`

**Files cần update:**
- `src/pages/recep/patient_detail.tsx`
- `src/pages/recep/AppointmentsPage.tsx` (nếu có)

**Thời gian ước tính:** 3-4 ngày

---

#### 3.4 Prescription CRUD (5 endpoints còn thiếu)

**Mục tiêu:** Hoàn thiện Prescription management cho Doctor và Receptionist.

#### ✅ Đã có (3 endpoints)
- [x] `POST /api/prescriptions` → `prescribeMed.tsx`
- [x] `GET /api/prescriptions/:id` → `prescriptionDetail.tsx`
- [x] `GET /api/prescriptions/visit/:visitId` → `prescribeMed.tsx` (cần verify)

#### ⚠️ Cần hoàn thiện (5 endpoints)
- [ ] `PUT /api/prescriptions/:id` → **Cần implement trong:** `prescriptionDetail.tsx`
  - Edit form
  - Update medicines list
  - Validation
  - Success message

- [ ] `POST /api/prescriptions/:id/cancel` → **Cần implement trong:** `prescriptionDetail.tsx`
  - Cancel button
  - Confirmation dialog
  - Success message

- [ ] `PUT /api/prescriptions/:id/dispense` → **Cần tạo:** Button trong `prescriptionDetail.tsx` (Receptionist)
  - Dispense button
  - Confirmation dialog
  - Success message

- [ ] `GET /api/prescriptions/patient/:patientId` → **Cần implement trong:** `patient_detail.tsx`
  - Tab "Đơn thuốc"
  - Table hiển thị prescriptions
  - View detail link

- [ ] `GET /api/prescriptions/:id/pdf` → **Cần implement trong:** `prescriptionDetail.tsx`
  - Export PDF button
  - Download PDF file

**Files cần update:**
- `src/pages/doctor/prescriptionDetail.tsx`
- `src/pages/recep/patient_detail.tsx`

**Thời gian ước tính:** 3-4 ngày

---

#### 3.5 Invoice CRUD (8 endpoints còn thiếu)

**Mục tiêu:** Hoàn thiện Invoice management cho Receptionist.

#### ✅ Đã có (3 endpoints)
- [x] `GET /api/invoices` → `InvoicesPage.tsx`
- [x] `GET /api/invoices/:id` → `InvoiceDetailPage.tsx`
- [x] `POST /api/invoices/:id/payments` → `InvoiceDetailPage.tsx` (cần verify)

#### ⚠️ Cần hoàn thiện (8 endpoints)
- [ ] `POST /api/invoices` → **Cần tạo:** `CreateInvoicePage.tsx` (Receptionist)
  - Form tạo invoice thủ công
  - Chọn patient
  - Add items
  - Calculate total
  - Validation

- [ ] `PUT /api/invoices/:id` → **Cần implement trong:** `InvoiceDetailPage.tsx`
  - Edit form
  - Update items
  - Validation
  - Success message

- [ ] `GET /api/invoices/patient/:patientId` → **Cần implement trong:** `patient_detail.tsx`
  - Tab "Hóa đơn"
  - Table hiển thị invoices
  - View detail link

- [ ] `GET /api/invoices/statistics` → **Cần tạo:** `InvoiceStatisticsPage.tsx` (Admin)
  - Statistics dashboard
  - Charts
  - Date range filter

- [ ] `GET /api/invoices/unpaid` → **Cần implement trong:** `InvoicesPage.tsx`
  - Filter "Unpaid"
  - Badge hiển thị số lượng
  - Link đến unpaid invoices

- [ ] `POST /api/invoices/:id/payments` → **Cần implement trong:** `InvoiceDetailPage.tsx`
  - Payment form
  - Amount input
  - Payment method dropdown
  - Validation
  - Success message

- [ ] `GET /api/invoices/:id/payments` → **Cần implement trong:** `InvoiceDetailPage.tsx`
  - Payment history table
  - Display payment details

- [ ] `GET /api/invoices/:id/pdf` → **Cần implement trong:** `InvoiceDetailPage.tsx`
  - Export PDF button
  - Download PDF file

**Files cần tạo:**
- `src/pages/recep/CreateInvoicePage.tsx`
- `src/pages/admin/InvoiceStatisticsPage.tsx`

**Files cần update:**
- `src/pages/recep/InvoiceDetailPage.tsx`
- `src/pages/recep/InvoicesPage.tsx`
- `src/pages/recep/patient_detail.tsx`

**Thời gian ước tính:** 5-6 ngày

---

#### 3.6 Medicine CRUD (8 endpoints còn thiếu)

**Mục tiêu:** Hoàn thiện Medicine management cho Admin.

#### ✅ Đã có (4 endpoints)
- [x] `GET /api/medicines` → `PharmacyPage.tsx`
- [x] `GET /api/medicines/:id` → `PharmacyDetailPage.tsx`
- [x] `POST /api/medicines/:id/import` → `PharmacyImportPage.tsx`
- [x] `PUT /api/medicines/:id` → `PharmacyDetailPage.tsx` (cần verify)

#### ❌ Cần tạo (8 endpoints)
- [ ] `POST /api/medicines` → **Cần tạo:** `CreateMedicinePage.tsx` (Admin)
  - Form tạo medicine mới
  - Validation
  - Success message

- [ ] `DELETE /api/medicines/:id` → **Cần implement trong:** `PharmacyPage.tsx` (Admin)
  - Delete button
  - Confirmation dialog
  - Success message

- [ ] `GET /api/medicines/low-stock` → **Cần implement trong:** `DashboardPage.tsx` (Admin)
  - Alert card
  - Link đến danh sách
  - Badge số lượng

- [ ] `GET /api/medicines/expiring` → **Cần implement trong:** `DashboardPage.tsx` (Admin)
  - Alert card
  - Link đến danh sách
  - Badge số lượng

- [ ] `GET /api/medicines/imports` → **Cần tạo:** `MedicineImportsPage.tsx` (Admin)
  - Table hiển thị imports
  - Filter và pagination
  - View detail

- [ ] `GET /api/medicines/exports` → **Cần tạo:** `MedicineExportsPage.tsx` (Admin)
  - Table hiển thị exports
  - Filter và pagination
  - View detail

- [ ] `GET /api/medicines/:id/imports` → **Cần implement trong:** `PharmacyDetailPage.tsx`
  - Tab "Lịch sử nhập"
  - Table hiển thị imports

- [ ] `GET /api/medicines/:id/exports` → **Cần implement trong:** `PharmacyDetailPage.tsx`
  - Tab "Lịch sử xuất"
  - Table hiển thị exports

**Files cần tạo:**
- `src/pages/admin/CreateMedicinePage.tsx`
- `src/pages/admin/MedicineImportsPage.tsx`
- `src/pages/admin/MedicineExportsPage.tsx`

**Files cần update:**
- `src/pages/admin/DashboardPage.tsx`
- `src/pages/PharmacyPage.tsx`
- `src/pages/PharmacyDetailPage.tsx`

**Thời gian ước tính:** 4-5 ngày

---

#### 3.7 Doctor CRUD (3 endpoints còn thiếu)

**Mục tiêu:** Hoàn thiện Doctor management cho Admin.

#### ✅ Đã có (3 endpoints)
- [x] `GET /api/doctors` → `doctorList.tsx`
- [x] `GET /api/doctors/:id` → `doctorDetail.tsx`
- [x] `POST /api/doctors` → `doctorAdd.tsx`

#### ⚠️ Cần hoàn thiện (3 endpoints)
- [ ] `PUT /api/doctors/:id` → **Cần implement trong:** `doctorDetail.tsx`
  - Edit form
  - Validation
  - Success message

- [ ] `DELETE /api/doctors/:id` → **Cần implement trong:** `doctorList.tsx`
  - Delete button
  - Confirmation dialog
  - Success message

- [ ] `GET /api/doctors/:doctorId/shifts` → **Cần implement trong:** `doctorDetail.tsx`
  - Tab "Lịch trực"
  - Table hiển thị shifts
  - Calendar view (optional)

**Files cần update:**
- `src/pages/admin/doctorDetail.tsx`
- `src/pages/admin/doctorList.tsx`

**Thời gian ước tính:** 2-3 ngày

---

### 4. Main Business Flows

#### 4.1 Complete Patient Journey (End-to-End Flow)

**Mục tiêu:** Đảm bảo flow hoàn chỉnh từ đặt lịch đến thanh toán.

**Flow:**
1. Patient đăng ký → Setup profile ✅
2. Patient đặt lịch ✅
3. Receptionist check-in appointment ❌
4. Doctor khám bệnh và kê đơn ✅
5. Doctor complete visit ✅
6. Auto tạo invoice ✅
7. Receptionist xử lý payment ⚠️
8. Patient xem invoice ✅

**Cần hoàn thiện:**
- [ ] Check-in appointment (Receptionist)
- [ ] Payment processing (Receptionist)
- [ ] Invoice PDF export

**Thời gian ước tính:** 2-3 ngày

---

#### 4.2 Doctor Shift Management Flow

**Mục tiêu:** Admin có thể quản lý lịch trực của bác sĩ.

**Flow:**
1. Admin xem danh sách doctors ✅
2. Admin assign doctor to shift ✅
3. Admin xem schedule ❌
4. Admin cancel/restore shift ❌
5. Doctor xem lịch trực của mình ✅

**Cần hoàn thiện:**
- [ ] `GET /api/doctor-shifts/on-duty` → Dashboard widget
- [ ] `GET /api/doctor-shifts/available` → Available shifts list
- [ ] `GET /api/doctor-shifts/doctor/:doctorId` → Doctor shifts tab
- [ ] `DELETE /api/doctor-shifts/:id` → Cancel shift
- [ ] `PUT /api/doctor-shifts/:id/cancel` → Cancel shift
- [ ] `POST /api/doctor-shifts/:id/restore` → Restore shift

**Files cần update:**
- `src/pages/admin/doctorSchedule.tsx`
- `src/pages/admin/DashboardPage.tsx`

**Thời gian ước tính:** 3-4 ngày

---

#### 4.3 Payroll Management Flow

**Mục tiêu:** Admin có thể tính lương, duyệt và thanh toán.

**Flow:**
1. Admin calculate payroll ⚠️
2. Admin approve payroll ⚠️
3. Admin pay payroll ⚠️
4. Admin xem payroll detail ❌
5. Admin export payroll PDF ❌

**Cần hoàn thiện:**
- [ ] `POST /api/payrolls/calculate` → Calculate button
- [ ] `PUT /api/payrolls/:id/approve` → Approve button
- [ ] `PUT /api/payrolls/:id/pay` → Pay button
- [ ] `GET /api/payrolls/:id` → PayrollDetailPage
- [ ] `GET /api/payrolls/:id/pdf` → Export PDF

**Files cần tạo:**
- `src/pages/admin/PayrollDetailPage.tsx`

**Files cần update:**
- `src/pages/admin/SalaryPage.tsx`

**Thời gian ước tính:** 3-4 ngày

---

## 🟡 MEDIUM PRIORITY - Hoàn thiện sau Core Features

### 5. Dashboard Enhancements (7 endpoints)

**Mục tiêu:** Dashboard hiển thị đầy đủ thông tin và statistics.

#### ❌ Cần implement (7 endpoints)
- [ ] `GET /api/dashboard/stats` → Stats cards
- [ ] `GET /api/dashboard/appointments/:date` → Calendar widget
- [ ] `GET /api/dashboard/overview` → Overview cards
- [ ] `GET /api/dashboard/recent-activities` → Activity feed
- [ ] `GET /api/dashboard/quick-stats` → Quick stats
- [ ] `GET /api/dashboard/alerts` → System alerts
- [ ] `GET /api/dashboard` → Main dashboard data

**Files cần update:**
- `src/pages/admin/DashboardPage.tsx`
- `src/pages/doctor/DashboardPage.tsx`
- `src/pages/recep/DashboardPage.tsx`

**Thời gian ước tính:** 4-5 ngày

---

### 6. Reports (9 endpoints còn thiếu)

**Mục tiêu:** Hoàn thiện tất cả reports và PDF exports.

#### ✅ Đã có (4 endpoints)
- [x] `GET /api/reports/revenue` → `revenueReport.tsx`
- [x] `GET /api/reports/expense` → `expenseReport.tsx`
- [x] `GET /api/reports/top-medicines` → `medicineReport.tsx`
- [x] `GET /api/reports/patients-by-gender` → `genderReport.tsx`

#### ❌ Cần tạo (9 endpoints)
- [ ] `GET /api/reports/profit` → **Cần tạo:** `profitReport.tsx`
- [ ] `GET /api/reports/appointments` → **Cần tạo:** `appointmentReport.tsx`
- [ ] `GET /api/reports/patient-statistics` → **Cần tạo:** `patientStatisticsReport.tsx`
- [ ] `GET /api/reports/medicine-alerts` → **Cần tạo:** `medicineAlertsReport.tsx`
- [ ] `GET /api/reports/revenue/pdf` → PDF export
- [ ] `GET /api/reports/expense/pdf` → PDF export
- [ ] `GET /api/reports/profit/pdf` → PDF export
- [ ] `GET /api/reports/top-medicines/pdf` → PDF export
- [ ] `GET /api/reports/patients-by-gender/pdf` → PDF export

**Files cần tạo:**
- `src/pages/admin/profitReport.tsx`
- `src/pages/admin/appointmentReport.tsx`
- `src/pages/admin/patientStatisticsReport.tsx`
- `src/pages/admin/medicineAlertsReport.tsx`

**Files cần update:**
- Tất cả report pages (thêm PDF export button)

**Thời gian ước tính:** 5-6 ngày

---

### 7. Search Functionality (3 endpoints)

**Mục tiêu:** Global search cho patients, doctors, medicines.

#### ❌ Cần tạo (3 endpoints)
- [ ] `POST /api/search/patients` → **Cần tạo:** `SearchBar.tsx`
  - Search input với autocomplete
  - Results dropdown
  - Link đến patient detail

- [ ] `POST /api/search/doctors` → **Cần tạo:** `SearchBar.tsx`
  - Search input với autocomplete
  - Results dropdown
  - Link đến doctor detail

- [ ] `POST /api/search/medicines` → **Cần tạo:** `SearchBar.tsx`
  - Search input với autocomplete
  - Results dropdown
  - Link đến medicine detail

**Files cần tạo:**
- `src/components/SearchBar.tsx`

**Files cần update:**
- `src/components/header.tsx` (thêm SearchBar)
- `src/components/topbar.tsx` (thêm SearchBar)

**Thời gian ước tính:** 3-4 ngày

---

## 🟢 LOW PRIORITY - Có thể làm sau

### 8. User Management - Admin (10 endpoints)

**Mục tiêu:** Admin quản lý tất cả users trong hệ thống.

#### ❌ Cần tạo (10 endpoints)
- [ ] `GET /api/users` → `UserManagementPage.tsx`
- [ ] `GET /api/users/:id` → `UserDetailPage.tsx`
- [ ] `POST /api/users` → `UserManagementPage.tsx`
- [ ] `PUT /api/users/:id` → `UserManagementPage.tsx`
- [ ] `PUT /api/users/:id/activate` → Activate button
- [ ] `PUT /api/users/:id/deactivate` → Deactivate button
- [ ] `PUT /api/users/:id/role` → Change role
- [ ] `DELETE /api/users/:id` → Delete button
- [ ] `GET /api/users/me/notification-settings` → `SettingsPage.tsx`
- [ ] `PUT /api/users/me/notification-settings` → `SettingsPage.tsx`

**Files cần tạo:**
- `src/pages/admin/UserManagementPage.tsx`
- `src/pages/admin/UserDetailPage.tsx`
- `src/pages/SettingsPage.tsx`

**Thời gian ước tính:** 5-6 ngày

---

### 9. Notification System (5 endpoints)

**Mục tiêu:** Real-time notifications cho users.

#### ❌ Cần tạo (5 endpoints)
- [ ] `GET /api/notifications` → `NotificationDropdown.tsx`
- [ ] `GET /api/notifications/unread-count` → `NotificationBell.tsx`
- [ ] `PUT /api/notifications/read-all` → Mark all read
- [ ] `PUT /api/notifications/:id/read` → Mark as read
- [ ] `DELETE /api/notifications/:id` → Delete notification

**Files cần tạo:**
- `src/components/NotificationBell.tsx`
- `src/components/NotificationDropdown.tsx`

**Files cần update:**
- `src/components/header.tsx`
- `src/components/topbar.tsx`

**Thời gian ước tính:** 4-5 ngày

---

### 10. Audit Logs (3 endpoints)

**Mục tiêu:** Admin xem audit logs của hệ thống.

#### ❌ Cần tạo (3 endpoints)
- [ ] `GET /api/audit-logs` → `AuditLogPage.tsx`
- [ ] `GET /api/audit-logs/user/:userId` → Filter by user
- [ ] `GET /api/audit-logs/entity/:entityType/:id` → Filter by entity

**Files cần tạo:**
- `src/pages/admin/AuditLogPage.tsx`

**Thời gian ước tính:** 3-4 ngày

---

### 11. Permissions Management (6 endpoints)

**Mục tiêu:** Admin quản lý permissions và roles.

#### ❌ Cần tạo (6 endpoints)
- [ ] `GET /api/permissions` → `PermissionPage.tsx`
- [ ] `GET /api/permissions/modules` → Modules list
- [ ] `GET /api/permissions/role/:roleId` → Role permissions
- [ ] `POST /api/permissions/role/:roleId/assign` → Assign permissions
- [ ] `POST /api/permissions` → Create permission
- [ ] `DELETE /api/permissions/:id` → Delete permission

**Files cần tạo:**
- `src/pages/admin/PermissionPage.tsx`

**Thời gian ước tính:** 4-5 ngày

---

### 12. Advanced Features

#### 12.1 Specialties (2 endpoints)
- [ ] `GET /api/specialties` → Implement trong dropdowns
- [ ] `GET /api/specialties/:id/doctors` → Doctors by specialty

#### 12.2 Shifts (6 endpoints)
- [ ] `GET /api/shifts` → Implement trong dropdowns
- [ ] `GET /api/shifts/schedule` → Shift schedule
- [ ] `GET /api/shifts/:id` → Shift detail
- [ ] `POST /api/shifts` → Create shift (Admin)
- [ ] `PUT /api/shifts/:id` → Update shift (Admin)
- [ ] `DELETE /api/shifts/:id` → Delete shift (Admin)

**Thời gian ước tính:** 3-4 ngày

---

## 📊 TỔNG KẾT THỜI GIAN

### High Priority
- Authentication Flow: 3-5 ngày
- Profile Management: 3-4 ngày
- Patient CRUD: 2-3 ngày
- Appointment CRUD: 4-5 ngày
- Visit CRUD: 3-4 ngày
- Prescription CRUD: 3-4 ngày
- Invoice CRUD: 5-6 ngày
- Medicine CRUD: 4-5 ngày
- Doctor CRUD: 2-3 ngày
- Main Business Flows: 8-11 ngày

**Tổng High Priority:** 37-50 ngày (~5-7 tuần)

### Medium Priority
- Dashboard Enhancements: 4-5 ngày
- Reports: 5-6 ngày
- Search Functionality: 3-4 ngày

**Tổng Medium Priority:** 12-15 ngày (~2 tuần)

### Low Priority
- User Management: 5-6 ngày
- Notification System: 4-5 ngày
- Audit Logs: 3-4 ngày
- Permissions Management: 4-5 ngày
- Advanced Features: 3-4 ngày

**Tổng Low Priority:** 19-24 ngày (~3-4 tuần)

### Tổng cộng
- **High Priority:** 5-7 tuần
- **Medium Priority:** 2 tuần
- **Low Priority:** 3-4 tuần
- **TỔNG:** 10-13 tuần (~2.5-3 tháng)

---

## 🎯 KẾ HOẠCH THỰC HIỆN

### Sprint 1-2: Authentication & Profile (1 tuần)
- Authentication flow
- Profile management

### Sprint 3-4: Core CRUD Operations (2 tuần)
- Patient CRUD
- Appointment CRUD
- Visit CRUD
- Prescription CRUD

### Sprint 5-6: Invoice & Medicine CRUD (2 tuần)
- Invoice CRUD
- Medicine CRUD
- Doctor CRUD

### Sprint 7: Main Business Flows (1 tuần)
- Complete patient journey
- Doctor shift management
- Payroll management

### Sprint 8-9: Medium Priority (2 tuần)
- Dashboard enhancements
- Reports
- Search functionality

### Sprint 10-12: Low Priority (3 tuần)
- User management
- Notification system
- Audit logs
- Permissions management
- Advanced features

---

## 📝 NOTES

- **MVP (Minimum Viable Product):** High Priority only = 5-7 tuần
- **Full Feature:** Tất cả priorities = 10-13 tuần
- **Ưu tiên:** Hoàn thành High Priority trước, sau đó mới làm Medium và Low Priority
- **Testing:** Test từng feature sau khi implement
- **Documentation:** Update documentation sau mỗi sprint

---

**Cập nhật:** 2025-01-03  
**Version:** 1.0.0
