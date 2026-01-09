# Hướng Dẫn Implementation Booking Flow Mới

## ✅ Backend - ĐÃ HOÀN THÀNH

### 1. ShiftTemplate System
- **Model**: `ShiftTemplate.ts` - Lịch mẫu hàng tuần
- **Migration**: `20260110000001-create-shift-templates.js`
- **Service**: `shiftTemplate.service.ts`
- **Controller**: `shiftTemplate.controller.ts`
- **Routes**: `/api/shift-templates`

### 2. Auto Schedule Generation
- **Service**: `scheduleGeneration.service.ts`
- **Controller**: `scheduleGeneration.controller.ts`
- **Routes**: `/api/schedule-generation`
- **Cron Job**: Chạy tự động 00:00 ngày 25 hàng tháng
- **File**: `jobs/scheduleGenerationCron.ts`

### 3. New API Endpoint
- **Endpoint**: `GET /api/doctor-shifts/doctors-by-date`
- **Controller**: `getAvailableDoctorsByDate` trong `doctorShift.controller.ts`
- **Query Params**:
  - `workDate`: YYYY-MM-DD (required)
  - `specialtyId`: number (optional)

## 🔧 Frontend - CẦN THỰC HIỆN

### Flow Cũ (Hiện tại):
1. Chọn Specialty
2. Chọn Doctor (từ specialty)
3. Chọn Date
4. Chọn Shift
5. Điền thông tin

### Flow Mới (Cần implement):
1. **Chọn Specialty**
2. **Chọn Date** ⭐ (Thay đổi vị trí)
3. **Chọn Doctor** (Chỉ show bác sĩ có lịch ngày đó) ⭐
4. **Chọn Shift** (Từ shifts của doctor đã chọn)
5. **Điền thông tin**

---

## 📝 Chi Tiết Thay Đổi Frontend

### A. Thêm Service Mới

Tạo hoặc update `shift.service.ts`:

```typescript
// Thêm interface
export interface DoctorWithShifts {
  doctor: {
    id: number;
    userId: number;
    specialtyId: number;
    licenseNumber: string;
    yearsOfExperience: number;
    biography: string;
    user: {
      id: number;
      fullName: string;
      email: string;
      phone: string;
      avatar?: string;
    };
    specialty: {
      id: number;
      name: string;
      description: string;
    };
  };
  shifts: Array<{
    doctorShiftId: number;
    shift: {
      id: number;
      name: string;
      startTime: string;
      endTime: string;
    };
    workDate: string;
    status: string;
  }>;
  shiftCount: number;
}

// Thêm method
static async getDoctorsByDate(
  workDate: string,
  specialtyId?: number
): Promise<DoctorWithShifts[]> {
  const params = new URLSearchParams();
  params.append("workDate", workDate);
  if (specialtyId) {
    params.append("specialtyId", specialtyId.toString());
  }

  const response = await api.get(
    `/doctor-shifts/doctors-by-date?${params.toString()}`
  );
  return response.data.data;
}
```

### B. Update Component `booking_form.tsx`

#### 1. Thay đổi State Variables

```typescript
// Thêm state mới
const [doctorsWithShifts, setDoctorsWithShifts] = useState<DoctorWithShifts[]>([]);
const [isLoadingDoctorsByDate, setIsLoadingDoctorsByDate] = useState(false);
const [selectedDoctorShifts, setSelectedDoctorShifts] = useState<any[]>([]);
```

#### 2. Xóa useEffect cũ fetch doctors by specialty

```typescript
// XÓA đoạn này:
useEffect(() => {
  if (selectedSpecialty) {
    const fetchDoctors = async () => {
      // ... fetch doctors by specialty
    }
    fetchDoctors()
  }
}, [selectedSpecialty])
```

#### 3. Thêm useEffect mới fetch doctors by date

```typescript
// THÊM useEffect mới:
useEffect(() => {
  const fetchDoctorsByDate = async () => {
    if (!date || !selectedSpecialty) {
      setDoctorsWithShifts([]);
      return;
    }

    try {
      setIsLoadingDoctorsByDate(true);
      const formattedDate = format(date, "yyyy-MM-dd");
      const data = await ShiftService.getDoctorsByDate(
        formattedDate,
        selectedSpecialty
      );
      setDoctorsWithShifts(data);

      // Reset selections
      setSelectedDoctor(null);
      setSelectedShift(null);
      setSelectedDoctorShifts([]);
    } catch (error: any) {
      console.error("Error fetching doctors by date:", error);
      toast.error("Không thể tải danh sách bác sĩ cho ngày này");
      setDoctorsWithShifts([]);
    } finally {
      setIsLoadingDoctorsByDate(false);
    }
  };

  fetchDoctorsByDate();
}, [date, selectedSpecialty]);
```

