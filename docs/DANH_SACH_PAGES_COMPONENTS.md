# 📋 DANH SÁCH TẤT CẢ PAGES & COMPONENTS HIỆN CÓ

## 📊 TỔNG QUAN

- **Tổng số Pages:** 28 files
- **Tổng số Components:** 60+ files
- **UI Components (shadcn/ui):** 50+ files
- **Custom Components:** 10+ files

---

## 📄 PAGES (28 files)

### 🌐 Public Pages (4 files)

| File Path | Route | Mô Tả | Status |
|-----------|-------|-------|--------|
| `src/pages/LandingPage.tsx` | `/` | Trang chủ | ✅ |
| `src/pages/LoginPage.tsx` | `/login` | Đăng nhập | ✅ |
| `src/pages/RegisterPage.tsx` | `/register` | Đăng ký | ✅ |
| `src/pages/Privacy_Policy.tsx` | - | Chính sách bảo mật | ✅ |
| `src/pages/ToS.tsx` | - | Điều khoản sử dụng | ✅ |

### 👤 Patient Pages (3 files)

| File Path | Route | Mô Tả | Status |
|-----------|-------|-------|--------|
| `src/pages/patient/SignupPage.tsx` | `/register` | Đăng ký bệnh nhân | ✅ |
| `src/pages/patient/BookAppointmentPage.tsx` | `/book-appointment` | Đặt lịch khám | ✅ |
| `src/pages/patient/Appointments.tsx` | `/patient/appointments` | Danh sách lịch hẹn | ✅ |

### 👨‍⚕️ Doctor Pages (7 files)

| File Path | Route | Mô Tả | Status |
|-----------|-------|-------|--------|
| `src/pages/doctor/DashboardPage.tsx` | `/doctor/dashboard` | Dashboard bác sĩ | ✅ |
| `src/pages/doctor/doctorShift.tsx` | `/doctor/shift` | Lịch trực bác sĩ | ✅ |
| `src/pages/doctor/formMedical.tsx` | `/doctor/patients/:id` | Form khám bệnh | ✅ |
| `src/pages/doctor/medicalList.tsx` | `/doctor/medicalList` | Danh sách bệnh nhân | ✅ |
| `src/pages/doctor/prescribeMed.tsx` | `/doctor/patients/:id/prescription` | Kê đơn thuốc | ✅ |
| `src/pages/doctor/prescriptionDetail.tsx` | `/doctor/prescriptions/:id/edit` | Chi tiết đơn thuốc | ✅ |
| `src/pages/doctor/QuanlyDonThuoc.tsx` | `/doctor/prescriptions` | Quản lý đơn thuốc | ✅ |

### 🏥 Receptionist Pages (5 files)

| File Path | Route | Mô Tả | Status |
|-----------|-------|-------|--------|
| `src/pages/recep/DashboardPage.tsx` | `/receptionist/dashboard` | Dashboard lễ tân | ✅ |
| `src/pages/recep/patient_list.tsx` | `/recep/patients` | Danh sách bệnh nhân | ✅ |
| `src/pages/recep/patient_detail.tsx` | `/recep/patients/:id` | Chi tiết bệnh nhân | ✅ |
| `src/pages/recep/InvoicesPage.tsx` | `/invoices` | Danh sách hóa đơn | ✅ |
| `src/pages/recep/InvoiceDetailPage.tsx` | `/invoices/:id` | Chi tiết hóa đơn | ✅ |

### 👑 Admin Pages (30 files)

