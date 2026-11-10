# StayEase – Smart Hostel & Apartment Management System

[![Spring Boot 3.3.5](https://img.shields.io/badge/Spring%20Boot-3.3.5-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Java 21](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![React 18](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev/)
[![Tailwind CSS 3](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![MySQL 8](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)

**StayEase** is a comprehensive, multi-property hostel and apartment management platform built from scratch. It allows property owners and landlords to list, manage, and scale hostels, boarding houses, and residential apartments under a centralized SaaS architecture.

The platform provides end-to-end management for room allocation, bed capacity tracking, real-time booking approvals, tenant onboarding, manual rent invoicing with printable receipts, utility meter tracking, maintenance requests, and analytics dashboards tailored for four distinct user roles.

---

## 🚀 Key Features

- **Multi-Role RBAC:** 4 discrete roles (`SUPER_ADMIN`, `OWNER`, `MANAGER`, `TENANT`) with backend method security (`@PreAuthorize`) and frontend route protection.
- **Dynamic Property & Unit Management:** Manage multi-unit properties with images, coordinates, facilities, room categories (Single, Double, Shared, Deluxe, Studio), and bed capacity tracking.
- **Real-Time Booking Workflow:** Tenants explore properties and submit reservation requests; owners and managers review applicant details and assign vacant rooms/beds, which automatically updates occupancy counts.
- **Rent & Automated Receipt Generation:** Invoices are tracked across `UNPAID`, `PAID`, `PARTIALLY_PAID`, and `OVERDUE` states. Record offline/manual payments and generate formatted receipts (`REC-YYYYMM-XXXX`) ready for print/download.
- **Utility Meter Management:** Electricity and water bill calculation with previous and current meter readings, rate per unit, due dates, and settlement tracking.
- **Maintenance Ticketing:** Tenants lodge tickets across categories (`Electrical`, `Plumbing`, `Furniture`, `Cleaning`, `Internet`, `Other`); managers assign resolution notes and track ticket lifecycles (`SUBMITTED`, `IN_PROGRESS`, `COMPLETED`, `REJECTED`).
- **Interactive Dashboards & Reports:** Interactive Recharts data visualizations for income trends, property occupancy rates, and maintenance analytics, with one-click **CSV export** for audit and financial records.
- **Noticeboard / Announcements:** Platform-wide and property-specific broadcasts with audience targeting.
- **In-App Notifications:** Real-time notification center for booking status updates, rent dues, and ticket resolutions.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router DOM v6, Axios, Recharts, Lucide React |
| **Backend** | Java 21, Spring Boot 3.3.5, Spring Security 6, JJWT 0.12.6, Spring Data JPA, Hibernate, Bean Validation |
| **Database** | MySQL 8 |
| **Build & Tooling** | Maven 3.9+, Node.js 18+, PostCSS, Autoprefixer |

---

## 📁 Project Directory Structure

```text
StayEase/
├── backend/                               # Spring Boot 3.3.5 API
│   ├── src/main/java/com/stayease/
│   │   ├── config/                        # Security & CORS configuration
│   │   ├── controller/                    # 14 REST API Controllers
│   │   ├── dto/                           # Request & Response DTOs
│   │   ├── entity/                        # 12 JPA Entities & Enums
│   │   ├── repository/                    # Spring Data JPA Repositories
│   │   ├── security/                      # JWT Token Provider, UserPrincipal, Filters
│   │   ├── service/                       # Business logic & access verification
│   │   └── initializer/                   # Creates the initial superadmin from environment variables
│   ├── src/main/resources/
│   │   ├── application.properties         # Default profile (MySQL 8)
│   │   └── application-dev.properties     # Dev profile (In-Memory H2 DB)
│   └── pom.xml
│
├── frontend/                              # React 18 + Vite Web Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/                    # Navbar, Sidebar, Modal, Badge, StatCard, Receipts
│   │   │   └── dashboard/                 # SuperAdmin, Owner, Manager, Tenant Dashboards
│   │   ├── context/                       # AuthContext (JWT session), NotificationContext
│   │   ├── layouts/                       # DashboardLayout with sidebar & header
│   │   ├── pages/                         # 15 Complete Page Views
│   │   ├── services/                      # Axios API client with interceptors
│   │   ├── App.jsx                        # React Router DOM configuration
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js                 # StayEase Brand Palette (#176B55, #123B35, etc.)
│   └── vite.config.js
│
├── database/
│   ├── schema.sql                         # MySQL 8 Normalized Relational Schema
│   └── seed-data.sql                      # Production SQL Seed Data with BCrypt Hashes
│
├── run-all.bat                            # Launches both backend and frontend concurrently
├── run-backend.bat                        # Starts Spring Boot Backend (Port 8080)
├── run-frontend.bat                       # Starts React Vite Frontend (Port 5173)
└── README.md
```

---

## Setup and Run (Windows)

### Prerequisites

- Java 21 and Maven 3.9+
- Node.js 18+ and npm
- MySQL 8

### 1. Create a MySQL database and application user

Start MySQL and connect as an administrator:

```cmd
mysql -u root -p
```

Create the database and a dedicated application user in the MySQL prompt. Replace the example password with a strong password:

```sql
CREATE DATABASE stayease_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'stayease'@'localhost' IDENTIFIED BY 'replace_with_a_strong_database_password';
GRANT ALL PRIVILEGES ON stayease_db.* TO 'stayease'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

The backend creates and updates tables at startup (`spring.jpa.hibernate.ddl-auto=update`).

### 2. Configure environment variables

From the project root, copy the example file and edit it:

```powershell
Copy-Item .env.example .env
notepad .env
```

Set these values in `.env`:

| Variable | Purpose |
|---|---|
| `DB_URL` | MySQL JDBC URL, for example `jdbc:mysql://localhost:3306/stayease_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC` |
| `DB_USERNAME` | MySQL application user, for example `stayease` |
| `DB_PASSWORD` | Password assigned to the MySQL application user |
| `JWT_SECRET` | Random secret of at least 32 characters for signing JWTs |
| `ADMIN_EMAIL` | Email address for the initial superadmin |
| `ADMIN_PASSWORD` | Strong password for the initial superadmin |

`ADMIN_EMAIL` and `ADMIN_PASSWORD` are used only when the database has no users and the initial superadmin is created. Keep `.env` private; it is excluded from version control. Replace every example value before running the application.

### 3. Start the application

After configuring `.env`, launch both services from the project root:

```cmd
run-all.bat
```

To start services separately, use two terminals. In the first:

```powershell
Set-Location .\backend
mvn spring-boot:run -Dspring-boot.run.profiles=mysql
```

In the second:

```powershell
Set-Location .\frontend
npm install
npm run dev
```

Open `http://localhost:5173`; the backend API is available at `http://localhost:8080/api`.

## 🌐 REST API Endpoints Overview

| Module | Method | Endpoint | Description |
|---|---|---|---|
| **Auth** | `POST` | `/api/auth/login` | Authenticate with username/email & password, returns JWT token |
| **Auth** | `POST` | `/api/auth/register` | Register new Owner or Tenant |
| **Auth** | `GET` | `/api/auth/me` | Fetch currently authenticated user profile |
| **Files** | `POST` | `/api/uploads` | Upload an authenticated user's JPG, JPEG, PNG, or WEBP image (max 5 MB) |
| **Files** | `GET` | `/uploads/{filename}` | Publicly retrieve an uploaded image |
| **Properties** | `GET` | `/api/properties` | List properties (role-filtered or all for Super Admin) |
| **Properties** | `POST` | `/api/properties` | Create a property (Owner/Admin) |
| **Rooms** | `GET` | `/api/rooms` | Filter rooms by property, status, capacity, or type |
| **Rooms** | `POST` | `/api/rooms` | Create room unit with facilities and bed count |
| **Bookings** | `GET` | `/api/bookings` | List user's bookings or property reservation queue |
| **Bookings** | `POST` | `/api/bookings` | Tenant submits reservation request |
| **Bookings** | `PATCH` | `/api/bookings/{id}/status` | Approve or reject booking and update room capacity |
| **Tenants** | `GET` | `/api/tenants` | Tenant directory (Owner/Manager) |
| **Tenants** | `GET` | `/api/tenants/me` | Tenant's own assigned room and stay details |
| **Rent** | `GET` | `/api/rent` | View monthly rent invoices and payment statuses |
| **Payments** | `POST` | `/api/payments` | Record manual payment & issue receipt number |
| **Utilities** | `GET` | `/api/utility-bills` | View electricity & water invoices |
| **Utilities** | `POST` | `/api/utility-bills` | Generate utility bill with meter readings |
| **Maintenance**| `GET` | `/api/maintenance` | View maintenance tickets |
| **Maintenance**| `POST` | `/api/maintenance` | Submit maintenance ticket |
| **Maintenance**| `PATCH` | `/api/maintenance/{id}/status` | Update repair status and resolution notes |
| **Reports** | `GET` | `/api/reports/income` | Aggregated monthly revenue and collection rates |
| **Reports** | `GET` | `/api/reports/occupancy` | Occupancy percentages and room type distribution |
| **Reports** | `GET` | `/api/reports/maintenance`| Ticket resolution velocity and issue breakdowns |
| **Reports** | `GET` | `/api/reports/export/payments-csv` | Download complete payment ledger as CSV |
| **Notices** | `GET` | `/api/announcements` | View bulletin announcements |
| **Users** | `GET` | `/api/users` | User management directory (Super Admin) |
| **Users** | `PATCH` | `/api/users/{id}/toggle-status` | Activate/Deactivate user account |

---

## 🎨 UI/UX Design System

The frontend follows the specified design guidelines:
- **Primary Color:** `#176B55` (Emerald Deep Teal)
- **Secondary Color:** `#123B35` (Midnight Pine)
- **Background:** `#F7F9F8` (Clean Soft Warm Slate)
- **Surface:** `#FFFFFF` (Crisp White Cards & Containers)
- **Status Indicators:** Emerald `#16A36A` (Success/Paid), Amber `#E9A23B` (Warning/Pending), Rose `#E45B5B` (Danger/Overdue)
- **Typography:** Inter Sans with strict visual hierarchy and responsive breakpoints.

---

## 🔒 Security & Data Integrity

1. **Password Encryption:** Sensitive credentials hashed using industry-standard BCrypt (12 rounds).
2. **Stateless JWT:** Secure Bearer tokens with 24-hour expiration validated on every API call.
3. **Data Isolation:** Owners and managers cannot view, edit, or manipulate records belonging to other properties.
4. **Tenant Privacy:** Tenants are strictly restricted to their own bookings, invoices, and maintenance tickets.
5. **Double-Booking Safeguards:** The booking confirmation workflow verifies bed and room availability before approving reservations.
