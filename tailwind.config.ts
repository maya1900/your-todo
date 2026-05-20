import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          900: "var(--ink-900)",
          700: "var(--ink-700)",
          500: "var(--ink-500)",
          300: "var(--ink-300)",
        },
        paper: {
          50: "var(--paper-50)",
          100: "var(--paper-100)",
          200: "var(--paper-200)",
        },
        rule: {
          200: "var(--rule-200)",
          400: "var(--rule-400)",
        },
        stamp: {
          100: "var(--stamp-100)",
          600: "var(--stamp-600)",
          700: "var(--stamp-700)",
        },
        prio: {
          "low-bg": "var(--prio-low-bg)",
          "low-ink": "var(--prio-low-ink)",
          "medium-bg": "var(--prio-medium-bg)",
          "medium-ink": "var(--prio-medium-ink)",
          "high-bg": "var(--prio-high-bg)",
          "high-ink": "var(--prio-high-ink)",
          "urgent-bg": "var(--prio-urgent-bg)",
          "urgent-ink": "var(--prio-urgent-ink)",
        },
        state: {
          pending: "var(--state-pending)",
          progress: "var(--state-progress)",
          completed: "var(--state-completed)",
          overdue: "var(--state-overdue)",
        },
      },
      fontFamily: {
        display: ['"Fraunces"', '"Songti SC"', '"Source Han Serif SC"', "serif"],
        sans: [
          '"IBM Plex Sans"',
          '"PingFang SC"',
          '"Hiragino Sans GB"',
          '"Source Han Sans SC"',
          "system-ui",
          "sans-serif",
        ],
        mono: ['"IBM Plex Mono"', '"SF Mono"', '"JetBrains Mono"', "monospace"],
      },
      fontSize: {
        "display-2xl": ["3.5rem", { lineHeight: "1.02", fontWeight: "400" }],
        "display-xl": ["2.5rem", { lineHeight: "1.05", fontWeight: "400" }],
        "display-lg": ["1.75rem", { lineHeight: "1.15", fontWeight: "500" }],
        "body-lg": ["1.125rem", { lineHeight: "1.55", fontWeight: "400" }],
        body: ["0.9375rem", { lineHeight: "1.55", fontWeight: "400" }],
        "body-sm": ["0.8125rem", { lineHeight: "1.5", fontWeight: "400" }],
        label: [
          "0.6875rem",
          { lineHeight: "1.3", fontWeight: "500", letterSpacing: "0.14em" },
        ],
        caption: [
          "0.625rem",
          { lineHeight: "1.3", fontWeight: "500", letterSpacing: "0.1em" },
        ],
      },
      boxShadow: {
        "paper-2":
          "0 2px 8px rgba(26,26,24,0.04), 0 1px 2px rgba(26,26,24,0.06)",
        "paper-3":
          "0 12px 32px rgba(26,26,24,0.1), 0 4px 12px rgba(26,26,24,0.06)",
        stamp:
          "0 0 0 1px var(--stamp-600), 0 4px 12px rgba(179,58,58,0.18)",
      },
      transitionTimingFunction: {
        "out-quint": "cubic-bezier(0.16, 1, 0.3, 1)",
        stamp: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        drawerInRight: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
        drawerInBottom: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        overlayIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "fade-up": "fadeUp 400ms cubic-bezier(0.16,1,0.3,1) both",
        "drawer-in-right": "drawerInRight 220ms cubic-bezier(0.16,1,0.3,1) both",
        "drawer-in-bottom":
          "drawerInBottom 220ms cubic-bezier(0.16,1,0.3,1) both",
        "overlay-in": "overlayIn 150ms ease-out both",
      },
    },
  },
  plugins: [forms({ strategy: "class" })],
} satisfies Config;
