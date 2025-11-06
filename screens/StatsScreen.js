import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { auth, db } from "../services/firebaseConfig";
import { collectionGroup, getDocs, orderBy, limit, query } from "firebase/firestore";

export default function StatsScreen({ navigation }) {
  const [rpes, setRpes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        
        const cg = collectionGroup(db, "responses");
        const qy = query(cg, orderBy("createdAt", "desc"), limit(10));
        const snap = await getDocs(qy);
        
        if (cancelled) return;
        
        const rows = [];
        snap.forEach(doc => {
          const data = doc.data();
          if (data && typeof data.rpe === "number") {
            rows.push({
              id: doc.id,
              rpe: data.rpe,
              fatigue: data.fatigue || 0,
              sleep: data.sleep || 0,
              createdAt: data.createdAt?.toDate?.() || new Date(),
            });
          }
        });
        
        setRpes(rows);
      } catch (error) {
        console.error("Error loading stats:", error);
        setRpes([]);
      } finally {
        setLoading(false);
      }
    })();
    
    return () => { cancelled = true; };
  }, []);

  const maxRpe = Math.max(10, ...rpes.map(r => r.rpe));
  const avgRpe = rpes.length > 0 ? rpes.reduce((sum, r) => sum + r.rpe, 0) / rpes.length : 0;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#00E0FF" />
        <Text style={styles.loadingText}>Loading your stats...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Performance</Text>
        <Text style={styles.subtitle}>Training insights and analytics</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{rpes.length}</Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{Math.round(avgRpe)}</Text>
          <Text style={styles.statLabel}>Avg RPE</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{maxRpe}</Text>
          <Text style={styles.statLabel}>Max RPE</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Sessions</Text>
        {rpes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              No data yet. Complete some questionnaires to see your stats!
            </Text>
          </View>
        ) : (
          <View style={styles.sessionsList}>
            {rpes.map((session, idx) => (
              <View key={session.id} style={styles.sessionCard}>
                <View style={styles.sessionHeader}>
                  <Text style={styles.sessionNumber}>Session {idx + 1}</Text>
                  <Text style={styles.sessionDate}>
                    {session.createdAt.toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.sessionStats}>
                  <View style={styles.statRow}>
                    <Text style={styles.statName}>RPE</Text>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { width: `${(session.rpe / maxRpe) * 100}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.statValue}>{session.rpe}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statName}>Fatigue</Text>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { width: `${session.fatigue}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.statValue}>{session.fatigue}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statName}>Sleep</Text>
                    <View style={styles.progressBar}>
                      <View 
                        style={[
                          styles.progressFill, 
                          { width: `${session.sleep}%` }
                        ]} 
                      />
                    </View>
                    <Text style={styles.statValue}>{session.sleep}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0E1528",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 100,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0E1528",
  },
  loadingText: {
    color: "#FFFFFF",
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
    fontFamily: "Inter",
    marginBottom: 8,
  },
  subtitle: {
    color: "#B4B8C2",
    fontSize: 16,
    fontFamily: "Inter",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  statCard: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#2B2E36",
  },
  statValue: {
    color: "#00E0FF",
    fontSize: 24,
    fontWeight: "700",
    fontFamily: "Inter",
  },
  statLabel: {
    color: "#B4B8C2",
    fontSize: 12,
    fontFamily: "Inter",
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
    fontFamily: "Inter",
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2B2E36",
  },
  emptyText: {
    color: "#B4B8C2",
    fontSize: 16,
    textAlign: "center",
    fontFamily: "Inter",
  },
  sessionsList: {
    gap: 16,
  },
  sessionCard: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#2B2E36",
  },
  sessionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sessionNumber: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter",
  },
  sessionDate: {
    color: "#B4B8C2",
    fontSize: 14,
    fontFamily: "Inter",
  },
  sessionStats: {
    gap: 12,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statName: {
    color: "#B4B8C2",
    fontSize: 14,
    fontFamily: "Inter",
    width: 60,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#2B2E36",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#00E0FF",
    borderRadius: 4,
  },
});




