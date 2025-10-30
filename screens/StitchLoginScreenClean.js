import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { View, Platform } from "react-native";
import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import MobileViewport from "../src/components/MobileViewport";

export default function StitchLoginScreenClean() {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Logging in:", formData);
    
    try {
      // Authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      console.log("Login successful:", userCredential.user.uid);
      
      // The AuthGate will handle navigation automatically
      // No need to navigate manually
    } catch (error) {
      console.error("Login error:", error);
      alert("Erreur de connexion: " + error.message);
    }
  };

  const handleCreateAccountLink = () => {
    navigation.navigate("CreateAccount");
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      setResetMessage("Please enter your email address");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage("Password reset email sent! Check your inbox.");
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (error) {
      console.error("Error sending password reset email:", error);
      setResetMessage("Error: " + error.message);
    }
  };

  const handleForgotPasswordClick = () => {
    setShowForgotPassword(true);
    setResetMessage("");
  };

  if (Platform.OS === "web") {
    return (
      <MobileViewport>
        <div 
          style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(180deg, #0E1528 0%, #000000 100%)",
            minHeight: "100vh",
            fontFamily: "'Inter', sans-serif",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            color: "white",
          }}
        >
          <div style={{ width: "100%", maxWidth: "384px", margin: "0 auto", textAlign: "center" }}>
            {/* Header */}
            <header style={{ marginBottom: "48px" }}>
              <h1 
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: "30px",
                  fontWeight: "bold",
                  background: "linear-gradient(135deg, #00E0FF, #4A67FF)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  marginBottom: "8px",
                }}
              >
                ChampionTrack<span style={{ color: "#00E0FF", textShadow: "0 0 15px #00E0FF, 0 0 25px #00E0FF" }}>PRO</span>
              </h1>
              <p 
                style={{
                  color: "#BFC5D9",
                  opacity: 0.8,
                  letterSpacing: "0.25em",
                  fontSize: "12px",
                  fontWeight: "300",
                  marginTop: "8px",
                  textTransform: "uppercase",
                }}
              >
                THE TRAINING INTELLIGENCE
              </p>
            </header>

            {/* Main Content */}
            <main style={{ width: "100%", display: "flex", flexDirection: "column", gap: "20px" }}>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }} autoComplete="off">
                <div>
                  <input 
                    type="email"
                    placeholder="Email or Username"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    autoComplete="new-password"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    data-form-type="other"
                    style={{
                      backgroundColor: "rgba(26, 26, 26, 0.6)",
                      border: "1px solid transparent",
                      borderRadius: "12px",
                      height: "52px",
                      color: "white",
                      width: "100%",
                      padding: "0 16px",
                      transition: "all 0.3s ease",
                    }}
                    onFocus={(e) => {
                      e.target.style.outline = "none";
                      e.target.style.boxShadow = "0 0 15px rgba(0, 224, 255, 0.5)";
                      e.target.style.borderColor = "rgba(0, 224, 255, 0.7)";
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow = "none";
                      e.target.style.borderColor = "transparent";
                    }}
                  />
                </div>
                <div style={{ position: "relative" }}>
                  <input 
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    autoComplete="new-password"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    data-form-type="other"
                    style={{
                      backgroundColor: "rgba(26, 26, 26, 0.6)",
                      border: "1px solid transparent",
                      borderRadius: "12px",
                      height: "52px",
                      color: "white",
                      width: "100%",
                      padding: "0 16px 0 16px",
                      paddingRight: "40px",
                      transition: "all 0.3s ease",
                    }}
                    onFocus={(e) => {
                      e.target.style.outline = "none";
                      e.target.style.boxShadow = "0 0 15px rgba(0, 224, 255, 0.5)";
                      e.target.style.borderColor = "rgba(0, 224, 255, 0.7)";
                    }}
                    onBlur={(e) => {
                      e.target.style.boxShadow = "none";
                      e.target.style.borderColor = "transparent";
                    }}
                  />
                  <button 
                    type="button"
                    style={{
                      position: "absolute",
                      top: "50%",
                      right: "12px",
                      transform: "translateY(-50%)",
                      color: "#9CA3AF",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                <div style={{ textAlign: "right" }}>
                  <button 
                    type="button"
                    onClick={handleForgotPasswordClick}
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#00E0FF",
                      cursor: "pointer",
                      textDecoration: "underline",
                      background: "none",
                      border: "none",
                      padding: "0",
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>
              </form>

              <div style={{ paddingTop: "24px" }}>
                <button 
                  onClick={handleSubmit}
                  style={{
                    width: "100%",
                    backgroundImage: "linear-gradient(to right, #00E0FF, #4A67FF)",
                    boxShadow: "0 4px 20px rgba(0, 224, 255, 0.3)",
                    borderRadius: "14px",
                    color: "white",
                    fontWeight: "bold",
                    padding: "16px",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    fontSize: "16px",
                    border: "none",
                    cursor: "pointer",
                    transition: "opacity 0.2s",
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = "0.9"}
                  onMouseLeave={(e) => e.target.style.opacity = "1"}
                >
                  LOG IN
                </button>
              </div>

              {/* Footer */}
              <footer style={{ paddingTop: "24px" }}>
                <p style={{ fontSize: "14px", color: "#9CA3AF" }}>
                  Don't have an account? <a 
                    onClick={handleCreateAccountLink}
                    style={{
                      fontWeight: "500",
                      color: "#00E0FF",
                      cursor: "pointer",
                      textDecoration: "underline",
                    }}
                  >
                    Create one
                  </a>
                </p>
              </footer>
            </main>

            {/* Forgot Password Modal */}
            {showForgotPassword && (
              <div style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 1000,
                padding: "20px"
              }}>
                <div style={{
                  backgroundColor: "#1A1A1A",
                  borderRadius: "16px",
                  padding: "32px",
                  maxWidth: "400px",
                  width: "100%",
                  border: "1px solid rgba(0, 224, 255, 0.3)",
                  boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)"
                }}>
                  <h3 style={{
                    color: "white",
                    fontSize: "20px",
                    fontWeight: "bold",
                    marginBottom: "16px",
                    textAlign: "center"
                  }}>
                    Reset Password
                  </h3>
                  
                  <p style={{
                    color: "#9CA3AF",
                    fontSize: "14px",
                    marginBottom: "24px",
                    textAlign: "center",
                    lineHeight: "1.5"
                  }}>
                    Enter your email address and we'll send you a link to reset your password.
                  </p>

                  <div style={{ marginBottom: "20px" }}>
                    <input 
                      type="email"
                      placeholder="Enter your email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      style={{
                        backgroundColor: "rgba(26, 26, 26, 0.6)",
                        border: "1px solid transparent",
                        borderRadius: "12px",
                        height: "52px",
                        color: "white",
                        width: "100%",
                        padding: "0 16px",
                        transition: "all 0.3s ease",
                      }}
                      onFocus={(e) => {
                        e.target.style.outline = "none";
                        e.target.style.boxShadow = "0 0 15px rgba(0, 224, 255, 0.5)";
                        e.target.style.borderColor = "rgba(0, 224, 255, 0.7)";
                      }}
                      onBlur={(e) => {
                        e.target.style.boxShadow = "none";
                        e.target.style.borderColor = "transparent";
                      }}
                    />
                  </div>

                  {resetMessage && (
                    <div style={{
                      padding: "12px",
                      borderRadius: "8px",
                      marginBottom: "20px",
                      backgroundColor: resetMessage.includes("Error") ? "rgba(239, 68, 68, 0.1)" : "rgba(34, 197, 94, 0.1)",
                      border: `1px solid ${resetMessage.includes("Error") ? "rgba(239, 68, 68, 0.3)" : "rgba(34, 197, 94, 0.3)"}`,
                      color: resetMessage.includes("Error") ? "#EF4444" : "#22C55E",
                      fontSize: "14px",
                      textAlign: "center"
                    }}>
                      {resetMessage}
                    </div>
                  )}

                  <div style={{ display: "flex", gap: "12px" }}>
                    <button 
                      onClick={() => {
                        setShowForgotPassword(false);
                        setResetEmail("");
                        setResetMessage("");
                      }}
                      style={{
                        flex: 1,
                        backgroundColor: "rgba(107, 114, 128, 0.2)",
                        border: "1px solid rgba(107, 114, 128, 0.3)",
                        borderRadius: "12px",
                        color: "#9CA3AF",
                        padding: "12px",
                        cursor: "pointer",
                        transition: "all 0.3s ease"
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(107, 114, 128, 0.3)"}
                      onMouseLeave={(e) => e.target.style.backgroundColor = "rgba(107, 114, 128, 0.2)"}
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleForgotPassword}
                      style={{
                        flex: 1,
                        backgroundImage: "linear-gradient(to right, #00E0FF, #4A67FF)",
                        border: "none",
                        borderRadius: "12px",
                        color: "white",
                        padding: "12px",
                        cursor: "pointer",
                        fontWeight: "600",
                        transition: "all 0.3s ease"
                      }}
                      onMouseEnter={(e) => e.target.style.opacity = "0.9"}
                      onMouseLeave={(e) => e.target.style.opacity = "1"}
                    >
                      Send Reset Link
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </MobileViewport>
    );
  }

  // Native fallback
  return (
    <MobileViewport>
      <View style={{ flex: 1, backgroundColor: "#0E1528", justifyContent: "center", alignItems: "center" }}>
        {/* Native implementation would go here */}
      </View>
    </MobileViewport>
  );
}
