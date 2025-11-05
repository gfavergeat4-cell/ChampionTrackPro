import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { View, Platform, Alert } from "react-native";
import MobileViewport from "../src/components/MobileViewport";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebaseConfig";

export default function StitchLoginScreen() {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }
    
    // Validation des champs
    if (!formData.email || !formData.password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    setLoading(true);
    
    try {
      console.log("🔐 Tentative de connexion avec:", formData.email);
      
      // Authentification Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        formData.email.trim(), 
        formData.password
      );
      
      console.log("✅ Connexion réussie:", userCredential.user.email);
      
      // La navigation sera gérée automatiquement par l'AuthGate
      // Pas besoin de naviguer manuellement
      
    } catch (error) {
      console.error("❌ Erreur de connexion:", error);
      console.error("❌ Code d'erreur:", error.code);
      console.error("❌ Message d'erreur:", error.message);
      
      let errorMessage = "Erreur lors de la connexion";
      
      if (error.code === "auth/user-not-found") {
        errorMessage = "Aucun compte trouvé avec cette adresse email. Créez un compte d'abord.";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Mot de passe incorrect";
      } else if (error.code === "auth/invalid-credential") {
        // Firebase v9+ utilise invalid-credential pour user-not-found ET wrong-password
        errorMessage = "Email ou mot de passe incorrect. Vérifiez vos identifiants ou créez un compte.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Adresse email invalide";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Trop de tentatives. Veuillez réessayer plus tard";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Erreur de connexion. Vérifiez votre connexion internet";
      } else {
        errorMessage = `Erreur: ${error.message || error.code || "Erreur inconnue"}`;
      }
      
      Alert.alert("Erreur de connexion", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (Platform.OS === "web") {
    return (
      <MobileViewport>
        {/* Halo central */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "25%",
            transform: "translate(-50%, -50%)",
            width: 750,
            height: 260,
            background:
              "radial-gradient(circle, rgba(0,224,255,0.18) 0%, rgba(0,224,255,0) 70%)",
            filter: "blur(60px)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />
        {/* Bouton retour */}
        <button
          onClick={() => navigation.navigate("Landing")}
          style={{
            position: "absolute",
            top: 24,
            left: 24,
            zIndex: 10,
            width: 40,
            height: 40,
            borderRadius: 20,
            background: "rgba(26,26,26,0.8)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.2s ease",
            backdropFilter: "blur(10px)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(26,26,26,0.9)";
            e.currentTarget.style.borderColor = "rgba(0,224,255,0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(26,26,26,0.8)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
          }}
        >
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Contenu */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            padding: 24,
            color: "#fff",
            WebkitFontSmoothing: "antialiased",
            MozOsxFontSmoothing: "grayscale",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 24,
            paddingTop: "25%",
          }}
        >
          {/* Logo - Unifié avec Landing */}
          <div style={{ textAlign: "center", userSelect: "none", zIndex: 2 }}>
            <h1
              style={{
                fontFamily: "'Cinzel', serif",
                fontWeight: 700,
                fontSize: "clamp(1.2rem, 4vw, 1.8rem)",
                color: "#FFFFFF",
                letterSpacing: "0.01em",
                textShadow: "0 0 10px rgba(255,255,255,0.5), 0 0 20px rgba(255,255,255,0.3)",
                margin: 0,
              }}
            >
              ChampionTrack
              <span
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
                fontFamily: "'Inter', sans-serif",
                color: "#BFC5D9",
                fontSize: "clamp(0.4rem, 1.5vw, 0.6rem)",
                fontWeight: 300,
                letterSpacing: "0.28em",
                marginTop: 8,
                textTransform: "uppercase",
              }}
            >
              The Training Intelligence
            </p>
          </div>

          {/* Form */}
          <main
            style={{
              width: "100%",
              maxWidth: 420,
              zIndex: 2,
            }}
          >
            <form
              id="login-form"
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
              autoComplete="off"
            >
              <input
                type="email"
                placeholder="Email or Username"
                value={formData.email}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, email: e.target.value }))
                }
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                style={inputStyle}
              />

              <div style={{ position: "relative" }}>
                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, password: e.target.value }))
                  }
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  style={{ ...inputStyle, paddingRight: 48 }}
                />
                {/* œil déco */}
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#9AA3B2",
                    opacity: 0.85,
                    pointerEvents: "none",
                  }}
                >
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              <div style={{ textAlign: "right", marginTop: 2 }}>
                <button
                  type="button"
                  onClick={() => {}}
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#00E0FF",
                    textDecoration: "underline",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Forgot Password?
                </button>
              </div>

            </form>
          </main>

          {/* Bouton LOG IN en bas */}
          <div
            style={{
              position: "absolute",
              bottom: "15%",
              left: 0,
              right: 0,
              padding: "0 24px env(safe-area-inset-bottom, 16px) 24px",
              zIndex: 2,
            }}
          >
            <button 
              type="submit" 
              form="login-form"
              onClick={(e) => {
                e.preventDefault();
                handleSubmit(e);
              }}
              style={{
                ...primaryBtnStyle,
                width: "100%",
                marginBottom: 16,
              }}
              disabled={loading}
            >
              {loading ? "CONNEXION..." : "LOG IN"}
            </button>

            <div style={{ textAlign: "center", paddingBottom: 8 }}>
              <p style={{ fontSize: 14, color: "#9CA3AF" }}>
                Don't have an account?{" "}
                <span
                  onClick={() => navigation.navigate("CreateAccount")}
                  style={{
                    fontWeight: 500,
                    color: "#00E0FF",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Create one
                </span>
              </p>
            </div>
          </div>
        </div>
      </MobileViewport>
    );
  }

  return <View style={{ flex: 1, backgroundColor: "#0E1528" }} />;
}

const inputStyle = {
  height: "clamp(36px, 5vh, 44px)",
  width: "100%",
  borderRadius: 10,
  padding: "0 14px",
  background: "rgba(26,26,26,0.6)",
  color: "#fff",
  border: "1px solid transparent",
  transition: "0.25s",
  fontSize: "clamp(12px, 1.8vw, 14px)",
};

const primaryBtnStyle = {
  width: "100%",
  height: "clamp(40px, 6vh, 48px)",
  borderRadius: 10,
  textTransform: "uppercase",
  fontWeight: 700,
  fontSize: "clamp(12px, 2vw, 14px)",
  letterSpacing: "0.06em",
  color: "#fff",
  backgroundImage: "linear-gradient(to right, #00E0FF, #4A67FF)",
  boxShadow: "0 4px 20px rgba(0,224,255,0.30), 0 0 24px rgba(74,103,255,0.20)",
  transition: "opacity 0.2s ease",
  border: "none",
  cursor: "pointer",
};