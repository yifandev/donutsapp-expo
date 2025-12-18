const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

config.resolver.unstable_enablePackageExports = true; // Enable package exports resolution

module.exports = withNativeWind(config, { input: "./global.css" });
