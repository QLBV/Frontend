# Prompt Kiểm Tra Các Page và Giao Diện Cho Patient

## Mục tiêu
Tạo một checklist toàn diện để kiểm tra tất cả các page, component và tính năng dành cho patient trong hệ thống, đảm bảo UI/UX, validation, API integration và user experience hoạt động đúng.

## Phạm vi Kiểm Tra

### 1. CÁC PAGE CHÍNH CỦA PATIENT

#### 1.1. SignupPage (`/register`)

**File:** `src/pages/patient/SignupPage.tsx`

**Kiểm tra:**

- [ ] Form đăng ký có đầy đủ các trường: fullName, email, password, confirmPassword
- [ ] Validation form:
  - [ ] Kiểm tra password và confirmPassword khớp nhau
  - [ ] Password có ít nhất 8 ký tự
  - [ ] Password có chữ thường, chữ hoa và số (regex validation)
  - [ ] FullName có ít nhất 2 ký tự
  - [ ] Email format hợp lệ (browser validation + server validation)
  - [ ] Checkbox đồng ý điều khoản dịch vụ (required)
  - [ ] Hiển thị thông báo lỗi validation rõ ràng, bằng tiếng Việt
- [ ] UI/UX:
  - [ ] Form có layout đẹp, responsive trên mobile/tablet/desktop
  - [ ] Có loading state khi đang submit (button disabled, loading spinner)
  - [ ] Success toast khi đăng ký thành công (⚠️ THIẾU - cần thêm)
  - [ ] Error toast với thông báo cụ thể khi lỗi
  - [ ] Error messages hiển thị trong card (đã có)
  - [ ] Có link đến trang login ở cuối form
  - [ ] Có Header và Footer
  - [ ] Input icons (User, Mail, Lock) hiển thị đúng
  - [ ] Password hint text hiển thị đúng
- [ ] API Integration:
  - [ ] Gọi API `/auth/register` đúng format (qua useAuth().register)
  - [ ] Xử lý error response từ API (email đã tồn tại, validation errors)
  - [ ] Xử lý các error codes: EMAIL_INVALID, PASSWORD_TOO_SHORT, PASSWORD_WEAK, FULLNAME_INVALID
  - [ ] Redirect sau khi đăng ký thành công (navigate("/"))
- [ ] Security:
  - [ ] Password inputs có type="password" (ẩn mật khẩu)
  - [ ] CSRF protection (nếu có)
  - [ ] Rate limiting (nếu có)

#### 1.2. BookAppointmentPage (`/book-appointment`)

**File:** `src/pages/patient/BookAppointmentPage.tsx`
**Component:** `src/components/booking_form.tsx`

**Kiểm tra:**

- [ ] Form đặt lịch có đầy đủ các trường:
  - [ ] Chọn chuyên khoa (specialty) - ⚠️ Đang dùng mock data (specialties array)
  - [ ] Chọn bác sĩ (doctor) - ⚠️ Đang dùng mock data (doctors array)
  - [ ] Chọn ngày (date picker) - Calendar component hoạt động
  - [ ] Chọn giờ (time slot) - Dynamic theo weekday/weekend
  - [ ] Triệu chứng/symptom description (optional) - Textarea
  - [ ] Thông tin liên hệ:
    - [ ] Full Name (required)
    - [ ] Phone Number (required)
    - [ ] Email Address (optional)
- [ ] UI/UX:
  - [ ] Calendar picker hoạt động đúng (date-fns format)
  - [ ] Disable dates trong quá khứ
  - [ ] Hiển thị danh sách bác sĩ theo chuyên khoa đã chọn (filter logic)
  - [ ] Search bác sĩ theo tên hoặc specialty
  - [ ] Hiển thị các time slot khả dụng theo weekday/weekend
  - [ ] Disable time slots không khả dụng
  - [ ] Hiển thị thông tin bác sĩ (avatar, tên, chuyên khoa, kinh nghiệm)
  - [ ] Step indicator (Step 1, 2, 3) hoạt động
  - [ ] Disable step 2, 3 khi chưa hoàn thành step trước
  - [ ] Responsive trên mobile/tablet/desktop
  - [ ] Loading states khi tải dữ liệu (⚠️ Chưa có API calls)
  - [ ] Empty states khi không có bác sĩ/time slot
  - [ ] Success screen sau khi submit (confirmation card)
  - [ ] Reset form button hoạt động
- [ ] Validation:
  - [ ] Kiểm tra đã chọn chuyên khoa (disabled submit nếu chưa)
  - [ ] Kiểm tra đã chọn bác sĩ (disabled submit nếu chưa)
  - [ ] Kiểm tra đã chọn ngày và giờ (disabled submit nếu chưa)
  - [ ] Validation triệu chứng (optional, nhưng có max length nếu có)
  - [ ] Validation phone number format (10-11 số)
  - [ ] Validation email format (nếu nhập)
- [ ] API Integration:
  - [ ] ⚠️ THIẾU: Fetch danh sách specialties từ API `/specialties`
  - [ ] ⚠️ THIẾU: Fetch danh sách doctors theo specialty từ API `/doctors?specialtyId=...`
  - [ ] ⚠️ THIẾU: Fetch available time slots theo doctor và date từ API `/appointments/available-slots?doctorId=...&date=...`
  - [ ] ⚠️ THIẾU: Submit appointment với đúng format data đến API `/appointments`
  - [ ] ⚠️ THIẾU: Xử lý conflict (time slot đã được đặt)
  - [ ] ⚠️ THIẾU: Success/error handling với toast
  - [ ] Form hiện tại chỉ có mock submission (isSubmitted state)