| File Path | Route | Mô Tả | Status |
|-----------|-------|-------|--------|
| `src/pages/admin/DashboardPage.tsx` | `/admin/dashboard` | Dashboard admin | ✅ |
| `src/pages/admin/doctorList.tsx` | `/admin/doctors` | Danh sách bác sĩ | ✅ |
| `src/pages/admin/doctorDetail.tsx` | `/admin/doctors/:id` | Chi tiết bác sĩ | ✅ |
| `src/pages/admin/doctorAdd.tsx` | `/admin/doctors/add` | Thêm bác sĩ | ✅ |
| `src/pages/admin/doctorSchedule.tsx` | `/admin/schedule` | Lịch trực bác sĩ | ✅ |
| `src/pages/admin/doctorShift.tsx` | `/admin/doctors/:id/shift` | Ca trực bác sĩ | ✅ |
| `src/pages/admin/modalChooseDay.tsx` | - | Modal chọn ngày | ✅ |
| `src/pages/admin/PharmacyImportPage.tsx` | `/admin/pharmacy/import` | Nhập kho thuốc | ✅ |
| `src/pages/admin/SalaryPage.tsx` | `/salary` | Quản lý lương | ✅ |
| `src/pages/admin/revenueReport.tsx` | - | Báo cáo doanh thu | ✅ |
| `src/pages/admin/expenseReport.tsx` | - | Báo cáo chi phí | ✅ |
| `src/pages/admin/genderReport.tsx` | - | Báo cáo giới tính | ✅ |
| `src/pages/admin/medicineReport.tsx` | - | Báo cáo thuốc | ✅ |

### 💊 Pharmacy Pages (2 files)

| File Path | Route | Mô Tả | Status |
|-----------|-------|-------|--------|
| `src/pages/PharmacyPage.tsx` | `/pharmacy` | Danh sách thuốc | ✅ |
| `src/pages/PharmacyDetailPage.tsx` | `/pharmacy/:id` | Chi tiết thuốc | ✅ |

---

## 🧩 COMPONENTS

### 📦 Custom Components (10+ files)

#### Layout Components

| File Path | Mô Tả | Status |
|-----------|-------|--------|
| `src/components/header.tsx` | Header component | ✅ |
| `src/components/footer.tsx` | Footer component | ✅ |
| `src/components/topbar.tsx` | Top bar navigation | ✅ |
| `src/components/sidebar_layout.tsx` | Sidebar layout wrapper | ✅ |
| `src/components/theme-provider.tsx` | Theme provider (dark/light) | ✅ |

#### Sidebar Components (4 files)

| File Path | Mô Tả | Role | Status |
|-----------|-------|------|--------|
| `src/components/sidebar/admin.tsx` | Admin sidebar | ADMIN | ✅ |
| `src/components/sidebar/doctor.tsx` | Doctor sidebar | DOCTOR | ✅ |
| `src/components/sidebar/patient.tsx` | Patient sidebar | PATIENT | ✅ |
| `src/components/sidebar/recep.tsx` | Receptionist sidebar | RECEPTIONIST | ✅ |

#### Form Components

| File Path | Mô Tả | Status |
|-----------|-------|--------|
| `src/components/form/Login.tsx` | Login form | ✅ |
| `src/components/form/Register.tsx` | Register form | ✅ |
| `src/components/booking_form.tsx` | Booking appointment form | ✅ |
| `src/components/contact_form.tsx` | Contact form | ✅ |

#### Feature Components

| File Path | Mô Tả | Status |
|-----------|-------|--------|
| `src/components/hero.tsx` | Hero section | ✅ |
| `src/components/features.tsx` | Features section | ✅ |
| `src/components/services.tsx` | Services section | ✅ |
| `src/components/stats.tsx` | Statistics section | ✅ |
| `src/components/cta.tsx` | Call to action | ✅ |

#### Appointment Components

| File Path | Mô Tả | Status |
|-----------|-------|--------|
| `src/components/appointment/Appointment_card.tsx` | Appointment card | ✅ |
| `src/components/appointment/Appointment_detail_modal.tsx` | Appointment detail modal | ✅ |
| `src/components/appointment/AppointmentStats.tsx` | Appointment statistics | ✅ |

#### Utility Components

| File Path | Mô Tả | Status |
|-----------|-------|--------|
| `src/components/ProtectedRoute.tsx` | Protected route wrapper | ✅ |
| `src/components/ErrorBoundary.tsx` | Error boundary | ✅ |

---

## 🎨 UI COMPONENTS (shadcn/ui) - 50+ files

### Form Components

| Component | File Path | Mô Tả |
|-----------|-----------|-------|
| Button | `src/components/ui/button.tsx` | Button component |
| Input | `src/components/ui/input.tsx` | Input field |
| Textarea | `src/components/ui/textarea.tsx` | Textarea field |
| Label | `src/components/ui/label.tsx` | Form label |
| Checkbox | `src/components/ui/checkbox.tsx` | Checkbox |
| Radio Group | `src/components/ui/radio-group.tsx` | Radio buttons |
| Select | `src/components/ui/select.tsx` | Dropdown select |
| Switch | `src/components/ui/switch.tsx` | Toggle switch |
| Input OTP | `src/components/ui/input-otp.tsx` | OTP input |
| Input Group | `src/components/ui/input-group.tsx` | Input group |
| Field | `src/components/ui/field.tsx` | Form field wrapper |
| Form | `src/components/ui/form.tsx` | Form wrapper |

