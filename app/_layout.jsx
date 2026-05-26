// app/_layout.jsx
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { enableScreens } from "react-native-screens";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";

// ✅ Fixes navigation crash on Android APK builds
enableScreens(true);

export default function RootLayout() {
  return (
    // ✅ Without this wrapper every button tap exits the app
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <CartProvider>
            <StatusBar style="light" backgroundColor="#1A1208" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: "#1A1208" },
                animation: "fade",
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="order" options={{ headerShown: false }} />
              <Stack.Screen
                name="order-success"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="my-orders" options={{ headerShown: false }} />
              <Stack.Screen
                name="my-reservations"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="staff/waiter-login"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="staff/waiter-dashboard"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="staff/chef-dashboard"
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="admin/admin-dashboard"
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
            </Stack>
          </CartProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