- [ ] Navigation:
  - [ ] Redirect sau khi đặt lịch thành công (⚠️ Chưa có, chỉ có "Go back" link)
  - [ ] Có nút "View My Appointments" (⚠️ Chưa có)
  - [ ] Link đến trang appointments trong success screen

#### 1.3. PatientAppointmentsPage (`/patient/appointments`)

**File:** `src/pages/patient/Appointments.tsx`
**Hook:** `hooks/usePatientAppointments.ts`
**Components:** 
  - `src/components/appointment/Appointment_card.tsx`
  - `src/components/appointment/Appointment_detail_modal.tsx`
  - `src/components/appointment/AppointmentStats.tsx`

**Kiểm tra:**

- [ ] Hiển thị thống kê:
  - [ ] Tổng số lịch hẹn (stats.total)
  - [ ] Số lịch sắp tới (stats.upcoming)
  - [ ] Số lịch đã qua (stats.completed)
  - [ ] Số lịch đã hủy (stats.cancelled)
  - [ ] Stats cards có icon và màu sắc phù hợp
- [ ] Tabs/Filter:
  - [ ] Tab "Upcoming" hiển thị các lịch sắp tới
  - [ ] Tab "History" hiển thị các lịch đã qua
  - [ ] Chuyển đổi tab hoạt động mượt (animate-in)
  - [ ] Active tab state rõ ràng
- [ ] Appointment Cards:
  - [ ] Hiển thị đầy đủ thông tin: bác sĩ (name, specialty, image), ngày giờ (date, time), trạng thái (status), lý do (reason), location
  - [ ] Status badges với màu sắc phù hợp (WAITING=blue, CHECKED_IN=yellow, CANCELLED=red, NO_SHOW=gray, Completed=green)
  - [ ] Có nút "View Details" cho mỗi card
  - [ ] Có nút "Cancel" cho lịch sắp tới (chỉ hiện khi !isPast)
  - [ ] Có nút "Book Follow-up" cho lịch đã qua (chỉ hiện khi status === "Completed")
  - [ ] Loading skeleton khi đang tải (⚠️ Chưa có)
  - [ ] Empty state khi không có lịch hẹn (có message phù hợp)
  - [ ] Card hover effects hoạt động
  - [ ] Responsive layout trên mobile
- [ ] Appointment Detail Modal:
  - [ ] Hiển thị đầy đủ thông tin chi tiết:
    - [ ] Appointment ID
    - [ ] Status badge
    - [ ] Thông tin bác sĩ (tên, chuyên khoa, ảnh)
    - [ ] Thông tin lịch hẹn (ngày, giờ, location)
    - [ ] Triệu chứng/ghi chú (reason)
    - [ ] Diagnosis (nếu có)
    - [ ] Prescription (nếu có)
    - [ ] Next steps (nếu có)
    - [ ] Cancellation reason (nếu status === 'Cancelled')
  - [ ] Có nút đóng modal (X button)
  - [ ] Responsive trên mobile (dialog fullscreen hoặc scrollable)
  - [ ] Modal animation mượt
- [ ] Cancel Appointment Dialog:
  - [ ] Dialog yêu cầu lý do hủy (Textarea với Label)
  - [ ] Validation: lý do không được để trống (disabled button nếu empty)
  - [ ] Confirmation trước khi hủy (dialog description)
  - [ ] Success/error toast sau khi hủy
  - [ ] Cập nhật UI sau khi hủy thành công (remove khỏi upcoming, add vào past)
  - [ ] Loading state khi đang cancel
- [ ] API Integration:
  - [ ] ⚠️ THIẾU: Fetch appointments từ API `/appointments?patientId=...` với filters
  - [ ] ⚠️ THIẾU: Call API cancel appointment với reason: `POST /appointments/:id/cancel` với body `{ reason }`
  - [ ] ⚠️ Đang dùng MOCK_DATA trong hook usePatientAppointments
  - [ ] ⚠️ Cần implement real API calls trong hook
  - [ ] Real-time updates (nếu có polling hoặc WebSocket)
  - [ ] Error handling đầy đủ (toast.error)
- [ ] Navigation:
  - [ ] Link đến trang đặt lịch mới (⚠️ Chưa có button rõ ràng, có thể thêm trong empty state)
  - [ ] Có Header với navigation (Header component có link đến /patient/appointments)
  - [ ] Responsive layout
- [ ] Book Follow-up:
  - [ ] Nút "Book Follow-up" navigate đến `/book-appointment` với state `{ selectedDoctorId }`
  - [ ] Pre-select doctor trong booking form

#### 1.4. ProfilePage (`/profile`)

**File:** `src/pages/ProfilePage.tsx`
**Note:** Dùng chung cho tất cả roles, nhưng cần kiểm tra với role patient

**Kiểm tra:**

