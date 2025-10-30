import React, { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import { auth } from "../../firebaseConfig";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";

export default function AuthScreen() {
  const [email, setEmail] = useState(""); const [pass, setPass] = useState("");
  const [mode, setMode] = useState("login"); const [msg, setMsg] = useState("");

  const go = async () => {
    setMsg("");
    try {
      if (mode === "login") await signInWithEmailAndPassword(auth, email.trim(), pass);
      else await createUserWithEmailAndPassword(auth, email.trim(), pass);
    } catch (e) { setMsg(String(e?.message || e)); }
  };

  return (
    <View style={{ flex:1, padding:24, gap:12, justifyContent:"center" }}>
      <Text style={{ fontSize:22, fontWeight:"600" }}>ChampionTrack Pro</Text>
      <TextInput placeholder="Email" autoCapitalize="none" keyboardType="email-address"
        value={email} onChangeText={setEmail} style={{ borderWidth:1, padding:12, borderRadius:8 }} />
      <TextInput placeholder="Password" secureTextEntry value={pass} onChangeText={setPass}
        style={{ borderWidth:1, padding:12, borderRadius:8 }} />
      <Button title={mode === "login" ? "Sign in" : "Sign up"} onPress={go} />
      <Button title={mode === "login" ? "Create an account" : "I already have an account"}
        onPress={() => setMode(mode === "login" ? "signup" : "login")} />
      {msg ? <Text style={{ color:"crimson" }}>{msg}</Text> : null}
      <View style={{ height:12 }} />
      <Button title="Sign out" onPress={() => signOut(auth)} />
    </View>
  );
}
