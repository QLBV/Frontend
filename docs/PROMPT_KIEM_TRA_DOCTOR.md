# 📋 PROMPT KIỂM TRA NGHIỆP VỤ VÀ CHỨC NĂNG DOCTOR

## 🎯 MỤC ĐÍCH
Prompt này dùng để kiểm tra toàn diện các chức năng nghiệp vụ và giao diện của doctor role trong hệ thống quản lý phòng khám.

---

## 📝 PROMPT CHÍNH

```
Hãy kiểm tra toàn diện nghiệp vụ và chức năng của DOCTOR role trong hệ thống quản lý phòng khám. 
Thực hiện các bước sau:

## 1. KIỂM TRA CÁC PAGES VÀ ROUTES

### 1.1. Liệt kê tất cả pages của doctor
- Kiểm tra file trong `src/pages/doctor/`
- Kiểm tra routes trong `src/App.tsx`
- Xác nhận mỗi route có ProtectedRoute với role="doctor"
- Xác nhận sidebar links khớp với routes

### 1.2. Kiểm tra navigation flows
- Dashboard → Medical List → Examination → Prescription
- Prescriptions List → Prescription Detail
- Sidebar navigation
- Back/Cancel buttons

## 2. KIỂM TRA NGHIỆP VỤ CHÍNH

### 2.1. QUẢN LÝ APPOINTMENTS
Kiểm tra các chức năng sau:

**a) Medical List Page (`/doctor/medicalList`)**
- [ ] Hiển thị danh sách appointments của doctor hôm nay
- [ ] Filter theo status: WAITING, IN_PROGRESS, COMPLETED, CANCELLED
- [ ] Search appointments (theo tên patient, ID)
- [ ] Hiển thị đầy đủ thông tin: patient name, time, status, shift
- [ ] Click "Khám bệnh" → Navigate đến formMedical
- [ ] API call: `GET /api/appointments?date=${today}` hoạt động đúng
- [ ] Loading state khi fetch data
- [ ] Error handling khi API fail

**b) Dashboard Page (`/doctor/dashboard`)**
- [ ] Hiển thị stats: số appointments hôm nay, số patients hôm nay
- [ ] Hiển thị danh sách appointments hôm nay (tối đa 10)
- [ ] Calendar widget hoạt động
- [ ] Upcoming Appointments Widget
- [ ] Click "Xem" → Navigate đến patient detail
- [ ] API call: `GET /api/appointments?date=${today}` hoạt động đúng

### 2.2. KHÁM BỆNH (EXAMINATION)

**Form Medical Page (`/doctor/patients/:id` hoặc `/doctor/patients/:id/examination`)**

- [ ] Hiển thị thông tin patient: tên, tuổi, giới tính, số điện thoại
- [ ] Hiển thị appointment info: date, time, shift
- [ ] Form nhập Vital Signs:
  - [ ] Blood Pressure (ví dụ: 120/80)
  - [ ] Heart Rate (bpm)
  - [ ] Temperature (°C)
  - [ ] Weight (kg)
- [ ] Form nhập Observations (textarea)
- [ ] Form nhập Diagnosis (textarea)
- [ ] Form nhập Private Remarks (textarea)
- [ ] Button "Lưu khám bệnh" → Complete visit
- [ ] Button "Kê đơn thuốc" → Navigate đến prescribeMed
- [ ] Button "Hủy" → Quay lại medicalList
- [ ] API call: `PUT /api/visits/:id/complete` với đầy đủ data
- [ ] Validation: kiểm tra required fields
- [ ] Success toast khi lưu thành công
- [ ] Error handling khi API fail
- [ ] Loading state khi saving

### 2.3. KÊ ĐƠN THUỐC (PRESCRIPTION)

**Prescribe Med Page (`/doctor/patients/:id/prescription`)**

- [ ] Hiển thị thông tin patient và diagnosis từ visit
- [ ] Search medicines (theo tên)
- [ ] Hiển thị danh sách medicines với: name, category, unit, currentStock, unitPrice
- [ ] Select medicine → Thêm vào prescription list
- [ ] Form nhập cho mỗi medicine:
  - [ ] Quantity (số lượng)
  - [ ] Dosage Morning (sáng)
  - [ ] Dosage Noon (trưa)
  - [ ] Dosage Afternoon (chiều)
  - [ ] Dosage Evening (tối)
  - [ ] Instruction (hướng dẫn sử dụng)
- [ ] Xóa medicine khỏi prescription list
- [ ] Tính tổng tiền tự động (quantity × unitPrice)
- [ ] Button "Lưu đơn thuốc" → Tạo prescription
- [ ] Button "Hoàn tác khám" → Quay lại examination form
- [ ] Button "Hủy" → Quay lại medicalList
- [ ] API call: `POST /api/prescriptions` với đầy đủ data
- [ ] Validation: kiểm tra ít nhất 1 medicine, quantity > 0
- [ ] Success toast khi tạo thành công
- [ ] Error handling khi API fail
- [ ] Loading state khi saving

### 2.4. QUẢN LÝ PRESCRIPTIONS

**a) Prescriptions List (`/doctor/prescriptions`)**

- [ ] Hiển thị danh sách prescriptions của doctor
- [ ] Search prescriptions (theo patient name, prescription ID)
- [ ] Hiển thị thông tin: patient name, date, status, total amount
- [ ] Filter theo status (nếu có)
- [ ] Pagination (nếu có nhiều prescriptions)
- [ ] Click row → Xem chi tiết (modal hoặc navigate)
- [ ] Button "Sửa" → Navigate đến prescription detail page
- [ ] Button "Xóa" → Cancel prescription (gọi API)
- [ ] Button "Kê đơn mới" → Navigate đến medicalList
- [ ] API call: `GET /api/prescriptions` hoạt động đúng
- [ ] Loading state khi fetch data
- [ ] Error handling khi API fail

**b) Prescription Detail (`/doctor/prescriptions/:id/edit`)**

- [ ] Hiển thị chi tiết prescription: ID, date, status, total amount
- [ ] Hiển thị thông tin patient: tên, tuổi, giới tính, địa chỉ
- [ ] Hiển thị danh sách medicines với đầy đủ thông tin:
  - [ ] Medicine name, quantity, unit
  - [ ] Dosage (morning, noon, afternoon, evening)
  - [ ] Instruction
  - [ ] Unit price, subtotal
- [ ] Hiển thị tổng tiền
- [ ] Button "Sửa đơn" (chỉ hiện nếu status = DRAFT)
- [ ] Button "Hủy đơn" → Cancel prescription
- [ ] Button "Xuất PDF" → Export PDF
- [ ] Button "In đơn" → Print prescription
- [ ] Button "Quay lại" → Quay lại prescriptions list
- [ ] API calls:
  - [ ] `GET /api/prescriptions/:id` - Lấy detail
  - [ ] `PUT /api/prescriptions/:id` - Update (nếu DRAFT)
  - [ ] `POST /api/prescriptions/:id/cancel` - Cancel
  - [ ] `GET /api/prescriptions/:id/pdf` - Export PDF
- [ ] Validation khi edit
- [ ] Success/Error toasts
- [ ] Loading states

### 2.5. QUẢN LÝ LỊCH TRỰC

**Doctor Shift Page (`/doctor/shift`)**

- [ ] Hiển thị lịch trực theo tuần (week view)
- [ ] Hiển thị các ngày trong tuần (Mon-Sun)
- [ ] Hiển thị shifts trong mỗi ngày: MORNING, AFTERNOON, EVENING
- [ ] Hiển thị appointments trong mỗi shift
- [ ] Navigation tuần: Previous week, Next week
- [ ] Button "Today" → Jump đến tuần hiện tại
- [ ] Sidebar summary:
  - [ ] Today's schedule (số appointments hôm nay)
  - [ ] Week stats (tổng appointments trong tuần)
- [ ] Click shift/appointment → Xem chi tiết (nếu có)
- [ ] API calls:
  - [ ] `GET /api/doctors/:doctorId/shifts` - Lấy shifts
  - [ ] `GET /api/appointments?doctorId=${doctorId}` - Lấy appointments
- [ ] Loading state khi fetch data
- [ ] Error handling khi API fail
- [ ] Không hiển thị admin-only functions (cancel shift)

### 2.6. DASHBOARD

**Dashboard Page (`/doctor/dashboard`)**

- [ ] Hiển thị stats cards:
  - [ ] Số appointments hôm nay
  - [ ] Số patients hôm nay
  - [ ] % thay đổi so với hôm trước (nếu có)
- [ ] Hiển thị danh sách appointments hôm nay (tối đa 10)
- [ ] Calendar widget: chọn ngày → filter appointments
- [ ] Upcoming Appointments Widget
- [ ] Click appointment → Navigate đến patient detail
- [ ] API call: `GET /api/appointments?date=${today}` hoạt động đúng
- [ ] Loading state khi fetch data
- [ ] Error handling khi API fail

## 3. KIỂM TRA API INTEGRATION

### 3.1. Appointments APIs
- [ ] `GET /api/appointments?date=${date}` - Lấy appointments theo ngày
- [ ] `GET /api/appointments?doctorId=${doctorId}` - Lấy appointments của doctor
- [ ] Response format khớp với frontend expectations
- [ ] Error handling khi API fail
- [ ] Loading states

### 3.2. Visits APIs
- [ ] `PUT /api/visits/:id/complete` - Complete visit
  - [ ] Gửi đầy đủ data: vitalSigns, observations, diagnosis, privateRemarks
  - [ ] Response format đúng
  - [ ] Error handling
- [ ] `GET /api/visits/:id` - Lấy visit detail

### 3.3. Prescriptions APIs
- [ ] `GET /api/prescriptions` - Lấy danh sách prescriptions
  - [ ] Filter theo doctorId (tự động)
  - [ ] Pagination hoạt động
  - [ ] Response format đúng
- [ ] `POST /api/prescriptions` - Tạo prescription
  - [ ] Gửi đầy đủ data: visitId, medicines, totalAmount
  - [ ] Response format đúng
- [ ] `GET /api/prescriptions/:id` - Lấy prescription detail
- [ ] `PUT /api/prescriptions/:id` - Update prescription (chỉ DRAFT)
- [ ] `POST /api/prescriptions/:id/cancel` - Cancel prescription
- [ ] `GET /api/prescriptions/:id/pdf` - Export PDF

### 3.4. Medicines APIs
- [ ] `GET /api/medicines` - Lấy danh sách medicines
  - [ ] Response format đúng
  - [ ] Search hoạt động (nếu có)

### 3.5. Doctor Shifts APIs
- [ ] `GET /api/doctors/:doctorId/shifts` - Lấy doctor shifts
  - [ ] Response format đúng
  - [ ] Filter theo date range (tuần)

## 4. KIỂM TRA VALIDATION VÀ ERROR HANDLING

### 4.1. Form Validation
- [ ] Examination form: required fields được validate
- [ ] Prescription form: ít nhất 1 medicine, quantity > 0
- [ ] Vital signs: format đúng (ví dụ: blood pressure "120/80")
- [ ] Dosage: số dương

### 4.2. Error Handling
- [ ] API errors hiển thị toast message
- [ ] Network errors được handle
- [ ] 401/403 errors → Redirect đến login
- [ ] 404 errors → Hiển thị message phù hợp
- [ ] 500 errors → Hiển thị generic error message

### 4.3. Loading States
- [ ] Loading spinner khi fetch data
- [ ] Disable buttons khi đang save
- [ ] Loading state khi export PDF

## 5. KIỂM TRA UI/UX

### 5.1. Responsive Design
- [ ] Pages hiển thị đúng trên desktop
- [ ] Pages hiển thị đúng trên tablet
- [ ] Pages hiển thị đúng trên mobile (nếu có)

### 5.2. User Experience
- [ ] Navigation flows mượt mà
- [ ] Buttons có loading states
- [ ] Success/Error toasts rõ ràng
- [ ] Forms có validation feedback
- [ ] Empty states được handle (no appointments, no prescriptions)
- [ ] Sidebar active state đúng

### 5.3. Accessibility
- [ ] Buttons có labels rõ ràng
- [ ] Forms có labels
- [ ] Error messages rõ ràng
- [ ] Color contrast đủ (nếu có)

## 6. KIỂM TRA EDGE CASES

### 6.1. Data Edge Cases
- [ ] Không có appointments hôm nay → Hiển thị empty state
- [ ] Không có prescriptions → Hiển thị empty state
- [ ] Prescription đã CANCELLED → Không cho edit
- [ ] Prescription đã LOCKED → Không cho edit
- [ ] Medicine hết stock → Hiển thị warning (nếu có)

### 6.2. Navigation Edge Cases
- [ ] Navigate với invalid appointment ID → Error handling
- [ ] Navigate với invalid prescription ID → Error handling
- [ ] Back button hoạt động đúng
- [ ] Browser refresh → Giữ state (nếu có)

### 6.3. Permission Edge Cases
- [ ] Doctor không thể cancel shift (chỉ admin)
- [ ] Doctor chỉ thấy prescriptions của mình
- [ ] Doctor chỉ thấy appointments của mình

## 7. TẠO BÁO CÁO TỔNG HỢP

Sau khi kiểm tra, tạo báo cáo với:
- [ ] Danh sách các chức năng đã kiểm tra
- [ ] Danh sách các issues phát hiện (nếu có)
- [ ] Đánh giá tổng thể: HOÀN CHỈNH / CẦN CẢI THIỆN
- [ ] Đề xuất cải thiện (nếu có)

## 8. KIỂM TRA BACKEND API ENDPOINTS

Kiểm tra các endpoints sau có tồn tại và hoạt động đúng:

### 8.1. Appointments
- [ ] `GET /api/appointments` - Có role DOCTOR
- [ ] `GET /api/appointments/my` - Có role DOCTOR
- [ ] `GET /api/appointments/upcoming` - Có role DOCTOR

### 8.2. Visits
- [ ] `PUT /api/visits/:id/complete` - Có role DOCTOR
- [ ] `GET /api/visits/:id` - Có role DOCTOR

### 8.3. Prescriptions
- [ ] `GET /api/prescriptions` - Có role DOCTOR, filter theo doctorId
- [ ] `POST /api/prescriptions` - Có role DOCTOR
- [ ] `GET /api/prescriptions/:id` - Có role DOCTOR
- [ ] `PUT /api/prescriptions/:id` - Có role DOCTOR, chỉ cho DRAFT
- [ ] `POST /api/prescriptions/:id/cancel` - Có role DOCTOR
- [ ] `GET /api/prescriptions/:id/pdf` - Có role DOCTOR

### 8.4. Medicines
- [ ] `GET /api/medicines` - Có role DOCTOR

### 8.5. Doctor Shifts
- [ ] `GET /api/doctors/:doctorId/shifts` - Có authentication

## 9. KIỂM TRA SECURITY

- [ ] Doctor chỉ thấy appointments của mình
- [ ] Doctor chỉ thấy prescriptions của mình
- [ ] Doctor không thể access admin-only endpoints
- [ ] Authentication required cho tất cả doctor pages
- [ ] Role-based access control hoạt động đúng

---

## 📊 OUTPUT MONG ĐỢI

Sau khi kiểm tra, cung cấp:

1. **Báo cáo chi tiết** với checklist đã hoàn thành
2. **Danh sách issues** (nếu có) với:
   - Mô tả issue
   - File/Route liên quan
   - Mức độ nghiêm trọng (Critical/High/Medium/Low)
   - Đề xuất fix
3. **Đánh giá tổng thể**: HOÀN CHỈNH / CẦN CẢI THIỆN / THIẾU NHIỀU CHỨC NĂNG
4. **Đề xuất cải thiện** (nếu có)

---

## 🔍 CÁCH SỬ DỤNG PROMPT NÀY

### Option 1: Kiểm tra toàn diện
Copy toàn bộ prompt trên và yêu cầu AI kiểm tra.

### Option 2: Kiểm tra từng phần
Copy từng section (1-9) và yêu cầu kiểm tra riêng lẻ.

### Option 3: Kiểm tra nhanh
Chỉ copy phần 1, 2, và 7 để có overview nhanh.

---

## 📝 LƯU Ý

- Prompt này giả định bạn đã có codebase với doctor pages
- Điều chỉnh file paths nếu cấu trúc project khác
- Thêm/bớt checklist items tùy theo requirements cụ thể
- Có thể dùng prompt này cho manual testing hoặc automated testing

---

**Version:** 1.0.0  
**Cập nhật:** 2025-01-03
