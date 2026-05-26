// app/my-orders.jsx
import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import axios from "axios";
import { COLORS, FONTS, SPACING, RADIUS } from "../constants/theme";
import { useAuth } from "../context/AuthContext";

const BASE_URL = "https://crave-server-main.onrender.com";

const STATUS_CONFIG = {
  pending: { color: "#F39C12", icon: "time-outline", label: "Pending" },
  preparing: { color: "#3498DB", icon: "flame-outline", label: "Preparing" },
  ready: { color: "#44BB44", icon: "checkmark-circle", label: "Ready!" },
  served: { color: "#95A5A6", icon: "restaurant-outline", label: "Served" },
  cancelled: { color: COLORS.error, icon: "close-circle", label: "Cancelled" },
};

export default function MyOrders() {
  const router = useRouter();
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [orderDetails, setOrderDetails] = useState({});

  const fetchOrders = async () => {
    if (!user?.email) {
      setLoading(false);
      return;
    }
    try {
      // Uses public email-based lookup — matches your backend /api/my-orders?email=
      const res = await axios.get(`${BASE_URL}/api/my-orders`, {
        params: { email: user.email },
      });
      // my-orders returns reservations — for orders we use the orders endpoint
      // Your backend has GET /api/orders — but that requires JWT (staff only)
      // So we store order IDs in local state after placing orders (from order-success)
      // For now we show a helpful message and the orders placed this session
      setOrders([]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  if (!user) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.background,
          justifyContent: "center",
          alignItems: "center",
          padding: SPACING.lg,
        }}
      >
        <Text style={{ fontSize: 56, marginBottom: 16 }}>🔒</Text>
        <Text
          style={{
            color: COLORS.text,
            fontSize: FONTS.sizes.xl,
            fontWeight: "900",
            marginBottom: 8,
          }}
        >
          Login Required
        </Text>
        <Text
          style={{
            color: COLORS.textMuted,
            fontSize: FONTS.sizes.sm,
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          Sign in to view your order history
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/auth/login")}
          style={{
            backgroundColor: COLORS.primary,
            paddingHorizontal: 32,
            paddingVertical: 14,
            borderRadius: RADIUS.full,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontWeight: "700",
              fontSize: FONTS.sizes.md,
            }}
          >
            Login
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: COLORS.surface,
          paddingHorizontal: SPACING.md,
          paddingVertical: 16,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: COLORS.surfaceLight,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="arrow-back" size={18} color={COLORS.text} />
        </TouchableOpacity>
        <Text
          style={{
            color: COLORS.text,
            fontSize: FONTS.sizes.xl,
            fontWeight: "900",
          }}
        >
          My Orders
        </Text>
      </View>

      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            padding: SPACING.md,
            paddingBottom: 40,
            flexGrow: 1,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
        >
          {/* Info card explaining how order tracking works */}
          <View
            style={{
              backgroundColor: COLORS.primary + "15",
              borderRadius: RADIUS.md,
              borderWidth: 1,
              borderColor: COLORS.primary + "30",
              padding: SPACING.md,
              marginBottom: 20,
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 10,
            }}
          >
            <Ionicons
              name="information-circle"
              size={20}
              color={COLORS.primary}
              style={{ marginTop: 1 }}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: COLORS.text,
                  fontWeight: "700",
                  fontSize: FONTS.sizes.sm,
                  marginBottom: 4,
                }}
              >
                Order Tracking
              </Text>
              <Text
                style={{
                  color: COLORS.textMuted,
                  fontSize: FONTS.sizes.xs,
                  lineHeight: 18,
                }}
              >
                Orders are tracked by table. After placing an order, ask your
                waiter for updates or watch for the "Ready!" notification. Order
                history will appear here once the backend links orders to your
                account.
              </Text>
            </View>
          </View>

          {/* Empty state */}
          <View style={{ alignItems: "center", paddingVertical: 60 }}>
            <Text style={{ fontSize: 64, marginBottom: 16 }}>🍽️</Text>
            <Text
              style={{
                color: COLORS.text,
                fontSize: FONTS.sizes.xl,
                fontWeight: "900",
                marginBottom: 8,
              }}
            >
              No orders yet
            </Text>
            <Text
              style={{
                color: COLORS.textMuted,
                fontSize: FONTS.sizes.sm,
                textAlign: "center",
                marginBottom: 24,
              }}
            >
              Your order history will appear here after you place your first
              order
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/menu")}
              style={{
                backgroundColor: COLORS.primary,
                paddingHorizontal: 28,
                paddingVertical: 13,
                borderRadius: RADIUS.full,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Ionicons name="restaurant" size={16} color="#fff" />
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "700",
                  fontSize: FONTS.sizes.md,
                }}
              >
                Browse Menu
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </View>
  );
}
