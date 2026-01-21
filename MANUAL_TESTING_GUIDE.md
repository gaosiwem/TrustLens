# Manual Application Verification Guide

This guide outlines how to verify the integrity and correctness of your `TrustLens` application (Frontend and Backend) without launching the full application stack (i.e., without running `npm run dev` or `npm start`).

## Prerequisites

Ensure you are in the root directory of your project or the respective `frontend`/`backend` directories as specified.

---

## Part 1: Static Analysis & Build Verification

These steps check if your code is syntactically correct, types manage up, and if the project _can_ build.

### 1. Frontend Verification

Navigate to `frontend/`:

```powershell
cd frontend
```

**Step A: Type Checking**
Run the TypeScript compiler without emitting files. This checks for type errors (like the one we just fixed in `NotificationBell`).

```powershell
npx tsc --noEmit
```

- **Result**: If silent, your types are good. If errors appear, they need fixing.

**Step B: Linting**
Check for code style and potential bugs using ESLint.

```powershell
npm run lint
```

- **Result**: Look for "Errors" (must fix) vs "Warnings" (should fix).

**Step C: Build Dry-Run**
Attempt a production build. This is the ultimate "will it run?" test.

```powershell
npm run build
```

- **Result**: If this completes successfully, your frontend is 99% guaranteed to start.

### 2. Backend Verification

Navigate to `Backend/`:

```powershell
cd ../Backend
```

**Step A: Type Checking**

```powershell
npx tsc --noEmit
```

**Step B: Prisma Schema Validation**
Verify your database schema file is valid.

```powershell
npx prisma validate
```

- **Result**: "The schema is valid" means your data model is syntactically correct.

---

## Part 2: Automated Unit Testing

Run the logic tests defined in your codebase. This tests specific functions without starting the server.

### 1. Frontend Tests

```powershell
cd ../frontend
npm test
```

- **Note**: This runs `jest`. It tests components and hooks in isolation.

### 2. Backend Tests

```powershell
cd ../Backend
npm test
```

- **Note**: This runs `jest` for backend services. You may need a local test database configured depending on your test setup.

---

## Part 3: Manual Code Review Checklist

Since you asked to "manually test" without running, this involves reading code to verify connections.

### 1. Check Environment Variables

Verify that your `.env` files exist and contain the necessary keys matching your code usage.

- **Frontend**: Check `.env.local` or `.env`.
  - Look for `NEXT_PUBLIC_API_URL` (Used in `useSocket.ts`).
- **Backend**: Check `.env`.
  - Look for `DATABASE_URL`, `JWT_SECRET`, `PORT`.

### 2. Verify Critical Integration Points

Manually trace these file paths to ensure the "plumbing" connects:

- **Socket Connection**:
  - Open `frontend/src/hooks/useSocket.ts`.
  - Verify the URL points to your backend (usually `http://localhost:3000` or env var).
- **API Calls**:
  - Open `frontend/src/app/api/...` or wherever you make generic fetch calls.
  - Ensure the base URL matches your backend's listening port.
- **Database Client**:
  - Open `Backend/src/prismaClient.ts`.
  - Ensure it exports a `prisma` instance used by your services.

---

## Part 4: Database Connectivity Check (Optional)

If you want to ensure the backend _can_ talk to the database without starting the app:

```powershell
cd Backend
npx prisma db pull
```

- **Warning**: This attempts to connect to the DB defined in your `.env`.
- **Result**: If it succeeds (or says "No changes"), your database connection is working. If it fails, your DB is down or credentials are wrong.

---

## Summary of Commands

| Component    | Action      | Command               |
| :----------- | :---------- | :-------------------- |
| **Frontend** | Type Check  | `npx tsc --noEmit`    |
| **Frontend** | Lint        | `npm run lint`        |
| **Frontend** | Build       | `npm run build`       |
| **Frontend** | Test        | `npm test`            |
| **Backend**  | Type Check  | `npx tsc --noEmit`    |
| **Backend**  | Validate DB | `npx prisma validate` |
| **Backend**  | Test        | `npm test`            |
