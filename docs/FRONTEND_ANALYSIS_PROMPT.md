# PROMPT PHÂN TÍCH TOÀN BỘ FRONTEND

## YÊU CẦU PHÂN TÍCH

Hãy phân tích toàn bộ codebase Frontend của ứng dụng quản lý phòng khám y tế với các khía cạnh sau:

### 1. KIẾN TRÚC VÀ CẤU TRÚC DỰ ÁN

- **Công nghệ stack chính:**
  - React 19.2.0 với TypeScript
  - Vite 7.2.4 làm build tool
  - React Router DOM 7.10.1 cho routing
  - Tailwind CSS 4.1.18 cho styling
  - Radix UI components cho UI primitives
  - Zustand 5.0.9 cho state management (nếu có sử dụng)
  - React Hook Form 7.68.0 + Yup 1.7.1 + Zod 4.1.13 cho form validation
  - Axios 1.13.2 cho HTTP requests
  - Firebase 12.6.0 cho authentication và data connect
  - TanStack Query (React Query) cho data fetching
  - Recharts 3.5.1 cho data visualization
  - Date-fns 4.1.0 cho date manipulation
  - jsPDF 3.0.4 cho PDF generation

- **Cấu trúc thư mục:**
  - Phân tích tổ chức thư mục `src/` và các module con
  - Đánh giá tính nhất quán và khả năng mở rộng của cấu trúc
  - Xác định các pattern được sử dụng (feature-based, layer-based, etc.)

- **Build configuration:**
  - Phân tích `vite.config.ts` và các cấu hình build
  - Path aliases và module resolution
  - Environment variables và configuration management

### 2. ROUTING VÀ NAVIGATION

- **Route structure:**
  - Phân tích tất cả routes trong `App.tsx`
  - Route protection và authentication guards
  - Nested routes và route organization
  - Route naming conventions

- **Navigation patterns:**
  - Sidebar navigation cho từng role (admin, doctor, patient, receptionist)
  - Topbar navigation
  - Breadcrumb navigation (nếu có)
  - Deep linking và URL structure

### 3. AUTHENTICATION VÀ AUTHORIZATION

- **Authentication flow:**
  - Phân tích `auth/authContext.tsx` và `context/AuthContext.tsx`
  - Login/Register flow
  - Token management (accessToken, refreshToken)
  - Token refresh mechanism
  - Session persistence và restore on page reload

- **Authorization:**
  - Role-based access control (RBAC)
  - Route protection based on user roles
  - Component-level permissions
  - API request authorization headers

- **Security:**
  - Token storage strategy (localStorage vs cookies)
  - XSS protection
  - CSRF protection
  - Secure API communication

### 4. STATE MANAGEMENT

- **Global state:**
  - AuthContext implementation
  - Zustand stores (nếu có)
  - React Query cache management
  - State synchronization across components

- **Local state:**
  - Component state patterns
  - Form state management với React Hook Form
  - UI state (modals, dropdowns, etc.)

- **Data fetching:**
  - React Query setup và configuration
  - Query keys organization
  - Mutation patterns
  - Cache invalidation strategies
  - Error handling và retry logic

### 5. API INTEGRATION

- **API client:**
  - Phân tích `lib/api.ts` và `lib/axiosAuth.ts`
  - Axios interceptors (request/response)
  - Error handling patterns
  - Timeout configuration
  - Request/response logging

- **API services:**
  - `services/appointment.service.ts`
  - `services/prescription.service.ts`
  - Service layer organization
  - Type safety trong API calls
  - Error response handling

- **Firebase Data Connect:**
  - Phân tích `dataconnect-generated/` và `dataconnect-admin-generated/`
  - GraphQL schema và queries
  - Integration với React components

### 6. UI COMPONENTS VÀ DESIGN SYSTEM

- **Component library:**
  - Radix UI components usage
  - Custom components trong `components/ui/`
  - Component composition patterns
  - Accessibility (a11y) implementation

