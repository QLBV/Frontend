# 📋 KIỂM TRA CÁC PAGE CỦA DOCTOR

## 🎯 Mục tiêu
Kiểm tra tính đầy đủ và nhất quán của các trang dành cho doctor:
- Routes trong App.tsx
- Sidebar links
- Backend API endpoints
- Mapping giữa frontend và backend

---

## 📊 DOCTOR ROUTES TRONG App.tsx

### Routes hiện có:
1. `/doctor/dashboard` → `DoctorDashboardPage`
2. `/doctor/medicalList` → `MedicalListPage`
3. `/doctor/shift` → `DoctorShiftPage`
4. `/doctor/patients/:id` → `FormMedicalPage`
5. `/doctor/patients/:id/examination` → `FormMedicalPage`
6. `/doctor/patients/:id/prescription` → `PrescribeMedPage`
7. `/doctor/prescriptions` → `UiQuanLyDT`
8. `/doctor/prescriptions/:id/edit` → `PrescriptionDetailPage`

---

## 🔗 SIDEBAR LINKS (doctor.tsx)

### Links hiện có:
1. **Dashboard**
   - `/doctor/dashboard` ✅

2. **Examination**
   - `/doctor/medicalList` ✅
   - `/doctor/diagnose` ⚠️ **KHÔNG TỒN TẠI TRONG ROUTES**

3. **Prescription**
   - `/doctor/prescriptions` ✅

4. **Payment**
   - `/doctor/invoices` ⚠️ **KHÔNG TỒN TẠI TRONG ROUTES**

---

## 📁 FILES TRONG `/pages/doctor/`

1. ✅ `DashboardPage.tsx` - Trang dashboard
2. ✅ `medicalList.tsx` - Danh sách bệnh nhân
3. ✅ `doctorShift.tsx` - Lịch trực
4. ✅ `formMedical.tsx` - Form khám bệnh
5. ✅ `prescribeMed.tsx` - Kê đơn thuốc
6. ✅ `prescriptionDetail.tsx` - Chi tiết đơn thuốc
7. ✅ `QuanlyDonThuoc.tsx` - Quản lý đơn thuốc
8. ✅ `VisitDetailPage.tsx` - Chi tiết phiên khám

---

## 🔍 KIỂM TRA CHI TIẾT

### 1. Dashboard Page (`/doctor/dashboard`)
- **File:** `pages/doctor/DashboardPage.tsx`
- **Sidebar link:** ✅ Có
- **Backend API:** ⚠️ `/api/dashboard/doctor` - Cần kiểm tra xem có tồn tại không
- **Status:** ⚠️ Có thể thiếu API endpoint

### 2. Medical List Page (`/doctor/medicalList`)
- **File:** `pages/doctor/medicalList.tsx`
- **Sidebar link:** ✅ Có
- **Backend API:** `/api/appointments` (với filter doctor)
- **Status:** ✅ OK

### 3. Doctor Shift Page (`/doctor/shift`)
- **File:** `pages/doctor/doctorShift.tsx`
- **Sidebar link:** ❌ Không có trong sidebar
- **Backend API:** `/api/doctor-shifts/doctor/:doctorId`
- **Status:** ⚠️ Thiếu sidebar link

### 4. Form Medical Page (`/doctor/patients/:id`)
- **File:** `pages/doctor/formMedical.tsx`
- **Sidebar link:** ❌ Không có (truy cập từ medicalList)
- **Backend API:** `/api/visits/checkin/:appointmentId`, `/api/visits/:id/complete`
- **Status:** ✅ OK (dynamic route)

### 5. Prescribe Med Page (`/doctor/patients/:id/prescription`)
- **File:** `pages/doctor/prescribeMed.tsx`
- **Sidebar link:** ❌ Không có (truy cập từ formMedical)
- **Backend API:** `POST /api/prescriptions`
- **Status:** ✅ OK (dynamic route)

### 6. Prescriptions List (`/doctor/prescriptions`)
- **File:** `pages/doctor/QuanlyDonThuoc.tsx`
- **Sidebar link:** ✅ Có
- **Backend API:** `/api/prescriptions`
- **Status:** ✅ OK

### 7. Prescription Detail (`/doctor/prescriptions/:id/edit`)
- **File:** `pages/doctor/prescriptionDetail.tsx`
- **Sidebar link:** ❌ Không có (truy cập từ prescriptions list)
- **Backend API:** `/api/prescriptions/:id`
- **Status:** ✅ OK (dynamic route)

### 8. Visit Detail (`/visits/:id`)
- **File:** `pages/doctor/VisitDetailPage.tsx`
- **Sidebar link:** ❌ Không có (shared route)
- **Backend API:** `/api/visits/:id`
- **Status:** ✅ OK (shared route)

---

