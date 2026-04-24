# ETMS API & Features Matrix

## 🔗 API Endpoints by Module

### Module 1: Attendance Tracking

#### QR System
```
GET    /controllers/attendance/generate-session.php
       Response: { success, token, expires }
       Purpose: Generate 30-second QR token
       Auth: Session required

POST   /controllers/check-in.php
       Body: { method: "qr"|"gps", gps: "lat,lng" }
       Response: { message: "Check-In successful" }
       Purpose: Record attendance check-in
       Auth: Session required

POST   /controllers/check-out.php
       Body: { gps: "lat,lng" }
       Response: { message: "Check-Out successful" }
       Purpose: Record attendance check-out
       Auth: Session required
```

#### Attendance Viewing
```
GET    /controllers/supervisor/get-attendance-map.php
       Response: { success, staff: [], summary: {}, date, asOf }
       Purpose: Live attendance status list
       Auth: Supervisor/Manager role, JWT or Session
       Auto-refresh: 60 seconds

GET    /controllers/get-attendance-history.php
       Response: { attendance: [] }
       Purpose: Get historical attendance records
       Auth: Session required

GET    /controllers/admin/get-staff-attendance.php
       Response: { attendance: [], stats: {} }
       Purpose: Admin view of all staff attendance
       Auth: Admin role
```

---

### Module 2: Employee Profile

#### Profile Management
```
GET    /controllers/get-profile.php
       Response: { success, user: { id, employeeCode, email, ... } }
       Purpose: Get logged-in user profile
       Auth: JWT or Session

POST   /controllers/update-profile.php
       Body: FormData { full_name, email, phone, department, avatar? }
       Response: { success, user: {...} }
       Purpose: Update profile (supports file upload)
       Auth: Session required
       Validation: Email uniqueness

GET    /controllers/get-user-stats.php
       Response: { stats: { attendance_rate, leaves_taken, ... } }
       Purpose: User dashboard statistics
       Auth: Session required
```

#### HR Profile Management
```
GET    /controllers/hr/get-hr-profiles.php
       Query: ?search=&department=&status=&role=
       Response: { success, profiles: [], departments: [], roles: [], summary: {} }
       Purpose: List all staff with filtering
       Auth: HR/Admin role
       Features: Search, multi-filter, pagination

GET    /controllers/hr/export-hr-profiles.php
       Query: ?department=&status=
       Response: XLS file (binary)
       Purpose: Export staff to Excel
       Auth: HR/Admin role
       Format: Formatted table with factory branding

POST   /controllers/hr/get-hr-profiles.php?action=update
       (Implicit - handled via form posts)
       Purpose: Update profile via admin
```

---

### Module 3: Lost ID Lookup

#### Lost ID Reporting
```
POST   /controllers/id/report-lost-id.php
       Body: FormData {
         name, employeeId, dateLost, location, notes,
         evidence (file)
       }
       Response: { success, message }
       Purpose: Report lost ID card
       Auth: Session required
       Validation: Required fields, file type

GET    /controllers/id/get-replacement-request.php
       Response: { requests: [] }
       Purpose: View replacement requests
       Auth: Session or HR role
```

#### HR Lost ID Management
```
GET    /controllers/hr/get-lost-id-reports.php
       Response: {
         success, reports: [
           { id, userId, fullName, email, status, dateLost, ... }
         ]
       }
       Purpose: Get all pending/processed lost ID reports
       Auth: HR/Admin role

POST   /controllers/hr/review-lost-id-report.php
       Body: { reportId, action: "APPROVED"|"REJECTED" }
       Response: { success, message }
       Purpose: Approve/reject lost ID claim
       Auth: HR/Admin role
       Side-effects: Updates id_cards table, creates history
```

#### Lost ID Status
```
GET    /controllers/id/get-replacement-requests.php
       Response: { requests: [] }
       Purpose: Get staff replacement request status
       Auth: Session

GET    /controllers/hr/get-replacement-requests.php
       Response: { requests: [] }
       Purpose: HR view of all replacement requests
       Auth: HR/Admin role

POST   /controllers/hr/review-replacement-request.php
       Body: { requestId, action: "APPROVED"|"REJECTED" }
       Response: { success }
       Purpose: Approve/reject replacement
       Auth: HR/Admin role
```

