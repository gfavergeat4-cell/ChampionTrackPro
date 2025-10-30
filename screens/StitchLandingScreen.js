// screens/StitchLandingScreen.js
import React from "react";
import { useNavigation } from "@react-navigation/native";
import { View, Platform } from "react-native";
import MobileViewport from "../src/components/MobileViewport";

export default function StitchLandingScreen() {
  const navigation = useNavigation();

  const handleCreateAccount = () => navigation.navigate("CreateAccount");
  const handleLogin = () => navigation.navigate("Login");

  if (Platform.OS === "web") {
    return (
      <MobileViewport>
        <>
          {/* Fonts */}
          <link
            href="https://fonts.googleapis.com"
            rel="preconnect"
          />
          <link
            href="https://fonts.gstatic.com"
            crossOrigin=""
            rel="preconnect"
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Inter:wght@300;400;700&display=swap"
            rel="stylesheet"
          />

          {/* Styles dédiés (pas de Tailwind pour éviter la purge) */}
          <style>{`
            :root {
              --gradient-cyan: #00E0FF;
              --gradient-blue: #4A67FF;
              --matte-graphite: #1A1A1A;
              --graphite-border: #2B2E36;
            }
            .logo-font { font-family: 'Cinzel', serif; }
            .text-glow-white { text-shadow: 0 0 8px rgba(255,255,255,.5), 0 0 20px rgba(255,255,255,.3); }
            .text-glow-cyan { color: #00E0FF; text-shadow: 0 0 8px rgba(0,224,255,.7), 0 0 20px rgba(0,224,255,.5); }
            .cyan-halo {
              position: absolute;
              top: 25%; left: 50%; transform: translate(-50%, -50%);
              width: 70vw; height: 25vh;
              background: radial-gradient(circle, rgba(0,224,255,.15) 0%, rgba(0,224,255,0) 70%);
              filter: blur(60px); pointer-events: none;
            }
            @media (max-width: 768px) {
              .cyan-halo { width: 90vw; height: 30vh; filter: blur(40px); }
            }
            @media (min-width: 1024px) {
              .cyan-halo { width: 60vw; height: 20vh; filter: blur(80px); }
            }
            .button-glow { box-shadow: 0 0 15px rgba(0,224,255,.3), 0 0 25px rgba(74,103,255,.2); }
          `}</style>

          {/* Page container */}
          <div
            style={{
              color: "white",
              WebkitFontSmoothing: "antialiased",
              MozOsxFontSmoothing: "grayscale",
              background: "linear-gradient(to bottom, #0E1528, #000000)",
              minHeight: "100vh",
              minHeight: "100dvh",
              overflow: "hidden",
              fontFamily: "'Inter','SF Pro Display',sans-serif",
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
            }}
          >
            {/* Halo central */}
            <div className="cyan-halo" />

            {/* Main (logo + tagline) */}
            <main
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
                flexGrow: 1,
                width: "100%",
                zIndex: 1,
                paddingTop: "25%",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <h1
                  className="logo-font text-glow-white"
                  style={{
                    margin: 0,
                    fontWeight: 700,
                    color: "#FFFFFF",
                    fontSize: "clamp(1.2rem, 4vw, 1.8rem)",
                    letterSpacing: "0.01em",
                    textShadow: "0 0 10px rgba(255,255,255,0.5), 0 0 20px rgba(255,255,255,0.3)",
                  }}
                >
                  ChampionTrack
                  <span 
                    className="text-glow-cyan"
                    style={{
                      color: "#00E0FF",
                      textShadow: "0 0 12px rgba(0,224,255,0.8), 0 0 28px rgba(0,224,255,0.4)",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                    }}
                  >
                    Pro
                  </span>
                </h1>

                <p
                  style={{
                    marginTop: 8,
                    fontSize: "clamp(0.4rem, 1.5vw, 0.6rem)",
                    fontWeight: 300,
                    color: "#BFC5D9",
                    letterSpacing: "0.28em",
                    textTransform: "uppercase",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  The Training Intelligence
                </p>
              </div>
            </main>

            {/* Footer (boutons) - Positionnés en bas */}
            <footer
              style={{
                width: "100%",
                maxWidth: 384,
                paddingBottom: "env(safe-area-inset-bottom, 16px)",
                paddingTop: 0,
                zIndex: 1,
                flexShrink: 0,
                position: "absolute",
                bottom: "20%",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <button
                  onClick={handleCreateAccount}
                  className="button-glow"
                  style={{
                    width: "100%",
                    height: "clamp(40px, 6vh, 48px)",
                    borderRadius: 10,
                    backgroundImage:
                      "linear-gradient(to right, var(--gradient-cyan), var(--gradient-blue))",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "clamp(12px, 2vw, 14px)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    border: "none",
                    cursor: "pointer",
                    transition: "opacity .2s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  Create Account
                </button>

                <button
                  onClick={handleLogin}
                  style={{
                    width: "100%",
                    height: "clamp(40px, 6vh, 48px)",
                    borderRadius: 10,
                    background: "var(--matte-graphite)",
                    border: "1px solid var(--graphite-border)",
                    color: "white",
                    fontWeight: 700,
                    fontSize: "clamp(12px, 2vw, 14px)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    transition: "background-color .2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "rgba(26,26,26,.8)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "var(--matte-graphite)")
                  }
                >
                  Log In
                </button>
              </div>
            </footer>
          </div>
        </>
      </MobileViewport>
    );
  }

  // Native fallback (simplifié)
  return (
    <MobileViewport>
      <View
        style={{
          flex: 1,
          backgroundColor: "#0E1528",
          justifyContent: "center",
          alignItems: "center",
          padding: 24,
        }}
      />
    </MobileViewport>
  );
}