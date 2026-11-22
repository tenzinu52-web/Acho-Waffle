/** Same design tokens as the single-page site. Compiled once, so the pages no longer load the Tailwind runtime script. */
module.exports = {
  content: ["../*.html", "../assets/*.js"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        sand: "rgb(var(--sand) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        ink2: "rgb(var(--ink2) / <alpha-value>)",
        choc: "rgb(var(--choc) / <alpha-value>)",
        gold: "rgb(var(--gold) / <alpha-value>)",
        cocoa: "#3A2218"
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', '"Arial Narrow"', "system-ui", "sans-serif"],
        sans: ['"Instrument Sans"', "system-ui", "-apple-system", '"Segoe UI"', "sans-serif"]
      }
    }
  }
};
