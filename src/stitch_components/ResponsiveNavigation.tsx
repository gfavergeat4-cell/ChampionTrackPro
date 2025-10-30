import React from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { tokens } from "../theme/tokens";
import { useDevice } from "../hooks/useDevice";
import { getResponsiveSpacing, getResponsiveFontSize } from "../utils/responsive";

interface Tab {
  id: string;
  label: string;
  icon: string;
  active?: boolean;
}

interface ResponsiveNavigationProps {
  tabs: Tab[];
  onTabPress: (tabId: string) => void;
}

export default function ResponsiveNavigation({ tabs, onTabPress }: ResponsiveNavigationProps) {
  const device = useDevice();
  
  // Sur desktop, afficher une sidebar verticale
  if (device.isDesktop) {
    return (
      <View style={styles.sidebar}>
        <View style={styles.sidebarContent}>
          {tabs.map((tab) => (
            <Pressable
              key={tab.id}
              style={[
                styles.sidebarTab,
                tab.active && styles.sidebarTabActive
              ]}
              onPress={() => onTabPress(tab.id)}
            >
              {tab.active ? (
                <LinearGradient
                  colors={tokens.gradients.primary}
                  style={styles.sidebarTabGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.sidebarTabIcon}>{tab.icon}</Text>
                  <Text style={styles.sidebarTabLabel}>{tab.label}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.sidebarTabContent}>
                  <Text style={styles.sidebarTabIcon}>{tab.icon}</Text>
                  <Text style={styles.sidebarTabLabel}>{tab.label}</Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>
      </View>
    );
  }
  
  // Sur mobile/tablet, afficher la navigation bottom
  return (
    <View style={styles.bottomNav}>
      <View style={styles.bottomNavContent}>
        {tabs.map((tab) => (
          <Pressable
            key={tab.id}
            style={styles.bottomTab}
            onPress={() => onTabPress(tab.id)}
          >
            {tab.active ? (
              <LinearGradient
                colors={tokens.gradients.primary}
                style={styles.bottomTabGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.bottomTabIcon}>{tab.icon}</Text>
                <Text style={styles.bottomTabLabel}>{tab.label}</Text>
              </LinearGradient>
            ) : (
              <View style={styles.bottomTabContent}>
                <Text style={styles.bottomTabIcon}>{tab.icon}</Text>
                <Text style={styles.bottomTabLabel}>{tab.label}</Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Sidebar pour desktop
  sidebar: {
    width: 250,
    backgroundColor: tokens.colors.surface,
    borderRightWidth: 1,
    borderRightColor: tokens.colors.surfaceHover,
    ...tokens.shadows.card,
  },
  
  sidebarContent: {
    padding: tokens.spacing.lg,
    gap: tokens.spacing.sm,
  },
  
  sidebarTab: {
    borderRadius: tokens.radii.md,
    overflow: 'hidden',
    marginBottom: tokens.spacing.xs,
  },
  
  sidebarTabActive: {
    ...tokens.shadows.glow,
  },
  
  sidebarTabGradient: {
    paddingVertical: tokens.spacing.lg,
    paddingHorizontal: tokens.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.md,
  },
  
  sidebarTabContent: {
    paddingVertical: tokens.spacing.lg,
    paddingHorizontal: tokens.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.md,
  },
  
  sidebarTabIcon: {
    fontSize: tokens.fontSizes.lg,
    color: tokens.colors.text,
  },
  
  sidebarTabLabel: {
    fontSize: tokens.fontSizes.md,
    fontWeight: tokens.fontWeights.medium,
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
  },
  
  // Bottom navigation pour mobile/tablet
  bottomNav: {
    backgroundColor: tokens.colors.surface,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.surfaceHover,
    paddingBottom: Platform.OS === 'web' ? 0 : 20,
    ...tokens.shadows.card,
  },
  
  bottomNavContent: {
    flexDirection: 'row',
    paddingVertical: tokens.spacing.md,
  },
  
  bottomTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: tokens.spacing.sm,
  },
  
  bottomTabGradient: {
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.md,
    borderRadius: tokens.radii.md,
    alignItems: 'center',
    ...tokens.shadows.glow,
  },
  
  bottomTabContent: {
    alignItems: 'center',
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.md,
  },
  
  bottomTabIcon: {
    fontSize: tokens.fontSizes.lg,
    color: tokens.colors.text,
    marginBottom: tokens.spacing.xs,
  },
  
  bottomTabLabel: {
    fontSize: tokens.fontSizes.xs,
    fontWeight: tokens.fontWeights.medium,
    color: tokens.colors.text,
    fontFamily: tokens.typography.ui,
    textAlign: 'center',
  },
});

