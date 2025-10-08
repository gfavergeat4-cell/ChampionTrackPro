import "react-native-gesture-handler";
import React, { useEffect, useState, Suspense } from "react";
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { auth, db } from "./firebaseConfig";
import { onAuthStateChanged, signInWithEmailAndPassword, signInAnonymously, signOut,
  createUserWithEmailAndPassword, setPersistence, browserLocalPersistence, inMemoryPersistence } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

const MyData         = React.lazy(()=> import("./screens/MyData"));
const TrainingScreen = React.lazy(()=> import("./screens/TrainingSchedule"));
const Questionnaire  = React.lazy(()=> import("./screens/SessionQuestionnaire"));

async function ensurePersistence(){ try{ await setPersistence(auth, browserLocalPersistence); } catch{ await setPersistence(auth, inMemoryPersistence); } }
async function ensureUserDoc(u){
  try{ if(!u) return;
    const ref = doc(db,"users", u.uid); const snap = await getDoc(ref);
    if(!snap.exists()) await setDoc(ref, { email: u.email ?? null, role:"athlete", createdAt: serverTimestamp() }, { merge:true });
  }catch(e){ console.error("ensureUserDoc", e); }
}
function Loader(){ return <View style={{ padding:16, alignItems:"center" }}><ActivityIndicator/><Text style={{ marginTop:8 }}>Chargement??</Text></View>; }

function PlanningSafe({ onClose }){
  let Nav, createStack, err=null;
  try{
    Nav = require("@react-navigation/native");
    try{ createStack = require("@react-navigation/native-stack").createNativeStackNavigator; }
    catch{ createStack = require("REMOVED_STACK").createStackNavigator; }
  }catch(e){ err = "React Navigation manquant (npm i @react-navigation/native @react-navigation/native-stack)"; }
  if(err){ return <View style={{ padding:16 }}><Text style={{ color:"#b91c1c", fontWeight:"800" }}>{err}</Text></View>; }
  const Stack = createStack();
  return (
    <View style={{ flex:1 }}>
      <View style={{ padding:10, borderBottomWidth:1, borderColor:"#e5e7eb", backgroundColor:"#f9fafb", flexDirection:"row", justifyContent:"space-between", alignItems:"center" }}>
        <Text style={{ fontWeight:"800" }}>Planning</Text>
        <TouchableOpacity onPress={onClose} style={{ paddingHorizontal:12, paddingVertical:6, backgroundColor:"#e5e7eb", borderRadius:8 }}>
          <Text style={{ fontWeight:"700" }}>Fermer</Text>
        </TouchableOpacity>
      </View>
      <Nav.NavigationContainer>
        <React.Suspense fallback={<Loader/>}>
          <Stack.Navigator initialRouteName="Planning">
            <Stack.Screen name="Planning" component={TrainingScreen} options={{ title:"Planning" }}/>
            <Stack.Screen name="Questionnaire" component={Questionnaire} options={{ title:"Questionnaire" }}/>
          </Stack.Navigator>
        </React.Suspense>
      </Nav.NavigationContainer>
    </View>
  );
}

