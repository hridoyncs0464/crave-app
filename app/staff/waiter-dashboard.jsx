// app/staff/waiter-dashboard.jsx
import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { COLORS, FONTS, SPACING, RADIUS } from "../../constants/theme";

const BASE_URL = "https://crave-server-main.onrender.com";

const STATUS_COLORS = {
  pending: { bg: "#F39C1220", text: "#F39C12", border: "#F39C1240" },
  preparing: { bg: "#3498DB20", text: "#3498DB", border: "#3498DB40" },
  ready: { bg: "#44BB4420", text: "#44BB44", border: "#44BB4440" },
  served: { bg: "#95A5A620", text: "#95A5A6", border: "#95A5A640" },
  cancelled: { bg: "#E74C3C20", text: "#E74C3C", border: "#E74C3C40" },
};

const STATUS_ICONS = {
  pending: "time-outline",
  preparing: "flame",
  ready: "checkmark-circle",
  served: "restaurant",
  cancelled: "close-circle",
};

export default function WaiterDashboard() {
  const router = useRouter();
  const [staff, setStaff] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [token, setToken] = useState("");
  const [tab, setTab] = useState("active"); // 'active' | 'served'
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadStaff();
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
  };

  const fetchOrders = useCallback(
    async (t) => {
      try {
        const res = await axios.get(`${BASE_URL}/api/orders`, {
          headers: { Authorization: `Bearer ${t || token}` },
        });
        if (res.data.success) setOrders(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token],
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders(token);
  };

  const markServed = async (orderId) => {
    Alert.alert(
      "Mark as Served?",
      `Confirm order #${orderId} has been delivered.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Mark Served",
          style: "default",
          onPress: async () => {
            setUpdatingId(orderId);
            try {
              await axios.put(
                `${BASE_URL}/api/orders/${orderId}/status`,
                { status: "served" },
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
          },
        },
      ],
    );
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("staff_token");
    await AsyncStorage.removeItem("staff_data");
    router.replace("/staff/waiter-login");
  };

  const activeOrders = orders.filter((o) =>
    ["pending", "preparing", "ready"].includes(o.status),
  );
  const servedOrders = orders.filter((o) => o.status === "served");
  const displayOrders = tab === "active" ? activeOrders : servedOrders;

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
      </View>
    );
  }

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
              Waiter Dashboard
            </Text>
            <Text
              style={{
                color: COLORS.text,
                fontSize: FONTS.sizes.xl,
                fontWeight: "900",
              }}
            >
              👋 {staff?.name}
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <TouchableOpacity
              onPress={onRefresh}
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: COLORS.surfaceLight,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="refresh" size={18} color={COLORS.text} />
            </TouchableOpacity>
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
              label: "Active",
              count: activeOrders.length,
              color: COLORS.primary,
            },
            {
              label: "Ready",
              count: activeOrders.filter((o) => o.status === "ready").length,
              color: "#44BB44",
            },
            {
              label: "Served Today",
              count: servedOrders.length,
              color: COLORS.textMuted,
            },
          ].map((s, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                backgroundColor: COLORS.surfaceLight,
                borderRadius: RADIUS.sm,
                padding: 10,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: s.color,
                  fontSize: FONTS.sizes.xl,
                  fontWeight: "900",
                }}
              >
                {s.count}
              </Text>
              <Text style={{ color: COLORS.textMuted, fontSize: 10 }}>
                {s.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── TABS ── */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: COLORS.surface,
          marginHorizontal: SPACING.md,
          marginTop: 14,
          borderRadius: RADIUS.md,
          padding: 4,
          borderWidth: 1,
          borderColor: COLORS.border,
        }}
      >
        {[
          { key: "active", label: `Active (${activeOrders.length})` },
          { key: "served", label: `Served (${servedOrders.length})` },
        ].map((t) => (
          <TouchableOpacity
            key={t.key}
            onPress={() => setTab(t.key)}
            style={{
              flex: 1,
              paddingVertical: 10,
              borderRadius: RADIUS.sm - 2,
              alignItems: "center",
              backgroundColor: tab === t.key ? COLORS.primary : "transparent",
            }}
          >
            <Text
              style={{
                color: tab === t.key ? "#fff" : COLORS.textMuted,
                fontWeight: "700",
                fontSize: FONTS.sizes.sm,
              }}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── ORDERS LIST ── */}
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
        {displayOrders.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 60 }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>
              {tab === "active" ? "✅" : "📋"}
            </Text>
            <Text
              style={{
                color: COLORS.textMuted,
                fontSize: FONTS.sizes.md,
                fontWeight: "600",
              }}
            >
              {tab === "active"
                ? "No active orders right now"
                : "No served orders yet"}
            </Text>
          </View>
        ) : (
          displayOrders.map((order) => {
            const sc = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
            const isReady = order.status === "ready";
            return (
              <View
                key={order.id}
                style={{
                  backgroundColor: COLORS.surface,
                  borderRadius: RADIUS.md,
                  borderWidth: isReady ? 2 : 1,
                  borderColor: isReady ? "#44BB44" : COLORS.border,
                  padding: SPACING.md,
                  marginBottom: 12,
                }}
              >
                {isReady && (
                  <View
                    style={{
                      backgroundColor: "#44BB4420",
                      borderRadius: RADIUS.sm,
                      padding: 8,
                      marginBottom: 10,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color="#44BB44"
                    />
                    <Text
                      style={{
                        color: "#44BB44",
                        fontWeight: "700",
                        fontSize: FONTS.sizes.xs,
                      }}
                    >
                      READY TO SERVE — Action required!
                    </Text>
                  </View>
                )}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 8,
                  }}
                >
                  <View>
                    <Text
                      style={{
                        color: COLORS.text,
                        fontSize: FONTS.sizes.lg,
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
                      {order.order_id} · {order.item_count} items
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 5,
                      backgroundColor: sc.bg,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: RADIUS.full,
                      borderWidth: 1,
                      borderColor: sc.border,
                    }}
                  >
                    <Ionicons
                      name={STATUS_ICONS[order.status]}
                      size={12}
                      color={sc.text}
                    />
                    <Text
                      style={{
                        color: sc.text,
                        fontSize: FONTS.sizes.xs,
                        fontWeight: "700",
                        textTransform: "capitalize",
                      }}
                    >
                      {order.status}
                    </Text>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: COLORS.primary,
                      fontSize: FONTS.sizes.lg,
                      fontWeight: "900",
                    }}
                  >
                    ৳{parseInt(order.total_amount)}
                  </Text>
                  {order.status === "ready" && (
                    <TouchableOpacity
                      onPress={() => markServed(order.id)}
                      disabled={updatingId === order.id}
                      style={{
                        backgroundColor: "#44BB44",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: RADIUS.full,
                      }}
                    >
                      {updatingId === order.id ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <>
                          <Ionicons name="restaurant" size={14} color="#fff" />
                          <Text
                            style={{
                              color: "#fff",
                              fontWeight: "700",
                              fontSize: FONTS.sizes.sm,
                            }}
                          >
                            Mark Served
                          </Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
