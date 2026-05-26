// app/my-reservations.jsx
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
  pending: {
    color: "#F39C12",
    bg: "#F39C1215",
    label: "Pending",
    icon: "time-outline",
  },
  confirmed: {
    color: "#44BB44",
    bg: "#44BB4415",
    label: "Confirmed",
    icon: "checkmark-circle",
  },
  cancelled: {
    color: COLORS.error,
    bg: COLORS.error + "15",
    label: "Cancelled",
    icon: "close-circle",
  },
};

export default function MyReservations() {
  const router = useRouter();
  const { user } = useAuth();

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReservations = async () => {
    if (!user?.email) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(`${BASE_URL}/api/my-reservations`, {
        params: { email: user.email },
      });
      if (res.data.success) setReservations(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [user]);
  const onRefresh = () => {
    setRefreshing(true);
    fetchReservations();
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
          Sign in to view your reservations
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
        <View>
          <Text
            style={{
              color: COLORS.text,
              fontSize: FONTS.sizes.xl,
              fontWeight: "900",
            }}
          >
            My Reservations
          </Text>
          <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.xs }}>
            {reservations.length} total
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/reservations")}
          style={{
            marginLeft: "auto",
            backgroundColor: COLORS.primary,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: RADIUS.full,
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Ionicons name="add" size={14} color="#fff" />
          <Text
            style={{
              color: "#fff",
              fontWeight: "700",
              fontSize: FONTS.sizes.xs,
            }}
          >
            New
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : reservations.length === 0 ? (
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: SPACING.lg,
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
        >
          <Text style={{ fontSize: 64, marginBottom: 16 }}>📅</Text>
          <Text
            style={{
              color: COLORS.text,
              fontSize: FONTS.sizes.xl,
              fontWeight: "900",
              marginBottom: 8,
            }}
          >
            No reservations yet
          </Text>
          <Text
            style={{
              color: COLORS.textMuted,
              fontSize: FONTS.sizes.sm,
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            Book a table and it will appear here
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/reservations")}
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
            <Ionicons name="calendar" size={16} color="#fff" />
            <Text
              style={{
                color: "#fff",
                fontWeight: "700",
                fontSize: FONTS.sizes.md,
              }}
            >
              Make a Reservation
            </Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: SPACING.md, paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={COLORS.primary}
            />
          }
        >
          {reservations.map((r) => {
            const sc = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
            const date = new Date(r.reservation_date);
            return (
              <View
                key={r.id}
                style={{
                  backgroundColor: COLORS.surface,
                  borderRadius: RADIUS.md,
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  padding: SPACING.md,
                  marginBottom: 12,
                }}
              >
                {/* Status banner for confirmed */}
                {r.status === "confirmed" && (
                  <View
                    style={{
                      backgroundColor: "#44BB4415",
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
                      size={14}
                      color="#44BB44"
                    />
                    <Text
                      style={{
                        color: "#44BB44",
                        fontWeight: "700",
                        fontSize: FONTS.sizes.xs,
                      }}
                    >
                      Reservation Confirmed!
                    </Text>
                  </View>
                )}

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
                        fontSize: FONTS.sizes.lg,
                        fontWeight: "900",
                      }}
                    >
                      {date.toLocaleDateString("en-BD", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                    <Text
                      style={{
                        color: COLORS.primary,
                        fontSize: FONTS.sizes.md,
                        fontWeight: "700",
                        marginTop: 2,
                      }}
                    >
                      {r.reservation_time}
                    </Text>
                  </View>
                  <View
                    style={{
                      backgroundColor: sc.bg,
                      paddingHorizontal: 12,
                      paddingVertical: 5,
                      borderRadius: RADIUS.full,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <Ionicons name={sc.icon} size={12} color={sc.color} />
                    <Text
                      style={{
                        color: sc.color,
                        fontSize: FONTS.sizes.xs,
                        fontWeight: "700",
                      }}
                    >
                      {sc.label}
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: "row", gap: 16 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <Ionicons
                      name="people-outline"
                      size={14}
                      color={COLORS.textMuted}
                    />
                    <Text
                      style={{
                        color: COLORS.textMuted,
                        fontSize: FONTS.sizes.xs,
                      }}
                    >
                      {r.number_of_guests} guests
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <Ionicons
                      name="call-outline"
                      size={14}
                      color={COLORS.textMuted}
                    />
                    <Text
                      style={{
                        color: COLORS.textMuted,
                        fontSize: FONTS.sizes.xs,
                      }}
                    >
                      {r.customer_phone}
                    </Text>
                  </View>
                </View>

                {r.special_requests ? (
                  <View
                    style={{
                      marginTop: 10,
                      backgroundColor: COLORS.surfaceLight,
                      borderRadius: RADIUS.sm,
                      padding: 8,
                      flexDirection: "row",
                      gap: 6,
                    }}
                  >
                    <Ionicons
                      name="chatbubble-outline"
                      size={12}
                      color={COLORS.textMuted}
                      style={{ marginTop: 1 }}
                    />
                    <Text
                      style={{
                        color: COLORS.textMuted,
                        fontSize: FONTS.sizes.xs,
                        flex: 1,
                        fontStyle: "italic",
                      }}
                    >
                      "{r.special_requests}"
                    </Text>
                  </View>
                ) : null}

                {r.assigned_table_number ? (
                  <View
                    style={{
                      marginTop: 10,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Ionicons
                      name="location-outline"
                      size={13}
                      color={COLORS.primary}
                    />
                    <Text
                      style={{
                        color: COLORS.primary,
                        fontSize: FONTS.sizes.xs,
                        fontWeight: "600",
                      }}
                    >
                      Assigned Table: {r.assigned_table_number}
                    </Text>
                  </View>
                ) : null}
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}
