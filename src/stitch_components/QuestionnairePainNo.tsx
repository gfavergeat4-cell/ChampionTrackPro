import React from "react";
import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import { tokens } from "../theme/tokens";
import { makePress } from "../utils/press";

interface QuestionnaireProps {
  rpe: number;
  setRpe: (v: number) => void;
  fatigue: number;
  setFatigue: (v: number) => void;
  sleep: number;
  setSleep: (v: number) => void;
  onSave: () => void;
  saving?: boolean;
  error?: string;
}

export default function QuestionnairePainNo({
  rpe,
  setRpe,
  fatigue,
  setFatigue,
  sleep,
  setSleep,
  onSave,
  saving,
  error
}: QuestionnaireProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Questionnaire</Text>
      <Text style={styles.subtitle}>Pain: No</Text>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>RPE: <Text style={styles.fieldValue}>{rpe}</Text></Text>
        <View style={styles.row}>
          <Pressable style={styles.chip} onPress={makePress(() => setRpe(Math.max(0, rpe-10)))} onClick={makePress(() => setRpe(Math.max(0, rpe-10)))} role={Platform.OS === "web" ? "button" : undefined} tabIndex={Platform.OS === "web" ? 0 : undefined}><Text style={styles.chipText}>-10</Text></Pressable>
          <Pressable style={styles.chip} onPress={makePress(() => setRpe(Math.max(0, rpe-1)))} onClick={makePress(() => setRpe(Math.max(0, rpe-1)))} role={Platform.OS === "web" ? "button" : undefined} tabIndex={Platform.OS === "web" ? 0 : undefined}><Text style={styles.chipText}>-1</Text></Pressable>
          <Pressable style={styles.chip} onPress={makePress(() => setRpe(Math.min(100, rpe+1)))} onClick={makePress(() => setRpe(Math.min(100, rpe+1)))} role={Platform.OS === "web" ? "button" : undefined} tabIndex={Platform.OS === "web" ? 0 : undefined}><Text style={styles.chipText}>+1</Text></Pressable>
          <Pressable style={styles.chip} onPress={makePress(() => setRpe(Math.min(100, rpe+10)))} onClick={makePress(() => setRpe(Math.min(100, rpe+10)))} role={Platform.OS === "web" ? "button" : undefined} tabIndex={Platform.OS === "web" ? 0 : undefined}><Text style={styles.chipText}>+10</Text></Pressable>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Fatigue: <Text style={styles.fieldValue}>{fatigue}</Text></Text>
        <View style={styles.row}>
          <Pressable style={styles.chip} onPress={makePress(() => setFatigue(Math.max(0, fatigue-10)))} onClick={makePress(() => setFatigue(Math.max(0, fatigue-10)))} role={Platform.OS === "web" ? "button" : undefined} tabIndex={Platform.OS === "web" ? 0 : undefined}><Text style={styles.chipText}>-10</Text></Pressable>
          <Pressable style={styles.chip} onPress={makePress(() => setFatigue(Math.max(0, fatigue-1)))} onClick={makePress(() => setFatigue(Math.max(0, fatigue-1)))} role={Platform.OS === "web" ? "button" : undefined} tabIndex={Platform.OS === "web" ? 0 : undefined}><Text style={styles.chipText}>-1</Text></Pressable>
          <Pressable style={styles.chip} onPress={makePress(() => setFatigue(Math.min(100, fatigue+1)))} onClick={makePress(() => setFatigue(Math.min(100, fatigue+1)))} role={Platform.OS === "web" ? "button" : undefined} tabIndex={Platform.OS === "web" ? 0 : undefined}><Text style={styles.chipText}>+1</Text></Pressable>
          <Pressable style={styles.chip} onPress={makePress(() => setFatigue(Math.min(100, fatigue+10)))} onClick={makePress(() => setFatigue(Math.min(100, fatigue+10)))} role={Platform.OS === "web" ? "button" : undefined} tabIndex={Platform.OS === "web" ? 0 : undefined}><Text style={styles.chipText}>+10</Text></Pressable>
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Sleep Quality: <Text style={styles.fieldValue}>{sleep}</Text></Text>
        <View style={styles.row}>
          <Pressable style={styles.chip} onPress={makePress(() => setSleep(Math.max(0, sleep-10)))} onClick={makePress(() => setSleep(Math.max(0, sleep-10)))} role={Platform.OS === "web" ? "button" : undefined} tabIndex={Platform.OS === "web" ? 0 : undefined}><Text style={styles.chipText}>-10</Text></Pressable>
          <Pressable style={styles.chip} onPress={makePress(() => setSleep(Math.max(0, sleep-1)))} onClick={makePress(() => setSleep(Math.max(0, sleep-1)))} role={Platform.OS === "web" ? "button" : undefined} tabIndex={Platform.OS === "web" ? 0 : undefined}><Text style={styles.chipText}>-1</Text></Pressable>
          <Pressable style={styles.chip} onPress={makePress(() => setSleep(Math.min(100, sleep+1)))} onClick={makePress(() => setSleep(Math.min(100, sleep+1)))} role={Platform.OS === "web" ? "button" : undefined} tabIndex={Platform.OS === "web" ? 0 : undefined}><Text style={styles.chipText}>+1</Text></Pressable>
          <Pressable style={styles.chip} onPress={makePress(() => setSleep(Math.min(100, sleep+10)))} onClick={makePress(() => setSleep(Math.min(100, sleep+10)))} role={Platform.OS === "web" ? "button" : undefined} tabIndex={Platform.OS === "web" ? 0 : undefined}><Text style={styles.chipText}>+10</Text></Pressable>
        </View>
      </View>

      <Pressable 
        style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
        onPress={makePress(onSave)} 
        onClick={makePress(onSave)}
        role={Platform.OS === "web" ? "button" : undefined}
        tabIndex={Platform.OS === "web" ? 0 : undefined}
        disabled={!!saving}
      >
        <Text style={styles.saveButtonText}>{saving ? "Saving..." : "Save"}</Text>
      </Pressable>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: tokens.spacing.xl
  },
  title: {
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
    fontSize: 22
  },
  subtitle: {
    marginTop: tokens.spacing.sm,
    color: tokens.colors.accentCyan,
    fontFamily: tokens.typography.ui,
    fontSize: 12
  },
  field: {
    width: "100%",
    maxWidth: 420,
    marginTop: tokens.spacing.lg
  },
  fieldLabel: {
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
    marginBottom: tokens.spacing.xs
  },
  fieldValue: {
    color: tokens.colors.accentCyan,
    fontWeight: "700"
  },
  row: {
    flexDirection: "row",
    gap: tokens.spacing.sm
  },
  chip: {
    backgroundColor: tokens.colors.graphite,
    borderRadius: 16,
    paddingVertical: tokens.spacing.xs,
    paddingHorizontal: tokens.spacing.md,
    zIndex: 10
  },
  chipText: {
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui
  },
  saveButton: {
    marginTop: tokens.spacing.xl,
    backgroundColor: tokens.colors.accentCyan,
    borderRadius: tokens.radii.lg,
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.lg,
    zIndex: 10
  },
  saveButtonDisabled: {
    opacity: 0.7
  },
  saveButtonText: {
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
    fontWeight: "700"
  },
  errorText: {
    color: tokens.colors.danger,
    marginTop: tokens.spacing.sm
  }
});


