import { type Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // SDS Brand Colors
        sds: {
          // Primary brand purple
          brand: "hsl(var(--sds-brand))",
          "brand-light": "hsl(var(--sds-brand-light))",
          "brand-dark": "hsl(var(--sds-brand-dark))",
          "brand-darker": "hsl(var(--sds-brand-darker))",
          // Secondary teal/cyan
          accent: "hsl(var(--sds-accent))",
          "accent-teal": "hsl(var(--sds-accent-teal))",
          // Status colors
          success: "hsl(var(--sds-success))",
          warning: "hsl(var(--sds-warning))",
          error: "hsl(var(--sds-error))",
          // Neutral colors
          gray: "hsl(var(--sds-gray))",
          "gray-light": "hsl(var(--sds-gray-light))",
          "gray-dark": "hsl(var(--sds-gray-dark))",
          white: "hsl(var(--sds-white))",
          "off-white": "hsl(var(--sds-off-white))",
          // Professional colors
          purple: {
            50: "hsl(var(--sds-purple-50))",
            100: "hsl(var(--sds-purple-100))",
            200: "hsl(var(--sds-purple-200))",
            300: "hsl(var(--sds-purple-300))",
            400: "hsl(var(--sds-purple-400))",
            500: "hsl(var(--sds-purple-500))",
            600: "hsl(var(--sds-purple-600))",
            700: "hsl(var(--sds-purple-700))",
            800: "hsl(var(--sds-purple-800))",
            900: "hsl(var(--sds-purple-900))",
          },
          teal: {
            50: "hsl(var(--sds-teal-50))",
            100: "hsl(var(--sds-teal-100))",
            200: "hsl(var(--sds-teal-200))",
            300: "hsl(var(--sds-teal-300))",
            400: "hsl(var(--sds-teal-400))",
            500: "hsl(var(--sds-teal-500))",
            600: "hsl(var(--sds-teal-600))",
            700: "hsl(var(--sds-teal-700))",
            800: "hsl(var(--sds-teal-800))",
            900: "hsl(var(--sds-teal-900))",
          },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        card: "1.5rem", // Custom rounded corners for cards
        pod: "1rem", // Dashboard pods
        badge: "2rem", // Status badges
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        heading: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "monospace"],
      },
      fontSize: {
        "xs": ["0.75rem", { lineHeight: "1rem" }],
        "sm": ["0.875rem", { lineHeight: "1.25rem" }],
        "base": ["1rem", { lineHeight: "1.5rem" }],
        "lg": ["1.125rem", { lineHeight: "1.75rem" }],
        "xl": ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1" }],
        "6xl": ["3.75rem", { lineHeight: "1" }],
        "7xl": ["4.5rem", { lineHeight: "1" }],
        "8xl": ["6rem", { lineHeight: "1" }],
        "9xl": ["8rem", { lineHeight: "1" }],
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
        "144": "36rem",
      },
      boxShadow: {
        "sds": "0 4px 6px -1px rgba(117, 79, 168, 0.1), 0 2px 4px -1px rgba(117, 79, 168, 0.06)",
        "sds-lg": "0 10px 15px -3px rgba(117, 79, 168, 0.1), 0 4px 6px -2px rgba(117, 79, 168, 0.05)",
        "pod": "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        "pod-hover": "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