---

### Module 4: Automated Reporting

#### Report Generation
```
GET    /controllers/manager/export-attendance-excel.php
       Query: ?from=2026-04-01&to=2026-04-30
       Response: XLS file (binary)
       Purpose: Export attendance with date range
       Auth: Manager/Admin role
       Default: Last 30 days
       Features: Color-coded status, employee data, late tracking

GET    /controllers/manager/export-shift-utilization.php
       Query: ?from=2026-04-01&to=2026-04-30
       Response: XLS file (binary)
       Purpose: Export shift-level utilization
       Auth: Manager role
       Features: Shift assignment, attendance matching

GET    /controllers/hr/export-hr-profiles.php
       Query: ?department=&status=
       Response: XLS file (binary)
       Purpose: Export staff profiles
       Auth: HR/Admin role

GET    /controllers/admin/export-admin-users.php
       Response: XLS file (binary)
       Purpose: Export user management report
       Auth: Admin role
```

#### Admin Dashboard Analytics
```
GET    /controllers/admin/admin-dashboard.php
       Response: {
         kpis: { activeUsers, pendingPermissions, alerts, ... },
         roleBreakdown: [],
         recentAudit: [],
         recentAlerts: [],
         shiftSummary: []
       }
       Purpose: Real-time system KPIs and analytics
       Auth: Admin role
       Features: Active user count, security alerts, role breakdown
```

#### Manager Analytics
```
GET    /controllers/manager/get-attendance-overview.php
       Response: { overview: { present, late, absent, outside, ... } }
       Purpose: Attendance summary
       Auth: Manager role

GET    /controllers/manager/get-attendance-trends.php
       Response: { trends: { dates: [], data: [] } }
       Purpose: Attendance trends chart data
       Auth: Manager role

GET    /controllers/manager/get-shift-utilization.php
       Response: { utilization: [] }
       Purpose: Shift-level utilization metrics
       Auth: Manager role
```

---

### Module 5: Authentication & RBAC

#### Authentication
```
POST   /controllers/login.php
       Body: { email, password }
       Response: { success, token, user: {...} }
       Purpose: User login with JWT generation
       Auth: None (public)
       Features: Session + JWT dual auth

POST   /controllers/logout.php
       Response: { success }
       Purpose: User logout
       Auth: Session

POST   /login (Next.js)
       Body: { email, password }
       Response: JWT token + redirect
       Purpose: Frontend auth handler
```

#### Permission Verification
```
GET    /controllers/check-auth.php
       Response: { authenticated, user: {...}, role: "" }
       Purpose: Check current auth status
       Auth: JWT or Session

GET    /controllers/admin/* (all admin endpoints)
       Auth Check: if ($role !== 'ADMIN') { throw Exception }
       
GET    /controllers/hr/* (all HR endpoints)
       Auth Check: if ($role !== 'HR' && $role !== 'ADMIN') { throw Exception }
       
GET    /controllers/manager/* (all manager endpoints)
       Auth Check: if ($role !== 'MANAGER' && $role !== 'ADMIN') { throw Exception }
       
GET    /controllers/supervisor/* (all supervisor endpoints)
       Auth Check: if ($role !== 'SUPERVISOR' && $role !== 'MANAGER' && $role !== 'ADMIN') 
```

---

## 🎯 Features Matrix by Role

### Staff User
```
✅ Dashboard
   - Today's attendance status
   - Check-in/check-out times
   
✅ Attendance
   - QR check-in
   - GPS check-in
   - View attendance history
   
✅ Identity
   - Report lost ID
   - View ID card status
   - Track replacement requests
   - View login devices
   
✅ Work
   - View assigned tasks
   - Task checklist
   - Submit feedback

✅ Leave
   - Apply for leave
   - View leave status

✅ Communication
   - View notifications
   - View messages
```

