import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS, FONTS, SPACING, RADIUS } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill all fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      router.replace("/(tabs)");
    } catch (e) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        padding: SPACING.lg,
      }}
    >
      {/* Logo */}
      <View style={{ alignItems: "center", marginBottom: 40 }}>
        <Text style={{ fontSize: 48, marginBottom: 8 }}>🔥</Text>
        <Text
          style={{
            color: COLORS.primary,
            fontSize: FONTS.sizes.xxxl,
            fontWeight: "900",
            letterSpacing: 2,
          }}
        >
          CRAVE
        </Text>
        <Text
          style={{
            color: COLORS.textMuted,
            fontSize: FONTS.sizes.sm,
            marginTop: 4,
          }}
        >
          Welcome back! Sign in to continue
        </Text>
      </View>

      {/* Form Card */}
      <View
        style={{
          backgroundColor: COLORS.surface,
          borderRadius: RADIUS.lg,
          borderWidth: 1,
          borderColor: COLORS.border,
          padding: SPACING.lg,
        }}
      >
        {error ? (
          <View
            style={{
              backgroundColor: COLORS.error + "20",
              borderRadius: RADIUS.sm,
              padding: 10,
              marginBottom: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Ionicons name="alert-circle" size={16} color={COLORS.error} />
            <Text
              style={{ color: COLORS.error, fontSize: FONTS.sizes.sm, flex: 1 }}
            >
              {error}
            </Text>
          </View>
        ) : null}

        {/* Email */}
        <Text
          style={{
            color: COLORS.textMuted,
            fontSize: FONTS.sizes.xs,
            fontWeight: "600",
            marginBottom: 6,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Email
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: COLORS.surfaceLight,
            borderRadius: RADIUS.sm,
            borderWidth: 1,
            borderColor: COLORS.border,
            marginBottom: 16,
            paddingHorizontal: 12,
          }}
        >
          <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} />
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="your@email.com"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            style={{
              flex: 1,
              color: COLORS.text,
              fontSize: FONTS.sizes.md,
              paddingVertical: 14,
              paddingLeft: 10,
            }}
          />
        </View>

        {/* Password */}
        <Text
          style={{
            color: COLORS.textMuted,
            fontSize: FONTS.sizes.xs,
            fontWeight: "600",
            marginBottom: 6,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          Password
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: COLORS.surfaceLight,
            borderRadius: RADIUS.sm,
            borderWidth: 1,
            borderColor: COLORS.border,
            marginBottom: 24,
            paddingHorizontal: 12,
          }}
        >
          <Ionicons
            name="lock-closed-outline"
            size={18}
            color={COLORS.textMuted}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Your password"
            placeholderTextColor={COLORS.textMuted}
            secureTextEntry={!showPass}
            style={{
              flex: 1,
              color: COLORS.text,
              fontSize: FONTS.sizes.md,
              paddingVertical: 14,
              paddingLeft: 10,
            }}
          />
          <TouchableOpacity onPress={() => setShowPass(!showPass)}>
            <Ionicons
              name={showPass ? "eye-off-outline" : "eye-outline"}
              size={18}
              color={COLORS.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          style={{
            backgroundColor: COLORS.primary,
            paddingVertical: 16,
            borderRadius: RADIUS.full,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text
              style={{
                color: "#fff",
                fontWeight: "900",
                fontSize: FONTS.sizes.lg,
              }}
            >
              Sign In
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Register Link */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          marginTop: 24,
          gap: 6,
        }}
      >
        <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.sm }}>
          Don't have an account?
        </Text>
        <TouchableOpacity onPress={() => router.push("/auth/register")}>
          <Text
            style={{
              color: COLORS.primary,
              fontWeight: "700",
              fontSize: FONTS.sizes.sm,
            }}
          >
            Register
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
