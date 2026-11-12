/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"] },
      colors: {
        canvas: "#f8f7f2",
        ink: "#252e29",
        muted: "#6e776f",
        subtle: "#616b63",
        line: "#dfe3d9",
        brand: { DEFAULT: "#496952", deep: "#354f3d", soft: "#e8eee5" },
        quiet: "#496952",
        moderate: { DEFAULT: "#936d32", soft: "#f3ecdc", text: "#946321" },
        busy: { DEFAULT: "#a55f4c", soft: "#f6e6e0" },
        map: { bg: "#eae9e1", block: "#deded3", park: "#d4dfc9", road: "#fafaf6", label: "#858d83" },
        bar: "#ced8ca"
      },
      boxShadow: {
        marker: "0px 3px 8px 0px rgba(37,62,40,0.10)",
        card: "0px 4px 18px 0px rgba(38,60,40,0.10)",
        sheet: "0px -4px 24px 0px rgba(37,62,40,0.10)"
      }
    }
  },
  plugins: []
};
