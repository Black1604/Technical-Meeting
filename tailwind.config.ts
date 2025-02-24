import type { Config } from "tailwindcss";
import { themeConfig } from "./src/config/theme";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: themeConfig.spacing.container,
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        primary: themeConfig.colors.primary,
        secondary: themeConfig.colors.secondary,
        background: themeConfig.colors.background,
      },
      fontFamily: themeConfig.fonts,
      borderRadius: themeConfig.borderRadius,
      transitionTimingFunction: {
        DEFAULT: themeConfig.transitions.default,
      },
    },
  },
  plugins: [],
};

export default config;
