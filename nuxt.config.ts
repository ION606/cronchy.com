// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  css: [
    "@/global.css",
    "@unocss/reset/normalize.css",
    "@unocss/reset/sanitize/sanitize.css",
    "@unocss/reset/sanitize/assets.css",
    "@unocss/reset/eric-meyer.css",
  ],
  modules: ["@unocss/nuxt", "@nuxtjs/google-fonts", "nuxt-build-cache", "@nuxt/image"],
  googleFonts: {
		families: { "IBM Plex Sans": true, "Libre Barcode 128 Text": true, Poppins: true },
		preload: true,
	},
});