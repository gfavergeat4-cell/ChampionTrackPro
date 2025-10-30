import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebaseConfig";

export default function ProfileScreen({ navigation }) {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await signOut(auth);
            } catch (error) {
              console.error("Logout error:", error);
              Alert.alert("Error", "Failed to logout. Please try again.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const user = auth.currentUser;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Manage your account</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </Text>
          </View>
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.userEmail}>{user?.email || "No email"}</Text>
          <Text style={styles.userRole}>Athlete</Text>
        </View>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>⚙️</Text>
          <Text style={styles.menuText}>Settings</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>📊</Text>
          <Text style={styles.menuText}>Training History</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>🏆</Text>
          <Text style={styles.menuText}>Achievements</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuIcon}>📱</Text>
          <Text style={styles.menuText}>Notifications</Text>
          <Text style={styles.menuArrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.logoutSection}>
        <TouchableOpacity 
          style={[styles.logoutButton, loading && styles.logoutButtonDisabled]} 
          onPress={handleLogout}
          disabled={loading}
        >
          <Text style={styles.logoutText}>
            {loading ? "Logging out..." : "Logout"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0E1528",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
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
  profileCard: {
    backgroundColor: "#111827",
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#2B2E36",
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#4A67FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#00E0FF",
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "700",
    fontFamily: "Inter",
  },
  userInfo: {
    alignItems: "center",
  },
  userEmail: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    fontFamily: "Inter",
    marginBottom: 4,
  },
  userRole: {
    color: "#00E0FF",
    fontSize: 14,
    fontFamily: "Inter",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  menuSection: {
    marginHorizontal: 24,
    marginBottom: 32,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2B2E36",
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter",
  },
  menuArrow: {
    color: "#B4B8C2",
    fontSize: 20,
    fontFamily: "Inter",
  },
  logoutSection: {
    marginHorizontal: 24,
    marginTop: "auto",
    marginBottom: 100,
  },
  logoutButton: {
    backgroundColor: "#EF4444",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  logoutButtonDisabled: {
    opacity: 0.6,
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "Inter",
  },
});