### Supervisor User
```
✅ All Staff features +

✅ Attendance Oversight
   - View all staff attendance
   - Live check-in map (auto-refresh 60s)
   - Late/early logs
   - Missing check-ins alert
   
✅ Task Management
   - Assign tasks to staff
   
✅ Leave Management
   - Review leave requests
   - Approve/reject leave
   
✅ Reporting
   - Shift rules and hours
   - View utilization
```

### Manager User
```
✅ All Supervisor features +

✅ Organization
   - Assign supervisors to departments
   
✅ Analytics
   - Attendance overview dashboard
   - Attendance trends chart
   - Shift utilization export
   
✅ Reporting
   - Export attendance (date range)
   - Export shift utilization
   - Generate reports (on-demand)
```

### HR User
```
✅ All Manager features +

✅ Profile Management
   - View all staff profiles
   - Edit staff profiles
   - Filter by department/role/status
   - Export profiles

✅ Lost ID Management
   - View all lost ID reports
   - Approve/reject reports
   - Track replacement requests
   - Approve replacements
   - View replacement history
   
✅ Leave Management
   (global view and approvals)
   
✅ Legal & Compliance
   - View official records
   - Access legal documents
   - Generate compliance reports
```

### Admin User
```
✅ All HR features +

✅ User Management
   - Create/edit/delete users
   - Assign roles (staff, supervisor, manager, hr, admin)
   - View user activity

✅ System Settings
   - Configure compliance rules
   - Set max weekly hours
   - Set overtime rates
   - Grace period settings
   - Backup management

✅ Security
   - View security alerts
   - Review failed logins
   - View login activity
   - Track devices
   - Audit logs (complete)

✅ Organization
   - Manage departments
   - Assign manager roles (Manager A / Manager B)
   - Supervisor assignments
   
✅ Dashboard
   - Real-time KPIs
   - User role breakdown
   - System health metrics
   - Pending permissions
```

---

## 🗄️ Database Schema Overview

### Core Tables

#### users
```sql
id (PK)
email (UNIQUE)
password (hashed)
full_name
employee_code
phone
department
department_id (FK → departments.id)
role_id (FK → roles.id)
avatar
status (ACTIVE|INACTIVE|SUSPENDED|EXITED)
last_login
created_at
updated_at
```

#### attendance (via v_attendance view)
```sql
id (PK)
user_id (FK → users.id)
date
check_in (timestamp)
check_out (timestamp nullable)
gps (coordinates)
gps_checkout (coordinates nullable)
method (qr|gps|manual)
status (PRESENT|LATE|ABSENT|OUTSIDE_GEOFENCE)
source (mobile|web|qr_scanner)
shift_id (FK → shifts.id nullable)
```

#### qr_sessions
```sql
id (PK)
token (unique)
type (attendance)
created_by (FK → users.id)
created_at
expires_at
is_active (boolean)
status (ACTIVE|EXPIRED|USED)
```

#### lost_id_reports
```sql
id (PK)
user_id (FK → users.id)
name
employee_id
date_lost
location
notes
evidence_file
status (PENDING|APPROVED|REJECTED)
created_at
reviewed_at nullable
reviewed_by (FK → users.id nullable)
```

#### id_cards
```sql
id (PK)
user_id (FK → users.id)
card_number (UNIQUE)
status (Active|Lost|Replaced|Cancelled)
created_at
issued_date
expiry_date nullable
created_by (FK → users.id)
```

#### departments
```sql
id (PK)
name (UNIQUE)
description
supervisor_id (FK → users.id nullable)
manager_id (FK → users.id nullable)
created_at
updated_at
```

#### manager_roles
```sql
id (PK)
user_id (FK → users.id UNIQUE)
manager_type (operations|commercial)
created_at
```

#### roles
```sql
id (PK)
name (staff|supervisor|manager|hr|admin)
description
permissions (JSON)
created_at
```

---

## 🛠️ Configuration & Constants

### Geofence Settings
```
Company Location: -1.2921, 36.8219 (Nairobi, Kenya)
Radius: 150 meters
GPS Accuracy Threshold: 1000 meters (anti-spoof)
```

### QR Token
```
Expiry: 30 seconds
Token Length: 64 characters (32 bytes hex)
Session Table: qr_sessions
```