#### 4. Update handleDoctorClick

```typescript
const handleDoctorClick = (doctorId: number) => {
  if (selectedDoctor === doctorId) {
    setSelectedDoctor(null);
    setSelectedShift(null);
    setSelectedDoctorShifts([]);
  } else {
    setSelectedDoctor(doctorId);
    setSelectedShift(null);

    // Lấy shifts của doctor này
    const doctorData = doctorsWithShifts.find((d) => d.doctor.id === doctorId);
    if (doctorData) {
      setSelectedDoctorShifts(doctorData.shifts);
      setStep(3); // Move to shift selection
    }
  }
};
```

#### 5. Thay đổi JSX - Đổi thứ tự Steps

**Step 1**: Chọn Specialty (không đổi)

**Step 2**: Chọn Date (Di chuyển lên trước Doctor)

```typescript
{/* Step 2: Select Date */}
<Card className={cn("md:col-span-1", step < 2 && "opacity-60")}>
  <CardHeader>
    <div className="flex items-center gap-3 mb-2">
      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
        2
      </div>
      <CardTitle>Chọn Ngày Khám</CardTitle>
    </div>
    <CardDescription>Chọn ngày bạn muốn đặt lịch</CardDescription>
  </CardHeader>
  <CardContent>
    <Label className="mb-3 block">Chọn Ngày</Label>
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
          disabled={!selectedSpecialty}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : "Chọn ngày"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(newDate) => {
            setDate(newDate);
            setSelectedDoctor(null);
            setSelectedShift(null);
            if (newDate) setStep(3);
          }}
          disabled={(calendarDate) =>
            calendarDate < new Date() ||
            calendarDate < new Date("1900-01-01")
          }
          initialFocus
        />
      </PopoverContent>
    </Popover>

    {!selectedSpecialty && (
      <p className="text-sm text-muted-foreground mt-2">
        Vui lòng chọn chuyên khoa trước
      </p>
    )}
  </CardContent>
</Card>
```

**Step 3**: Chọn Doctor (Sau khi có date)

```typescript
{/* Step 3: Select Doctor */}
<Card className={cn("md:col-span-2", step < 3 && "opacity-60")}>
  <CardHeader>
    <div className="flex items-center gap-3 mb-2">
      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
        3
      </div>
      <CardTitle>Chọn Bác Sĩ</CardTitle>
    </div>
    <CardDescription>
      Bác sĩ có lịch làm việc ngày {date && format(date, "PPP")}
    </CardDescription>
  </CardHeader>
  <CardContent>
    {!date ? (
      <div className="text-center py-8 text-muted-foreground">
        <Stethoscope className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>Vui lòng chọn ngày khám trước</p>
      </div>
    ) : isLoadingDoctorsByDate ? (
      <div className="text-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
        <p className="text-sm text-muted-foreground mt-2">
          Đang tải danh sách bác sĩ...
        </p>
      </div>
    ) : doctorsWithShifts.length === 0 ? (
      <div className="text-center py-8 text-muted-foreground">
        <Stethoscope className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>Không có bác sĩ nào làm việc trong ngày này.</p>
        <p className="text-sm mt-1">Vui lòng chọn ngày khác.</p>
      </div>
    ) : (
      <div className="grid gap-4">
        {doctorsWithShifts.map(({ doctor, shifts, shiftCount }) => (
          <button
            key={doctor.id}
            type="button"
            onClick={() => handleDoctorClick(doctor.id)}
            className={cn(
              "flex items-center gap-4 p-4 rounded-lg border-2 transition-all hover:border-primary/50 text-left",
              selectedDoctor === doctor.id
                ? "border-primary bg-primary/5"
                : "border-border bg-card"
            )}
          >
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">
                {doctor.user?.fullName}
              </h3>
              <p className="text-sm text-muted-foreground">
                {doctor.specialty?.name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {shiftCount} ca làm việc trong ngày
              </p>
            </div>
            {selectedDoctor === doctor.id && (
              <CheckCircle2 className="h-6 w-6 text-primary" />
            )}
          </button>
        ))}
      </div>
    )}
  </CardContent>
</Card>
```

