import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import {
  useFonts,
  ScheherazadeNew_400Regular,
  ScheherazadeNew_700Bold,
} from "@expo-google-fonts/scheherazade-new";
import { ThemeProvider, useAppTheme } from "../src/contexts/ThemeContext";

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNavigator() {
  const { colors, mode, ready } = useAppTheme();

  const [fontsLoaded, fontError] = useFonts({
    ScheherazadeNew_400Regular,
    ScheherazadeNew_700Bold,
  });

  useEffect(() => {
    if ((fontsLoaded || fontError) && ready) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError, ready]);

  if (!ready || (!fontsLoaded && !fontError)) {
    return (
      <View
        style={[styles.loading, { backgroundColor: colors.background }]}
        testID="loading-screen"
      >
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: "fade",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="reading/[id]" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <RootNavigator />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