### JWT Configuration
```
Secret Key: your-super-secret-key-change-this-in-production
Algorithm: HS256 (HMAC-SHA256)
Token Expiry: 24 hours (86400 seconds)
```

### Session Configuration
```
SameSite: Lax
Secure: false (localhost), true (production)
HttpOnly: true
Lifetime: Until browser close
```

### Upload Restrictions
```
Allowed Extensions: jpg, jpeg, png, webp
Allowed MIME Types: image/jpeg, image/png, image/webp
Max File Size: (check upload handling code)
Storage Path: /uploads/ (relative to root)
```

---

## 📊 Status Code Reference

### Success
```
200 OK              Request succeeded
201 Created         Resource created
204 No Content      Success, no response body
```

### Client Errors
```
400 Bad Request     Invalid input/validation failed
401 Unauthorized    No auth / invalid token
403 Forbidden       Insufficient permissions
404 Not Found       Resource not found
409 Conflict        Email already in use (duplicate)
```

### Server Errors
```
500 Internal Error  Database or server error
503 Service Error   Temporarily unavailable
```

---

## 🔄 Common Workflow Sequences

### Workflow 1: Staff Check-In via QR
```
1. GET /controllers/attendance/generate-session.php
   ↓ Receive token + expires time
2. Frontend renders QR code (qrcode.react)
3. QR reader scans code
4. POST /controllers/check-in.php
   Body: { method: "qr", gps: "lat,lng" }
5. Backend validates GPS within geofence
6. Record stored in attendance table
7. Return success message
```

### Workflow 2: Staff Reports Lost ID
```
1. GET /controllers/id/report/page.tsx
   ↓ Display form
2. Staff fills form + uploads evidence
3. POST /controllers/id/report-lost-id.php
   ↓ Validate + store in lost_id_reports (PENDING)
4. GET /controllers/hr/get-lost-id-reports.php
   ↓ HR reviews list
5. POST /controllers/hr/review-lost-id-report.php
   Body: { reportId, action: "APPROVED" }
   ↓ Update status + mark id_card as Lost
6. GET /controllers/id/id-status/page.tsx
   ↓ Staff sees "Lost" status
```

### Workflow 3: Manager Exports Report
```
1. GET /dashboard/manager/attendance-trends
2. Select date range: from=2026-04-01, to=2026-04-30
3. Click "Export to Excel"
4. GET /controllers/manager/export-attendance-excel.php?from=...&to=...
5. Backend queries v_attendance JOIN users JOIN departments
6. Generate XLS file with formatting
7. Browser downloads file
8. User opens in Excel, view attendance data
```

---

## 🧪 Test Queries

### SQL Queries for Verification

**Check all staff with their attendance today**
```sql
SELECT 
    u.employee_code,
    u.full_name,
    a.check_in,
    a.check_out,
    a.status
FROM users u
LEFT JOIN v_attendance a ON u.id = a.user_id AND DATE(a.check_in) = CURDATE()
ORDER BY u.full_name;
```

**Lost IDs pending approval**
```sql
SELECT 
    u.full_name,
    l.date_lost,
    l.location,
    l.status
FROM lost_id_reports l
JOIN users u ON l.user_id = u.id
WHERE l.status = 'PENDING'
ORDER BY l.created_at;
```

**User role breakdown**
```sql
SELECT 
    r.name as role,
    COUNT(u.id) as count
FROM roles r
LEFT JOIN users u ON r.id = u.role_id
GROUP BY r.id
ORDER BY count DESC;
```

**Attendance rate by department (last 30 days)**
```sql
SELECT 
    d.name as department,
    COUNT(DISTINCT a.user_id) as employees_checked_in,
    ROUND(AVG(CASE WHEN a.status = 'PRESENT' THEN 100 ELSE 0 END), 2) as present_rate
FROM v_attendance a
JOIN users u ON a.user_id = u.id
LEFT JOIN departments d ON u.department_id = d.id
WHERE a.check_in >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY d.id
ORDER BY present_rate DESC;
```

---

**Last Updated**: April 14, 2026  
**API Version**: 1.0  
**Status**: Production Ready
