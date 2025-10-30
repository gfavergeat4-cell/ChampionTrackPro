import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, Text, StyleSheet } from "react-native";
import { tokens } from "../src/theme/tokens";
import MobileViewport from "../src/components/MobileViewport";

// Import screens
import HomeTabs from "../screens/HomeTabs";
import CalendarScreen from "../screens/CalendarScreen";
import StatsScreen from "../screens/StatsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import Questionnaire from "../screens/Questionnaire";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Custom tab bar icon component
function TabIcon({ icon, label, focused }) {
  return (
    <View style={styles.tabIconContainer}>
      <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>
        {icon}
      </Text>
      <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>
        {label}
      </Text>
      {focused && <View style={styles.activeIndicator} />}
    </View>
  );
}

// Main tab navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "rgba(10, 10, 10, 0.95)",
          borderTopWidth: 1,
          borderTopColor: `${tokens.colors.text}10`,
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarActiveTintColor: tokens.colors.accentCyan,
        tabBarInactiveTintColor: tokens.colors.muted,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeTabs}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🏠" label="Home" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📅" label="Schedule" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📊" label="Stats" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="👤" label="Profile" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Main stack navigator that includes tabs and modal screens
export default function MainTabNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen 
        name="Questionnaire" 
        component={Questionnaire}
        options={{
          presentation: "modal",
          gestureEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    flex: 1,
  },
  tabIcon: {
    fontSize: 24,
    marginBottom: 4,
    color: tokens.colors.muted,
  },
  tabIconFocused: {
    color: tokens.colors.accentCyan,
    textShadowColor: tokens.colors.accentCyan,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: tokens.typography.ui,
    color: tokens.colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tabLabelFocused: {
    color: tokens.colors.accentCyan,
  },
  activeIndicator: {
    position: "absolute",
    bottom: -8,
    height: 3,
    width: 24,
    backgroundColor: tokens.colors.accentCyan,
    borderRadius: 2,
    shadowColor: tokens.colors.accentCyan,
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 4,
  },
});
