# Qivora

Qivora is a production-focused full-stack examination ecosystem built with:

- Frontend: React, Vite, Tailwind CSS, Framer Motion, React Router, Zustand, React Hook Form, Zod, Axios, TanStack Query
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs-compatible secure password hashing, Helmet, Rate Limit, CORS, dotenv, cookie-parser

## Features

- JWT auth with refresh cookie flow
- Role-based access for students, teachers, organizations, and admins
- Real exam builder with `Exam -> Subjects -> Questions`
- Scheduling with independent result release controls
- Secure attempt flow with fullscreen, blur, tab-switch, and clipboard violation logging
- Attempt autosave and one-attempt enforcement
- Unified result generation with subject analytics, ranks, GPA, grades, accuracy, strengths, and weaknesses
- Reviews, ratings, creator profiles, follow system, trending/public exam discovery
- Admin moderation for users and exams
- In-app AI assistant wired for Groq and Gemini API keys

## Structure

```text
frontend/
backend/
```

## Local setup

1. Copy environment templates:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

2. Fill in:

- `backend/.env`
  - `MONGODB_URI`
  - `JWT_ACCESS_SECRET`
  - `JWT_REFRESH_SECRET`
  - `CLIENT_URL`
  - Optional SMTP values for forgot-password email
  - Optional `GROQ_API_KEY`
  - Optional `GEMINI_API_KEY`
- `frontend/.env`
  - `VITE_API_BASE_URL`

3. Install and run:

```bash
npm install
npm run dev
```

4. Production builds:

```bash
npm run build
```

## Deployment

### Frontend on Vercel

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Env:
  - `VITE_API_BASE_URL=https://your-backend-domain/api`

### Backend on Render

- Root directory: `backend`
- Build command: `npm install && npm run build`
- Start command: `npm run start`
- Env:
  - `NODE_ENV=production`
  - `CLIENT_URL=https://your-frontend-domain`
  - `MONGODB_URI=...`
  - `JWT_ACCESS_SECRET=...`
  - `JWT_REFRESH_SECRET=...`
  - `COOKIE_SECURE=true`
  - Optional SMTP + AI keys

### MongoDB Atlas

- Create a cluster
- Add the backend host IP/network access
- Put the Atlas connection string into `MONGODB_URI`

## API overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/exams`
- `GET /api/exams/:examId`
- `POST /api/exams`
- `POST /api/exams/creator/:creatorId/follow`
- `POST /api/attempts/:examId/start`
- `PUT /api/attempts/:examId/save`
- `POST /api/attempts/:examId/submit`
- `POST /api/attempts/:examId/violations`
- `GET /api/results`
- `GET /api/results/:resultId`
- `POST /api/results/publish/:examId`
- `GET /api/reviews/:examId`
- `POST /api/reviews/:examId`
- `GET /api/admin/dashboard`
- `GET /api/notifications`
- `POST /api/ai/assistant`

## Notes

- Clipboard, blur, tab-switch, and fullscreen protections are implemented only with browser-supported techniques.
- PDF download/printing is modeled in result configuration and the browser print flow can be enabled from the result page extension layer if you want a dedicated export next.
- Old scaffold files from the previous single-root prototype remain in the repo, but the deployable app now lives in `frontend/` and `backend/`.
