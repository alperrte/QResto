import type { Config } from "tailwindcss";

/**
 * Tailwind v4: tema token’ları çoğunlukla `src/styles/tailwind-theme.css` içindeki @theme ile tanımlıdır.
 * Bu dosya içerik taraması ve IDE uyumluluğu için tutulur.
 */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
} satisfies Config;
