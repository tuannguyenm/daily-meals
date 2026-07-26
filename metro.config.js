const {getSentryExpoConfig}=require('@sentry/react-native/metro');

/** @type {import('expo/metro-config').MetroConfig} */
const config=getSentryExpoConfig(__dirname);

// Supabase's CommonJS bundle depends on packages that do not publish an
// exports map yet. Use Metro's classic resolution fallback for compatibility.
config.resolver.unstable_enablePackageExports=false;

module.exports=config;
