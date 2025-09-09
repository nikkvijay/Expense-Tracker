// import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
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
      fontFamily: {
        sans: ["Urbanist", "system-ui", "sans-serif"],
        heading: ["Urbanist", "system-ui", "sans-serif"],
        body: ["Urbanist", "system-ui", "sans-serif"],
      },
      fontSize: {
        h1: [
          "clamp(48px, 8vw, 80px)",
          { lineHeight: "1.15", fontWeight: "600" },
        ],
        h2: [
          "clamp(36px, 6vw, 56px)",
          { lineHeight: "1.25", fontWeight: "600" },
        ],
        h3: [
          "clamp(24px, 4vw, 32px)",
          { lineHeight: "1.3", fontWeight: "600" },
        ],
        h4: [
          "clamp(20px, 3vw, 26px)",
          { lineHeight: "1.3", fontWeight: "600" },
        ],
        h5: [
          "clamp(16px, 2.5vw, 18px)",
          { lineHeight: "1.4", fontWeight: "600" },
        ],
        subtitle: [
          "clamp(20px, 3vw, 26px)",
          { lineHeight: "1.15", fontWeight: "600" },
        ],
        paragraph: ["20px", { lineHeight: "1.5", fontWeight: "400" }],
        "paragraph-small": ["16px", { lineHeight: "1.15", fontWeight: "400" }],
      },
      colors: {
        // Brand Primary Colors
        "brand-primary-1": "#0c1f25",
        "brand-primary-2": "#3b3b3b",
        "brand-primary-3": "#b7ec42",

        // Brand Background Colors
        "brand-light-bg-1": "#f9f9f9",
        "brand-light-bg-2": "#f8faf5",
        "brand-dark-bg-1": "#0c1f25",
        "brand-dark-bg-2": "#1a1a1a",

        // CSS Custom Properties (for existing components)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: "hsl(var(--surface))",
        "surface-elevated": "hsl(var(--surface-elevated))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
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
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Expense Category Colors
        category: {
          food: "hsl(var(--category-food))",
          transport: "hsl(var(--category-transport))",
          entertainment: "hsl(var(--category-entertainment))",
          bills: "hsl(var(--category-bills))",
          shopping: "hsl(var(--category-shopping))",
          health: "hsl(var(--category-health))",
          education: "hsl(var(--category-education))",
          other: "hsl(var(--category-other))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      backgroundImage: {
        "gradient-primary": "var(--gradient-primary)",
        "gradient-surface": "var(--gradient-surface)",
        "gradient-card": "var(--gradient-card)",
      },
      boxShadow: {
        soft: "var(--shadow-soft)",
        medium: "var(--shadow-medium)",
        large: "var(--shadow-large)",
        glow: "var(--shadow-glow)",
      },
      // fontFamily already updated above
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "fade-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "scale-in": {
          "0%": {
            transform: "scale(0.95)",
            opacity: "0",
          },
          "100%": {
            transform: "scale(1)",
            opacity: "1",
          },
        },
        "slide-up": {
          "0%": {
            transform: "translateY(20px)",
            opacity: "0",
          },
          "100%": {
            transform: "translateY(0)",
            opacity: "1",
          },
        },
        "glow-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 20px hsl(var(--primary) / 0.3)",
          },
          "50%": {
            boxShadow: "0 0 30px hsl(var(--primary) / 0.5)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
      },
      transitionProperty: {
        smooth: "all",
        colors: "color, background-color, border-color, fill, stroke",
        shadows: "box-shadow",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
