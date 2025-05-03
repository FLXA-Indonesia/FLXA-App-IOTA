import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { useColorScheme } from "@/hooks/useColorScheme";
import Navbar from "@/components/Navbar";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),

    PlusJakartaTextBold: require("../assets/fonts/PlusJakartaText-Bold.ttf"),
    PlusJakartaTextBoldItalic: require("../assets/fonts/PlusJakartaText-BoldItalic.ttf"),
    PlusJakartaTextItalic: require("../assets/fonts/PlusJakartaText-Italic.ttf"),
    PlusJakartaTextLight: require("../assets/fonts/PlusJakartaText-Light.ttf"),
    PlusJakartaTextLightItalic: require("../assets/fonts/PlusJakartaText-LightItalic.ttf"),
    PlusJakartaTextRegular: require("../assets/fonts/PlusJakartaText-Regular.ttf"),
  });
  const screensWithNavbar = ["/dashboard", "/profile", "/history", "/top-up"];

  const pathname = usePathname();
  const [showNavbar, setShowNavbar] = useState(false);

  useEffect(() => {
    if (screensWithNavbar.includes(pathname)) {
      setShowNavbar(true);
    } else {
      setShowNavbar(false);
    }
  }, [pathname]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="auth/login"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="auth/register"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="auth/otp"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="auth/complete-profile"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="auth/forgot-secret"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="dashboard"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="profile"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="top-up"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="history"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="manage-card"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="add-card"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="edit-profile"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="settings"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="success"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="wallet-top-up"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="bank-top-up"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="credit-card-top-up"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="mobile-top-up"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="qris-payment"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="bank-payment"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="bonus"
          options={{ headerShown: false }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      {showNavbar && <Navbar pathname={pathname} />}
    </ThemeProvider>
  );
}