**Step 4**: Chọn Shift (Từ doctor đã chọn)

```typescript
{/* Step 4: Select Shift */}
<Card className={cn("md:col-span-1", step < 4 && "opacity-60")}>
  <CardHeader>
    <div className="flex items-center gap-3 mb-2">
      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
        4
      </div>
      <CardTitle>Chọn Ca Khám</CardTitle>
    </div>
    <CardDescription>Ca làm việc của bác sĩ</CardDescription>
  </CardHeader>
  <CardContent>
    {!selectedDoctor ? (
      <p className="text-sm text-muted-foreground">
        Vui lòng chọn bác sĩ trước
      </p>
    ) : selectedDoctorShifts.length === 0 ? (
      <p className="text-sm text-muted-foreground">
        Bác sĩ không có ca trực
      </p>
    ) : (
      <div className="grid gap-2">
        {selectedDoctorShifts.map((shiftData) => (
          <button
            key={shiftData.doctorShiftId}
            type="button"
            onClick={() => {
              setSelectedShift(shiftData.shift.id);
              setStep(5);
            }}
            className={cn(
              "p-3 rounded-lg border-2 text-sm font-medium transition-all text-left",
              selectedShift === shiftData.shift.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:border-primary/50"
            )}
          >
            <div className="font-semibold">{shiftData.shift.name}</div>
            <div className="text-xs opacity-90">
              {shiftData.shift.startTime} - {shiftData.shift.endTime}
            </div>
          </button>
        ))}
      </div>
    )}
  </CardContent>
</Card>
```

**Step 5**: Điền thông tin bệnh nhân (không đổi nhiều, chỉ update step number)

---

## 🚀 Hướng Dẫn Sử Dụng Hệ Thống

### 1. Chạy Migration

```bash
cd Backend
npx sequelize-cli db:migrate
```

### 2. Tạo Shift Templates (Admin)

```bash
# API: POST /api/shift-templates
# Body:
{
  "doctorId": 1,
  "shiftId": 1,      # ID của ca (Morning, Afternoon, v.v.)
  "dayOfWeek": 1,    # 1=Thứ 2, 2=Thứ 3, ..., 7=Chủ nhật
  "notes": "Regular weekly schedule"
}

# Ví dụ: Bác sĩ ID 1 làm việc ca sáng (shift 1) vào thứ 2 và thứ 4
POST /api/shift-templates { doctorId: 1, shiftId: 1, dayOfWeek: 1 }
POST /api/shift-templates { doctorId: 1, shiftId: 1, dayOfWeek: 3 }
```

### 3. Generate Lịch Tháng

```bash
# Tự động: Cron chạy ngày 25 hàng tháng lúc 00:00

# Hoặc manual (Admin):
POST /api/schedule-generation/generate-monthly

# Generate cho tháng cụ thể:
POST /api/schedule-generation/generate-for-month
Body: { "year": 2026, "month": 2 }

# Preview trước khi generate:
GET /api/schedule-generation/preview
```

### 4. Test Booking Flow

```
1. Frontend: Chọn chuyên khoa (ví dụ: Tim mạch)
   → API: GET /api/specialties

2. Frontend: Chọn ngày (ví dụ: 2026-01-15)
   → Calendar component

3. Frontend: Load bác sĩ có lịch ngày đó
   → API: GET /api/doctor-shifts/doctors-by-date?workDate=2026-01-15&specialtyId=1
   → Response: Danh sách bác sĩ + shifts của họ

4. Frontend: User chọn bác sĩ
   → Hiển thị shifts của bác sĩ đó

5. Frontend: User chọn shift và điền thông tin
   → API: POST /api/appointments
```

---

## ✅ Checklist Implementation

### Backend
- [x] ShiftTemplate Model & Migration
- [x] ShiftTemplate CRUD Service & Controller
- [x] ShiftTemplate Routes
- [x] Schedule Generation Service
- [x] Schedule Generation Controller & Routes
- [x] Cron Job Setup
- [x] New API: getDoctorsByDate
- [x] Register routes in app.ts

