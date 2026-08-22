# NearNow — See what students are building

NearNow is the collaboration and activity discovery platform for college student builders across India. Discover active student projects, find teammates, track skill missions, and showcase your builds in real time.

---

## Technical Stack

- **Framework**: Next.js 16.3.1 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + Vanilla CSS + Framer Motion + GSAP
- **Database & Auth**: Supabase (PostgreSQL, Supabase Auth, Row Level Security)
- **Supabase Integration**: `@supabase/supabase-js` + `@supabase/ssr`

---

## Backend & Database Architecture

### 1. Supabase PostgreSQL Schema
- **`public.profiles`**: Stores user profile details (`id`, `name`, `handle`, `avatar`, `college`) linked 1:1 with `auth.users(id)`. Automatically provisioned via PostgreSQL trigger on user sign-up.
- **`public.activities`**: Stores student activities, project launches, missions, and hackathon wins (`id`, `user_id`, `type`, `content`, `meta`, `tags`, `xp`, `created_at`).
- **Row Level Security (RLS)**: Enforces public read permissions (`SELECT`) and authenticated user write permissions (`INSERT`/`UPDATE`/`DELETE`) scoped to `auth.uid() = user_id`.

### 2. Supabase Auth & Session Management
- **`@supabase/ssr` Integration**:
  - `src/lib/supabase/client.ts`: Browser client (`createBrowserClient`) for client components.
  - `src/lib/supabase/server.ts`: Server client (`createServerClient`) utilizing Next.js `cookies()` for Server Components and Server Actions.
  - `src/proxy.ts` / `src/lib/supabase/middleware.ts`: Next.js 16 session proxy that refreshes auth tokens and updates response cookies on incoming requests.

### 3. Server Actions & API Layer
- **`src/lib/actions/auth.ts`**: Handles Sign Up (with auto profile creation), Sign In, Sign Out, and current user retrieval.
- **`src/lib/actions/activities.ts`**: Handles fetching feed activities (with category filtering and keyword search), fetching activity details by ID, and inserting user posts with RLS authorization.

---

## Key Features Implemented

- **Authentication & User Profile**:
  - Sign up with full name, college email, college name, and password.
  - Sign in with session cookie persistence across pages and reloads.
  - Navbar integration displaying user avatar, handle (`@handle`), and one-click logout.
- **Live Activity Feed (`/feed`)**:
  - Displays real activity records fetched dynamically from Supabase PostgreSQL.
  - Category filters (`Missions`, `Wins`, `Projects`, `Deployed`, `OSS`).
  - Real-time search query matching across builder names, content, colleges, and tech tags.
- **Activity Details (`/feed/[id]`)**:
  - Fetches single activity by UUID joined with profile information.
  - Handles missing/invalid IDs gracefully with error states.
  - Dynamically fetches related activities from the same campus or tech stack.
- **Create Activity Post (`/feed/create`)**:
  - Authenticated form requiring user login.
  - Category selector, description textarea, optional meta details, and tag picker.
  - Saves new record directly into PostgreSQL and updates the live feed.

---

## Local Setup & Configuration

### 1. Prerequisites
Ensure Node.js 18+ and `npm` are installed.

### 2. Environment Variables
Copy `.env.example` to `.env.local` and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
```