export default function App(){
  const [user,setUser]   = useState(undefined);
  const [role,setRole]   = useState(null);
  const [email,setEmail] = useState(""); const [pwd,setPwd] = useState("");
  const [busy,setBusy]   = useState(false); const [err,setErr] = useState(null);
  const [mode,setMode]   = useState("login");
  const [view,setView]   = useState("home");
  const [showPlan,setShowPlan] = useState(false);

  useEffect(()=>{ (async()=>{
    try{ await ensurePersistence(); }catch(e){}
    const unsub = onAuthStateChanged(auth, async (u)=>{ try{ if(u) await ensureUserDoc(u);}catch(e){}; setUser(u??null); setErr(null); });
    return ()=> unsub();
  })(); },[]);

  useEffect(()=>{ (async()=>{
    if(user?.uid){
      try{ const me=await getDoc(doc(db,"users", user.uid)); setRole(me.exists()?(me.data().role||"athlete"):"athlete"); }
      catch(e){ console.error(e); }
    } else setRole(null);
  })(); },[user?.uid]);

  async function doLogin(){ try{ setBusy(true); const c=await signInWithEmailAndPassword(auth,String(email).trim(),String(pwd)); await ensureUserDoc(c.user); }
    catch(e){ setErr(e?.message||String(e)); Alert.alert("Connexion", e?.message??String(e)); } finally{ setBusy(false);} }
  async function doSignup(){ try{ setBusy(true); const c=await createUserWithEmailAndPassword(auth,String(email).trim(),String(pwd)); await ensureUserDoc(c.user); }
    catch(e){ setErr(e?.message||String(e)); Alert.alert("Cr�ation", e?.message??String(e)); } finally{ setBusy(false);} }
  async function doAnon(){ try{ setBusy(true); const c=await signInAnonymously(auth); await ensureUserDoc(c.user); }
    catch(e){ setErr(e?.message||String(e)); Alert.alert("Connexion anonyme", e?.message??String(e)); } finally{ setBusy(false);} }
  async function doLogout(){ try{ await signOut(auth); setView("home"); setShowPlan(false);}catch(e){} }
  async function testWrite(){
    if(!user?.uid) return;
    try{ setBusy(true); await setDoc(doc(db,"users", user.uid, "debug", "ping"), { at: serverTimestamp() }, { merge:true });
      Alert.alert("Firestore", "�criture test OK"); }
    catch(e){ Alert.alert("Firestore", e?.message||String(e)); } finally{ setBusy(false); }
  }

  if(user===undefined) return (<SafeAreaView style={{flex:1,justifyContent:"center",alignItems:"center"}}><ActivityIndicator/><Text>Chargement??</Text></SafeAreaView>);

  if(!user){
    const title = mode==="login" ? "Connexion" : "Cr�ation de compte";
    const primaryAction = mode==="login" ? doLogin : doSignup;
    const primaryLabel  = mode==="login" ? "Se connecter" : "Cr�er le compte";
    const switchLabel   = mode==="login" ? "Cr�er un compte" : "J'ai d�j� un compte";
    return (
      <SafeAreaView style={{ flex:1, backgroundColor:"#fff", padding:16 }}>
        <Text style={{ fontSize:22, fontWeight:"800", marginBottom:12 }}>{title}</Text>
        {!!err && <Text style={{ color:"#b91c1c", marginBottom:8 }}>{err}</Text>}
        <TextInput placeholder="Email" autoCapitalize="none" keyboardType="email-address"
          value={email} onChangeText={setEmail}
          style={{ borderWidth:1, borderColor:"#e5e7eb", borderRadius:8, padding:12, marginBottom:8 }}/>
        <TextInput placeholder="Mot de passe" secureTextEntry
          value={pwd} onChangeText={setPwd}
          style={{ borderWidth:1, borderColor:"#e5e7eb", borderRadius:8, padding:12, marginBottom:12 }}/>
        <TouchableOpacity onPress={primaryAction} disabled={busy || !email || !pwd}
          style={{ backgroundColor:(!email||!pwd)?"#9ca3af":"#111827", padding:14, borderRadius:10, marginBottom:10, alignItems:"center" }}>
          {busy? <ActivityIndicator color="#fff"/> : <Text style={{ color:"#fff", fontWeight:"700" }}>{primaryLabel}</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={()=> setMode(mode==="login"?"signup":"login")} disabled={busy}
          style={{ backgroundColor:"#e5e7eb", padding:12, borderRadius:10, alignItems:"center", marginBottom:10 }}>
          <Text style={{ fontWeight:"700", color:"#111827" }}>{switchLabel}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={doAnon} disabled={busy}
          style={{ backgroundColor:"#f3f4f6", padding:12, borderRadius:10, alignItems:"center" }}>
          <Text style={{ fontWeight:"700", color:"#111827" }}>Connexion anonyme (test)</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if(showPlan) return <PlanningSafe onClose={()=> setShowPlan(false)} />;

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:"#fff" }}>
      <View style={{ padding:16, borderBottomWidth:1, borderColor:"#e5e7eb" }}>
        <Text style={{ fontSize:18, fontWeight:"800" }}>ACCUEIL V10</Text>
        <Text style={{ color:"#6b7280" }}>UID: {user.uid} ?? Email: {user.email ?? "??"} ?? R�le: {role ?? "??"}</Text>
        <View style={{ flexDirection:"row", flexWrap:"wrap", marginTop:10 }}>
          <TouchableOpacity onPress={()=> setShowPlan(true)} style={{ backgroundColor:"#16a34a", padding:10, borderRadius:10, marginRight:8, marginBottom:8 }}>
            <Text style={{ color:"#fff", fontWeight:"700" }}>Ouvrir Planning</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=> setView("data")} style={{ backgroundColor:"#e5e7eb", padding:10, borderRadius:10, marginRight:8, marginBottom:8 }}>
            <Text style={{ fontWeight:"700" }}>Mes donn�es</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={testWrite} style={{ backgroundColor:"#10b981", padding:10, borderRadius:10, marginRight:8, marginBottom:8 }}>
            <Text style={{ fontWeight:"700", color:"#fff" }}>Test Firestore write</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={doLogout} style={{ backgroundColor:"#ef4444", padding:10, borderRadius:10, marginRight:8, marginBottom:8 }}>
            <Text style={{ fontWeight:"700", color:"#fff" }}>Se d�connecter</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ flex:1 }}>
        {view==="home" && <View style={{ padding:16 }}><Text style={{ color:"#6b7280" }}>Choisis un �cran ci-dessus.</Text></View>}
        {view==="data" && (<Suspense fallback={<Loader/>}><MyData/></Suspense>)}
      </View>
    </SafeAreaView>
  );
}