import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        gbg: "rgb(var(--color-gbg) / <alpha-value>)", // Hỗ trợ transparency
        gtext: "rgb(var(--color-gtext) / <alpha-value>)",
        ghead: "rgb(var(--color-ghead) / <alpha-value>)",
        thead: "rgb(var(--color-thead) / <alpha-value>)",
      },
    },
  },
  plugins: [],
});
