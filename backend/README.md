# ScoreVista Backend

Production-ready Node.js backend for the ScoreVista multi-sport scoreboard. Uses Express, MongoDB (Mongoose), JWT auth, and Supabase for video storage.

## Requirements

- Node.js 18+
- MongoDB Atlas cluster
- Supabase project (for highlight video storage)

## Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret for signing JWTs (use a long random string in production) |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (for server-side uploads) |
| `PORT` | Server port (default 5000) |
| `CORS_ORIGIN` | Allowed frontend origin(s), comma-separated (e.g. `http://localhost:3000`) |

## Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

Production:

```bash
npm start
```

## Supabase Setup

1. In Supabase Dashboard → Storage, create a bucket named **`highlight-videos`**.
2. Set bucket to **Public** if you want public video URLs, or keep private and use signed URLs (you’d need to generate signed URLs in the API when returning highlight data).
3. The bucket name is set in `src/config/supabase.js` as `BUCKET_HIGHLIGHTS = 'highlight-videos'`.

## API Overview

Base URL: `http://localhost:5000` (or your `PORT`).

### Authentication

- **POST** `/api/auth/register` – Register user (body: `email`, `password`, `name?`)
- **POST** `/api/auth/login` – User login (body: `email`, `password`)
- **GET** `/api/auth/me` – Current user (header: `Authorization: Bearer <token>`)
- **POST** `/api/auth/admin/request-otp` – Request admin code (body: `email`, `name`, `sport`). Enforces **one active admin per sport**.
- **POST** `/api/auth/admin/verify-otp` – Verify code and set password (body: `code`, `password`)
- **POST** `/api/auth/admin/login` – Admin login with code + password (body: `code`, `password`)

### Sports

- **GET** `/api/sports` – List (query: `active=true|false`)
- **GET** `/api/sports/:id` – Get by id or slug
- **POST** `/api/sports` – Create (auth required; body: `name`, `slug?`, `icon?`, `description?`)
- **PATCH/PUT** `/api/sports/:id` – Update
- **DELETE** `/api/sports/:id` – Delete

### Teams

- **GET** `/api/teams` – List (query: `sport=cricket`)
- **GET** `/api/teams/:id` – Get one
- **POST** `/api/teams` – Create (admin, body: `name`, `sport?`, `players`, `wins`, `losses`, `captain?`, etc.)
- **PATCH/PUT** `/api/teams/:id` – Update (admin, same sport)
- **DELETE** `/api/teams/:id` – Delete (admin)

### Matches

- **GET** `/api/matches` – List (query: `sport`, `status`)
- **GET** `/api/matches/:id` – Get one
- **POST** `/api/matches` – Create (admin, body: `team1`, `team2`, `sport`, `venue`, `date`, `time`, `status`, `score1`, `score2`, etc.)
- **PATCH/PUT** `/api/matches/:id` – Update (admin)
- **PATCH** `/api/matches/:id/live` – Update live score (admin, body: `score1`, `score2`, `status`, `overs1`, `overs2`)
- **DELETE** `/api/matches/:id` – Delete (admin)

### Highlights

- **GET** `/api/highlights` – List (query: `sport`)
- **GET** `/api/highlights/:id` – Get one
- **POST** `/api/highlights` – Create (admin, multipart: `video` file or body `videoUrl`; body: `title`, `sport`, `description`, `duration`, `date`)
- **PATCH/PUT** `/api/highlights/:id` – Update (admin)
- **DELETE** `/api/highlights/:id` – Delete (admin)

Video upload: send as `multipart/form-data` with field name `video`. File is uploaded to Supabase bucket and the public URL is stored in the document.

## Design Notes

- **One sport = one active admin:** Requesting an admin code for a sport that already has an active admin returns 409.
- Admin endpoints that are sport-scoped (teams, matches, highlights) check that the admin’s `sport` matches the resource’s `sport`.
- JWT payload includes `id`, `role` (`user` | `admin`), and for admin `sport`.
- All error responses use `{ success: false, message: string }` and appropriate HTTP status codes.
