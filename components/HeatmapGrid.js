import React from "react";
import { View, Text } from "react-native";

// 0 -> rouge, 50 -> jaune, 100 -> vert
function colorFor(v){
  const x = Math.max(0, Math.min(100, Number(v)||0));
  // simple gradient: red->yellow->green
  const r = x < 50 ? 255 : Math.round(255 - (x-50)*5.1);
  const g = x < 50 ? Math.round(x*5.1) : 255;
  return `rgb(${r},${g},0)`;
}

export default function HeatmapGrid({ indicators=[], rows=[] }){
  // rows: [{name:"Joueur A", values:{intensity_avg:70, fatigue:30, ...}}, ...]
  return (
    <View style={{ borderWidth:1, borderColor:"#e5e7eb", borderRadius:10, overflow:"hidden" }}>
      {/* Header */}
      <View style={{ flexDirection:"row", backgroundColor:"#f9fafb" }}>
        <View style={{ width:120, padding:8, borderRightWidth:1, borderColor:"#e5e7eb" }}>
          <Text style={{ fontWeight:"700" }}>Joueur</Text>
        </View>
        {indicators.map(key=>(
          <View key={key} style={{ width:80, padding:8, borderRightWidth:1, borderColor:"#e5e7eb", alignItems:"center" }}>
            <Text numberOfLines={1} style={{ fontWeight:"700", fontSize:12 }}>{key.replace(/_/g," ")}</Text>
          </View>
        ))}
      </View>
      {/* Rows */}
      {rows.map((r,ri)=>(
        <View key={ri} style={{ flexDirection:"row", borderTopWidth:1, borderColor:"#e5e7eb" }}>
          <View style={{ width:120, padding:8, borderRightWidth:1, borderColor:"#e5e7eb" }}>
            <Text numberOfLines={1} style={{ fontWeight:"600" }}>{r.name||r.uid}</Text>
          </View>
          {indicators.map(key=>{
            const v = r.values?.[key];
            return (
              <View key={key} style={{ width:80, height:40, borderRightWidth:1, borderColor:"#e5e7eb", justifyContent:"center", alignItems:"center", backgroundColor: colorFor(v) }}>
                <Text style={{ fontSize:12, color:"#111" }}>{typeof v==="number" ? Math.round(v) : "-"}</Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}