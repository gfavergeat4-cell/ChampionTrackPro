import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { tokens } from "../theme/tokens";
import { useDevice } from "../hooks/useDevice";
import { getMainContainerStyle, shouldShowBottomNavigation, shouldShowSidebar } from "../utils/responsive";

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  navigation?: React.ReactNode;
  sidebar?: React.ReactNode;
}

export default function ResponsiveLayout({ 
  children, 
  navigation, 
  sidebar 
}: ResponsiveLayoutProps) {
  const device = useDevice();
  const containerStyle = getMainContainerStyle(device);
  const showBottomNav = shouldShowBottomNavigation(device);
  const showSidebar = shouldShowSidebar(device);

  return (
    <LinearGradient
      colors={[tokens.colors.bg, tokens.colors.bgSecondary]}
      style={styles.container}
    >
      <View style={styles.layout}>
        {/* Sidebar pour desktop */}
        {showSidebar && sidebar && (
          <View style={styles.sidebarContainer}>
            {sidebar}
          </View>
        )}
        
        {/* Contenu principal */}
        <View style={[
          styles.mainContent,
          showSidebar && styles.mainContentWithSidebar
        ]}>
          {children}
        </View>
      </View>
      
      {/* Navigation bottom pour mobile/tablet */}
      {showBottomNav && navigation && (
        <View style={styles.bottomNavContainer}>
          {navigation}
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.colors.bg,
    paddingTop: Platform.OS === 'web' ? 60 : 0,
  },
  
  layout: {
    flex: 1,
    flexDirection: 'row',
  },
  
  sidebarContainer: {
    width: 250,
    backgroundColor: tokens.colors.surface,
    borderRightWidth: 1,
    borderRightColor: tokens.colors.surfaceHover,
    ...tokens.shadows.card,
  },
  
  mainContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  
  mainContentWithSidebar: {
    marginLeft: 0,
  },
  
  bottomNavContainer: {
    backgroundColor: tokens.colors.surface,
    borderTopWidth: 1,
    borderTopColor: tokens.colors.surfaceHover,
    ...tokens.shadows.card,
  },
});

