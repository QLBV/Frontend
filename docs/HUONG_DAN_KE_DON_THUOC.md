# 📋 HƯỚNG DẪN KÊ ĐƠN THUỐC CHO BÁC SĨ

## 🎯 QUY TRÌNH KÊ ĐƠN THUỐC

### Bước 1: Truy cập trang kê đơn thuốc

**Cách 1:** Từ trang khám bệnh (Form Medical)
- Sau khi hoàn thành khám bệnh, click nút **"Kê đơn thuốc"**
- Hệ thống sẽ chuyển đến trang `/doctor/patients/:id/prescription`

**Cách 2:** Từ danh sách bệnh nhân
- Vào **Patient List** → Chọn bệnh nhân → **Khám bệnh** → **Kê đơn thuốc**

---

## 📝 BƯỚC 2: NHẬP THÔNG TIN ĐƠN THUỐC

### 2.1. Thông tin hiển thị

Trang kê đơn thuốc sẽ hiển thị:
- ✅ **Thông tin bệnh nhân:** Tên, tuổi, giới tính, số điện thoại
- ✅ **Chẩn đoán:** Từ lần khám vừa thực hiện
- ✅ **Vital Signs:** Huyết áp, nhịp tim, nhiệt độ, cân nặng

### 2.2. Thêm thuốc vào đơn

**Cách thêm thuốc:**

1. **Click nút "Thêm thuốc"** (màu xanh lá, góc trên bên phải)
   - Mỗi lần click sẽ thêm 1 dòng thuốc mới vào bảng

2. **Tìm kiếm và chọn thuốc:**
   - Gõ tên thuốc vào ô **"Tìm kiếm thuốc..."**
   - Hệ thống sẽ hiển thị dropdown gợi ý các thuốc phù hợp
   - Mỗi gợi ý hiển thị:
     - Tên thuốc
     - Danh mục (category)
     - Đơn vị (unit)
     - Số lượng tồn kho (Stock)
   - **Click vào thuốc** để chọn

---

## 💊 BƯỚC 3: NHẬP LIỀU LƯỢNG VÀ HƯỚNG DẪN

Sau khi chọn thuốc, bác sĩ cần nhập:

### 3.1. Liều lượng theo thời gian

Bảng có các cột:
- **Tổng SL (Số lượng):** Tự động tính từ tổng các liều (không cần nhập)
- **Sáng:** Số lượng uống buổi sáng
- **Trưa:** Số lượng uống buổi trưa  
- **Tối:** Số lượng uống buổi tối

**Lưu ý:**
- Nhập số >= 0 cho mỗi buổi
- Tổng số lượng = Sáng + Trưa + Tối (tự động tính)
- Có thể để 0 nếu không uống buổi đó

**Ví dụ:**
- Thuốc A: Sáng = 1, Trưa = 1, Tối = 1 → Tổng SL = 3
- Thuốc B: Sáng = 2, Trưa = 0, Tối = 2 → Tổng SL = 4

### 3.2. Ghi chú (Instruction)

- Nhập hướng dẫn sử dụng cho từng thuốc
- Ví dụ: "Uống sau ăn", "Uống trước khi ngủ", "Không uống với rượu"

### 3.3. Ghi chú thêm (Additional Notes)

- Ô textarea ở cuối form
- Nhập ghi chú chung cho toàn bộ đơn thuốc
- Ví dụ: "Uống đủ liệu trình 7 ngày", "Tái khám sau 1 tuần"

---

## ✅ BƯỚC 4: KIỂM TRA VÀ LƯU ĐƠN

### 4.1. Validation tự động

Hệ thống sẽ kiểm tra:
- ✅ Ít nhất 1 thuốc được chọn
- ✅ Tất cả thuốc đã chọn phải có số lượng > 0
- ✅ Liều lượng phải là số >= 0

**Nếu thiếu:**
- Hiển thị toast error: "Vui lòng thêm ít nhất một loại thuốc vào đơn"
- Hoặc: "Vui lòng nhập số lượng thuốc lớn hơn 0"

### 4.2. Xóa thuốc (nếu cần)

- Click nút **🗑️ (Trash)** ở cột "Thao tác"
- Không thể xóa nếu chỉ còn 1 thuốc trong đơn

### 4.3. Lưu đơn thuốc

**Có 2 cách:**

**Cách 1: Lưu và hoàn tất**
- Click nút **"Lưu đơn thuốc"** (màu xanh)
- Hệ thống sẽ:
  1. Gửi API `POST /api/prescriptions` với dữ liệu:
     ```json
     {
       "visitId": <appointmentId>,
       "patientId": <patientId>,
       "medicines": [
         {
           "medicineId": 1,
           "quantity": 3,
           "dosageMorning": 1,
           "dosageNoon": 1,
           "dosageAfternoon": 0,
           "dosageEvening": 1,
           "instruction": "Uống sau ăn"
         }
       ],
       "note": "Ghi chú thêm"
     }
     ```
  2. Hiển thị toast success: "Lưu đơn thuốc thành công!"
  3. Chuyển về trang **Medical List**

