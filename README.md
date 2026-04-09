# ScoreVista

ScoreVista is a full-stack multi-sport scoreboard and admin platform. It includes a **Next.js (React) frontend** and a **Node.js/Express backend** with MongoDB, JWT authentication, and admin tooling for managing sports, teams, matches, and highlight videos.

---

## 🧩 What’s Included

### Frontend (Next.js)
- **Next.js 13+ (App Router)** with Turbopack
- **Authentication flows**: user signup/login, admin signup/login via admin codes
- **Responsive UI** using a Tailwind-style design system and reusable UI components (`components/ui/*`)
- **Admin dashboard(s)** for each sport: manage teams/matches/highlights
- **Public site pages**: sports list, match list, highlights, news, profile, etc.
- **API client** in `lib/api.ts` (handles auth headers, JSON, form data)

### Backend (Express + MongoDB)
- **Express API** located in `backend/src/`
- **JWT authentication** (user + admin roles)
- **Admin code system** (one active admin per sport) with OTP-like workflow
- **Sports / Teams / Matches / Highlights endpoints** with role-based access
- **File upload support** (video highlights via Supabase storage)
- **CORS config** to allow requests from frontend origin(s)

---

## 🚀 Run Locally (Dev)

### 1) Start Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit backend/.env and set your MONGO_URI, JWT_SECRET, SUPABASE keys, and CORS_ORIGIN
npm run dev
```

### 2) Start Frontend

```bash
cd ..
pnpm install
# ensure .env.local has API URL (matches backend PORT)
# example:
# NEXT_PUBLIC_API_URL=http://localhost:5001
pnpm dev
```

Then open: `http://localhost:3000`

---

## 📦 Deployment Notes

### Frontend
- Ensure `NEXT_PUBLIC_API_URL` points to the deployed backend.
- For same-origin deployments (frontend + backend behind the same domain), `NEXT_PUBLIC_API_URL` can be omitted (frontend will use `window.location.origin`).

### Backend
- Make sure `CORS_ORIGIN` includes your frontend domain (or set to `*` for testing).
- `PORT` default is `5001`.

---

## 🔐 Auth Overview

### Users
- Signup: `POST /api/auth/register`
- Login: `POST /api/auth/login`
- Uses JWT stored in browser localStorage

### Admins
- Request admin code: `POST /api/auth/admin/request-otp`
- Verify code & set password: `POST /api/auth/admin/verify-otp`
- Login with code: `POST /api/auth/admin/login`

---

## 📁 Key Files / Folders

- `app/` — Next.js frontend routes and pages
- `components/` — shared UI and layout components
- `lib/api.ts` — API client used by frontend
- `backend/src/` — Express API server
- `backend/.env.example` — backend required environment variables

---

## ✅ Useful Tips

- If you see `Failed to fetch` in the browser console, verify:
  - Backend is running
  - `NEXT_PUBLIC_API_URL` is correct and matches the backend URL
  - Backend CORS is configured properly (frontend origin included)

- For production, set secure JWT secrets and use HTTPS.

---

If you'd like, I can also add a quick **deployment checklist** for common hosts (Vercel/Netlify/Heroku) and a short **API reference** for key endpoints.