- [ ] Hiển thị đúng sidebar cho patient (PatientSidebar) - ✅ Đã có switch case
- [ ] Tab "Profile Information":
  - [ ] Hiển thị thông tin cá nhân: fullName, email (readonly), phone, address
  - [ ] Avatar upload:
    - [ ] Hiển thị avatar hiện tại hoặc initials
    - [ ] Button "Thay đổi avatar"
    - [ ] File input với accept="image/*"
    - [ ] Validation file type (chỉ image)
    - [ ] Validation file size (max 5MB)
    - [ ] Loading state khi upload
    - [ ] Success/error toast khi upload
    - [ ] Update avatar URL sau khi upload thành công
  - [ ] Form chỉnh sửa với validation:
    - [ ] FullName: required, min 2 chars
    - [ ] Phone: optional, format 10-11 số (regex: /^[0-9]{10,11}$/)
    - [ ] Address: optional
    - [ ] Email: readonly, disabled, có hint text
  - [ ] Success/error toast khi cập nhật
  - [ ] Loading state khi submit (button disabled)
  - [ ] Form reset sau khi cập nhật thành công
- [ ] Tab "Change Password":
  - [ ] Form đổi mật khẩu: currentPassword, newPassword, confirmPassword
  - [ ] Show/hide password toggles cho cả 3 fields (Eye/EyeOff icons)
  - [ ] Validation: newPassword phải khác currentPassword (⚠️ Chưa có check)
  - [ ] Validation: newPassword match confirmPassword (yup.oneOf)
  - [ ] Validation: newPassword đủ mạnh (min 8 chars, có chữ hoa, chữ thường, số)
  - [ ] Validation messages hiển thị dưới mỗi field
  - [ ] Success/error handling với toast
  - [ ] Loading state khi submit
  - [ ] Form reset sau khi đổi mật khẩu thành công
- [ ] API Integration:
  - [ ] Fetch profile data từ API `/profile` (GET)
  - [ ] Update profile API: `PUT /profile` với body `{ fullName, phone, address }`
  - [ ] Change password API: `PUT /profile/password` với body `{ currentPassword, newPassword }`
  - [ ] Upload avatar API: `POST /profile/avatar` với FormData
  - [ ] Error handling đầy đủ (401, 403, 400, 500)
- [ ] UI/UX:
  - [ ] Form layout đẹp, có icons cho inputs
  - [ ] Responsive trên mobile
  - [ ] Tabs navigation hoạt động mượt
  - [ ] Card layout với proper spacing

#### 1.5. AppointmentDetailPage (`/appointments/:id`)

**File:** `src/pages/AppointmentDetailPage.tsx`
**Note:** Dùng chung, nhưng cần kiểm tra với role patient

**Kiểm tra:**

- [ ] Hiển thị đúng sidebar cho patient (PatientSidebar) - ✅ Có getSidebar() function
- [ ] Hiển thị đầy đủ thông tin:
  - [ ] Thông tin bác sĩ (fullName, specialty)
  - [ ] Thông tin bệnh nhân (fullName, patientCode nếu có)
  - [ ] Thông tin lịch hẹn (ngày khám format "Thứ X, ngày DD tháng MM năm YYYY", ca trực, startTime-endTime)
  - [ ] Trạng thái (status badge với màu phù hợp)
  - [ ] Triệu chứng ban đầu (symptomInitial)
  - [ ] Loại đặt lịch (ONLINE/Offline badge)
  - [ ] Ngày tạo
  - [ ] Thông tin khám (nếu đã khám - ⚠️ Chưa có section này)
- [ ] Actions cho patient:
  - [ ] Nút "Cancel Appointment" (nếu status === "WAITING" và roleId === 3) - ✅ Có canCancel check
  - [ ] Nút "Reschedule" (nếu status === "WAITING" và roleId === 3) - ✅ Có canReschedule check
  - [ ] Nút "Book Follow-up" (⚠️ Chưa có, có thể thêm)
  - [ ] Link đến prescription (nếu có) - ⚠️ Chưa có
  - [ ] Link đến invoice (nếu có) - ⚠️ Chưa có
  - [ ] Link đến visit detail (nếu đã khám) - ⚠️ Chưa có
- [ ] Cancel Dialog:
  - [ ] Dialog confirmation
  - [ ] Success/error toast
  - [ ] Navigate back sau khi hủy thành công
- [ ] Reschedule Dialog:
  - [ ] Select doctor dropdown
  - [ ] Select shift dropdown (disabled nếu chưa chọn doctor)
  - [ ] Date picker (disable dates trong quá khứ)
  - [ ] Validation: phải chọn date
  - [ ] Success/error toast
  - [ ] Refresh appointment data sau khi reschedule
- [ ] Permission checks:
  - [ ] Patient chỉ xem được lịch hẹn của chính họ (⚠️ Backend cần check)
  - [ ] Hiển thị thông báo nếu không có quyền
  - [ ] 404 redirect nếu appointment không tồn tại
- [ ] API Integration:
  - [ ] Fetch appointment từ API: `GET /appointments/:id`
  - [ ] Cancel API: `POST /appointments/:id/cancel`
  - [ ] Update API: `PUT /appointments/:id` với body `{ doctorId?, shiftId?, date? }`
  - [ ] Fetch doctors và shifts cho reschedule dialog
  - [ ] Error handling đầy đủ
- [ ] Loading States:
  - [ ] Loading spinner khi fetch appointment
  - [ ] Loading state khi đang cancel/reschedule
  - [ ] Disable buttons khi đang xử lý

### 2. COMPONENTS CHUNG

#### 2.1. PatientSidebar (`src/components/sidebar/patient.tsx`)

