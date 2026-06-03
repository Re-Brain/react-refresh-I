# Retired Racehorse Visit Scheduler

A web application that allows visitors to browse retired racehorses available for visits at registered ranches, and book a visit with a horse they are interested in.

## Project Purpose

Many retired racehorses are rehomed to ranches and farms. This platform connects horse lovers with those farms, allowing them to discover available horses and schedule a visit — while giving farmers a simple tool to manage their horses and bookings.

---

## User Roles

### Guest (Not Logged In)
- Browse all approved horses across all approved farms
- View horse detail pages (name, breed, age, background story)
- View farm profiles
- Search and filter horses

### Visitor (Logged In)
Everything a guest can do, plus:
- Book a visit to see a specific horse using a calendar
- View and manage their own bookings
- Cancel a booking

### Farmer (Logged In)
Everything a visitor can do, plus:
- Register their farm (name, location, description)
- Add, edit, and remove horses from their farm
- View incoming booking requests
- Approve or reject bookings
- Mark visits as completed

> Note: A farmer is also a visitor — they can browse and book visits at other farms without needing a second account.

### Admin *(planned)*
- Review and approve/reject farmer registrations
- Review and approve/reject horse listings
- Manage all users and farms
- Handle disputes or reports
- View platform-wide statistics

---

## Core Features

### Horse Browsing
- Public list of all approved horses
- Horse detail page: name, breed, age, color, backstory
- Search by name, breed, or farm
- Filter by availability

### Booking System
- Calendar-based booking for logged-in visitors
- Booking status flow: `Pending → Approved → Completed / Cancelled`
- Conflict prevention — same horse cannot be double-booked on the same date
- Booking history for visitors
- Booking management dashboard for farmers

### Farm Registration
- Farmers register a farm with name, location, and description
- Each farm can have multiple horses
- Farmers can also book visits at other farms as a visitor

### Authentication & Authorization
- Register and login system
- Role-based access control (Guest, Visitor, Farmer, Admin)
- One account can hold multiple roles (a farmer is also a visitor)
- Protected routes — booking and farm management require login

---

## Approval System *(planned)*

### Farm Approval
When a farmer registers their farm, an admin must approve it before it appears publicly.

**Flow:**
```
Farmer registers farm → status: "pending"
Admin reviews application → Approve or Reject
Approved → farm is visible to public
Rejected → farmer is notified with a reason
```

**Documents a farmer submits for approval:**
- Farm ownership proof
- Animal welfare certificate
- Contact number

> Currently auto-approved for development. Change `status: "approved"` to `status: "pending"` in the backend when admin approval is implemented.

### Horse Approval
When a farmer adds a new horse, an admin must approve it before it appears on the public browse page.

**Flow:**
```
Farmer adds horse → status: "pending"
Admin reviews listing → Approve or Reject
Approved → horse appears on public browse page
Rejected → farmer is notified with a reason
```

**Documents a farmer submits per horse:**
- Proof the horse is a retired racehorse (race registration number or JRA certificate)
- Veterinary health record
- Photo of the horse

> Currently auto-approved for development. Same as farm approval — swap to `"pending"` when admin review is implemented.

---

## Suggested Tech Stack

### Frontend
- React + React Router
- Tailwind CSS
- Calendar UI library (e.g. react-calendar or react-big-calendar)

### Backend
- Node.js + Express (or Fastify)
- JWT-based authentication
- bcrypt for password hashing

### Database
- PostgreSQL (relational — fits users → farms → horses → bookings well)

---

## Data Models (Draft)

```
User        — id, name, email, password, roles: ["visitor", "farmer"]
Farm        — id, owner_id, name, location, description, status (pending | approved | rejected)
Horse       — id, farm_id, name, breed, age, color, bio, is_available, status (pending | approved | rejected)
Booking     — id, horse_id, visitor_id, date, status (pending | approved | completed | cancelled)
```

---

## Build Order (Recommended)

1. Auth system — register, login, roles
2. Farmer flow — register farm, add horses (auto-approved for now)
3. Guest flow — browse and search horses
4. Visitor flow — calendar booking
5. Admin panel — farm and horse approval, user management *(future)*
6. Real approval flow — pending status, admin review, notifications *(future)*
7. Farmer verification documents — file upload and review *(future)*
