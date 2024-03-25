module.exports = {
  apps: [
    {
      name: "veryCrunchy/portfolio",
      port: "3058",
      script: "./.output/server/index.mjs",
      autorestart: true,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
