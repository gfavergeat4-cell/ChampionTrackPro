import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { onAuthStateChanged, setPersistence, browserLocalPersistence } from "firebase/auth";
import { auth, db } from "../services/firebaseConfig";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import SplashScreen from "../src/components/SplashScreen";

// Import Stitch screens
import LandingScreen from "../screens/StitchLandingScreen";
import CreateAccountScreen from "../screens/StitchCreateAccountScreen";
import LoginScreen from "../screens/StitchLoginScreen";
import HomeScreen from "../screens/StitchHomeScreenClean";
import ScheduleScreen from "../screens/StitchScheduleScreen";
import ProfileScreen from "../screens/StitchProfileScreen";
import QuestionnaireScreen from "../screens/StitchQuestionnaireScreen";
import AdminDashboard from "../screens/StitchAdminDashboard";
import TeamDetails from "../screens/StitchTeamDetails";
import DevEventsProbe from "../screens/DevEventsProbe";

const AuthStack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();

// Auth Stack (Landing, Create Account, Login)
function AuthStackNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Landing" component={LandingScreen} />
      <AuthStack.Screen name="CreateAccount" component={CreateAccountScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
    </AuthStack.Navigator>
  );
}

// Athlete Tabs (Home, Schedule, Profile) - Navigation simple sans barre du bas
function AthleteTabs() {
  const AthleteTab = createBottomTabNavigator();
  return (
    <AthleteTab.Navigator 
      screenOptions={{ 
        headerShown: false,
        tabBarStyle: { display: 'none' }, // Masque complètement la barre de navigation
      }}
    >
      <AthleteTab.Screen name="Home" component={HomeScreen} />
      <AthleteTab.Screen name="Schedule" component={ScheduleScreen} />
      <AthleteTab.Screen name="Profile" component={ProfileScreen} />
    </AthleteTab.Navigator>
  );
}

// Composant d'icône harmonisé
const TabIcon = ({ name, color, size = 24, focused }) => {
  const iconStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: focused ? 'rgba(0,224,255,0.15)' : 'transparent',
    border: focused ? '1px solid rgba(0,224,255,0.3)' : '1px solid transparent',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: focused ? '0 4px 12px rgba(0,224,255,0.2)' : 'none',
  };

  const getIcon = () => {
    switch (name) {
      case 'Home':
        return (
          <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="9,22 9,12 15,12 15,22" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'Schedule':
        return (
          <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2.5" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="3" y1="10" x2="21" y2="10" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'Profile':
        return (
          <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'Dashboard':
        return (
          <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2.5" viewBox="0 0 24 24">
            <rect x="3" y="3" width="7" height="7" rx="1" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="14" y="3" width="7" height="7" rx="1" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="14" y="14" width="7" height="7" rx="1" strokeLinecap="round" strokeLinejoin="round"/>
            <rect x="3" y="14" width="7" height="7" rx="1" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'Teams':
        return (
          <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M23 21v-2a4 4 0 00-3-3.87" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'Analytics':
        return (
          <svg width={size} height={size} fill="none" stroke={color} strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M18 20V10" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 20V4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6 20v-6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div style={iconStyle}>
      {getIcon()}
    </div>
  );
};

// Admin Tabs (Dashboard, Teams, Analytics, Profile)
function AdminTabs() {
  const AdminTab = createBottomTabNavigator();
  return (
    <AdminTab.Navigator 
      screenOptions={{ 
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#0E1528',
          borderTopColor: '#2B2E36',
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 16,
          paddingTop: 16,
        },
        tabBarActiveTintColor: '#00E0FF',
        tabBarInactiveTintColor: '#9CA3AF',
      }}
    >
      <AdminTab.Screen 
        name="AdminDashboard" 
        component={AdminDashboard}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="Dashboard" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <AdminTab.Screen 
        name="Teams" 
        component={AdminDashboard}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="Teams" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <AdminTab.Screen 
        name="Analytics" 
        component={AdminDashboard}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="Analytics" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <AdminTab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="Profile" color={color} size={size} focused={focused} />
          ),
        }}
      />
    </AdminTab.Navigator>
  );
}

// Coach Tabs (placeholder for future)
function CoachTabs() {
  const CoachTab = createBottomTabNavigator();
  return (
    <CoachTab.Navigator 
      screenOptions={{ 
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#0E1528',
          borderTopColor: '#2B2E36',
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 16,
          paddingTop: 16,
        },
        tabBarActiveTintColor: '#00E0FF',
        tabBarInactiveTintColor: '#9CA3AF',
      }}
    >
      <CoachTab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="Home" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <CoachTab.Screen 
        name="Schedule" 
        component={ScheduleScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="Schedule" color={color} size={size} focused={focused} />
          ),
        }}
      />
      <CoachTab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon name="Profile" color={color} size={size} focused={focused} />
          ),
        }}
      />
    </CoachTab.Navigator>
  );
}

