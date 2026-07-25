const {getDefaultConfig}=require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config=getDefaultConfig(__dirname);

// Supabase's CommonJS bundle depends on packages that do not publish an
// exports map yet. Use Metro's classic resolution fallback for compatibility.
config.resolver.unstable_enablePackageExports=false;

module.exports=config;
