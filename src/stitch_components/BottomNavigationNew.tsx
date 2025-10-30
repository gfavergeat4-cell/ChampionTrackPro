import React from "react";
import { View, Text, Pressable, StyleSheet, Dimensions, Platform } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { tokens } from "../theme/tokens";

interface Tab {
  id: string;
  label: string;
  icon: string;
  active?: boolean;
}

interface BottomNavigationProps {
  tabs: Tab[];
  onTabPress: (tabId: string) => void;
}

export default function BottomNavigation({ tabs, onTabPress }: BottomNavigationProps) {
  return (
    <View style={styles.container}>
      <View style={styles.navigation}>
        {tabs.map((tab) => (
          <Pressable
            key={tab.id}
            style={styles.tab}
            onPress={() => onTabPress(tab.id)}
          >
            {tab.active ? (
              <LinearGradient
                colors={tokens.gradients.primary}
                style={styles.activeTabContent}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.activeTabIcon}>{tab.icon}</Text>
                <Text style={styles.activeTabLabel}>{tab.label}</Text>
              </LinearGradient>
            ) : (
              <View style={styles.tabContent}>
                <Text style={styles.tabIcon}>{tab.icon}</Text>
                <Text style={styles.tabLabel}>{tab.label}</Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    backgroundColor: tokens.colors.bg,
    paddingBottom: Platform.OS === 'web' ? 0 : 20,
  },
  
  navigation: {
    flexDirection: 'row',
    backgroundColor: tokens.colors.surface,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.surfaceHover,
    ...tokens.shadows.card,
  },
  
  tab: {
    flex: 1,
    paddingVertical: tokens.spacing.md,
    paddingHorizontal: tokens.spacing.sm,
  },
  
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  activeTabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.md,
    borderRadius: tokens.radii.md,
    ...tokens.shadows.glow,
  },
  
  tabIcon: {
    fontSize: tokens.fontSizes.lg,
    color: tokens.colors.textSecondary,
    marginBottom: tokens.spacing.xs,
  },
  
  activeTabIcon: {
    fontSize: tokens.fontSizes.lg,
    color: tokens.colors.text,
    marginBottom: tokens.spacing.xs,
  },
  
  tabLabel: {
    fontSize: tokens.fontSizes.xs,
    color: tokens.colors.textSecondary,
    fontFamily: tokens.typography.ui,
    fontWeight: tokens.fontWeights.medium,
    textAlign: 'center',
  },
  
  activeTabLabel: {
    fontSize: tokens.fontSizes.xs,
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
    fontWeight: tokens.fontWeights.semibold,
    textAlign: 'center',
  },
});