**Cách 2: Hoàn tác khám (quay lại form khám)**
- Click nút **"Hoàn tác khám"** (màu xám)
- Hệ thống sẽ:
  1. Tự động lưu đơn thuốc (nếu có thuốc)
  2. Chuyển về trang **Form Medical** để chỉnh sửa thông tin khám

---

## 📊 CẤU TRÚC DỮ LIỆU ĐƠN THUỐC

### Dữ liệu gửi lên server:

```typescript
{
  visitId: number,           // ID của visit (từ appointment)
  patientId: number,         // ID của bệnh nhân
  medicines: [
    {
      medicineId: number,    // ID của thuốc
      quantity: number,      // Tổng số lượng (tự động tính)
      dosageMorning: number, // Liều sáng
      dosageNoon: number,    // Liều trưa
      dosageAfternoon: number, // Liều chiều
      dosageEvening: number,  // Liều tối
      instruction: string     // Hướng dẫn sử dụng
    }
  ],
  note: string              // Ghi chú thêm
}
```

### Tính toán số lượng:

```
Tổng số lượng (quantity) = dosageMorning + dosageNoon + dosageAfternoon + dosageEvening
```

**Lưu ý:** Hiện tại trong UI chỉ có 3 cột (Sáng, Trưa, Tối), nhưng backend hỗ trợ 4 buổi (Morning, Noon, Afternoon, Evening).

---

## 🎨 GIAO DIỆN

### Bảng kê đơn thuốc:

| STT | Tên thuốc | Tổng SL | Sáng | Trưa | Tối | Ghi chú | Thao tác |
|-----|-----------|---------|------|------|-----|---------|----------|
| 1   | [Tìm kiếm] | 3 (auto) | 1    | 1    | 1   | [Input]  | 🗑️       |
| 2   | [Tìm kiếm] | 4 (auto) | 2    | 0    | 2   | [Input]  | 🗑️       |

### Các nút:

- **➕ Thêm thuốc** (màu xanh lá) - Thêm dòng thuốc mới
- **💾 Lưu đơn thuốc** (màu xanh) - Lưu và hoàn tất
- **↩️ Hoàn tác khám** (màu xám) - Quay lại form khám
- **❌ Hủy** (màu đỏ) - Hủy và quay về Medical List

---

## ⚠️ LƯU Ý QUAN TRỌNG

1. **Phải có ít nhất 1 thuốc** trong đơn mới lưu được
2. **Số lượng phải > 0** cho tất cả thuốc đã chọn
3. **Tổng số lượng tự động tính** từ các liều, không cần nhập thủ công
4. **Có thể xóa thuốc** bằng nút 🗑️ (trừ khi chỉ còn 1 thuốc)
5. **Sau khi lưu thành công**, hệ thống tự động chuyển về Medical List
6. **Nếu lỗi**, sẽ hiển thị toast error với thông báo cụ thể

---

## 🔄 QUY TRÌNH HOÀN CHỈNH

```
1. Khám bệnh (Form Medical)
   ↓
2. Click "Kê đơn thuốc"
   ↓
3. Trang kê đơn thuốc (Prescribe Med)
   ↓
4. Thêm thuốc → Tìm kiếm → Chọn thuốc
   ↓
5. Nhập liều lượng (Sáng, Trưa, Tối)
   ↓
6. Nhập ghi chú (nếu cần)
   ↓
7. Click "Lưu đơn thuốc"
   ↓
8. ✅ Thành công → Về Medical List
   ❌ Lỗi → Hiển thị thông báo
```

---

## 📱 VÍ DỤ THỰC TẾ

### Ví dụ: Kê đơn cho bệnh nhân cảm cúm

1. **Thêm thuốc 1: Paracetamol 500mg**
   - Tìm kiếm: "Paracetamol"
   - Chọn: "Paracetamol 500mg - Viên nén - Stock: 100"
   - Sáng: 1 viên
   - Trưa: 1 viên
   - Tối: 1 viên
   - Ghi chú: "Uống sau ăn, không quá 4 viên/ngày"

2. **Thêm thuốc 2: Vitamin C**
   - Tìm kiếm: "Vitamin C"
   - Chọn: "Vitamin C 1000mg - Viên nén - Stock: 50"
   - Sáng: 1 viên
   - Trưa: 0 viên
   - Tối: 1 viên
   - Ghi chú: "Uống sau ăn sáng và tối"

3. **Ghi chú thêm:** "Uống đủ liệu trình 5 ngày. Tái khám nếu không đỡ."

4. **Click "Lưu đơn thuốc"**
   - ✅ Toast: "Lưu đơn thuốc thành công!"
   - Chuyển về Medical List

---

**Cập nhật:** 2025-01-03  
**Version:** 1.0.0