### Layout Components

| Component | File Path | Mô Tả |
|-----------|-----------|-------|
| Card | `src/components/ui/card.tsx` | Card container |
| Separator | `src/components/ui/separator.tsx` | Divider |
| Aspect Ratio | `src/components/ui/aspect-ratio.tsx` | Aspect ratio wrapper |
| Scroll Area | `src/components/ui/scroll-area.tsx` | Scrollable area |
| Resizable | `src/components/ui/resizable.tsx` | Resizable panels |

### Navigation Components

| Component | File Path | Mô Tả |
|-----------|-----------|-------|
| Sidebar | `src/components/ui/sidebar.tsx` | Sidebar component |
| Navigation Menu | `src/components/ui/navigation-menu.tsx` | Navigation menu |
| Menubar | `src/components/ui/menubar.tsx` | Menu bar |
| Breadcrumb | `src/components/ui/breadcrumb.tsx` | Breadcrumb navigation |
| Pagination | `src/components/ui/pagination.tsx` | Pagination controls |

### Overlay Components

| Component | File Path | Mô Tả |
|-----------|-----------|-------|
| Dialog | `src/components/ui/dialog.tsx` | Modal dialog |
| Alert Dialog | `src/components/ui/alert-dialog.tsx` | Confirmation dialog |
| Sheet | `src/components/ui/sheet.tsx` | Slide-out panel |
| Drawer | `src/components/ui/drawer.tsx` | Drawer panel |
| Popover | `src/components/ui/popover.tsx` | Popover |
| Tooltip | `src/components/ui/tooltip.tsx` | Tooltip |
| Hover Card | `src/components/ui/hover-card.tsx` | Hover card |
| Context Menu | `src/components/ui/context-menu.tsx` | Right-click menu |
| Dropdown Menu | `src/components/ui/dropdown-menu.tsx` | Dropdown menu |

### Feedback Components

| Component | File Path | Mô Tả |
|-----------|-----------|-------|
| Alert | `src/components/ui/alert.tsx` | Alert message |
| Toast | `src/components/ui/toast.tsx` | Toast notification |
| Toaster | `src/components/ui/toaster.tsx` | Toast container |
| Sonner | `src/components/ui/sonner.tsx` | Sonner toast |
| Progress | `src/components/ui/progress.tsx` | Progress bar |
| Skeleton | `src/components/ui/skeleton.tsx` | Loading skeleton |
| Spinner | `src/components/ui/spinner.tsx` | Loading spinner |
| Empty | `src/components/ui/empty.tsx` | Empty state |

### Data Display Components

| Component | File Path | Mô Tả |
|-----------|-----------|-------|
| Table | `src/components/ui/table.tsx` | Data table |
| Badge | `src/components/ui/badge.tsx` | Badge/tag |
| Avatar | `src/components/ui/avatar.tsx` | Avatar image |
| Calendar | `src/components/ui/calendar.tsx` | Date picker |
| Chart | `src/components/ui/chart.tsx` | Chart component |
| Carousel | `src/components/ui/carousel.tsx` | Image carousel |
| Accordion | `src/components/ui/accordion.tsx` | Collapsible content |
| Collapsible | `src/components/ui/collapsible.tsx` | Collapsible section |
| Tabs | `src/components/ui/tabs.tsx` | Tab navigation |

### Interactive Components

| Component | File Path | Mô Tả |
|-----------|-----------|-------|
| Toggle | `src/components/ui/toggle.tsx` | Toggle button |
| Toggle Group | `src/components/ui/toggle-group.tsx` | Toggle group |
| Slider | `src/components/ui/slider.tsx` | Range slider |
| Command | `src/components/ui/command.tsx` | Command palette |
| Item | `src/components/ui/item.tsx` | List item |

### Utility Components

