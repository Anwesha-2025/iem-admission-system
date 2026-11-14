# IEM Admission Management System

Full-stack admission portal built with React + Vite, Node.js, Express and MongoDB (MERN).

## Features
- Student registration and login (JWT + bcrypt password hashing)
- Student admission form with personal, guardian and academic details
- Document upload: PDF, JPG/JPEG and PNG, max 5 MB per file
- Student application status tracking and rejection reason
- Admin login, application search, review, approve/reject
- Simulated payment flow (no real money is charged)
- Payment receipt view/print
- Role-based API authorization

## Requirements
- Node.js 18+
- MongoDB Community Server or MongoDB Atlas
- VS Code

## 1. Configure the backend
Open a terminal in `server`:

```bash
cd server
npm install
```

Copy `.env.example` to `.env` and edit the values:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/iem_admission
JWT_SECRET=replace_this_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
ADMIN_NAME=IEM Administrator
ADMIN_EMAIL=admin@iem.edu
ADMIN_PASSWORD=Admin@12345
```

Create the first admin account:

```bash
npm run seed:admin
```

Start the API:

```bash
npm run dev
```

The API runs at http://localhost:5000.

## 2. Configure the frontend
Open another terminal in the project root:

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start React:

```bash
npm run dev
```

Open http://localhost:5173.

## Demo admin login
- Email: `admin@iem.edu`
- Password: `Admin@12345`

Change the password and JWT secret before deploying or sharing the application.

## Student workflow
1. Register a student account.
2. Log in and complete the admission form.
3. Upload required documents.
4. Submit the application.
5. Track its status from the student dashboard.
6. Once approved, open Payments and complete the simulated payment.
7. View/print the generated receipt.

## Admin workflow
1. Log in using the seeded admin credentials.
2. Open the Admin Dashboard.
3. Search/filter applications.
4. Open an application and inspect its details/documents.
5. Mark it Under Review, Approve it, or Reject it with a reason.

## New in this version
- **Landing page:** two main buttons – *Apply Now* and *Applicant / Admin Login* (dropdown). *Admin Login* goes straight to `/admin-login`.
- **Admission form:** now split into *Student details* and a separate *Guardian information* block (name, relationship, mobile, email, occupation).
- **Passwords:** show/hide eye icon on every password field.
- **Forgot password:** `/forgot-password` emails a one-time link (valid 30 min) to `/reset-password/:token`. Add the `SMTP_*` values in `server/.env` (see `.env.example`). With no SMTP set, the link is printed in the server console for local testing. Run `npm install` in `server` (adds `nodemailer`).
- **Academic information** is split into Class 10 and Class 12 cards (board dropdowns), then a **Qualifying examination** section (IEM-JEE / WB-JEE / JEE-MAINS need a mandatory rank, percentile optional) and a **Course applying for** section with grouped course options.
- **Email validation** shows friendly messages such as "'@gmail.com' is missing".
- **Fixed:** admin application review page (it requested `/applications/undefined`).
- **IEM logo** used on the landing page, sign-in pages, sidebar, receipt and as the browser-tab icon (`client/public`).

## Important prototype notes
- Payment is simulated. It does not connect to a bank, UPI app or payment gateway and must not be used to collect real fees.
- Uploaded files are stored locally in `server/uploads`. For production, use secure object storage and malware scanning.
- This is an academic prototype. Before production use, add HTTPS, rate limiting, email verification at sign-up, audit logs, backups, stronger admin provisioning, and production-grade file access controls.
- The requirements specify a maximum of 5 MB and PDF/JPG/JPEG/PNG formats. This implementation validates those limits on the server.
