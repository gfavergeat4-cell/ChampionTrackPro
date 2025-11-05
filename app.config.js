export default {
  expo: {
    name: "ChampionTrackPRO",
    slug: "championtrackpro",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "dark",
    scheme: "championtrackpro",
    owner: "favergab",
    ios: { bundleIdentifier: "com.championtrackpro.app" },
    android: { package: "com.championtrackpro.app" },
    web: {
      favicon: "./assets/favicon.png",
      bundler: "metro",
      output: "static",
      entryPoint: "./index.web.js"
    },
    extra: {
      eas: { projectId: "265f2c6f-c23c-46ba-b6ae-43fdf41bb497" }
    }
  }
};
