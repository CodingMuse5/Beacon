/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ground: "#10141b",
        surface: "#171e29",
        "surface-2": "#1d2632",
        border: "#2b3543",
        "border-soft": "#212a36",
        text: "#e9e4d8",
        "text-dim": "#8b93a1",
        "text-faint": "#5b6472",
        accent: "#e8a33d",
        contact: "#5fb8b0",
        good: "#7cb686",
        warn: "#d2704a",
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', "system-ui", "sans-serif"],
        body: ['"Manrope"', "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "Consolas", "monospace"],
        serif: ['"Fraunces"', "ui-serif", "Georgia", "serif"],
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      keyframes: {
        "result-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "header-sweep": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(250%)" },
        },
        "scan-sweep": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(250%)" },
        },
      },
      animation: {
        "result-in": "result-in 300ms cubic-bezier(0.34, 1.56, 0.64, 1) both",
        "header-sweep": "header-sweep 6s ease-in-out infinite",
        "scan-sweep": "scan-sweep 3.2s linear infinite",
      },
    },
  },
  plugins: [],
};
