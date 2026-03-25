# Thesis Frontend

## Contents

- [1. Project Title](#1-project-title)
- [2. Project Purpose](#2-project-purpose)
- [3. Technologies and Instruments Used](#3-technologies-and-instruments-used)
- [4. Instructions to Run the Project](#4-instructions-to-run-the-project)
- [5. Project Structure](#5-project-structure)
- [6. Endpoint Reference (Frontend + Backend)](#6-endpoint-reference-frontend--backend)
- [7. Data Types Used in the Project](#7-data-types-used-in-the-project)
- [8. Feature Walkthrough](#8-feature-walkthrough)
- [Notes](#notes)

## 1. Project Title

### **Educational Web Platform for Assessing and Preparing Students for National Examinations**

---

## 2. Project Purpose

This project is a web frontend for an educational platform focused on exam preparation (BAC and 9th grade) for students in Moldova.

Main goals:
- Provide authentication flow (register, login, OTP verification)
- Allow users to view and update profile data
- Enable test workflow: load/generate test, answer image-based questions, submit session, verify results
- Offer a modern UI and responsive experience for students

---

## 3. Technologies and Instruments Used

### Core stack
- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**

### UI and UX
- **shadcn/ui** component architecture (Radix UI primitives)
- **lucide-react** icons
- **sonner / toast hooks** for notifications

### Forms and validation
- **react-hook-form**
- **zod**

### Data and integration
- Native `fetch` for API calls
- Dedicated API service layer in `lib/api`
- Next.js API proxy routes in `app/api` (used to avoid browser CORS issues for test endpoints)

### Tooling
- `npm` package manager (also `pnpm-lock.yaml` exists)
- TypeScript compiler settings in `tsconfig.json`

---

## 4. Instructions to Run the Project

### Prerequisites
- **Node.js 18+** (recommended: latest LTS)
- Running backend services:
	- Main API: `http://localhost:8080`
	- Test service API: `http://localhost:8070`

### Setup
1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` in the project root (can be based on `.env.local.example`):

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_TEST_API_BASE_URL=http://localhost:8070
```

> If `NEXT_PUBLIC_TEST_API_BASE_URL` is missing, the app falls back to `http://localhost:8070` by default.

3. Start development server:

```bash
npm run dev
```

4. Open the app:

```text
http://localhost:3000
```

### Production commands

```bash
npm run build
npm run start
```

### Linting

```bash
npm run lint
```

If lint fails with `eslint is not recognized`, install ESLint in the project:

```bash
npm install -D eslint
```

---

## 5. Project Structure

```text
thesis-frontend/
├── app/                          # Next.js App Router pages + API routes
│   ├── api/                      # Next.js server proxy routes (test/session/image forwarding)
│   ├── login/                    # Login page
│   ├── register/                 # Registration page
│   ├── verify/                   # OTP verification page
│   ├── profile/                  # Profile page
│   ├── tests/                    # Test-taking page
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/                   # UI and feature components
│   ├── auth/                     # Auth forms/layout
│   ├── dashboard/                # Header/navigation
│   ├── profile/                  # Profile feature components
│   ├── tests/                    # Test flow UI
│   └── ui/                       # Reusable shadcn/ui components
├── hooks/                        # Custom hooks (toast, mobile, etc.)
├── lib/
│   ├── api/                      # API clients (auth, user, test)
│   ├── types/                    # TypeScript DTOs and models
│   ├── api-config.ts             # API base URLs and endpoints
│   └── utils.ts                  # Shared utilities
├── public/                       # Static assets
├── styles/                       # Global styles
├── API_INTEGRATION.md            # Auth and user integration details
├── PROFILE_INTEGRATION.md        # Profile flow notes
├── TestEndpoints.md              # Test module endpoint references
├── next.config.mjs               # Next.js config
├── tsconfig.json                 # TypeScript config
└── package.json                  # Scripts and dependencies
```

---

## 6. Endpoint Reference (Frontend + Backend)

This project uses two backend services:
- **Main API** (`NEXT_PUBLIC_API_BASE_URL`, default `http://localhost:8080`) for auth, profile, and test-session actions
- **Test API** (`NEXT_PUBLIC_TEST_API_BASE_URL`, default `http://localhost:8070`) for tests and question/answer images

For the test module, browser calls are routed through **Next.js API proxy routes** (`app/api/*`) to avoid CORS preflight issues.

### Authentication (direct frontend → main API)

- `GET /api/auth/api-health` — check API availability
- `GET /api/auth/db-health` — check database availability
- `POST /api/auth/register` — register user
- `POST /api/auth/verify-otp` — verify OTP
- `POST /api/auth/login` — login and receive tokens
- `POST /api/auth/refresh` — refresh auth token

### User profile (direct frontend → main API, requires JWT)

- `GET /api/user/profile` — fetch current user profile
- `PUT /api/user/profile` — update current user profile

### Test flow (frontend → Next proxy → test/main APIs)

- Frontend `GET /api/test?type={type}&language={lang}` → backend `GET {TEST_BASE_URL}/test`
- Frontend `POST /api/test/generate` → backend `POST {TEST_BASE_URL}/test/generate`
- Frontend `GET /api/test/{testId}` → backend `GET {TEST_BASE_URL}/test/{testId}`
- Frontend `GET /api/question/{questionId}/image` → backend `GET {TEST_BASE_URL}/question/{questionId}/image`
- Frontend `GET /api/answer/{answerId}/image` → backend `GET {TEST_BASE_URL}/answer/{answerId}/answer_image`
- Frontend `POST /api/test-session/register` (Bearer JWT) → backend `POST {API_BASE_URL}/api/testSession/testSession`
- Frontend `POST /api/test-session/verify/{sessionId}` (Bearer JWT) → backend `POST {API_BASE_URL}/api/testSession/verifyTest/{sessionId}`

---

## 7. Data Types Used in the Project

### Authentication DTOs (`lib/types/auth.ts`)

- `UserToRegisterDTO`: `{ firstName, lastName, email, password, role }`
- `UserToLoginDTO`: `{ email, password }`
- `VerifyOTPDTO`: `{ email, otp }`
- `RefreshTokenRequest`: `{ token }`
- `AuthResponse`: optional `{ token, refreshToken, message, error }`

### User profile DTOs (`lib/types/user.ts`)

- `UserProfileDTO`: `{ firstName, lastName, email, role, ...optional fields }`
	- Optional: `phone`, `location`, `dateOfBirth`, `gradeLevel`, `school`, `bio`
- `UserToUpdateDTO`: payload for profile update
	- `{ firstName, lastName, email, phoneNumber, location, gradeLevel, school, biography }`
- `UpdateProfileResponse`: `{ message, profile }`

### Test DTOs (`lib/types/test.ts`)

- `TestQuestionSlot`
	- `{ position, question_id, correct_answer_id, incorrect_answer_ids[] }`
- `AvailableTest`
	- `{ test_id, type, language, questions: TestQuestionSlot[] }`
- `GenerateTestRequest`
	- `{ type, language }`
- `RegisterTestComponent`
	- `{ id, answer_id, question_id }`
- `RegisterTestSessionRequest`
	- `{ testId, testComponents: RegisterTestComponent[] }`
- `VerifyTestResponse`
	- `{ resultId, sessionId, totalQuestions, correctAnswers, skipped, scorePercentage, detailedResults[], verifiedAt }`

### Error model

All API services can throw `ApiException` with:
- `message`
- `status`
- optional `errors` (field-level backend validation messages)

---

## 8. Feature Walkthrough

### A. Registration and authentication flow

1. User opens `/register` and submits registration form.
2. App calls `POST /api/auth/register`.
3. User is redirected to `/verify` and enters OTP.
4. App calls `POST /api/auth/verify-otp`.
5. On successful verification/login, tokens are stored in `localStorage` (`authToken`, `refreshToken`).

### B. Profile flow

1. User opens `/profile`.
2. App reads JWT from `localStorage` and calls `GET /api/user/profile`.
3. Profile data is rendered in UI.
4. User edits profile and submits changes.
5. App calls `PUT /api/user/profile` and updates the displayed data.

### C. Test-taking flow

1. User opens `/tests` from **Take a Test** navigation.
2. User can either:
	 - load available tests by type/language, or
	 - generate a new test.
3. When user selects a test from list, app fetches **full test details by ID** before starting.
4. Questions are shown one by one as images; each question displays 4 answer images.
5. Selected answers are stored locally in state and mapped into:
	 - `RegisterTestSessionRequest = { testId, testComponents[] }`
6. On final question, submit button appears only after selecting an answer.
7. App registers session (`POST /api/test-session/register`) with JWT.
8. App verifies session (`POST /api/test-session/verify/{sessionId}`) with same payload.
9. UI shows final score summary and per-question status (correct/incorrect/skipped).

---

## Notes

- Authentication token is stored in browser `localStorage` as `authToken`.
- Test session registration and verification require JWT and are proxied through `app/api/test-session/*`.
- Test question and answer images are loaded via same-origin proxy endpoints in `app/api/question/*` and `app/api/answer/*`.
