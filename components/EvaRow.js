import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Slider from "@react-native-community/slider";

export default function EvaRow({ label, hintLeft="-", hintRight="+", value, onChange }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.rowHead}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.hintRight}>{hintRight}</Text>
      </View>
      <Text style={styles.hintLeft}>{hintLeft}</Text>
      <Slider
        style={{ width: "100%", height: 44 }}
        minimumValue={0}
        maximumValue={100}
        step={1}
        value={value ?? 50}
        onValueChange={onChange}
        minimumTrackTintColor="#0a66c2"
        maximumTrackTintColor="#bfeeea"
        thumbTintColor="#0a66c2"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:{ marginBottom:18 },
  rowHead:{ flexDirection:"row", justifyContent:"space-between", alignItems:"center" },
  label:{ fontWeight:"800", fontSize:18 },
  hintLeft:{ color:"#333", marginTop:2 },
  hintRight:{ color:"#333" },
});
