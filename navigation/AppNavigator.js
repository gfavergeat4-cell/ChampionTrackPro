import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { onAuthStateChanged, setPersistence, browserLocalPersistence } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import Landing from "../screens/Landing";
import Login from "../screens/Login";
import Register from "../screens/Register";
import MainTabNavigator from "./MainTabNavigator";

const Stack = createNativeStackNavigator();

function AuthGate() {
  const [state, setState] = React.useState({ loading: true, user: null });

  React.useEffect(() => {
    console.log("🔐 AuthGate: Initializing...");
    setPersistence(auth, browserLocalPersistence).catch((e) => {
      console.log("⚠️ AuthGate: Persistence error:", e);
    });
    
    const unsub = onAuthStateChanged(auth, (u) => {
      console.log("🔐 AuthGate: Auth state changed:", u ? `User: ${u.email} (${u.uid})` : "No user");
      setState({ loading: false, user: u });
    });
    
    return () => {
      console.log("🔐 AuthGate: Cleaning up...");
      unsub();
    };
  }, []);

  console.log("🔐 AuthGate: Current state:", { loading: state.loading, hasUser: !!state.user });

  if (state.loading) {
    console.log("🔐 AuthGate: Loading...");
    return null;
  }

  if (state.user) {
    console.log("🔐 AuthGate: User authenticated, showing MainTabNavigator");
    return <MainTabNavigator />;
  } else {
    console.log("🔐 AuthGate: No user, showing auth stack");
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Landing" component={Landing} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
      </Stack.Navigator>
    );
  }
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <AuthGate />
    </NavigationContainer>
  );
}