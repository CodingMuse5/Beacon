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
        display: ['"IBM Plex Sans Condensed"', "system-ui", "sans-serif"],
        body: ['"IBM Plex Sans"', "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "ui-monospace", "SFMono-Regular", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};