**Kiểm tra:**

- [ ] Hiển thị đúng menu items:
  - [ ] Dashboard (⚠️ Chưa có href, chỉ là button không có action)
  - [ ] Appointment (⚠️ Chưa có href, chỉ là button không có action)
  - [ ] Medical History (⚠️ Chưa có href, chỉ là button không có action)
- [ ] Navigation links hoạt động đúng:
  - [ ] ⚠️ Cần thêm href hoặc onClick handlers
  - [ ] Dashboard -> `/patient/dashboard` (nếu có) hoặc `/`
  - [ ] Appointment -> `/patient/appointments`
  - [ ] Medical History -> `/patient/medical-history` (nếu có) hoặc `/patient/prescriptions`
- [ ] Active state khi ở page tương ứng:
  - [ ] ⚠️ Chưa có active state detection
  - [ ] Highlight menu item đang active
- [ ] Responsive trên mobile (collapse/expand):
  - [ ] ⚠️ SidebarLayout component cần check
- [ ] Style nhất quán với design system:
  - [ ] Icons size 24, strokeWidth 2.5
  - [ ] Hover effects
  - [ ] Spacing và typography

#### 2.2. Header Component (`src/components/header.tsx`)

**Kiểm tra:**

- [ ] Hiển thị đúng với role patient:
  - [ ] Logo và brand name hiển thị
  - [ ] Desktop navigation (Services, About Us, Providers, Contact)
  - [ ] User profile button khi đã login
- [ ] Link "My Appointments" hoạt động:
  - [ ] ✅ Có link `/patient/appointments` trong dropdown (line 105)
  - [ ] Mobile menu cũng có link `/appointments` (line 155)
- [ ] Dropdown user menu có:
  - [ ] Thông tin user (fullName hoặc email prefix)
  - [ ] Email hiển thị
  - [ ] Link "Home" -> `/`
  - [ ] Link "Appointments" -> `/patient/appointments`
  - [ ] Separator
  - [ ] Nút "Sign Out" với icon LogOut
- [ ] Notification bell (nếu có):
  - [ ] ⚠️ Chưa có notification bell trong Header
- [ ] Responsive navigation:
  - [ ] Mobile menu toggle button
  - [ ] Mobile menu slide animation
  - [ ] User info trong mobile menu

#### 2.3. BookingForm (`src/components/booking_form.tsx`)

**Kiểm tra:**

- [ ] Form validation đầy đủ:
  - [ ] Required fields: specialty (implicit), doctor, date, time, name, phone
  - [ ] Optional fields: email, symptoms
  - [ ] Disable submit nếu thiếu required fields
- [ ] Calendar picker hoạt động:
  - [ ] Date-fns format
  - [ ] Disable past dates
  - [ ] Popover trigger và content
- [ ] Doctor selection với search/filter:
  - [ ] Search input filter theo name hoặc specialtyLabel
  - [ ] Specialty buttons filter doctors
  - [ ] Empty state khi không có doctor
- [ ] Time slot selection dynamic:
  - [ ] Tính toán weekday/weekend slots
  - [ ] Disable nếu chưa chọn doctor hoặc date
  - [ ] Empty state khi không có slot
- [ ] Loading states:
  - [ ] ⚠️ Chưa có loading states (cần khi fetch API)
- [ ] Error handling:
  - [ ] ⚠️ Chưa có error handling cho API calls
- [ ] Success redirect:
  - [ ] ⚠️ Chưa có API integration, chỉ có mock success screen
  - [ ] Cần redirect đến `/patient/appointments` sau khi submit thành công

#### 2.4. AppointmentCard (`src/components/appointment/Appointment_card.tsx`)

**Kiểm tra:**

- [ ] Hiển thị đầy đủ thông tin:
  - [ ] Doctor avatar, name, specialty
  - [ ] Date, time, location, reason
  - [ ] Status badge
- [ ] Status badges với màu sắc đúng:
  - [ ] Sử dụng getStatusColor() utility
  - [ ] Icons từ getStatusIcon()
- [ ] Click events hoạt động:
  - [ ] onViewDetails khi click "View Details"
  - [ ] onCancel khi click "Cancel"
  - [ ] onFollowUp khi click "Book Follow-up"
- [ ] Responsive design:
  - [ ] Grid layout adapts trên mobile
  - [ ] Card spacing hợp lý
- [ ] Hover effects:
  - [ ] Shadow transition
  - [ ] Card hover state

#### 2.5. AppointmentDetailModal (`src/components/appointment/Appointment_detail_modal.tsx`)

**Kiểm tra:**

- [ ] Modal structure:
  - [ ] Dialog component từ shadcn/ui
  - [ ] DialogHeader với title và status badge
  - [ ] DialogDescription với appointment ID
- [ ] Hiển thị đầy đủ thông tin:
  - [ ] Doctor section (avatar, name, specialty)
  - [ ] Date, time, location
  - [ ] Reason for visit
  - [ ] Diagnosis (conditional)
  - [ ] Prescription (conditional)
  - [ ] Next steps (conditional)
  - [ ] Cancellation reason (conditional, với red background)
- [ ] Responsive:
  - [ ] Max width 2xl
  - [ ] Scrollable content nếu quá dài
- [ ] Close functionality:
  - [ ] onOpenChange callback
  - [ ] Close button (default trong DialogContent)

