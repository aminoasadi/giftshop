import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        field: "#071A2C",
        fieldDark: "#04101C",
        card: "#0B2338",
        cardLift: "#12314A",
        chrome: "#F4F7F9",
        body: "#D6DEE4",
        muted: "#A9B6C1",
        line: "#1D4667"
      },
      fontFamily: {
        sans: ["Vazirmatn", "IRANYekanX", "Tahoma", "Arial", "sans-serif"]
      },
      boxShadow: {
        glass: "inset 0 1px 0 #ffffff18, 0 24px 80px #02080f66"
      }
    }
  },
  plugins: []
};

export default config;
