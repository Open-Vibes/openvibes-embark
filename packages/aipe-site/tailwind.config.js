/** @type {import('tailwindcss').Config} */

// Every color is driven by a CSS variable holding a space-separated RGB triple
// (see src/index.css). That lets a single class name resolve correctly in both
// the dark-first canvas and the complete light theme, and keeps Tailwind's
// `/<alpha>` opacity modifiers working (rgb(var(--x) / <alpha-value>)).
const withVar = (name) => `rgb(var(${name}) / <alpha-value>)`;

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Sora", "Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      colors: {
        // Surfaces & text — the neutral chassis.
        bg: withVar("--bg"),
        surface: {
          1: withVar("--surface-1"),
          2: withVar("--surface-2"),
          3: withVar("--surface-3"),
        },
        line: withVar("--line"),
        "line-soft": withVar("--line-soft"),
        text: withVar("--text"),
        muted: withVar("--muted"),
        faint: withVar("--faint"),

        // Brand — "Iris" violet. AIPe is a coordinator that composes many agents
        // into one result; violet (the synthesis of the spectrum) encodes that,
        // and is deliberately NOT pdd-site's #5eb8ff blue. Use `brand/<alpha>`
        // for soft tints.
        brand: {
          DEFAULT: withVar("--brand"),
          strong: withVar("--brand-strong"),
        },

        // Semantic state ramp — the product literally encodes these ledger
        // statuses (src/journey/types.ts). `running` is the session-mode
        // transient. Never carried by color alone: always paired with a glyph
        // + label.
        state: {
          dispatched: withVar("--st-dispatched"),
          running: withVar("--st-running"),
          delivered: withVar("--st-delivered"),
          verified: withVar("--st-verified"),
          failed: withVar("--st-failed"),
          escalated: withVar("--st-escalated"),
          merged: withVar("--st-merged"),
          redirected: withVar("--st-redirected"),
          removed: withVar("--st-removed"),
        },
      },
      maxWidth: {
        content: "72rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.45" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
        "pulse-soft": "pulse-soft 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