## ⚠️ VẤN ĐỀ PHÁT HIỆN

### 1. Sidebar Links Không Khớp Routes

**Vấn đề:** Sidebar có links nhưng routes không tồn tại:
- `/doctor/diagnose` - Không có route tương ứng
- `/doctor/invoices` - Không có route tương ứng

**Giải pháp:**
- Xóa các links không tồn tại khỏi sidebar HOẶC
- Tạo các routes tương ứng

### 2. Routes Không Có Sidebar Links

**Vấn đề:** Có routes nhưng không có trong sidebar:
- `/doctor/shift` - Có route nhưng không có sidebar link

**Giải pháp:**
- Thêm link vào sidebar HOẶC
- Xóa route nếu không cần thiết

### 3. API Endpoint Có Thể Thiếu

**Vấn đề:** Dashboard page gọi `/api/dashboard/doctor` nhưng có thể không tồn tại

**Giải pháp:**
- Kiểm tra backend có endpoint này không
- Nếu không có, tạo endpoint hoặc sửa frontend để dùng endpoint khác

---

## ✅ CHECKLIST KIỂM TRA

### Frontend Routes
- [ ] Tất cả routes trong App.tsx đều có file page tương ứng
- [ ] Tất cả routes đều có ProtectedRoute với role="doctor"
- [ ] Không có route trùng lặp hoặc conflict

### Sidebar Links
- [ ] Tất cả sidebar links đều có route tương ứng
- [ ] Tất cả routes quan trọng đều có sidebar link
- [ ] Active state hoạt động đúng

### Backend API
- [ ] Tất cả API calls trong pages đều có endpoint tương ứng
- [ ] API endpoints có đúng role permissions (DOCTOR)
- [ ] Response format khớp với frontend expectations

### Page Functionality
- [ ] Dashboard hiển thị đúng dữ liệu
- [ ] Medical List load được danh sách appointments
- [ ] Form Medical có thể tạo visit
- [ ] Prescribe Med có thể tạo prescription
- [ ] Prescriptions List hiển thị đúng danh sách
- [ ] Prescription Detail có thể edit/cancel

---

## 📝 HÀNH ĐỘNG CẦN THỰC HIỆN

### Priority 1 (Quan trọng)
1. ⚠️ **Sửa sidebar links** - Xóa `/doctor/diagnose` và `/doctor/invoices` hoặc tạo routes tương ứng
2. ⚠️ **Thêm sidebar link** - Thêm `/doctor/shift` vào sidebar nếu cần
3. ⚠️ **Kiểm tra API** - Xác nhận `/api/dashboard/doctor` có tồn tại không

### Priority 2 (Nên làm)
4. ✅ **Kiểm tra navigation** - Đảm bảo các nút "Quay lại" điều hướng đúng
5. ✅ **Kiểm tra error handling** - Xử lý lỗi API đúng cách
6. ✅ **Kiểm tra loading states** - Hiển thị loading khi fetch data

### Priority 3 (Tùy chọn)
7. ⚠️ **Thêm route `/doctor/invoices`** - Nếu doctor cần xem invoices
8. ⚠️ **Thêm route `/doctor/diagnose`** - Nếu cần trang riêng cho diagnose

---

## 🔧 PROMPT ĐỂ KIỂM TRA

```
Kiểm tra các page của doctor:
1. So sánh routes trong App.tsx với sidebar links trong doctor.tsx
2. Kiểm tra tất cả API calls trong các doctor pages có endpoint tương ứng trong backend
3. Xác nhận tất cả routes đều có file page tương ứng
4. Kiểm tra navigation flows (từ medicalList → formMedical → prescribeMed)
5. Tìm các vấn đề:
   - Sidebar links không có route tương ứng
   - Routes không có sidebar links
   - API endpoints thiếu hoặc không khớp
   - Navigation flows bị lỗi
6. Tạo báo cáo chi tiết với:
   - Danh sách routes và status
   - Danh sách sidebar links và status
   - Mapping API endpoints
   - Các vấn đề phát hiện và giải pháp
```

---

## 📊 TỔNG KẾT

### Routes: 8 routes
- ✅ 6 routes có sidebar links
- ⚠️ 2 routes không có sidebar links (shift, dynamic routes)

### Sidebar Links: 4 links
- ✅ 2 links có routes tương ứng
- ⚠️ 2 links không có routes (diagnose, invoices)

### Files: 8 files
- ✅ Tất cả đều tồn tại và có routes tương ứng

### API Endpoints: Cần kiểm tra
- ⚠️ `/api/dashboard/doctor` - Cần xác nhận tồn tại
- ✅ Các endpoints khác đều có trong backend

---

**Trạng thái tổng thể:** ⚠️ **CẦN SỬA** - Có 2 sidebar links không khớp routes và 1 route thiếu sidebar link.
