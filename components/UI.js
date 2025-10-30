import React from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";

/** Champ de saisie avec label (utilisé par Landing) */
export function Field({
  label,
  value,
  onChangeText,
  secure = false,
  keyboardType = "default",
  placeholder = "",
  autoCapitalize = "none",
  multiline = false,
  numberOfLines = 1,
  style,
  inputStyle,
}) {
  return (
    <View style={[styles.fieldWrap, style]}>
      {!!label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secure}
        keyboardType={keyboardType}
        placeholder={placeholder}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        numberOfLines={numberOfLines}
        style={[styles.input, inputStyle]}
      />
    </View>
  );
}

/** Bouton simple (utilisé partout) */
export function Button({ title, onPress, variant = "primary", style, textStyle }) {
  const isSecondary = variant === "secondary";
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.btn,
        isSecondary ? styles.btnSec : styles.btnPri,
        style,
      ]}
    >
      <Text
        style={[
          styles.btnText,
          isSecondary && { color: "#333" },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fieldWrap: { marginBottom: 12 },
  label: { marginBottom: 6, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  btn: { padding: 14, borderRadius: 10, alignItems: "center", marginTop: 8 },
  btnPri: { backgroundColor: "#0a66c2" },
  btnSec: { backgroundColor: "#eee", borderWidth: 1, borderColor: "#ccc" },
  btnText: { color: "#fff", fontWeight: "700" },
});
