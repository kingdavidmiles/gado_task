# Task Management App

A modern task management application built with **Next.js**, **Supabase**, and **Prisma**, allowing users to create, view, and delete tasks. It includes authentication, real-time task fetching, and modals for creating tasks.

---

## Features

- User authentication via Supabase
- Create, view, and delete tasks
- Responsive UI with Tailwind CSS
- SweetAlert2 for user-friendly alerts
- Modal component for task creation
- TypeScript for type safety

---

## Tech Stack

- **Next.js** (App Router)
- **TypeScript**
- **Supabase** (Auth + Database)
- **Prisma** (ORM)
- **Tailwind CSS**
- **Lucide Icons**
- **SweetAlert2** for alerts

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/kingdavidmiles/gado_task.git
cd gado_task
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

Create a `.env` file in the root with the following:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Replace with your Supabase project credentials and PostgreSQL connection string.

### 4. Prisma setup

Generate Prisma client:

```bash
npx prisma generate
```

Run migrations:

```bash
npx prisma migrate dev --name init
```

### 5. Run the development server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Database Schema Notes

Task model (Prisma schema):

```prisma
model Task {
  id          String   @id @default(uuid())
  title       String
  description String
  userId      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  @@index([userId])
}
```

- `createdAt` stores when a task is created.
- `updatedAt` automatically updates when a task is modified.
- `userId` links a task to a Supabase authenticated user.
- Indexed `userId` for faster querying per user.

## Implementation Decisions

- Supabase handles authentication and session management.
- Prisma handles PostgreSQL database interactions.
- SweetAlert2 is used for deletion confirmations and success/error notifications.
- Task timestamps are stored in UTC and formatted in the client for display.
- Tasks are fetched only for the logged-in user.
- Modal `CreateTaskModal` communicates back to `TasksPage` via `onTaskCreated` callback.

## Scripts

- `npm run dev` - start the dev server
- `npm run build` - build the app
- `npm start` - start the production server
- `npx prisma generate` - generate Prisma client
- `npx prisma migrate dev` - run migrations

## Notes

- Make sure your Supabase auth policies allow CRUD operations on tasks.
- All API requests are authenticated using Supabase session tokens.
- Dates returned from Supabase are ISO strings and formatted in the frontend.

---

## Author

**David Miles**  
GitHub: [kingdavidmiles](https://github.com/kingdavidmiles)  
Portfolio: [dmiles.vercel.app](https://dmiles.vercel.app)