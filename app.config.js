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
      output: "single",
      entryPoint: "./index.web.js",
      name: "ChampionTrackPRO",
      shortName: "CTP",
      description: "The Training Intelligence - Optimisez vos entraînements avec ChampionTrackPRO",
      themeColor: "#0E1528",
      backgroundColor: "#0E1528",
      lang: "en",
      scope: "/",
      startUrl: "/",
      display: "standalone",
      orientation: "portrait"
    },
    extra: {
      eas: { projectId: "265f2c6f-c23c-46ba-b6ae-43fdf41bb497" }
    }
  }
};
