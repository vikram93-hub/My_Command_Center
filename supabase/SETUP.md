# Supabase setup for My Command Center

## 1. Create the database table

Open your Supabase project, go to **SQL Editor**, create a new query, paste the full contents of [schema.sql](./schema.sql), and run it.

The table stores one JSONB workspace per authenticated user. Row Level Security restricts reads and writes to the matching `auth.uid()`.

## 2. Configure authentication

In **Authentication → URL Configuration**, add your deployed Vercel URL to the allowed redirect/site URLs. During initial testing, you can temporarily disable email confirmation under **Authentication → Providers → Email** if you want immediate password sign-in; otherwise users must confirm their email before signing in.

Use the same email/password account on each device.

## 3. Add environment variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
```

In Vercel, add the same two variables under **Project → Settings → Environment Variables** for Preview and Production, then redeploy.

Only the Supabase project URL and publishable/anon key belong in browser environment variables. Never add the `service_role` key or database password.

## 4. First login and migration

On the laptop that has the existing browser data, sign in and choose **Migrate data from this browser**. If the browser data is unavailable, choose **Import backup and sync** and select the JSON export from Settings → Workspace data.

Do not clear the old browser storage or delete the JSON backup until the dashboard has loaded and you have checked the tasks, habits, timetable, and roadmaps.

## Current scope

- Email/password sign-up and sign-in.
- One private workspace per Supabase user, protected by RLS.
- Import from the existing browser storage or the app's JSON export.
- Cloud writes when the existing dashboard updates its supported local-storage keys.
- Other signed-in devices check for remote changes periodically.

The optional public read-only share link is not included in this first cloud-sync change. It should be added separately with explicit field selection and revocation.