#### 2.6. AppointmentStats (`src/components/appointment/AppointmentStats.tsx`)

**Kiểm tra:**

- [ ] Stats cards hiển thị đúng:
  - [ ] Total Appointments (indigo)
  - [ ] Upcoming (blue)
  - [ ] Completed (emerald)
  - [ ] Cancelled (red)
- [ ] Icons và colors phù hợp:
  - [ ] Calendar icon cho Total
  - [ ] Clock icon cho Upcoming
  - [ ] CheckCircle icon cho Completed
  - [ ] XCircle icon cho Cancelled
- [ ] Responsive grid:
  - [ ] 2 columns trên mobile
  - [ ] 4 columns trên desktop
- [ ] Values tính toán đúng từ stats prop

### 3. BACKEND API INTEGRATION

#### 3.1. Authentication APIs

- [ ] POST `/auth/register` - Đăng ký
  - [ ] Request body: `{ email, password, fullName }`
  - [ ] Response: `{ success, message?, data? }`
  - [ ] Error codes: EMAIL_INVALID, PASSWORD_TOO_SHORT, PASSWORD_WEAK, FULLNAME_INVALID, Email already exists
- [ ] POST `/auth/login` - Đăng nhập
  - [ ] Request body: `{ email, password }`
  - [ ] Response: `{ success, data: { token, user } }`
- [ ] POST `/auth/logout` - Đăng xuất
  - [ ] Clear token và user data
- [ ] GET `/auth/me` - Lấy thông tin user hiện tại
  - [ ] Response: `{ success, data: { user } }`

#### 3.2. Appointment APIs

- [ ] GET `/appointments` - Lấy danh sách lịch hẹn
  - [ ] Query params: `?patientId=...&status=...&page=...&limit=...`
  - [ ] Response: `{ success, data: [...], pagination?: {...} }`
  - [ ] ⚠️ Cần check: Patient chỉ xem được appointments của chính họ
- [ ] GET `/appointments/:id` - Lấy chi tiết lịch hẹn
  - [ ] Response: `{ success, data: { appointment } }`
  - [ ] ⚠️ Permission check: Patient chỉ xem được appointment của chính họ
- [ ] POST `/appointments` - Tạo lịch hẹn mới
  - [ ] Request body: `{ doctorId, shiftId, date, symptomInitial?, patientName?, patientPhone?, patientEmail? }`
  - [ ] Response: `{ success, data: { appointment } }`
  - [ ] Error: Time slot conflict, Doctor not available
- [ ] PUT `/appointments/:id` - Cập nhật lịch hẹn (reschedule)
  - [ ] Request body: `{ doctorId?, shiftId?, date? }`
  - [ ] Response: `{ success, data: { appointment } }`
  - [ ] ⚠️ Permission check: Patient chỉ reschedule được appointment của chính họ
- [ ] POST `/appointments/:id/cancel` - Hủy lịch hẹn
  - [ ] Request body: `{ reason? }` (optional)
  - [ ] Response: `{ success, data: { appointment } }`
  - [ ] ⚠️ Permission check: Patient chỉ cancel được appointment của chính họ
  - [ ] Business rule: Chỉ cancel được nếu status === "WAITING"
- [ ] GET `/appointments/available-slots` - Lấy time slots khả dụng
  - [ ] Query params: `?doctorId=...&date=...&shiftId=...`
  - [ ] Response: `{ success, data: { slots: [...] } }`
  - [ ] ⚠️ Cần implement endpoint này

#### 3.3. Profile APIs

- [ ] GET `/profile` - Lấy thông tin profile
  - [ ] Response: `{ success, data: { user } }` hoặc `{ success, user: {...} }`
  - [ ] ⚠️ Cần check endpoint: có thể là `/users/profile` hoặc `/profile`
- [ ] PUT `/profile` - Cập nhật profile
  - [ ] Request body: `{ fullName, phone?, address? }`
  - [ ] Response: `{ success, data: { user } }`
- [ ] PUT `/profile/password` - Đổi mật khẩu
  - [ ] Request body: `{ currentPassword, newPassword }`
  - [ ] Response: `{ success, message }`
  - [ ] Error: Current password incorrect, New password same as current
- [ ] POST `/profile/avatar` - Upload avatar
  - [ ] Request: FormData với field "avatar"
  - [ ] Response: `{ success, data: { avatar: "url" } }`
  - [ ] Content-Type: multipart/form-data

#### 3.4. Patient-specific APIs (nếu có)

- [ ] GET `/prescriptions/patient/:patientId` - Lấy đơn thuốc của patient
  - [ ] ⚠️ Cần check: Patient chỉ xem được prescriptions của chính họ
  - [ ] Query params: `?page=...&limit=...`
  - [ ] Response: `{ success, data: [...], pagination? }`
- [ ] GET `/invoices/patient/:patientId` - Lấy hóa đơn của patient
  - [ ] ⚠️ Cần check: Patient chỉ xem được invoices của chính họ
  - [ ] Query params: `?page=...&limit=...&status=...`
  - [ ] Response: `{ success, data: [...], pagination? }`
- [ ] GET `/visits/patient/:patientId` - Lấy lịch sử khám bệnh
  - [ ] ⚠️ Cần check: Patient chỉ xem được visits của chính họ
  - [ ] Query params: `?page=...&limit=...`
  - [ ] Response: `{ success, data: [...], pagination? }`
