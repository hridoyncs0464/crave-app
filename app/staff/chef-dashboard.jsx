// app/staff/chef-dashboard.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  AppState,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, FONTS, SPACING, RADIUS } from "../../constants/theme";

const BASE_URL = "https://crave-server-main.onrender.com";

const STATUS_COLORS = {
  pending: {
    bg: "#F39C1225",
    text: "#F39C12",
    border: "#F39C1250",
    label: "New Order",
  },
  preparing: {
    bg: "#3498DB25",
    text: "#3498DB",
    border: "#3498DB50",
    label: "Preparing",
  },
  ready: {
    bg: "#44BB4425",
    text: "#44BB44",
    border: "#44BB4450",
    label: "Ready",
  },
};

export default function ChefDashboard() {
  const router = useRouter();
  const [staff, setStaff] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [token, setToken] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const pollingRef = useRef(null);

  useEffect(() => {
    loadStaff();
    return () => clearInterval(pollingRef.current);
  }, []);

  const loadStaff = async () => {
    const t = await AsyncStorage.getItem("staff_token");
    const s = await AsyncStorage.getItem("staff_data");
    if (!t || !s) {
      router.replace("/staff/waiter-login");
      return;
    }
    setToken(t);
    setStaff(JSON.parse(s));
    fetchOrders(t);
    // Poll every 8 seconds
    pollingRef.current = setInterval(() => fetchOrders(t), 8000);
  };

  const fetchOrders = useCallback(async (t) => {
    try {
      const res = await axios.get(`${BASE_URL}/api/orders?status=pending`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      const res2 = await axios.get(`${BASE_URL}/api/orders?status=preparing`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      const combined = [...(res.data.data || []), ...(res2.data.data || [])];
      // Sort: pending first, then preparing
      combined.sort((a, b) => {
        const order = ["pending", "preparing"];
        return (
          order.indexOf(a.status) - order.indexOf(b.status) ||
          new Date(a.created_at) - new Date(b.created_at)
        );
      });
      setOrders(combined);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders(token);
  };

  const updateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await axios.put(
        `${BASE_URL}/api/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchOrders(token);
    } catch (err) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to update order.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLogout = async () => {
    clearInterval(pollingRef.current);
    await AsyncStorage.removeItem("staff_token");
    await AsyncStorage.removeItem("staff_data");
    router.replace("/staff/waiter-login");
  };

  const pendingOrders = orders.filter((o) => o.status === "pending");
  const preparingOrders = orders.filter((o) => o.status === "preparing");

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ color: COLORS.textMuted, marginTop: 12 }}>
          Loading kitchen queue...
        </Text>
      </View>
    );
  }

  const OrderCard = ({ order }) => {
    const isPending = order.status === "pending";
    const sc = STATUS_COLORS[order.status];
    const timeSince = Math.floor(
      (Date.now() - new Date(order.created_at)) / 60000,
    );

    return (
      <View
        style={{
          backgroundColor: COLORS.surface,
          borderRadius: RADIUS.md,
          borderWidth: isPending ? 2 : 1,
          borderColor: isPending ? COLORS.primary : COLORS.border,
          padding: SPACING.md,
          marginBottom: 12,
        }}
      >
        {isPending && (
          <View
            style={{
              backgroundColor: COLORS.primary + "20",
              borderRadius: RADIUS.sm,
              padding: 8,
              marginBottom: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Ionicons name="notifications" size={14} color={COLORS.primary} />
            <Text
              style={{
                color: COLORS.primary,
                fontWeight: "700",
                fontSize: FONTS.sizes.xs,
              }}
            >
              NEW ORDER — Start preparing!
            </Text>
          </View>
        )}

        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 12,
          }}
        >
          <View>
            <Text
              style={{
                color: COLORS.text,
                fontSize: FONTS.sizes.xl,
                fontWeight: "900",
              }}
            >
              Table {order.table_number}
            </Text>
            <Text
              style={{
                color: COLORS.textMuted,
                fontSize: FONTS.sizes.xs,
                marginTop: 2,
              }}
            >
              {order.order_id}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end", gap: 4 }}>
            <View
              style={{
                backgroundColor: sc.bg,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: RADIUS.full,
                borderWidth: 1,
                borderColor: sc.border,
              }}
            >
              <Text
                style={{
                  color: sc.text,
                  fontSize: FONTS.sizes.xs,
                  fontWeight: "700",
                }}
              >
                {sc.label}
              </Text>
            </View>
            <Text style={{ color: COLORS.textMuted, fontSize: 10 }}>
              {timeSince < 1 ? "Just now" : `${timeSince}m ago`}
            </Text>
          </View>
        </View>

        {/* Customer note */}
        {order.customer_note ? (
          <View
            style={{
              backgroundColor: COLORS.accent + "15",
              borderRadius: RADIUS.sm,
              padding: 10,
              marginBottom: 12,
              flexDirection: "row",
              alignItems: "flex-start",
              gap: 8,
            }}
          >
            <Ionicons
              name="chatbubble-outline"
              size={14}
              color={COLORS.accent}
              style={{ marginTop: 1 }}
            />
            <Text
              style={{ color: COLORS.text, fontSize: FONTS.sizes.xs, flex: 1 }}
            >
              {order.customer_note}
            </Text>
          </View>
        ) : null}

        {/* Action Buttons */}
        <View style={{ flexDirection: "row", gap: 10 }}>
          {isPending ? (
            <TouchableOpacity
              onPress={() => updateStatus(order.id, "preparing")}
              disabled={updatingId === order.id}
              style={{
                flex: 1,
                backgroundColor: COLORS.primary,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                paddingVertical: 12,
                borderRadius: RADIUS.sm,
              }}
            >
              {updatingId === order.id ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="flame" size={16} color="#fff" />
                  <Text
                    style={{
                      color: "#fff",
                      fontWeight: "700",
                      fontSize: FONTS.sizes.sm,
                    }}
                  >
                    Start Preparing
                  </Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => updateStatus(order.id, "ready")}
              disabled={updatingId === order.id}
              style={{
                flex: 1,
                backgroundColor: "#44BB44",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                paddingVertical: 12,
                borderRadius: RADIUS.sm,
              }}
            >
              {updatingId === order.id ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={16} color="#fff" />
                  <Text
                    style={{
                      color: "#fff",
                      fontWeight: "700",
                      fontSize: FONTS.sizes.sm,
                    }}
                  >
                    Mark Ready
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* ── HEADER ── */}
      <View
        style={{
          backgroundColor: COLORS.surface,
          paddingHorizontal: SPACING.md,
          paddingTop: 48,
          paddingBottom: 16,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <View>
            <Text
              style={{
                color: COLORS.textMuted,
                fontSize: FONTS.sizes.xs,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              🍳 Kitchen Display
            </Text>
            <Text
              style={{
                color: COLORS.text,
                fontSize: FONTS.sizes.xl,
                fontWeight: "900",
              }}
            >
              Chef {staff?.name}
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View
              style={{
                backgroundColor:
                  orders.length > 0
                    ? COLORS.primary + "20"
                    : COLORS.surfaceLight,
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: RADIUS.full,
                borderWidth: 1,
                borderColor:
                  orders.length > 0 ? COLORS.primary + "40" : COLORS.border,
              }}
            >
              <Text
                style={{
                  color: orders.length > 0 ? COLORS.primary : COLORS.textMuted,
                  fontWeight: "700",
                  fontSize: FONTS.sizes.xs,
                }}
              >
                Live · {orders.length} orders
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleLogout}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: COLORS.error + "20",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="log-out-outline" size={18} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
          {[
            {
              label: "New Orders",
              count: pendingOrders.length,
              color: COLORS.primary,
            },
            {
              label: "In Progress",
              count: preparingOrders.length,
              color: "#3498DB",
            },
          ].map((s, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                backgroundColor: COLORS.surfaceLight,
                borderRadius: RADIUS.sm,
                padding: 12,
                alignItems: "center",
                borderWidth: 1,
                borderColor: s.count > 0 ? s.color + "40" : COLORS.border,
              }}
            >
              <Text style={{ color: s.color, fontSize: 26, fontWeight: "900" }}>
                {s.count}
              </Text>
              <Text
                style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.xs }}
              >
                {s.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING.md, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Polling indicator */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: "#44BB44",
            }}
          />
          <Text style={{ color: COLORS.textMuted, fontSize: 10 }}>
            Auto-refreshing every 8 seconds
          </Text>
        </View>

        {orders.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 80 }}>
            <Text style={{ fontSize: 64, marginBottom: 16 }}>✨</Text>
            <Text
              style={{
                color: COLORS.text,
                fontSize: FONTS.sizes.xl,
                fontWeight: "900",
                marginBottom: 6,
              }}
            >
              Kitchen is clear!
            </Text>
            <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.sm }}>
              No pending or active orders
            </Text>
          </View>
        ) : (
          <>
            {pendingOrders.length > 0 && (
              <>
                <Text
                  style={{
                    color: COLORS.primary,
                    fontSize: FONTS.sizes.sm,
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 10,
                  }}
                >
                  🔔 New Orders ({pendingOrders.length})
                </Text>
                {pendingOrders.map((o) => (
                  <OrderCard key={o.id} order={o} />
                ))}
              </>
            )}
            {preparingOrders.length > 0 && (
              <>
                <Text
                  style={{
                    color: "#3498DB",
                    fontSize: FONTS.sizes.sm,
                    fontWeight: "700",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 10,
                    marginTop: pendingOrders.length > 0 ? 10 : 0,
                  }}
                >
                  🍳 In Progress ({preparingOrders.length})
                </Text>
                {preparingOrders.map((o) => (
                  <OrderCard key={o.id} order={o} />
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
