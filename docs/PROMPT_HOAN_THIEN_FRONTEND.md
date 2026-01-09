# 🎯 PROMPT HOÀN THIỆN FRONTEND DỰA TRÊN BACKEND

## 📋 MỤC TIÊU

Hoàn thiện Frontend để tích hợp đầy đủ với tất cả API endpoints từ Backend, đảm bảo:
- ✅ Tất cả features từ Backend đều có UI tương ứng
- ✅ User experience mượt mà và nhất quán
- ✅ Error handling đầy đủ
- ✅ Responsive design
- ✅ Role-based access control (RBAC) được implement đúng

---

## 🔍 PHẦN 1: KIỂM TRA VÀ HOÀN THIỆN AUTHENTICATION

### 1.1 Authentication Endpoints

**Backend APIs:**
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/refresh-token` - Refresh token
- `POST /api/auth/logout` - Đăng xuất
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `POST /api/auth/reset-password` - Reset mật khẩu
- `GET /api/auth/oauth/google` - OAuth Google login

**Frontend Checklist:**
- [ ] **Login Page** (`src/pages/LoginPage.tsx`)
  - [ ] Form validation (email, password)
  - [ ] Error handling và hiển thị messages
  - [ ] Loading state khi đang login
  - [ ] Redirect sau khi login thành công
  - [ ] "Remember me" checkbox (optional)
  - [ ] Link đến forgot password
  - [ ] Link đến register page
  - [ ] Google OAuth button (nếu có)

- [ ] **Register Page** (`src/pages/RegisterPage.tsx`)
  - [ ] Form validation (email, password, confirm password, role)
  - [ ] Password strength indicator
  - [ ] Error handling
  - [ ] Success message và redirect
  - [ ] Link đến login page

- [ ] **Forgot Password Page** (Cần tạo nếu chưa có)
  - [ ] Form nhập email
  - [ ] Validation
  - [ ] Success message
  - [ ] Link quay lại login

- [ ] **Reset Password Page** (Cần tạo nếu chưa có)
  - [ ] Form nhập new password và confirm
  - [ ] Token validation từ URL params
  - [ ] Success message và redirect

- [ ] **Auth Context** (`src/auth/authContext.tsx`)
  - [ ] Token management (save, get, clear)
  - [ ] Auto refresh token khi hết hạn
  - [ ] Logout function
  - [ ] User state management

- [ ] **Protected Routes** (`src/components/ProtectedRoute.tsx`)
  - [ ] Check authentication
  - [ ] Redirect to login nếu chưa auth
  - [ ] Role-based route protection

---

## 📋 PHẦN 2: PROFILE & USER MANAGEMENT

### 2.1 Profile Endpoints

**Backend APIs:**
- `GET /api/profile` - Lấy thông tin profile
- `PUT /api/profile` - Cập nhật profile
- `PUT /api/profile/password` - Đổi mật khẩu
- `POST /api/profile/avatar` - Upload avatar

**Frontend Checklist:**
- [ ] **Profile Page** (Cần tạo nếu chưa có)
  - [ ] Hiển thị thông tin user
  - [ ] Form edit profile
  - [ ] Upload avatar với preview
  - [ ] Change password form
  - [ ] Validation và error handling

### 2.2 User Management (Admin Only)

**Backend APIs:**
- `GET /api/users` - Danh sách users (pagination)
- `GET /api/users/:id` - Chi tiết user
- `POST /api/users` - Tạo user mới
- `PUT /api/users/:id` - Cập nhật user
- `PUT /api/users/:id/avatar` - Upload avatar
- `PUT /api/users/:id/role` - Thay đổi role
- `DELETE /api/users/:id` - Xóa user
- `GET /api/users/me/notification-settings` - Notification settings
- `PUT /api/users/me/notification-settings` - Update notification settings

**Frontend Checklist:**
- [ ] **User Management Page** (Admin) (Cần tạo nếu chưa có)
  - [ ] Table danh sách users với pagination
  - [ ] Search và filter
  - [ ] Create user modal/form
  - [ ] Edit user modal/form
  - [ ] Delete confirmation dialog
  - [ ] Role assignment dropdown
  - [ ] Avatar upload

---

## 📋 PHẦN 3: PATIENT MANAGEMENT

### 3.1 Patient Endpoints

**Backend APIs:**
- `POST /api/patients/setup` - Setup patient profile (PATIENT role)
- `GET /api/patients` - Danh sách patients (pagination)
- `GET /api/patients/:id` - Chi tiết patient
- `PUT /api/patients/:id` - Cập nhật patient
- `DELETE /api/patients/:id` - Xóa patient
- `POST /api/patients/:id/avatar` - Upload avatar
- `GET /api/patients/:id/medical-history` - Lịch sử khám bệnh
- `GET /api/patients/:id/prescriptions` - Danh sách đơn thuốc

**Frontend Checklist:**
- [ ] **Patient Setup Page** (`src/pages/patient/SignupPage.tsx`)
  - [ ] Form setup profile (fullName, dateOfBirth, gender, phone, CCCD)
  - [ ] Validation (CCCD 12 số)
  - [ ] Success message và redirect

- [ ] **Patient List Page** (`src/pages/recep/patient_list.tsx`)
  - [ ] Table với pagination
  - [ ] Search và filter
  - [ ] View detail button
  - [ ] Edit button
  - [ ] Delete button với confirmation

- [ ] **Patient Detail Page** (`src/pages/recep/patient_detail.tsx`)
  - [ ] Hiển thị thông tin patient
  - [ ] Medical history tab
  - [ ] Prescriptions tab
  - [ ] Edit form
  - [ ] Avatar upload

---

## 📋 PHẦN 4: APPOINTMENT MANAGEMENT

### 4.1 Appointment Endpoints

**Backend APIs:**
- `POST /api/appointments` - Đặt lịch online (PATIENT)
- `POST /api/appointments/offline` - Đặt lịch offline (RECEPTIONIST)
- `GET /api/appointments` - Danh sách appointments
- `GET /api/appointments/my` - Lịch hẹn của tôi
- `GET /api/appointments/upcoming` - Lịch hẹn sắp tới
- `GET /api/appointments/:id` - Chi tiết appointment
- `PUT /api/appointments/:id` - Cập nhật/reschedule
- `PUT /api/appointments/:id/cancel` - Hủy lịch
- `PUT /api/appointments/:id/no-show` - Đánh dấu no-show

**Frontend Checklist:**
- [ ] **Book Appointment Page** (`src/pages/patient/BookAppointmentPage.tsx`)
  - [ ] Form chọn doctor, shift, date
  - [ ] Hiển thị available slots
  - [ ] Validation (không được đặt trước 2 giờ)
  - [ ] Success message
  - [ ] Redirect sau khi đặt thành công

- [ ] **Appointments List Page** (`src/pages/patient/Appointments.tsx`)
  - [ ] Danh sách appointments của patient
  - [ ] Filter theo status (WAITING, CHECKED_IN, COMPLETED, CANCELLED)
  - [ ] Cancel button (nếu còn > 2 giờ)
  - [ ] View detail

- [ ] **Appointment Management** (Receptionist/Admin)
  - [ ] Danh sách tất cả appointments
  - [ ] Filter theo date, doctor, status
  - [ ] Create offline appointment
  - [ ] Mark no-show
  - [ ] Cancel appointment

---

## 📋 PHẦN 5: VISIT MANAGEMENT

### 5.1 Visit Endpoints

**Backend APIs:**
- `POST /api/visits/checkin/:appointmentId` - Check-in appointment (RECEPTIONIST)
- `PUT /api/visits/:id/complete` - Hoàn thành visit (DOCTOR)
- `GET /api/visits` - Danh sách visits
- `GET /api/visits/patient/:patientId` - Lịch sử khám của patient
- `GET /api/visits/:id` - Chi tiết visit

**Frontend Checklist:**
- [ ] **Check-in Functionality** (Receptionist)
  - [ ] Button check-in trong appointment list
  - [ ] Confirmation dialog
  - [ ] Success message

- [ ] **Visit Completion Form** (`src/pages/doctor/formMedical.tsx`)
  - [ ] Form nhập symptoms, diagnoses
  - [ ] Vital signs input (nếu có)
  - [ ] Treatment notes
  - [ ] Complete button
  - [ ] Auto redirect sau khi complete

- [ ] **Visit History** (Doctor/Patient)
  - [ ] Danh sách visits
  - [ ] Filter theo date, patient
  - [ ] View detail với diagnoses

---

## 📋 PHẦN 6: PRESCRIPTION MANAGEMENT

### 6.1 Prescription Endpoints

**Backend APIs:**
- `POST /api/prescriptions` - Tạo đơn thuốc (DOCTOR)
- `PUT /api/prescriptions/:id` - Cập nhật đơn thuốc
- `POST /api/prescriptions/:id/cancel` - Hủy đơn thuốc
- `PUT /api/prescriptions/:id/dispense` - Phát thuốc (ADMIN/RECEPTIONIST)
- `GET /api/prescriptions/:id` - Chi tiết đơn thuốc
- `GET /api/prescriptions/visit/:visitId` - Đơn thuốc theo visit
- `GET /api/prescriptions/patient/:patientId` - Đơn thuốc của patient
- `GET /api/prescriptions/:id/pdf` - Export PDF

**Frontend Checklist:**
- [ ] **Create Prescription Page** (`src/pages/doctor/prescribeMed.tsx`)
  - [ ] Form chọn medicines với search
  - [ ] Add medicine với quantity, dosage, frequency, duration
  - [ ] Remove medicine từ list
  - [ ] Validation (stock available)
  - [ ] Preview total price
  - [ ] Submit button

- [ ] **Prescription List** (`src/pages/doctor/QuanlyDonThuoc.tsx`)
  - [ ] Danh sách prescriptions
  - [ ] Filter theo status, patient, date
  - [ ] View detail
  - [ ] Cancel button (nếu chưa dispensed)
  - [ ] Export PDF button

- [ ] **Prescription Detail** (`src/pages/doctor/prescriptionDetail.tsx`)
  - [ ] Hiển thị chi tiết đơn thuốc
  - [ ] List medicines với dosage instructions
  - [ ] Status badge
  - [ ] Export PDF button
  - [ ] Cancel button (nếu có thể)

- [ ] **Dispense Prescription** (Receptionist/Admin)
  - [ ] Button dispense trong prescription detail
  - [ ] Confirmation dialog
  - [ ] Success message

---

## 📋 PHẦN 7: MEDICINE MANAGEMENT

### 7.1 Medicine Endpoints

**Backend APIs:**
- `GET /api/medicines` - Danh sách medicines (pagination)
- `GET /api/medicines/:id` - Chi tiết medicine
- `POST /api/medicines` - Tạo medicine mới (ADMIN)
- `PUT /api/medicines/:id` - Cập nhật medicine
- `DELETE /api/medicines/:id` - Xóa medicine
- `POST /api/medicines/:id/import` - Nhập kho
- `GET /api/medicines/low-stock` - Thuốc sắp hết
- `GET /api/medicines/expiring` - Thuốc sắp hết hạn
- `GET /api/medicines/imports` - Lịch sử nhập kho
- `GET /api/medicines/exports` - Lịch sử xuất kho
- `GET /api/medicines/:id/imports` - Lịch sử nhập của medicine
- `GET /api/medicines/:id/exports` - Lịch sử xuất của medicine

**Frontend Checklist:**
- [ ] **Medicine List Page** (`src/pages/PharmacyPage.tsx`)
  - [ ] Table với pagination
  - [ ] Search và filter
  - [ ] Stock status badges
  - [ ] Expiry date warnings
  - [ ] View detail button
  - [ ] Edit button (Admin)
  - [ ] Delete button (Admin)

- [ ] **Medicine Detail Page** (`src/pages/PharmacyDetailPage.tsx`)
  - [ ] Hiển thị thông tin medicine
  - [ ] Stock history (imports/exports)
  - [ ] Import button (Admin)
  - [ ] Edit button (Admin)

- [ ] **Medicine Import Page** (`src/pages/admin/PharmacyImportPage.tsx`)
  - [ ] Form nhập kho (quantity, expiry date, supplier)
  - [ ] Validation
  - [ ] Success message

- [ ] **Low Stock & Expiring Alerts** (Admin Dashboard)
  - [ ] Alert cards hiển thị số lượng
  - [ ] Link đến danh sách
  - [ ] Auto refresh

---

## 📋 PHẦN 8: INVOICE & PAYMENT MANAGEMENT

### 8.1 Invoice Endpoints

**Backend APIs:**
- `POST /api/invoices` - Tạo invoice (ADMIN/RECEPTIONIST)
- `GET /api/invoices` - Danh sách invoices
- `GET /api/invoices/:id` - Chi tiết invoice
- `PUT /api/invoices/:id` - Cập nhật invoice
- `GET /api/invoices/patient/:patientId` - Invoices của patient
- `GET /api/invoices/statistics` - Thống kê (ADMIN)
- `GET /api/invoices/unpaid` - Invoices chưa thanh toán
- `POST /api/invoices/:id/payments` - Thêm payment
- `GET /api/invoices/:id/payments` - Lịch sử payments
- `GET /api/invoices/:id/pdf` - Export PDF

**Frontend Checklist:**
- [ ] **Invoice List Page** (`src/pages/recep/InvoicesPage.tsx`)
  - [ ] Table với pagination
  - [ ] Filter theo status, patient, date
  - [ ] Status badges (UNPAID, PARTIALLY_PAID, PAID)
  - [ ] View detail button
  - [ ] Create invoice button (Receptionist)

- [ ] **Invoice Detail Page** (`src/pages/recep/InvoiceDetailPage.tsx`)
  - [ ] Hiển thị chi tiết invoice
  - [ ] List items
  - [ ] Payment history
  - [ ] Add payment form (Receptionist)
  - [ ] Export PDF button
  - [ ] Payment status indicator

- [ ] **Payment Form**
  - [ ] Amount input
  - [ ] Payment method dropdown (CASH, BANK_TRANSFER, QR_CODE)
  - [ ] Validation (không vượt quá total)
  - [ ] Success message

---

## 📋 PHẦN 9: DOCTOR MANAGEMENT

### 9.1 Doctor Endpoints

**Backend APIs:**
- `GET /api/doctors` - Danh sách doctors (ADMIN)
- `GET /api/doctors/:id` - Chi tiết doctor
- `POST /api/doctors` - Tạo doctor mới (ADMIN)
- `PUT /api/doctors/:id` - Cập nhật doctor
- `DELETE /api/doctors/:id` - Xóa doctor
- `GET /api/doctors/:doctorId/shifts` - Lịch trực của doctor

**Frontend Checklist:**
- [ ] **Doctor List Page** (`src/pages/admin/doctorList.tsx`)
  - [ ] Table với pagination
  - [ ] Search và filter
  - [ ] Specialty filter
  - [ ] View detail button
  - [ ] Edit button
  - [ ] Delete button

- [ ] **Doctor Detail Page** (`src/pages/admin/doctorDetail.tsx`)
  - [ ] Hiển thị thông tin doctor
  - [ ] Specialty info
  - [ ] Shift schedule
  - [ ] Edit form

- [ ] **Add Doctor Page** (`src/pages/admin/doctorAdd.tsx`)
  - [ ] Form tạo doctor
  - [ ] Specialty selection
  - [ ] Validation
  - [ ] Success message

---

## 📋 PHẦN 10: DOCTOR SHIFT MANAGEMENT

### 10.1 Doctor Shift Endpoints

**Backend APIs:**
- `GET /api/doctor-shifts/on-duty` - Bác sĩ đang trực
- `GET /api/doctor-shifts/available` - Ca trực còn trống
- `POST /api/doctor-shifts` - Assign doctor to shift
- `GET /api/doctor-shifts/doctor/:doctorId` - Lịch trực của doctor
- `DELETE /api/doctor-shifts/:id` - Unassign shift
- `PUT /api/doctor-shifts/:id/cancel` - Hủy ca trực
- `POST /api/doctor-shifts/:id/restore` - Khôi phục ca trực

**Frontend Checklist:**
- [ ] **Doctor Shift Schedule** (`src/pages/admin/doctorSchedule.tsx`)
  - [ ] Calendar view hoặc table view
  - [ ] Hiển thị shifts theo ngày
  - [ ] Assign doctor button
  - [ ] Cancel shift button
  - [ ] Restore shift button

- [ ] **Assign Shift Modal/Form**
  - [ ] Chọn doctor
  - [ ] Chọn shift (Morning/Afternoon/Evening)
  - [ ] Chọn date
  - [ ] Validation (không conflict)
  - [ ] Success message

---

## 📋 PHẦN 11: DASHBOARD

### 11.1 Dashboard Endpoints

**Backend APIs:**
- `GET /api/dashboard/stats` - Thống kê tổng quan (ADMIN)
- `GET /api/dashboard/appointments/:date` - Appointments theo ngày
- `GET /api/dashboard/overview` - Tổng quan
- `GET /api/dashboard/recent-activities` - Hoạt động gần đây
- `GET /api/dashboard/quick-stats` - Thống kê nhanh

**Frontend Checklist:**
- [ ] **Admin Dashboard** (`src/pages/admin/DashboardPage.tsx`)
  - [ ] Stats cards (total patients, appointments, revenue)
  - [ ] Charts (revenue, appointments over time)
  - [ ] Recent activities list
  - [ ] Quick stats
  - [ ] Upcoming appointments

- [ ] **Doctor Dashboard** (`src/pages/doctor/DashboardPage.tsx`)
  - [ ] Today's appointments
  - [ ] Upcoming appointments
  - [ ] Patient stats
  - [ ] Quick actions

- [ ] **Receptionist Dashboard** (`src/pages/recep/DashboardPage.tsx`)
  - [ ] Today's appointments
  - [ ] Pending check-ins
  - [ ] Unpaid invoices
  - [ ] Quick stats

- [ ] **Patient Dashboard** (Cần tạo nếu chưa có)
  - [ ] Upcoming appointments
  - [ ] Recent visits
  - [ ] Prescriptions
  - [ ] Invoices

---

## 📋 PHẦN 12: REPORTS

### 12.1 Report Endpoints

**Backend APIs:**
- `GET /api/reports/revenue` - Báo cáo doanh thu
- `GET /api/reports/expense` - Báo cáo chi phí
- `GET /api/reports/profit` - Báo cáo lợi nhuận
- `GET /api/reports/top-medicines` - Top thuốc bán chạy
- `GET /api/reports/patients-by-gender` - Phân bố theo giới tính
- `GET /api/reports/appointments` - Báo cáo appointments
- `GET /api/reports/patient-statistics` - Thống kê bệnh nhân
- `GET /api/reports/medicine-alerts` - Cảnh báo thuốc
- `GET /api/reports/*/pdf` - Export PDF cho các reports

**Frontend Checklist:**
- [ ] **Revenue Report** (`src/pages/admin/revenueReport.tsx`)
  - [ ] Date range picker
  - [ ] Chart hiển thị revenue
  - [ ] Table với chi tiết
  - [ ] Export PDF button

- [ ] **Expense Report** (`src/pages/admin/expenseReport.tsx`)
  - [ ] Date range picker
  - [ ] Chart
  - [ ] Table
  - [ ] Export PDF

- [ ] **Profit Report** (Cần tạo nếu chưa có)
  - [ ] Date range picker
  - [ ] Chart (revenue - expense)
  - [ ] Table
  - [ ] Export PDF

- [ ] **Top Medicines Report** (`src/pages/admin/medicineReport.tsx`)
  - [ ] Date range picker
  - [ ] Bar chart
  - [ ] Table
  - [ ] Export PDF

- [ ] **Gender Report** (`src/pages/admin/genderReport.tsx`)
  - [ ] Pie chart
  - [ ] Table
  - [ ] Export PDF

---

## 📋 PHẦN 13: PAYROLL MANAGEMENT

### 13.1 Payroll Endpoints

**Backend APIs:**
- `POST /api/payrolls/calculate` - Tính lương (ADMIN)
- `GET /api/payrolls` - Danh sách payrolls
- `GET /api/payrolls/:id` - Chi tiết payroll
- `GET /api/payrolls/employee/:employeeId` - Payrolls của employee
- `GET /api/payrolls/month/:month` - Payrolls theo tháng
- `PUT /api/payrolls/:id/approve` - Duyệt lương
- `PUT /api/payrolls/:id/pay` - Thanh toán lương
- `GET /api/payrolls/:id/pdf` - Export PDF

**Frontend Checklist:**
- [ ] **Payroll List Page** (`src/pages/admin/SalaryPage.tsx`)
  - [ ] Table với pagination
  - [ ] Filter theo month, employee, status
  - [ ] Calculate payroll button
  - [ ] Approve button
  - [ ] Pay button
  - [ ] Export PDF button

- [ ] **Payroll Detail**
  - [ ] Hiển thị chi tiết lương
  - [ ] Breakdown (base salary, commission, penalty)
  - [ ] Export PDF button

---

## 📋 PHẦN 14: NOTIFICATIONS

### 14.1 Notification Endpoints

**Backend APIs:**
- `GET /api/notifications` - Danh sách notifications
- `GET /api/notifications/unread-count` - Số thông báo chưa đọc
- `PUT /api/notifications/read-all` - Đánh dấu tất cả đã đọc
- `PUT /api/notifications/:id/read` - Đánh dấu đã đọc
- `DELETE /api/notifications/:id` - Xóa notification

**Frontend Checklist:**
- [ ] **Notification Bell** (Header component)
  - [ ] Badge hiển thị unread count
  - [ ] Dropdown menu với notifications
  - [ ] Mark as read khi click
  - [ ] Link đến notification detail

- [ ] **Notification Settings** (Profile page)
  - [ ] Toggle notifications on/off
  - [ ] Select notification types
  - [ ] Save settings

---

## 📋 PHẦN 15: SEARCH FUNCTIONALITY

### 15.1 Search Endpoints

**Backend APIs:**
- `POST /api/search/patients` - Tìm kiếm patients
- `POST /api/search/doctors` - Tìm kiếm doctors
- `POST /api/search/medicines` - Tìm kiếm medicines

**Frontend Checklist:**
- [ ] **Global Search Bar** (Header)
  - [ ] Search input với autocomplete
  - [ ] Search results dropdown
  - [ ] Link đến detail pages
  - [ ] Keyboard navigation

---

## 📋 PHẦN 16: AUDIT LOGS (ADMIN)

### 16.1 Audit Log Endpoints

**Backend APIs:**
- `GET /api/audit-logs` - Danh sách audit logs
- `GET /api/audit-logs/user/:userId` - Logs của user
- `GET /api/audit-logs/entity/:entityType/:id` - Logs của entity

**Frontend Checklist:**
- [ ] **Audit Log Page** (Cần tạo nếu chưa có)
  - [ ] Table với pagination
  - [ ] Filter theo user, entity, action, date
  - [ ] View detail với before/after values
  - [ ] Export CSV (optional)

---

## 📋 PHẦN 17: PERMISSIONS MANAGEMENT (ADMIN)

### 17.1 Permission Endpoints

**Backend APIs:**
- `GET /api/permissions` - Danh sách permissions
- `GET /api/permissions/modules` - Modules với permissions
- `GET /api/permissions/role/:roleId` - Permissions của role
- `POST /api/permissions/role/:roleId/assign` - Assign permissions
- `POST /api/permissions` - Tạo permission mới
- `DELETE /api/permissions/:id` - Xóa permission

**Frontend Checklist:**
- [ ] **Permission Management Page** (Cần tạo nếu chưa có)
  - [ ] List permissions theo modules
  - [ ] Role-based permission matrix
  - [ ] Checkbox để assign/unassign
  - [ ] Save changes button

---

## 📋 PHẦN 18: UI/UX IMPROVEMENTS

### 18.1 Design Consistency

**Checklist:**
- [ ] Tất cả pages sử dụng cùng design system (shadcn/ui)
- [ ] Colors, fonts, spacing đồng nhất
- [ ] Button styles nhất quán
- [ ] Form styles nhất quán
- [ ] Table styles nhất quán
- [ ] Modal/dialog styles nhất quán

### 18.2 Loading States

**Checklist:**
- [ ] Loading spinner cho tất cả API calls
- [ ] Skeleton loaders cho tables và lists
- [ ] Button loading states

### 18.3 Error Handling

**Checklist:**
- [ ] Error messages hiển thị rõ ràng
- [ ] Toast notifications cho success/error
- [ ] Form validation errors hiển thị inline
- [ ] Network error handling
- [ ] 404 page
- [ ] 500 error page

### 18.4 Responsive Design

**Checklist:**
- [ ] Mobile-friendly (320px+)
- [ ] Tablet-friendly (768px+)
- [ ] Desktop-friendly (1024px+)
- [ ] Tables responsive (scroll hoặc card view trên mobile)
- [ ] Forms responsive
- [ ] Navigation responsive (mobile menu)

---

## 📋 PHẦN 19: ROUTING & NAVIGATION

### 19.1 Routes Setup

**Checklist:**
- [ ] Tất cả routes được định nghĩa trong router
- [ ] Protected routes yêu cầu authentication
- [ ] Role-based route protection
- [ ] 404 route handler
- [ ] Redirect logic đúng

### 19.2 Navigation

**Checklist:**
- [ ] Sidebar navigation theo role
- [ ] Active route highlighting
- [ ] Breadcrumbs (nếu cần)
- [ ] Back button (nếu cần)

---

## 📋 PHẦN 20: TESTING & VALIDATION

### 20.1 Manual Testing Checklist

**Authentication:**
- [ ] Login với valid credentials
- [ ] Login với invalid credentials
- [ ] Register new user
- [ ] Logout
- [ ] Token refresh

**CRUD Operations:**
- [ ] Create operations
- [ ] Read operations
- [ ] Update operations
- [ ] Delete operations

**Business Flows:**
- [ ] Patient đặt lịch → Check-in → Visit → Prescription → Invoice → Payment
- [ ] Doctor tạo prescription
- [ ] Receptionist xử lý payment
- [ ] Admin xem reports

### 20.2 Error Scenarios

**Checklist:**
- [ ] Network errors
- [ ] 401 Unauthorized
- [ ] 403 Forbidden
- [ ] 404 Not Found
- [ ] 500 Server Error
- [ ] Validation errors
- [ ] Form submission errors

---

## 🚀 QUY TRÌNH HOÀN THIỆN

### Bước 1: Audit Current State
1. Liệt kê tất cả pages/components hiện có
2. So sánh với Backend APIs
3. Xác định missing features

### Bước 2: Priority Order
1. **High Priority:**
   - Authentication flow
   - Core CRUD operations
   - Main business flows

2. **Medium Priority:**
   - Reports
   - Dashboard enhancements
   - Search functionality

3. **Low Priority:**
   - Audit logs
   - Advanced features

### Bước 3: Implementation
1. Tạo missing pages/components
2. Implement API integrations
3. Add error handling
4. Add loading states
5. Test functionality

### Bước 4: Polish
1. UI/UX improvements
2. Responsive design
3. Performance optimization
4. Final testing

---

## 📝 NOTES

- Sử dụng checklist này để track progress
- Đánh dấu ✅ khi hoàn thành mỗi item
- Document mọi issues và solutions
- Test thoroughly trước khi mark complete

---

**Tạo bởi:** AI Assistant  
**Ngày:** 2025-01-03  
**Version:** 1.0.0