- **Styling approach:**
  - Tailwind CSS configuration
  - Custom CSS trong `index.css` và `App.css`
  - Theme system (`components/theme-provider.tsx`)
  - Dark mode support (nếu có)
  - Responsive design patterns

- **Reusable components:**
  - Form components (`components/form/`)
  - Layout components (`components/sidebar_layout.tsx`)
  - Feature components (appointment, booking, etc.)
  - Component props và TypeScript interfaces

### 7. PAGES VÀ FEATURES

Phân tích từng page và feature theo role:

**Landing/Public Pages:**
- `LandingPage.tsx` - Homepage với hero, features, services
- `LoginPage.tsx` - Authentication
- `RegisterPage.tsx` - User registration
- `Privacy_Policy.tsx` và `ToS.tsx` - Legal pages

**Patient Pages:**
- `BookAppointmentPage.tsx` - Appointment booking
- `Appointments.tsx` - Patient appointments list
- `SignupPage.tsx` - Patient registration

**Admin Pages:**
- `DashboardPage.tsx` - Admin dashboard với statistics
- `doctorList.tsx`, `doctorDetail.tsx`, `doctorAdd.tsx` - Doctor management
- `doctorSchedule.tsx`, `doctorShift.tsx` - Schedule management
- `PharmacyImportPage.tsx` - Medicine import
- `SalaryPage.tsx` - Salary management
- Report pages: `revenueReport.tsx`, `expenseReport.tsx`, `genderReport.tsx`, `medicineReport.tsx`

**Doctor Pages:**
- `DashboardPage.tsx` - Doctor dashboard
- `medicalList.tsx` - Patient list for examination
- `formMedical.tsx` - Medical examination form
- `prescribeMed.tsx` - Prescription creation
- `QuanlyDonThuoc.tsx` - Prescription management
- `prescriptionDetail.tsx` - Prescription details
- `doctorShift.tsx` - Doctor shift management

**Receptionist Pages:**
- `DashboardPage.tsx` - Receptionist dashboard
- `patient_list.tsx`, `patient_detail.tsx` - Patient management
- `InvoicesPage.tsx`, `InvoiceDetailPage.tsx` - Invoice management

**Pharmacy Pages:**
- `PharmacyPage.tsx` - Medicine list
- `PharmacyDetailPage.tsx` - Medicine details

### 8. FORM HANDLING VÀ VALIDATION

- **Form libraries:**
  - React Hook Form integration
  - Yup và Zod validation schemas
  - Form error handling và display
  - Form submission patterns

- **Custom form components:**
  - `components/form/Login.tsx` và `Register.tsx`
  - `components/booking_form.tsx`
  - `components/contact_form.tsx`
  - Reusable form field components

### 9. TYPE SAFETY VÀ TYPESCRIPT

- **Type definitions:**
  - `types/appointment.ts`
  - `types/prescription.types.ts`
  - `auth/types.ts`
  - Type coverage và completeness
  - Interface vs type usage

- **TypeScript configuration:**
  - `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`
  - Strict mode settings
  - Path mapping và module resolution
  - Type checking trong build process

### 10. UTILITIES VÀ HELPERS

- **Utility functions:**
  - `lib/utils.ts` - General utilities
  - `utils/prescriptionHelpers.ts`, `prescriptionUtils.ts`
  - `utils/vietnameseUtils.ts` - Vietnamese language utilities
  - `lib/utils/appointment_utils.tsx`
  - Code reusability và organization

### 11. HOOKS VÀ CUSTOM HOOKS

- **Custom hooks:**
  - `hooks/use-mobile.ts` - Responsive detection
  - `hooks/use-toast.ts` - Toast notifications
  - `hooks/usePatientAppointments.ts` - Data fetching hook
  - Hook patterns và reusability

### 12. ERROR HANDLING VÀ LOGGING

- **Error boundaries:**
  - React Error Boundaries (nếu có)
  - Global error handling
  - User-friendly error messages

- **Logging:**
  - Console logging patterns
  - Error tracking (nếu có)
  - Debug information

