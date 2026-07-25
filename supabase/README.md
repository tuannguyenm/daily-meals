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

## Synced app flows

- Selecting or completing a meal updates the matching slot in today's plan.
- Recipe ingredients and Shopping changes are written atomically to the active shopping list.
- Shopping item positions are stored so checking an item does not reorder the list.
- The app updates optimistically, keeps its local cache offline, and offers a retry action when Supabase is unavailable.

# Google account linking

Daily Meals starts each new installation with Supabase Anonymous Sign-In. The
Settings screen upgrades that same user to Google with `linkIdentity`, so the
user ID and all rows protected by RLS stay unchanged.

The repository config enables manual linking and allows the app callback
`dailymeals://auth/callback`. Google itself still requires credentials created
in Google Auth Platform:

1. Create an OAuth client of type **Web application**.
2. Add `https://wtjtdlpusfmgssuhmdie.supabase.co/auth/v1/callback` as an
   authorized redirect URI.
3. In Supabase Dashboard, open **Authentication → Providers → Google**, enable
   Google, then paste the client ID and client secret.
4. Confirm **Authentication → URL Configuration** allows
   `dailymeals://auth/callback`.
5. Confirm **Authentication → Sign In / Providers** has manual identity linking
   enabled.

The Google client secret belongs only in Google/Supabase configuration. It must
never be added to the Expo environment or committed to this repository.
