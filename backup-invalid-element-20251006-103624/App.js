import React, { useEffect, useState } from "react";
import { SafeAreaView, View, ActivityIndicator, Text } from "react-native";
import DevErrorBoundary from "./components/DevErrorBoundary";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./services/firebaseConfig";

/** Imports écrans (doivent exister) */
import Landing from "./screens/Landing";
import AdminHome from "./screens/AdminHome";
import CoachHome from "./screens/CoachHome";
import AthleteHome from "./screens/AthleteHome";

/** Helpers rôle/meta */
import { getUserMeta, isAdminUser } from "./services/roles";

/** Petit composant d'état */
function Center({ children }) {
  return (
    <SafeAreaView style={{flex:1, alignItems:"center", justifyContent:"center"}}>
      {children}
    </SafeAreaView>
  )
}

export default function App() {
  const [boot, setBoot]   = useState(true);
  const [user, setUser]   = useState(null);
  const [route, setRoute] = useState({ role:null, teamId:null });

  useEffect(() => {
    console.log("[App] mount: écoute auth…");
    const unsub = onAuthStateChanged(auth, async (u) => {
      console.log("[App] onAuthStateChanged:", u?.uid || null);
      setUser(u);

      if (!u) {
        setRoute({ role:null, teamId:null });
        setBoot(false);
        return;
      }

      try {
        // 1) Admin prioritaire
        const admin = await isAdminUser(u.uid).catch(()=>false);
        console.log("[App] isAdminUser?", admin);
        if (admin) {
          setRoute({ role:"admin", teamId:null });
          setBoot(false);
          return;
        }

        // 2) Métadonnées user (role + teamId)
        const meta = await getUserMeta(u.uid);
        console.log("[App] meta:", meta);
        if (meta?.role) {
          setRoute({ role: meta.role, teamId: meta.teamId ?? null });
        } else {
          setRoute({ role:null, teamId:null }); // on laisse Landing guider post-signup
        }
      } catch (e) {
        console.error("[App] meta/admin error:", e);
        setRoute({ role:null, teamId:null });
      }
      setBoot(false);
    });
    return () => unsub();
  }, []);

  const onRouted = (role, teamId) => {
    console.log("[App] onRouted()", role, teamId);
    setRoute({ role, teamId: teamId ?? null });
  };

  const handleLogout = async () => {
    try { await signOut(auth); } catch {}
    setRoute({ role:null, teamId:null });
  };

  if (boot) {
    return (
      <DevErrorBoundary>
        <Center><ActivityIndicator /></Center>
      </DevErrorBoundary>
    );
  }

  /** Non connecté ou pas de rôle -> Landing */
  if (!user || !route.role) {
    return (
      <DevErrorBoundary>
        <SafeAreaView style={{ flex:1, backgroundColor:"#fff" }}>
          <Landing onRouted={onRouted} />
        </SafeAreaView>
      </DevErrorBoundary>
    );
  }

  if (route.role === "admin") {
    return (
      <DevErrorBoundary>
        <SafeAreaView style={{ flex:1, backgroundColor:"#fff" }}>
          <AdminHome onLogout={handleLogout} />
        </SafeAreaView>
      </DevErrorBoundary>
    );
  }

  if (route.role === "coach") {
    return (
      <DevErrorBoundary>
        <SafeAreaView style={{ flex:1, backgroundColor:"#fff" }}>
          <CoachHome teamId={route.teamId} onLogout={handleLogout} />
        </SafeAreaView>
      </DevErrorBoundary>
    );
  }

  if (route.role === "athlete") {
    return (
      <DevErrorBoundary>
        <SafeAreaView style={{ flex:1, backgroundColor:"#fff" }}>
          <AthleteHome teamId={route.teamId} onLogout={handleLogout} />
        </SafeAreaView>
      </DevErrorBoundary>
    );
  }

  return (
    <DevErrorBoundary>
      <Center><Text>Route inconnue.</Text></Center>
    </DevErrorBoundary>
  );
}