| Component | File Path | Mô Tả |
|-----------|-----------|-------|
| KBD | `src/components/ui/kbd.tsx` | Keyboard shortcut display |
| Button Group | `src/components/ui/button-group.tsx` | Button group |
| Use Mobile | `src/components/ui/use-mobile.tsx` | Mobile detection hook |
| Use Toast | `src/components/ui/use-toast.ts` | Toast hook |

---

## 📁 CẤU TRÚC THƯ MỤC

```
src/
├── pages/
│   ├── admin/          (12 files)
│   ├── doctor/         (7 files)
│   ├── patient/        (3 files)
│   ├── recep/          (5 files)
│   └── [root]          (5 files)
│
├── components/
│   ├── ui/             (50+ files - shadcn/ui)
│   ├── sidebar/        (4 files)
│   ├── appointment/    (3 files)
│   ├── form/          (2 files)
│   └── [root]         (10+ files)
│
├── auth/              (Auth context & services)
├── lib/               (API clients, utilities)
├── services/          (API services)
├── types/             (TypeScript types)
└── utils/             (Helper functions)
```

---

## 📊 THỐNG KÊ THEO ROLE

### Admin Pages (30)
- Dashboard
- Doctor Management (List, Detail, Add, Schedule, Shift)
- Pharmacy/Medicine Management (Import, Export, Create, Edit, Inventory)
- Salary/Payroll Management
- Reports (Revenue, Expense, Profit, Appointments, Patients, Medicines, Medicine Alerts, Gender)
- User Management
- System Management (Audit Logs, Permissions)
- Specialties Management
- Shifts Management

### Doctor Pages (7)
- Dashboard
- Shift Management
- Medical List
- Form Medical (Visit)
- Prescribe Medicine
- Prescription Management
- Prescription Detail

### Receptionist Pages (5)
- Dashboard
- Patient List
- Patient Detail
- Invoice List
- Invoice Detail

### Patient Pages (3)
- Signup (Setup Profile)
- Book Appointment
- Appointments List

### Public Pages (5)
- Landing Page
- Login
- Register
- Privacy Policy
- Terms of Service

---

## ⚠️ PAGES/COMPONENTS CẦN TẠO

### High Priority

1. **Profile Management**
   - `src/pages/ProfilePage.tsx` - Quản lý profile
   - `src/pages/ForgotPasswordPage.tsx` - Quên mật khẩu
   - `src/pages/ResetPasswordPage.tsx` - Reset mật khẩu

2. **User Management (Admin)**
   - `src/pages/admin/UserManagementPage.tsx` - Quản lý users
   - `src/pages/admin/UserDetailPage.tsx` - Chi tiết user

3. **Notification System**
   - `src/components/NotificationBell.tsx` - Notification bell
   - `src/components/NotificationDropdown.tsx` - Notification dropdown

4. **Search Functionality**
   - `src/components/SearchBar.tsx` - Global search bar

### Medium Priority

5. **Reports (Missing Routes)**
   - `src/pages/admin/profitReport.tsx` - Báo cáo lợi nhuận
   - `src/pages/admin/appointmentReport.tsx` - Báo cáo appointments
   - `src/pages/admin/patientStatisticsReport.tsx` - Thống kê bệnh nhân

6. **Audit Logs (Admin)**
   - `src/pages/admin/AuditLogPage.tsx` - Audit logs

7. **Permissions Management (Admin)**
   - `src/pages/admin/PermissionPage.tsx` - Quản lý permissions

8. **Visit Detail**
   - `src/pages/doctor/VisitDetailPage.tsx` - Chi tiết lượt khám

9. **Appointment Detail**
   - `src/pages/patient/AppointmentDetailPage.tsx` - Chi tiết lịch hẹn

10. **Payroll Detail**
    - `src/pages/admin/PayrollDetailPage.tsx` - Chi tiết bảng lương

---

## 📝 NOTES

- ✅ = Đã có và đang sử dụng
- ⚠️ = Cần hoàn thiện hoặc chưa có route
- ❌ = Chưa có, cần tạo

- Tất cả UI components từ shadcn/ui đã được setup
- Routing được cấu hình trong `src/App.tsx`
- Protected routes sử dụng `ProtectedRoute` component
- Sidebar navigation theo từng role

---

**Cập nhật:** 2025-01-03  
**Version:** 1.0.0