### 13. PERFORMANCE OPTIMIZATION

- **Code splitting:**
  - Lazy loading routes
  - Component lazy loading
  - Dynamic imports

- **Rendering optimization:**
  - React.memo usage
  - useMemo và useCallback patterns
  - Virtualization cho large lists (nếu có)

- **Bundle optimization:**
  - Vite build optimization
  - Tree shaking
  - Asset optimization

### 14. TESTING (NẾU CÓ)

- **Test setup:**
  - Test framework configuration
  - Unit tests
  - Integration tests
  - E2E tests

### 15. ACCESSIBILITY (A11Y)

- **WCAG compliance:**
  - Keyboard navigation
  - Screen reader support
  - ARIA attributes
  - Focus management

### 16. INTERNATIONALIZATION (I18N)

- **Multi-language support:**
  - Vietnamese language utilities
  - Translation patterns
  - Locale management

### 17. DEPENDENCIES VÀ PACKAGE MANAGEMENT

- **Dependencies analysis:**
  - Production dependencies review
  - Dev dependencies review
  - Version compatibility
  - Security vulnerabilities (nếu có)
  - Unused dependencies

### 18. CODE QUALITY VÀ BEST PRACTICES

- **Code organization:**
  - Naming conventions
  - File structure consistency
  - Import organization
  - Code duplication

- **React patterns:**
  - Component patterns (functional components, hooks)
  - Props drilling vs context
  - State management patterns
  - Side effects management

- **TypeScript best practices:**
  - Type safety
  - Any types usage
  - Type inference
  - Generic types

### 19. DOCUMENTATION

- **Code documentation:**
  - Comments và JSDoc
  - README files
  - Component documentation
  - API documentation

### 20. DEPLOYMENT VÀ CI/CD

- **Build process:**
  - Vite build configuration
  - Environment variables
  - Build output analysis

- **Deployment:**
  - Firebase hosting configuration (`.firebaserc`, `firebase.json`)
  - Static asset handling
  - Environment-specific builds

### 21. SECURITY CONSIDERATIONS

- **Frontend security:**
  - XSS prevention
  - CSRF protection
  - Secure token handling
  - Input sanitization
  - Content Security Policy (CSP)

### 22. KNOWN ISSUES VÀ TECHNICAL DEBT

- **Documentation files:**
  - `API_ROUTE_FIX.md`
  - `TIMEOUT_FIX.md`
  - Các issues đã được fix
  - Remaining technical debt

### 23. RECOMMENDATIONS

Sau khi phân tích, đưa ra:
- **Strengths:** Điểm mạnh của codebase
- **Weaknesses:** Điểm yếu và vấn đề cần cải thiện
- **Improvements:** Đề xuất cải thiện cụ thể
- **Refactoring opportunities:** Cơ hội refactor code
- **Best practices:** Áp dụng best practices
- **Performance optimizations:** Tối ưu hiệu suất
- **Security enhancements:** Cải thiện bảo mật

### 24. ARCHITECTURE DIAGRAMS

Tạo các diagram:
- Component hierarchy
- Data flow diagram
- Authentication flow
- Route structure
- State management flow

---

## OUTPUT FORMAT

Kết quả phân tích nên được trình bày dưới dạng:
1. **Executive Summary** - Tổng quan ngắn gọn
2. **Detailed Analysis** - Phân tích chi tiết từng phần
3. **Code Examples** - Ví dụ code minh họa
4. **Diagrams** - Sơ đồ kiến trúc
5. **Recommendations** - Đề xuất cải thiện
6. **Action Items** - Danh sách công việc ưu tiên

---

## LƯU Ý

- Phân tích toàn diện, không bỏ sót file hoặc module quan trọng
- Đưa ra đánh giá khách quan về chất lượng code
- Đề xuất cải thiện cụ thể và actionable
- Ưu tiên các vấn đề về security, performance, và maintainability
- Sử dụng tiếng Việt cho các giải thích và đề xuất