- [ ] GET `/patients/:patientId/medical-history` - Lấy tiền sử bệnh
  - [ ] ⚠️ Cần check: Patient chỉ xem được medical history của chính họ
  - [ ] Response: `{ success, data: {...} }`

### 4. UI/UX CHẤT LƯỢNG

#### 4.1. Responsive Design

- [ ] Mobile (< 768px):
  - [ ] Layout hợp lý, dễ sử dụng
  - [ ] Form inputs không quá nhỏ (min touch target 44x44px)
  - [ ] Cards stack vertically
  - [ ] Modal fullscreen hoặc scrollable
  - [ ] Navigation menu collapse thành hamburger
- [ ] Tablet (768px - 1024px):
  - [ ] Layout tối ưu
  - [ ] Grid columns adapt (2-3 columns)
  - [ ] Modal max-width phù hợp
- [ ] Desktop (> 1024px):
  - [ ] Layout đầy đủ
  - [ ] Sidebar visible (nếu có)
  - [ ] Optimal use of screen space
- [ ] Touch-friendly buttons và inputs trên mobile:
  - [ ] Button height tối thiểu 44px
  - [ ] Input height tối thiểu 44px
  - [ ] Adequate spacing giữa các elements

#### 4.2. Loading States

- [ ] Skeleton loaders khi fetch data:
  - [ ] ⚠️ Chưa có skeleton loaders
  - [ ] Cần thêm cho appointment cards, profile data
- [ ] Loading spinners cho actions:
  - [ ] Submit buttons có Loader2 spinner
  - [ ] Disable buttons khi loading
- [ ] Disable buttons khi đang submit:
  - [ ] ✅ Đã có trong SignupPage, ProfilePage
  - [ ] ⚠️ Cần check BookingForm

#### 4.3. Error States

- [ ] Error messages rõ ràng, dễ hiểu:
  - [ ] Messages bằng tiếng Việt
  - [ ] Specific error messages (không phải generic "Error occurred")
  - [ ] Hiển thị trong alert boxes hoặc toast
- [ ] Error toasts với action buttons (retry):
  - [ ] ⚠️ Chưa có retry buttons, chỉ có toast.error()
- [ ] Empty states với CTAs phù hợp:
  - [ ] Empty state trong AppointmentCards có message
  - [ ] ⚠️ Cần thêm CTA "Book New Appointment" trong empty states
- [ ] 404 page nếu route không tồn tại:
  - [ ] ⚠️ Cần check có 404 page component không

#### 4.4. Success Feedback

- [ ] Success toasts cho mọi action thành công:
  - [ ] ✅ Đã có trong ProfilePage, AppointmentDetailPage
  - [ ] ⚠️ THIẾU trong SignupPage (chỉ có console.log)
  - [ ] ⚠️ THIẾU trong BookingForm (chưa có API call)
- [ ] Visual feedback khi submit form:
  - [ ] Button loading state
  - [ ] Form disable during submission
- [ ] Confirmation dialogs cho destructive actions:
  - [ ] Cancel appointment có confirmation dialog
  - [ ] Delete/remove actions có confirmation (nếu có)

#### 4.5. Accessibility

- [ ] Keyboard navigation:
  - [ ] Tab order hợp lý
  - [ ] Enter submit forms
  - [ ] Escape close modals
- [ ] ARIA labels cho screen readers:
  - [ ] Button labels
  - [ ] Form inputs có labels
  - [ ] Icons có aria-label hoặc aria-hidden
- [ ] Focus states rõ ràng:
  - [ ] Focus rings visible
  - [ ] Focus trap trong modals
- [ ] Color contrast đạt chuẩn WCAG:
  - [ ] Text contrast ratio >= 4.5:1 (normal text)
  - [ ] Text contrast ratio >= 3:1 (large text)
  - [ ] Interactive elements contrast đạt chuẩn

### 5. VALIDATION & SECURITY

#### 5.1. Form Validation

- [ ] Client-side validation cho tất cả forms:
  - [ ] ✅ SignupPage có validation
  - [ ] ✅ ProfilePage có validation với yup
  - [ ] ⚠️ BookingForm chỉ có required attributes, chưa có validation logic
  - [ ] ⚠️ AppointmentDetailPage reschedule form chưa có validation
- [ ] Real-time validation feedback:
  - [ ] ⚠️ Chưa có real-time validation (chỉ validate on submit)
  - [ ] Có thể thêm onBlur validation
- [ ] Server-side error handling:
  - [ ] ✅ Có error handling trong try-catch blocks
  - [ ] ✅ Hiển thị error messages từ API
- [ ] Validation messages bằng tiếng Việt:
  - [ ] ✅ Đã có messages tiếng Việt

#### 5.2. Authorization

- [ ] Protected routes với ProtectedRoute component:
  - [ ] ✅ Route `/patient/appointments` có ProtectedRoute với requiredRole="patient"
  - [ ] ✅ Route `/profile` có ProtectedRoute (requireAuth default true)
  - [ ] ✅ Route `/appointments/:id` có ProtectedRoute
- [ ] Patient chỉ truy cập được routes của họ:
  - [ ] ⚠️ Cần verify: Patient không thể truy cập `/admin/*`, `/doctor/*`, `/receptionist/*`
