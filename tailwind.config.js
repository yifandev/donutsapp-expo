/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Semantic Aliases (for easier use)
        primary: "#6D2F13",
        secondary: "#C25322",
        accent: "#AE562F",
        muted: "#EDECE3",
        background: "#EDECE3",
      },
    },
  },
  plugins: [],
};
