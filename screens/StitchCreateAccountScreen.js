import React, { useState } from "react";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { View, Platform, Alert } from "react-native";
import MobileViewport from "../src/components/MobileViewport";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs, updateDoc, increment } from "firebase/firestore";
import { auth, db } from "../services/firebaseConfig";

export default function StitchCreateAccountScreen() {
  const navigation = useNavigation();
  const [role, setRole] = useState("ATHLETE");
  const [formData, setFormData] = useState({
    teamCode: "",
    fullName: "",
    email: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    try {
      console.log("[CREATE] click");
      
      // Validation des champs
      if (!formData.teamCode || !formData.fullName || !formData.email || !formData.password) {
        Alert.alert("Erreur", "Veuillez remplir tous les champs");
        return;
      }
      
      if (formData.password.length < 6) {
        Alert.alert("Erreur", "Le mot de passe doit contenir au moins 6 caractères");
        return;
      }

      setLoading(true);
      
      // Vérifier le code d'accès AVANT de créer le compte (pas besoin d'être authentifié pour lire)
      let teamId = null;
      if (formData.teamCode) {
        console.log("🔍 Vérification du code d'accès:", formData.teamCode);
        console.log("🔍 Recherche dans la collection 'teams'...");
        
        const teamsRef = collection(db, "teams");
        const q = query(teamsRef, where("codes.athlete", "==", formData.teamCode));
        console.log("🔍 Requête Firestore créée:", q);
        
        const querySnapshot = await getDocs(q);
        console.log("🔍 Résultat de la requête:", querySnapshot.size, "équipes trouvées");
        
        if (!querySnapshot.empty) {
          const teamDoc = querySnapshot.docs[0];
          teamId = teamDoc.id;
          const teamData = teamDoc.data();
          console.log("✅ Code d'accès valide, équipe trouvée:");
          console.log("  - Team ID:", teamId);
          console.log("  - Team Name:", teamData.name);
          console.log("  - Team Data:", teamData);
        } else {
          console.log("❌ Code d'accès invalide:", formData.teamCode);
          console.log("❌ Aucune équipe trouvée avec ce code");
          Alert.alert("Erreur", "Code d'accès invalide. Vérifiez le code fourni par votre équipe.");
          setLoading(false);
          return;
        }
      } else {
        console.log("⚠️ Aucun code d'accès fourni");
      }

      // Créer le compte Firebase maintenant que le code est validé
      const cred = await createUserWithEmailAndPassword(auth, formData.email.trim(), formData.password);
      console.log("[CREATE] auth ok", cred.user.uid);

      // Créer le document utilisateur dans Firestore
      const userData = {
        role: role.toLowerCase(),
        email: formData.email.trim(),
        fullName: formData.fullName.trim(),
        teamCode: formData.teamCode,
        teamId: teamId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      console.log("📝 Données utilisateur à sauvegarder:", userData);
      console.log("📝 TeamId à sauvegarder:", teamId);
      
      await setDoc(doc(db, "users", cred.user.uid), userData, { merge: true });
      console.log("[CREATE] user doc set ok");

      // Mettre à jour le compteur de membres de l'équipe
      if (teamId) {
        await updateDoc(doc(db, "teams", teamId), {
          members: increment(1)
        });
        console.log("✅ Compteur de membres mis à jour");
      }

      // Navigation robuste avec reset
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "AthleteTabs" }],
        })
      );
      console.log("[CREATE] nav reset → AthleteTabs");
      
    } catch (e) {
      console.error("[CREATE] error", e?.code, e?.message);
      let errorMessage = "Erreur lors de la création du compte";
      
      if (e.code === "auth/email-already-in-use") {
        errorMessage = "Cette adresse email est déjà utilisée. Essayez de vous connecter ou utilisez un autre email.";
      } else if (e.code === "auth/weak-password") {
        errorMessage = "Le mot de passe est trop faible. Utilisez au moins 6 caractères.";
      } else if (e.code === "auth/invalid-email") {
        errorMessage = "L'adresse email n'est pas valide.";
      }
      
      Alert.alert("Erreur", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginLink = () => {
    console.log("🔗 Navigation vers la page de connexion");
    navigation.navigate("Login");
  };

  if (Platform.OS === "web") {
    return (
      <MobileViewport>
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

        {/* Styles dédiés (scopés) */}
        <style>{`
          .create-account-root {
            position: relative;
            min-height: max(884px, 100dvh);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 24px;
            color: #fff;
            font-family: 'Inter', 'SF Pro Display', sans-serif;
            background: linear-gradient(to bottom, #0E1528, #000000);
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            overflow: hidden;
          }
          /* Halo central, identique au Login */
          .create-account-root::before {
            content: "";
            position: absolute;
            left: 50%;
            top: 48%;
            transform: translate(-50%, -50%);
            width: min(900px, 70vw);
            height: 28vh;
            background: radial-gradient(circle, rgba(0,224,255,0.18) 0%, rgba(0,224,255,0) 70%);
            filter: blur(60px);
            pointer-events: none;
            z-index: 0;
          }

          .create-account-card {
            position: relative;
            z-index: 1;
            width: 100%;
            max-width: 420px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 32px;
          }

          /* Logo + tagline (mêmes réglages que Login) */
          .logo-wrap { text-align: center; user-select: none; }
          .logo {
            font-family: "Cinzel", serif;
            font-weight: 700;
            font-size: 26px;
            line-height: 1.1;
            margin: 0;
            text-shadow: 0 0 10px rgba(255,255,255,0.25), 0 0 25px rgba(255,255,255,0.15);
            letter-spacing: .02em;
          }
          .logo .pro {
            color: #00E0FF;
            text-shadow: 0 0 12px rgba(0,224,255,0.8), 0 0 28px rgba(0,224,255,0.4);
            font-weight: 700;
            letter-spacing: 0.06em;
          }
          .tagline {
            margin-top: 10px;
            font-size: 10px;
            letter-spacing: 0.25em;
            text-transform: uppercase;
            color: #A8B3C5;
            opacity: .85;
          }

          /* Zone boutons de rôle */
          .role-selection {
            width: 100%;
            display: flex;
            gap: 12px;
          }
          .role-btn {
            flex: 1;
            height: 48px;
            border-radius: 12px;
            border: none;
            cursor: pointer;
            font-weight: 600;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            transition: all 0.2s;
          }
          .role-btn.active {
            background-image: linear-gradient(to right, #00E0FF, #4A67FF);
            color: #fff;
            box-shadow: 0 4px 15px rgba(0,224,255,0.3);
          }
          .role-btn.inactive {
            background: rgba(26,26,26,0.6);
            border: 1px solid #2B2E36;
            color: #9CA3AF;
          }
          .role-btn.inactive:hover {
            background: rgba(26,26,26,0.8);
            border-color: #3A3D46;
          }

          /* Form */
          .form {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          .input {
            height: 52px;
            width: 100%;
            border-radius: 12px;
            padding: 0 16px;
            background: rgba(26,26,26,0.6);
            color: #fff;
            border: 1px solid transparent;
            transition: 0.25s;
            font-size: 16px;
            box-sizing: border-box;
          }
          .input:focus {
            outline: none;
            border-color: #00E0FF;
            box-shadow: 0 0 0 3px rgba(0,224,255,0.1);
          }
          .input::placeholder {
            color: #9CA3AF;
          }

          .password-container {
            position: relative;
          }
          .eye-icon {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: #9AA3B2;
            opacity: 0.85;
            pointer-events: none;
          }

          .btn-primary {
            width: 100%;
            height: 54px;
            border-radius: 12px;
            text-transform: uppercase;
            font-weight: 700;
            font-size: 15px;
            letter-spacing: 0.06em;
            color: #fff;
            background-image: linear-gradient(to right, #00E0FF, #4A67FF);
            box-shadow: 0 4px 20px rgba(0,224,255,0.30), 0 0 24px rgba(74,103,255,0.20);
            transition: opacity 0.2s ease;
            border: none;
            cursor: pointer;
            margin-top: 8px;
          }
          .btn-primary:hover:not(:disabled) { opacity: 0.9; }
          .btn-primary:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            background: rgba(0,224,255,0.5);
            box-shadow: none;
          }

          .footer {
            text-align: center;
            margin-top: 24px;
          }
          .footer p {
            font-size: 14px;
            color: #9CA3AF;
            margin: 0;
          }
          .footer a {
            font-weight: 500;
            color: #00E0FF;
            cursor: pointer;
            text-decoration: underline;
          }
        `}</style>

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
        <div className="create-account-root">
          <div className="create-account-card">
            {/* Logo + Tagline */}
            <div className="logo-wrap">
              <h1 className="logo">
                ChampionTrack<span className="pro">Pro</span>
              </h1>
              <p className="tagline">THE TRAINING INTELLIGENCE</p>
            </div>

            {/* Sélection du rôle */}
            <div className="role-selection">
              <button
                className={`role-btn ${role === "ATHLETE" ? "active" : "inactive"}`}
                onClick={() => setRole("ATHLETE")}
              >
                ATHLETE
              </button>
              <button
                className={`role-btn ${role === "COACH" ? "active" : "inactive"}`}
                onClick={() => setRole("COACH")}
              >
                COACH
              </button>
            </div>

            {/* Formulaire */}
            <form className="form" onSubmit={(e) => { e.preventDefault(); handleSignUp(); }}>
              <input
                type="text"
                placeholder="Team Access Code"
                value={formData.teamCode}
                onChange={(e) => setFormData({...formData, teamCode: e.target.value})}
                className="input"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
              />

              <input
                type="text"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                className="input"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
              />

              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="input"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
              />

              <div className="password-container">
                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="input"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                />
                <div className="eye-icon">
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                onClick={() => {
                  console.log("🚀 BOUTON CLICKED: CREATE ACCOUNT button pressed");
                  console.log("🚀 Form data:", formData);
                  console.log("🚀 Role:", role);
                  console.log("🚀 Loading:", loading);
                  if (!loading) {
                    handleSignUp();
                  } else {
                    console.log("🚀 Bouton désactivé pendant le chargement");
                  }
                }}
              >
                {loading ? "Création..." : "CREATE ACCOUNT"}
              </button>
            </form>

            {/* Footer */}
            <div className="footer">
              <p>
                Already have an account?{" "}
                <span onClick={handleLoginLink}>
                  Log in
                </span>
              </p>
            </div>
          </div>
        </div>
      </MobileViewport>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#0E1528" }}>
      <Text>Create Account Screen</Text>
    </View>
  );
}
