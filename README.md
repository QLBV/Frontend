<div align="center">

# 🏥 HEALOS - Healthcare Management System

### Modern Medical Practice Management Platform

[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4.1-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-12.6-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)

<p align="center">
  <strong>A comprehensive, enterprise-grade healthcare management solution built with modern web technologies.</strong>
</p>

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Project Structure](#-project-structure) • [Contributing](#-contributing)

</div>

---

## 📋 Overview

HEALOS is a full-featured **Healthcare Management System** designed to streamline medical practice operations. It provides role-based dashboards for **Administrators**, **Doctors**, **Receptionists**, and **Patients**, enabling efficient management of appointments, prescriptions, invoices, pharmacy inventory, and more.

## ✨ Features

### 🔐 Authentication & Authorization
- **Multi-role authentication** (Admin, Doctor, Receptionist, Patient)
- OAuth 2.0 integration (Google Sign-In)
- JWT-based session management
- Password reset & email verification
- Role-based access control (RBAC)

### 👨‍💼 Admin Portal
- **Dashboard** with real-time analytics & KPIs
- **User Management** - CRUD operations for all user roles
- **Doctor Management** - Schedules, shifts, specialties
- **Patient Management** - Medical history, prescriptions
- **Employee Management** - Attendance, payroll, salary
- **Pharmacy Management** - Inventory, imports/exports
- **Financial Reports** - Revenue, invoices, statistics
- **Audit Logs** - System activity tracking
- **System Settings** - Configurable app settings

### 👨‍⚕️ Doctor Portal
- **Patient Queue** - Real-time patient list
- **Medical Examination** - Diagnosis, vital signs recording
- **Prescription Management** - Create, edit, lock prescriptions
- **Digital Prescription** - PDF export, electronic signatures
- **Shift Management** - View assigned schedules

### 🧑‍💻 Receptionist Portal
- **Appointment Management** - Online & offline booking
- **Patient Registration** - New patient intake
- **Invoice Management** - Create, edit, payment processing
- **Patient Lookup** - Quick search & history access

### 👤 Patient Portal
- **Appointment Booking** - Online scheduling
- **Medical History** - View past visits & diagnoses
- **Prescription Access** - Digital prescription viewer
- **Invoice History** - Payment status & receipts
- **Profile Management** - Personal health information

### 📊 Reporting & Analytics
- Revenue & financial reports with charts
- Appointment statistics & trends
- Patient demographics analysis
- Medicine usage reports
- Export to PDF & Excel

## 🛠 Tech Stack

### Core Framework
| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2 | UI Library |
| **TypeScript** | 5.9 | Type Safety |
| **Vite** | 7.2 | Build Tool & Dev Server |

### UI & Styling
| Technology | Purpose |
|------------|---------|
| **Tailwind CSS 4** | Utility-first CSS |
| **Radix UI** | Headless UI Components |
| **Lucide React** | Icon Library |
| **shadcn/ui** | Component Library |
| **Recharts** | Data Visualization |

### State & Forms
| Technology | Purpose |
|------------|---------|
| **Zustand** | Global State Management |
| **React Hook Form** | Form Handling |
| **Zod / Yup** | Schema Validation |

### Backend Integration
| Technology | Purpose |
|------------|---------|
| **Axios** | HTTP Client |
| **Firebase** | Authentication & Hosting |
| **React Router DOM** | Client-side Routing |

### Developer Experience
| Technology | Purpose |
|------------|---------|
| **ESLint** | Code Linting |
| **TypeScript ESLint** | TS-specific Linting |
| **Prettier** | Code Formatting |

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x or **yarn** >= 1.22
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/healos-frontend.git
   cd healos-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:3000/api
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
src/
├── assets/              # Static assets (images, fonts)
├── auth/                # Authentication context & guards
├── components/          # Reusable UI components
│   ├── ui/              # Base UI components (shadcn/ui)
│   └── sidebar/         # Role-specific sidebars
├── context/             # React Context providers
├── hooks/               # Custom React hooks
├── lib/                 # Utility libraries
├── pages/               # Page components
│   ├── admin/           # Admin dashboard pages
│   ├── doctor/          # Doctor portal pages
│   ├── patient/         # Patient portal pages
│   └── recep/           # Receptionist pages
├── services/            # API service layers
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── App.tsx              # Main application component
├── main.tsx             # Application entry point
└── index.css            # Global styles
```

## 🔑 Role-Based Routes

| Role | Base Route | Access Level |
|------|------------|--------------|
| **Admin** | `/admin/*` | Full system access |
| **Doctor** | `/doctor/*` | Medical operations |
| **Receptionist** | `/recep/*` | Front desk operations |
| **Patient** | `/patient/*` | Self-service portal |

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## 🎨 Design System

HEALOS uses a modern, premium design language featuring:

- **Glassmorphism** effects for depth
- **Gradient accents** for visual hierarchy
- **Micro-animations** for enhanced UX
- **Responsive layouts** for all devices
- **Dark mode ready** architecture
- **Consistent color palette** using Tailwind

### Color Palette

| Color | Usage |
|-------|-------|
| `blue-600` | Primary actions, links |
| `emerald-600` | Success states, confirmations |
| `amber-500` | Warnings, pending states |
| `rose-500` | Errors, cancellations |
| `slate-900` | Text, headings |

## 🔒 Security Features

- **JWT Token Management** with automatic refresh
- **Protected Routes** with role verification
- **CSRF Protection** via secure headers
- **Input Sanitization** for all forms
- **Secure Storage** for sensitive data

## 📱 Responsive Design

Fully responsive across all breakpoints:
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px - 1279px
- **Large Desktop**: 1280px+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

```
feat: Add new feature
fix: Bug fix
docs: Documentation changes
style: Code style changes
refactor: Code refactoring
test: Testing updates
chore: Maintenance tasks
```

## 📄 License

This project is proprietary software. All rights reserved.

## 👥 Team

Developed with ❤️ by the HEALOS Development Team

---

<div align="center">

**[⬆ Back to Top](#-healos---healthcare-management-system)**

</div>
