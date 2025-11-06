import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Platform } from "react-native";

interface StitchWebViewProps {
  htmlContent: string;
  onRespond?: (sessionId: string) => void;
  onOpenSession?: (sessionId: string) => void;
  onNavigateToTab?: (tabName: string) => void;
}

export default function StitchWebView({ 
  htmlContent, 
  onRespond, 
  onOpenSession, 
  onNavigateToTab 
}: StitchWebViewProps) {
  const webViewRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (Platform.OS === "web" && webViewRef.current) {
      const iframe = webViewRef.current;
      
      // Set up message handling
      const handleMessage = (event: MessageEvent) => {
        if (event.data.type === 'respond') {
          onRespond?.(event.data.sessionId);
        } else if (event.data.type === 'openSession') {
          onOpenSession?.(event.data.sessionId);
        } else if (event.data.type === 'navigateToTab') {
          onNavigateToTab?.(event.data.tabName);
        }
      };

      window.addEventListener('message', handleMessage);

      // Inject navigation handlers into the iframe
      iframe.onload = () => {
        const iframeWindow = iframe.contentWindow;
        if (iframeWindow) {
          iframeWindow.postMessage({
            type: 'setupHandlers',
            handlers: {
              onRespond,
              onOpenSession,
              onNavigateToTab
            }
          }, '*');
        }
      };

      return () => {
        window.removeEventListener('message', handleMessage);
      };
    }
  }, [onRespond, onOpenSession, onNavigateToTab]);

  if (Platform.OS !== "web") {
    return null;
  }

  return (
    <View style={styles.container}>
      <iframe
        ref={webViewRef}
        srcDoc={htmlContent}
        style={styles.iframe}
        sandbox="allow-scripts allow-same-origin"
        seamless
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: 375,
    height: 812,
    alignSelf: "center",
  },
  iframe: {
    width: "100%",
    height: "100%",
    border: "none",
    borderRadius: 20,
    overflow: "hidden",
  },
});