- [ ] API calls có authentication token:
  - [ ] ✅ api instance có interceptors để add token (cần verify)
  - [ ] Token được lấy từ localStorage hoặc auth context
- [ ] Handle 401/403 errors đúng cách:
  - [ ] ⚠️ Cần check: Redirect to login khi 401
  - [ ] ⚠️ Cần check: Show forbidden message khi 403

#### 5.3. Data Privacy

- [ ] Patient không xem được dữ liệu của patient khác:
  - [ ] ⚠️ Backend cần enforce: Filter appointments/prescriptions/invoices by patientId
  - [ ] ⚠️ Frontend không nên trust, nhưng cần verify backend checks
- [ ] Sensitive data được bảo vệ:
  - [ ] Password không hiển thị (type="password")
  - [ ] Token không log ra console
  - [ ] Personal info không expose trong URL params
- [ ] Logout clear all data:
  - [ ] ✅ logout() function clear token và user
  - [ ] Navigate to login sau khi logout

### 6. PERFORMANCE & OPTIMIZATION

#### 6.1. Code Splitting

- [ ] Lazy loading cho các page lớn:
  - [ ] ✅ PatientAppointmentsPage được lazy load trong App.tsx
  - [ ] ✅ ProfilePage được lazy load
  - [ ] ⚠️ SignupPage và BookAppointmentPage không lazy load (nhưng là public pages, OK)
- [ ] Component lazy loading nếu cần:
  - [ ] Các heavy components có thể lazy load

#### 6.2. Data Fetching

- [ ] Caching data nếu phù hợp:
  - [ ] ⚠️ Chưa có caching mechanism (React Query, SWR, etc.)
  - [ ] Profile data có thể cache
  - [ ] Appointments data có thể cache với TTL
- [ ] Debounce cho search inputs:
  - [ ] ⚠️ BookingForm search không có debounce
  - [ ] Có thể thêm debounce cho doctor search
- [ ] Optimistic updates cho actions:
  - [ ] ⚠️ Cancel appointment không có optimistic update
  - [ ] Có thể update UI trước khi API confirm
- [ ] Pagination cho danh sách dài:
  - [ ] ⚠️ Appointments list chưa có pagination
  - [ ] Cần implement pagination nếu có nhiều appointments

#### 6.3. Image Optimization

- [ ] Optimize images:
  - [ ] Avatar images có proper sizing
  - [ ] Doctor images có alt text
- [ ] Lazy loading images:
  - [ ] ⚠️ Chưa có lazy loading cho images
- [ ] Placeholder images:
  - [ ] ✅ Có fallback "/placeholder.svg"
  - [ ] ✅ Avatar có AvatarFallback với initials

### 7. TESTING CHECKLIST

#### 7.1. Functional Testing

- [ ] Test tất cả user flows end-to-end:
  - [ ] Flow 1: Đăng ký -> Đăng nhập -> Đặt lịch -> Xem lịch hẹn -> Hủy lịch
  - [ ] Flow 2: Đăng nhập -> Xem profile -> Cập nhật profile -> Đổi mật khẩu
  - [ ] Flow 3: Đặt lịch -> Xem chi tiết -> Reschedule -> Xem lại
  - [ ] Flow 4: Xem lịch đã qua -> Book follow-up -> Xem lịch mới
- [ ] Test với data hợp lệ:
  - [ ] Valid email, password, phone
  - [ ] Valid appointment dates (future)
  - [ ] Valid form submissions
- [ ] Test với data không hợp lệ:
  - [ ] Invalid email format
  - [ ] Weak password
  - [ ] Mismatch passwords
  - [ ] Past dates cho appointment
  - [ ] Empty required fields
- [ ] Test edge cases:
  - [ ] Empty states (no appointments, no doctors)
  - [ ] Error states (network error, API error)
  - [ ] Loading states (slow network)
  - [ ] Large data sets (many appointments)
  - [ ] Special characters trong inputs

#### 7.2. Browser Compatibility

- [ ] Chrome/Edge (latest):
  - [ ] Test tất cả features
  - [ ] Test responsive design
- [ ] Firefox (latest):
  - [ ] Test form submissions
  - [ ] Test date picker
- [ ] Safari (latest):
  - [ ] Test date picker (có thể khác format)
  - [ ] Test CSS features
- [ ] Mobile browsers:
  - [ ] iOS Safari
  - [ ] Chrome Mobile (Android)

#### 7.3. Device Testing

- [ ] iPhone (Safari):
  - [ ] Test touch interactions
  - [ ] Test viewport sizing
  - [ ] Test date picker
- [ ] Android (Chrome):
  - [ ] Test touch interactions
  - [ ] Test form inputs
  - [ ] Test modals
- [ ] Tablet (iPad, Android tablet):
  - [ ] Test layout adaptation
  - [ ] Test touch vs mouse interactions
- [ ] Desktop (Windows, macOS):
  - [ ] Test keyboard navigation
  - [ ] Test hover states
  - [ ] Test large screen layouts

### 8. DOCUMENTATION

- [ ] README có hướng dẫn cho patient features:
  - [ ] ⚠️ Cần thêm section về patient features trong README
  - [ ] Hướng dẫn đăng ký tài khoản
  - [ ] Hướng dẫn đặt lịch hẹn
  - [ ] Hướng dẫn xem và quản lý lịch hẹn
