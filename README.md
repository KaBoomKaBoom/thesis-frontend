# Thesis Frontend

Frontend for an educational exam-prep platform (BAC + 9th grade) built with Next.js.

## What is implemented

- Authentication flow: register, OTP verification, login, token storage
- User profile: view + update profile
- User activity: list of taken sessions in profile
- Session details page: full per-session breakdown with question/answer image previews
- Dashboard page:
  - stats cards
  - recent sessions list
  - score trend chart
  - topic analytics (strongest/weakest questions)
- Test flow:
  - load tests by filters
  - generate test
  - start test by ID
  - answer image-based questions
  - register + verify test session
  - result summary + per-question status
- Localization (i18n): English, Romanian, Russian
- Theme support: Light / Dark toggle
- Next.js API proxy routes for test/session/image/dashboard endpoints

---

## Tech stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- shadcn/ui + Radix UI
- next-themes (theme switching)
- Recharts (dashboard chart)
- lucide-react icons

---
 
## Demo

A short demo video showcasing the app is included in this repository.

[![Demo](Demo-poster.svg)](Demo.mp4)

View directly: [Demo.mp4](Demo.mp4)

---

## Run locally

### Prerequisites

- Node.js 18+ (recommended: LTS)
- Backend services running:
  - Main API: `http://localhost:8080`
  - Test API: `http://localhost:8070`

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_TEST_API_BASE_URL=http://localhost:8070
```

### 3) Start dev server

```bash
npm run dev
```

Open: `http://localhost:3000`

### Build / start

```bash
npm run build
npm run start
```

### Lint

```bash
npm run lint
```

If ESLint is missing in your environment:

```bash
npm install -D eslint
```

---

## App routes

- `/` — landing page
- `/login` — login
- `/register` — registration
- `/verify` — OTP verification
- `/dashboard` — dashboard statistics
- `/tests` — test workflow
- `/profile` — profile + activity + achievements
- `/profile/activity/[sessionId]` — dedicated session details page

---

## API architecture

The frontend uses:

1) **Direct calls to Main API** (`NEXT_PUBLIC_API_BASE_URL`) for auth + profile
2) **Next.js API proxy routes** (`/app/api/*`) for test/session/image/dashboard flows

This keeps browser calls same-origin and avoids CORS issues for test endpoints.

### Direct API usage

- `POST /api/auth/register`
- `POST /api/auth/verify-otp`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/api-health`
- `GET /api/auth/db-health`
- `GET /api/user/profile` (Bearer)
- `PUT /api/user/profile` (Bearer)

### Frontend proxy routes

- `GET /api/test?type=...&language=...` → `{TEST_API}/test`
- `POST /api/test/generate` → `{TEST_API}/test/generate`
- `GET /api/test/[testId]` → `{TEST_API}/test/{id}`
- `GET /api/question/[questionId]/image` → `{TEST_API}/question/{id}/image`
- `GET /api/answer/[answerId]/image` → `{TEST_API}/answer/{id}/answer_image`
- `POST /api/test-session/register` (Bearer) → `{MAIN_API}/api/testSession/testSession`
- `POST /api/test-session/verify/[sessionId]` (Bearer) → `{MAIN_API}/api/testSession/verifyTest/{id}`
- `GET /api/test-session/activity/sessions` (Bearer) → `{MAIN_API}/api/testSession/activity/sessions`
- `GET /api/test-session/activity/sessions/[sessionId]` (Bearer) → `{MAIN_API}/api/testSession/activity/sessions/{id}`
- `GET /api/user/dashboard` (Bearer) → `{MAIN_API}/api/user/dashboard`

---

## Main project structure

```text
app/
  api/
    answer/[answerId]/image/route.ts
    question/[questionId]/image/route.ts
    test/route.ts
    test/[testId]/route.ts
    test/generate/route.ts
    test-session/register/route.ts
    test-session/verify/[sessionId]/route.ts
    test-session/activity/sessions/route.ts
    test-session/activity/sessions/[sessionId]/route.ts
    user/dashboard/route.ts
  dashboard/page.tsx
  login/page.tsx
  profile/page.tsx
  profile/activity/[sessionId]/page.tsx
  register/page.tsx
  tests/page.tsx
  verify/page.tsx
  layout.tsx
  page.tsx

components/
  auth/
  dashboard/
  i18n/
  profile/
  tests/
  ui/
  theme-provider.tsx
  theme-toggle.tsx

lib/
  api/
  types/
  api-config.ts
  i18n.ts
```

---

## Localization

Implemented via custom i18n provider:

- Locales: `en`, `ro`, `ru`
- Files:
  - `lib/i18n.ts` (dictionary)
  - `components/i18n/i18n-provider.tsx`
  - `components/i18n/language-switcher.tsx`
- Persisted in `localStorage` (`locale`)

---

## Theme support

Implemented with `next-themes`:

- Global provider in `app/layout.tsx`
- Toggle component: `components/theme-toggle.tsx`
- Uses CSS token sets in `app/globals.css`
- Works with existing Tailwind token-based styling

---

## Data types

Core DTOs are defined in:

- `lib/types/auth.ts`
- `lib/types/user.ts`
- `lib/types/test.ts`

Notable additions include:

- Dashboard response DTOs (`UserDashboardDTO`, stats/trend/topic analytics)
- Session activity DTOs (`SessionActivitySummary`, `SessionActivityDetail`)

---

## Notes

- Auth tokens are stored in `localStorage` as:
  - `authToken`
  - `refreshToken`
- Session detail page supports clickable image previews in modal dialogs.
- Test filter UI currently uses dropdown menus for both **Type** and **Language**.
- Some historical docs (`API_INTEGRATION.md`, `PROFILE_INTEGRATION.md`, `TestEndpoints.md`) may contain older intermediate states; this README reflects the current implemented frontend behavior.
