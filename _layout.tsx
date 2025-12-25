import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ScoreboardProvider } from "@/contexts/ScoreboardContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PremiumProvider } from "@/contexts/PremiumContext";
import { AdProvider } from "@/contexts/AdContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="match-detail" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        if (Platform.OS === "ios") {
          const TrackingTransparency = await import("expo-tracking-transparency");
          const { status } = await TrackingTransparency.requestTrackingPermissionsAsync();
          if (status === "granted") {
            console.log("Tracking permission granted");
          } else {
            console.log("Tracking permission denied - will show non-personalized ads");
          }
        }
      } catch {
        console.log("Tracking permission not available");
      } finally {
        await SplashScreen.hideAsync();
      }
    };

    initializeApp();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <PremiumProvider>
          <AdProvider>
            <ScoreboardProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <RootLayoutNav />
              </GestureHandlerRootView>
            </ScoreboardProvider>
          </AdProvider>
        </PremiumProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
