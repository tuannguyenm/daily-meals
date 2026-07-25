# Daily Meals Supabase backend

## Cloud setup

1. Create a Supabase project.
2. In Authentication → Providers, enable **Anonymous Sign-Ins**.
3. Add the mobile callback URL `dailymeals://auth/callback` to Authentication redirect URLs.
4. Configure Google and Apple providers before enabling the account-link buttons in production.
5. Copy `.env.example` to `.env` and add the project URL and publishable key.
6. Install/login to the Supabase CLI, then link and deploy:

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
npx supabase functions deploy recommendations
```

The migration creates all application tables, seed meals, helper functions, and Row Level Security policies. The mobile app never needs a secret/service-role key.

## Local Supabase

Docker Desktop is required:

```bash
npx supabase start
npx supabase db reset
npx supabase functions serve recommendations
```
