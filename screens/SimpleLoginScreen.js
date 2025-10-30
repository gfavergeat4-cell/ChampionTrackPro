import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import MobileViewport from "../src/components/MobileViewport";

export default function SimpleLoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("gabfavergeat@gmail.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      
      console.log("🔐 Attempting login with:", email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("✅ Login successful:", userCredential.user.email);
      
      // Navigation will be handled by AuthGate
    } catch (error) {
      console.error("❌ Login error:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileViewport>
      <div style={{
        width: "100%",
        height: "100%",
        background: "linear-gradient(to bottom, #0B0F1A, #020409)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        color: "white",
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ 
            fontSize: "32px", 
            fontWeight: "bold", 
            margin: "0 0 8px 0",
            background: "linear-gradient(135deg, #00E0FF, #4A67FF)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            ChampionTrackPRO
          </h1>
          <p style={{ fontSize: "16px", color: "#9AA3B2", margin: 0 }}>
            THE TRAINING INTELLIGENCE
          </p>
        </div>

        <div style={{ width: "100%", maxWidth: "320px" }}>
          <div style={{ marginBottom: "20px" }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                background: "rgba(255, 255, 255, 0.1)",
                color: "white",
                fontSize: "16px",
                outline: "none"
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              style={{
                width: "100%",
                padding: "16px",
                borderRadius: "12px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                background: "rgba(255, 255, 255, 0.1)",
                color: "white",
                fontSize: "16px",
                outline: "none"
              }}
            />
          </div>

          {error && (
            <div style={{ 
              color: "#EF4444", 
              fontSize: "14px", 
              marginBottom: "20px",
              textAlign: "center"
            }}>
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "12px",
              background: loading ? "rgba(0, 224, 255, 0.5)" : "linear-gradient(135deg, #00E0FF, #4A67FF)",
              color: "white",
              fontSize: "16px",
              fontWeight: "600",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "opacity 0.2s"
            }}
          >
            {loading ? "Connecting..." : "LOG IN"}
          </button>

          <div style={{ 
            textAlign: "center", 
            marginTop: "20px",
            fontSize: "14px",
            color: "#9AA3B2"
          }}>
            <p>Test Admin: gabfavergeat@gmail.com</p>
            <p>Password: password123</p>
          </div>
        </div>
      </div>
    </MobileViewport>
  );
}



