import React from "react";
import { View, Text, ScrollView } from "react-native";

/** Affiche toute erreur runtime pour éviter les pages blanches silencieuses. */
export default class DevErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state = {error:null, info:null}; }
  static getDerivedStateFromError(error){ return { error }; }
  componentDidCatch(error, info){ this.setState({ info }); console.error("[ErrorBoundary]", error, info); }
  render(){
    if (!this.state.error) return this.props.children;
    return (
      <ScrollView contentContainerStyle={{padding:16, backgroundColor:"#fff"}}>
        <View style={{borderWidth:1, borderColor:"#f00", borderRadius:12, padding:16}}>
          <Text style={{fontWeight:"800", color:"#b00020", fontSize:18, marginBottom:8}}>Erreur d’exécution</Text>
          <Text selectable style={{color:"#111", marginBottom:12}}>{String(this.state.error?.message || this.state.error)}</Text>
          {this.state.info?.componentStack ? (
            <Text selectable style={{color:"#444", fontFamily:"monospace"}}>{this.state.info.componentStack}</Text>
          ) : null}
        </View>
      </ScrollView>
    );
  }
}

/** Active un catcher global navigateur (web) */
if (typeof window !== "undefined") {
  window.addEventListener("error", (e) => {
    console.error("[window.error]", e.error || e.message || e);
  });
  window.addEventListener("unhandledrejection", (e) => {
    console.error("[unhandledrejection]", e.reason || e);
  });
}
