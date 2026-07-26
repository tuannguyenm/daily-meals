# Android release

The repository is configured with three EAS profiles:

- `development`: installable development-client APK.
- `preview`: installable release APK for internal QA.
- `production`: signed Android App Bundle (`.aab`) for Google Play.

## One-time setup

```powershell
npx eas-cli login
npx eas-cli init
```

Add the public runtime configuration to the `preview` and `production` EAS
environments:

```powershell
npx eas-cli env:create --environment production --name EXPO_PUBLIC_SUPABASE_URL --value "https://PROJECT.supabase.co" --visibility plaintext
npx eas-cli env:create --environment production --name EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY --value "sb_publishable_..." --visibility sensitive
npx eas-cli env:create --environment production --name EXPO_PUBLIC_SENTRY_DSN --value "https://PUBLIC_KEY@HOST/PROJECT" --visibility plaintext
```

For symbolicated Sentry native and JavaScript stack traces, also configure
`SENTRY_AUTH_TOKEN` as `sensitive`, plus `SENTRY_ORG` and `SENTRY_PROJECT`.
Never prefix the auth token with `EXPO_PUBLIC_`.

If Sentry credentials have not been configured yet, local native builds can
skip source-map upload without disabling crash reporting at runtime:

```powershell
$env:SENTRY_DISABLE_AUTO_UPLOAD="true"
```

## Build

```powershell
npm run build:android:preview
npm run build:android:production
```

EAS manages the Android upload key and automatically increments the remote
version code. The preview build is an APK; production is an AAB.

To verify the native release pipeline locally for a modern Android device:

```powershell
$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"
$env:NODE_ENV="production"
$env:SENTRY_DISABLE_AUTO_UPLOAD="true"
Set-Location android
.\gradlew.bat app:bundleRelease -PreactNativeArchitectures=arm64-v8a
```

This local bundle uses the repository's development signing configuration and
is only a compile check. Use the EAS production profile for a Play-ready,
properly signed bundle.

## Internal Play Store release

Create the app with package `com.dailymeals.family` in Google Play Console.
After configuring an EAS Submit service account:

```powershell
npm run submit:android:internal
```

The default submit track is `internal`. Promote the tested build in Google Play
Console instead of uploading a different binary.
