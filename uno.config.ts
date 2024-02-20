import { defineConfig, presetWebFonts } from "unocss";

export default defineConfig({
  theme: {
    colors: {
      dim: "#a3a3a3",
      statsfm: {
        primary: "rgb(17, 17, 18)",
        secondary: "rgb(24, 24, 28)",
        accent: {
          primary: "rgb(30 215 96)",
          secondary: "rgba(30,215,96,.1)",
        },
      },
    },
  },
});