- [ ] Code comments cho các functions phức tạp:
  - [ ] ⚠️ Cần thêm comments cho business logic
  - [ ] JSDoc comments cho exported functions
- [ ] API documentation cho patient endpoints:
  - [ ] ⚠️ Cần document các endpoints patient có thể dùng
  - [ ] Request/response formats
  - [ ] Error codes và messages

## Checklist Execution

Khi kiểm tra, cần:

1. **Tạo user account với role patient**
   - Đăng ký account mới tại `/register`
   - Verify account được tạo với role PATIENT
   - Login với account này

2. **Test tất cả các flows từ đầu đến cuối**
   - Flow đăng ký và đăng nhập
   - Flow đặt lịch hẹn
   - Flow xem và quản lý lịch hẹn
   - Flow xem và cập nhật profile
   - Flow reschedule và cancel appointment

3. **Ghi lại tất cả bugs/issues**
   - Tạo file issues list
   - Screenshots/videos của bugs
   - Steps to reproduce
   - Expected vs Actual behavior

4. **Test trên nhiều devices và browsers**
   - Desktop: Chrome, Firefox, Safari, Edge
   - Mobile: iOS Safari, Chrome Mobile
   - Tablet: iPad Safari, Android Chrome

5. **Verify API integration hoạt động đúng**
   - Check Network tab trong DevTools
   - Verify request/response formats
   - Check error handling
   - Verify authentication tokens

6. **Check responsive design trên các screen sizes**
   - Mobile: 375px, 414px (iPhone sizes)
   - Tablet: 768px, 1024px (iPad sizes)
   - Desktop: 1280px, 1920px

7. **Test với data thực từ backend**
   - Không chỉ test với mock data
   - Test với real database data
   - Test với edge cases trong data

## Kết quả Mong đợi

Sau khi kiểm tra xong, cần có:

- **Báo cáo chi tiết** về tất cả các issues tìm thấy:
  - List tất cả checkboxes chưa pass
  - Mô tả chi tiết từng issue
  - Screenshots/videos minh họa
  - Browser/device information

- **Screenshots/videos của bugs** (nếu có):
  - Annotate screenshots với vòng tròn/arrows
  - Record videos cho complex bugs
  - Include console errors trong screenshots

- **Suggestions để improve UX**:
  - Recommendations cho better user experience
  - Suggestions cho UI improvements
  - Performance optimization suggestions

- **Priority của từng issue** (High/Medium/Low):
  - **High**: Bugs ảnh hưởng core functionality, security issues, data loss bugs
  - **Medium**: UI/UX issues, missing features, validation issues
  - **Low**: Minor UI tweaks, optimization suggestions, nice-to-have features

## Các Vấn Đề Quan Trọng Cần Chú Ý

### ⚠️ CRITICAL ISSUES (Cần fix ngay)

1. **BookingForm không có API integration**
   - Đang dùng mock data (specialties, doctors arrays)
   - Chưa fetch từ backend APIs
   - Chưa submit appointment thực sự
   - Cần implement API calls

2. **PatientAppointmentsPage dùng mock data**
   - Hook `usePatientAppointments.ts` chỉ có mock data
   - Chưa fetch từ API `/appointments`
   - Cần implement real API integration

3. **PatientSidebar không có navigation links**
   - Các menu items chỉ là buttons không có href hoặc onClick
   - Cần thêm navigation functionality

4. **SignupPage thiếu success toast**
   - Chỉ có console.log khi đăng ký thành công
   - Cần thêm toast.success() và redirect proper

### ⚠️ MEDIUM PRIORITY ISSUES

5. **Missing loading states**
   - BookingForm chưa có loading khi fetch data
   - Appointments list chưa có skeleton loaders

6. **Missing empty state CTAs**
   - Empty states chưa có "Book New Appointment" buttons
   - Empty states chưa có helpful messages

7. **Missing patient-specific pages**
   - Chưa có `/patient/dashboard` page
   - Chưa có `/patient/medical-history` page  
   - Chưa có `/patient/prescriptions` page (patient view)
   - Chưa có `/patient/invoices` page (patient view)

8. **Authorization checks cần verify**
   - Backend cần verify patient chỉ xem được data của chính họ
   - Frontend không trust, nhưng cần verify backend enforces

### ⚠️ LOW PRIORITY ISSUES

9. **Performance optimizations**
   - Chưa có caching mechanism
   - Chưa có debounce cho search
   - Chưa có optimistic updates

10. **Accessibility improvements**
    - Cần thêm ARIA labels
    - Cần improve keyboard navigation
    - Cần verify color contrast

11. **Documentation**
    - Cần thêm code comments
    - Cần update README với patient features
    - Cần API documentation

## Notes cho Developer

Khi implement các fixes:

1. **Ưu tiên Critical Issues trước**
   - Fix API integration cho BookingForm và PatientAppointmentsPage
   - Fix PatientSidebar navigation
   - Add success toast cho SignupPage

2. **Test thoroughly sau mỗi fix**
   - Test với real API
   - Test trên multiple browsers
   - Test với multiple user accounts (nếu có)

3. **Follow existing patterns**
   - Sử dụng toast từ "sonner" (đã có)
   - Sử dụng API service patterns (như PrescriptionService)
   - Sử dụng existing validation patterns

4. **Consider user experience**
   - Loading states để user biết app đang làm gì
   - Error messages rõ ràng, helpful
   - Success feedback để user biết action thành công