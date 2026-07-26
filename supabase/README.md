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
npx supabase functions deploy recommendations --no-verify-jwt
```

The migration creates all application tables, seed meals, helper functions, and Row Level Security policies. The mobile app never needs a secret/service-role key.

## OpenAI recommendations

The `recommendations` Edge Function calls the OpenAI Responses API with strict
structured output. It only accepts meal IDs already present in the Supabase
catalog. Invalid output, timeouts, API errors, or a missing key automatically
fall back to deterministic rules, so the meal flow remains available.

Set the server-only secret from your own terminal (never add it to `.env` or
the Expo bundle):

```bash
npx supabase secrets set OPENAI_API_KEY=YOUR_KEY OPENAI_MODEL=gpt-5.4-mini
npx supabase functions deploy recommendations --no-verify-jwt
```

`gpt-5.4-mini` is the default for this high-volume, well-defined selection
task. Override `OPENAI_MODEL` without changing code if another compatible
model is preferred.

The function is deployed with the gateway JWT check disabled because Supabase
publishable-key sessions are validated inside the function with
`auth.getUser()`. It still rejects missing/invalid sessions and verifies family
membership before reading or writing family data.

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

## Scalable meal catalog

The app reads published meals from Supabase through `search_meal_catalog`, with
server-side search, filters and pagination. Images are served by the public
`meal-images` Storage bucket. The bundled meal data remains an offline fallback.

New content is imported from versioned JSON instead of being hard-coded in the
mobile app:

```bash
npm run catalog:validate -- content/catalog.example.json
npm run catalog:import -- content/catalog.example.json --dry-run
```

For a real import, set the service-role key only in the current terminal and run
the command without `--dry-run`:

```bash
$env:SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVER_ONLY_KEY"
npm run catalog:import -- path/to/catalog.json
```

The service-role key is an administrative secret. Never put it in `.env`, Expo,
the app bundle, Git, or a client-side CI variable. Use a protected server/CI
secret when imports are automated.

Imported meals should normally start with `"status": "review"`. Only
`"published"` meals are returned to the app. Every entry records its source,
license and content version, and every import creates an auditable batch record.

### Current production seed

The 30 bundled MVP meals use 30 distinct WebP covers. The 21 recipes that
previously shared a generic instruction template are maintained in
`content/curated-extra-recipes.json`; the original nine recipes remain in the
app seed. Database migration `202607260007_production_catalog_content.sql`
publishes the same recipe content and checksum-versioned Storage paths.

For a later intentional content/image revision, always generate a new migration
timestamp; never overwrite a migration already applied to Supabase:

```bash
npm run catalog:prepare-production -- --migration=YYYYMMDDHHMMSS_catalog_revision.sql
npx supabase --experimental storage cp -r .catalog-upload ss:///meal-images/production --linked --jobs 5
npx supabase db push --linked
npm run catalog:smoke
```

The current content and images are AI-assisted, labeled with
`source_type=ai_generated` and an internal-use license. A culinary editor should
review cooking safety, allergens, nutrition and regional authenticity before a
commercial release or medical/dietary claims are added.