// Root Stack Navigator with role-based routing
function RootStackNavigator({ role, user }) {
  console.log("[ROOT] role at render =", role);
  console.log("[ROOT] user =", user?.email);
  
  // Normalize role (toLowerCase, trim)
  const normalizedRole = String(role || '').trim().toLowerCase();
  console.log("[ROOT] normalized role =", normalizedRole);
  
  if (normalizedRole === 'admin') {
    console.log("Rendering AdminTabs");
    return (
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="AdminMain" component={AdminTabs} />
        <RootStack.Screen name="TeamDetails" component={TeamDetails} />
        <RootStack.Screen name="DevEventsProbe" component={DevEventsProbe} />
        <RootStack.Screen 
          name="Questionnaire" 
          component={QuestionnaireScreen}
          options={{
            presentation: "modal",
            gestureEnabled: true,
          }}
        />
      </RootStack.Navigator>
    );
  }
  
  if (normalizedRole === 'coach') {
    console.log("Rendering CoachTabs");
    return (
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="CoachMain" component={CoachTabs} />
        <RootStack.Screen 
          name="Questionnaire" 
          component={QuestionnaireScreen}
          options={{
            presentation: "modal",
            gestureEnabled: true,
          }}
        />
      </RootStack.Navigator>
    );
  }
  
  if (normalizedRole === 'athlete') {
    console.log("Rendering AthleteTabs");
    return (
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        <RootStack.Screen name="AthleteMain" component={AthleteTabs} />
        <RootStack.Screen 
          name="Questionnaire" 
          component={QuestionnaireScreen}
          options={{
            presentation: "modal",
            gestureEnabled: true,
          }}
        />
      </RootStack.Navigator>
    );
  }
  
  console.log("Rendering AuthStack (guest/none)");
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="Auth" component={AuthStackNavigator} />
      <RootStack.Screen 
        name="Questionnaire" 
        component={QuestionnaireScreen}
        options={{
          presentation: "modal",
          gestureEnabled: true,
        }}
      />
    </RootStack.Navigator>
  );
}

// Auth Gate Component with proper role detection
function AuthGate() {
  const [state, setState] = React.useState({ 
    loading: true, 
    user: null, 
    userRole: null,
    authReady: false 
  });

  // Timeout pour éviter que l'écran de chargement reste bloqué
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (!state.authReady) {
        console.log("⚠️ Auth timeout - showing landing screen");
        setState({ loading: false, user: null, userRole: null, authReady: true });
      }
    }, 5000); // 5 secondes de timeout

    return () => clearTimeout(timeout);
  }, [state.authReady]);

  React.useEffect(() => {
    console.log("🚀 Initializing auth...");
    
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.error("❌ Error setting persistence:", error);
    });
    
    const unsub = onAuthStateChanged(auth, async (u) => {
      console.log("🔍 Auth state changed:", u?.email);
      
      if (u) {
        try {
          console.log("👤 User authenticated, fetching role...");
          // Récupérer le rôle depuis Firestore
          const userDoc = await getDoc(doc(db, "users", u.uid));
          let role = "athlete"; // Default role
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const rawRole = userData.role || "athlete";
            // Normalize role (toLowerCase, trim)
            role = String(rawRole).trim().toLowerCase();
            console.log("📄 User document exists:", userData);
            console.log("📄 Raw role from Firestore:", rawRole);
            console.log("📄 Normalized role:", role);
            console.log("📄 Role comparison (admin):", role === "admin");
          } else {
            console.log("⚠️ No user document found, creating admin document for gabfavergeat@gmail.com");
            // Créer automatiquement le document admin pour gabfavergeat@gmail.com
            if (u.email === "gabfavergeat@gmail.com") {
              await setDoc(doc(db, "users", u.uid), {
                email: u.email,
                role: "admin",
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
              role = "admin";
              console.log("✅ Admin document created automatically");
            }
          }
          
          console.log("👤 User state:", { user: u?.email, role });
          setState({ loading: false, user: u, userRole: role, authReady: true });
        } catch (error) {
          console.error("❌ Error fetching user role:", error);
          // Fallback to email-based detection
          const role = u.email === "gabfavergeat@gmail.com" ? "admin" : "athlete";
          console.log("🔄 Fallback role detection:", role);
          setState({ loading: false, user: u, userRole: role, authReady: true });
        }
      } else {
        console.log("👤 No user logged in");
        setState({ loading: false, user: null, userRole: null, authReady: true });
      }
    });
    
    return () => unsub();
  }, []);

  // Show splash screen while loading
  if (!state.authReady) {
    return <SplashScreen />;
  }

  return <RootStackNavigator role={state.userRole} user={state.user} />;
}

export default function StitchNavigator() {
  return (
    <NavigationContainer>
      <AuthGate />
    </NavigationContainer>
  );
}