### Frontend
- [ ] Add `getDoctorsByDate` method to `shift.service.ts`
- [ ] Update `booking_form.tsx`:
  - [ ] Add new state variables
  - [ ] Remove old useEffect (fetch doctors by specialty)
  - [ ] Add new useEffect (fetch doctors by date)
  - [ ] Update handleDoctorClick
  - [ ] Reorder JSX steps (Specialty → Date → Doctor → Shift)
  - [ ] Update step numbers and logic
- [ ] Test flow end-to-end

### Testing
- [ ] Tạo shift templates cho vài bác sĩ
- [ ] Chạy schedule generation
- [ ] Kiểm tra database có doctor_shifts được tạo
- [ ] Test booking flow trên frontend
- [ ] Verify appointment được tạo thành công

---

## 🐛 Troubleshooting

### Lỗi: "Không có bác sĩ nào làm việc trong ngày này"
- Kiểm tra đã tạo shift templates chưa
- Kiểm tra đã chạy schedule generation chưa
- Verify date format (YYYY-MM-DD)
- Check database: `SELECT * FROM doctor_shifts WHERE workDate = '2026-01-15'`

### Lỗi: Cron job không chạy
- Check server logs khi khởi động
- Verify `setupScheduleGenerationCron()` được gọi trong `server.ts`
- Test manual: `POST /api/schedule-generation/generate-monthly`

### Performance
- API `doctors-by-date` đã include User và Specialty
- Nếu slow, thêm index:
  ```sql
  CREATE INDEX idx_doctor_shifts_work_date ON doctor_shifts(workDate, status);
  ```

---

## 📚 API Reference

### ShiftTemplate APIs
- `GET /api/shift-templates` - List templates
- `GET /api/shift-templates/:id` - Get template by ID
- `POST /api/shift-templates` - Create template (Admin)
- `PUT /api/shift-templates/:id` - Update template (Admin)
- `DELETE /api/shift-templates/:id` - Delete template (Admin)

### Schedule Generation APIs
- `POST /api/schedule-generation/generate-monthly` - Generate next month (Admin)
- `POST /api/schedule-generation/generate-for-month` - Generate specific month (Admin)
- `GET /api/schedule-generation/preview` - Preview next month (Admin)

### Booking APIs
- `GET /api/doctor-shifts/doctors-by-date?workDate=YYYY-MM-DD&specialtyId=X` - **NEW**
- `POST /api/appointments` - Create appointment

---

## 📅 Example Data Flow

```json
// 1. Tạo template: Bác sĩ Nguyễn Văn A làm ca sáng thứ 2, 4, 6
POST /api/shift-templates
{
  "doctorId": 5,
  "shiftId": 1,
  "dayOfWeek": 1  // Thứ 2
}

// 2. Generate lịch tháng 2
POST /api/schedule-generation/generate-for-month
{
  "year": 2026,
  "month": 2
}

// Response:
{
  "success": true,
  "generated": 45,
  "skipped": 0,
  "period": {
    "year": 2026,
    "month": 2,
    "startDate": "2026-02-01",
    "endDate": "2026-02-28"
  }
}

// 3. Frontend: User chọn ngày 2026-02-02 (Thứ 2)
GET /api/doctor-shifts/doctors-by-date?workDate=2026-02-02&specialtyId=1

// Response:
{
  "success": true,
  "data": [
    {
      "doctor": {
        "id": 5,
        "user": { "fullName": "BS. Nguyễn Văn A" },
        "specialty": { "name": "Tim mạch" }
      },
      "shifts": [
        {
          "doctorShiftId": 123,
          "shift": {
            "id": 1,
            "name": "Ca sáng",
            "startTime": "08:00",
            "endTime": "12:00"
          },
          "workDate": "2026-02-02",
          "status": "ACTIVE"
        }
      ],
      "shiftCount": 1
    }
  ],
  "count": 1,
  "date": "2026-02-02"
}
```

---

## 🎯 Summary

**Ưu điểm của flow mới:**
- ✅ User chọn ngày trước, chỉ thấy bác sĩ có lịch → Không bị thất vọng
- ✅ Tự động generate lịch tháng → Giảm công việc admin
- ✅ Template-based → Dễ quản lý lịch định kỳ
- ✅ Professional workflow như bệnh viện lớn

**Lưu ý:**
- Admin cần tạo templates trước
- Cron job chạy ngày 25 hàng tháng
- Có thể manual generate nếu cần
- Bác sĩ có thể override/cancel shifts cụ thể
