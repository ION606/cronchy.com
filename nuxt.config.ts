// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  css: [
    "@unocss/reset/normalize.css",
    "@unocss/reset/sanitize/sanitize.css",
    "@unocss/reset/sanitize/assets.css",
    "@unocss/reset/eric-meyer.css",
  ],
  modules: ["@unocss/nuxt"],
});
