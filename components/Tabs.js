import React from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";

const items = [
  { key:"home", label:"Accueil", icon:"🏠" },
  { key:"cal",  label:"Calendrier", icon:"📅" },
  { key:"rep",  label:"Rapports",   icon:"📈" },
  { key:"menu", label:"Menu",       icon:"⚙️" },
];

export default function Tabs({ current, onChange }) {
  return (
    <View style={styles.bar}>
      {items.map(it => {
        const active = current===it.key;
        return (
          <Pressable key={it.key} onPress={()=>onChange(it.key)} style={[styles.item, active && styles.active]}>
            <Text style={{fontSize:20}}>{it.icon}</Text>
            <Text style={[styles.lbl, active && styles.lblActive]}>{it.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar:{ flexDirection:"row", borderTopWidth:1, borderColor:"#eee", backgroundColor:"#fff" },
  item:{ flex:1, alignItems:"center", paddingVertical:10, gap:4 },
  active:{ backgroundColor:"#eef5ff" },
  lbl:{ color:"#333", fontWeight:"600" },
  lblActive:{ color:"#0a66c2" },
});
