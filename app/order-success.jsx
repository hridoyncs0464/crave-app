// app/order-success.jsx
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { COLORS, FONTS, SPACING, RADIUS } from "../constants/theme";

export default function OrderSuccess() {
  const router = useRouter();
  const { orderId, tableNumber, totalAmount } = useLocalSearchParams();

  const steps = [
    {
      icon: "checkmark-circle",
      color: COLORS.primary,
      label: "Order Received",
      sub: "Your order is confirmed",
    },
    {
      icon: "flame",
      color: COLORS.secondary,
      label: "Being Prepared",
      sub: "Kitchen is on it",
    },
    {
      icon: "restaurant",
      color: COLORS.accent,
      label: "Ready to Serve",
      sub: "Almost there!",
    },
    {
      icon: "star",
      color: "#44BB44",
      label: "Enjoy Your Meal",
      sub: "Bon appétit!",
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: SPACING.lg,
        }}
      >
        {/* ── SUCCESS ICON ── */}
        <View style={{ alignItems: "center", marginBottom: 32 }}>
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: COLORS.primary + "20",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
              borderWidth: 2,
              borderColor: COLORS.primary + "40",
            }}
          >
            <Text style={{ fontSize: 52 }}>🎉</Text>
          </View>
          <Text
            style={{
              fontSize: 32,
              fontWeight: "900",
              color: COLORS.text,
              textAlign: "center",
              marginBottom: 6,
            }}
          >
            Order Placed!
          </Text>
          <Text
            style={{
              color: COLORS.textMuted,
              fontSize: FONTS.sizes.sm,
              textAlign: "center",
              lineHeight: 20,
            }}
          >
            Your delicious food is on its way to your table. Sit back and relax!
          </Text>
        </View>

        {/* ── ORDER DETAILS ── */}
        <View
          style={{
            backgroundColor: COLORS.surface,
            borderRadius: RADIUS.md,
            borderWidth: 1,
            borderColor: COLORS.border,
            padding: SPACING.md,
            marginBottom: 24,
          }}
        >
          {[
            { label: "Order ID", value: orderId, color: COLORS.primary },
            {
              label: "Table Number",
              value: `Table ${tableNumber}`,
              color: COLORS.text,
            },
            {
              label: "Total Amount",
              value: `৳${parseInt(totalAmount)}`,
              color: COLORS.primary,
            },
            {
              label: "Status",
              value: "Pending → Being Prepared",
              color: "#44BB44",
            },
          ].map((row, i) => (
            <View
              key={i}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingVertical: 10,
                borderBottomWidth: i < 3 ? 1 : 0,
                borderBottomColor: COLORS.border,
              }}
            >
              <Text
                style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.sm }}
              >
                {row.label}
              </Text>
              <Text
                style={{
                  color: row.color,
                  fontSize: FONTS.sizes.sm,
                  fontWeight: "700",
                }}
              >
                {row.value}
              </Text>
            </View>
          ))}
        </View>

        {/* ── ORDER JOURNEY ── */}
        <View
          style={{
            backgroundColor: COLORS.surface,
            borderRadius: RADIUS.md,
            borderWidth: 1,
            borderColor: COLORS.border,
            padding: SPACING.md,
            marginBottom: 32,
          }}
        >
          <Text
            style={{
              color: COLORS.text,
              fontSize: FONTS.sizes.md,
              fontWeight: "700",
              marginBottom: 16,
            }}
          >
            Order Journey
          </Text>
          {steps.map((step, i) => (
            <View
              key={i}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                marginBottom: i < steps.length - 1 ? 0 : 0,
              }}
            >
              <View style={{ alignItems: "center", marginRight: 12 }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor:
                      i === 0 ? step.color + "30" : COLORS.surfaceLight,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 1.5,
                    borderColor: i === 0 ? step.color : COLORS.border,
                  }}
                >
                  <Ionicons
                    name={step.icon}
                    size={16}
                    color={i === 0 ? step.color : COLORS.textMuted}
                  />
                </View>
                {i < steps.length - 1 && (
                  <View
                    style={{
                      width: 1.5,
                      height: 24,
                      backgroundColor:
                        i === 0 ? COLORS.primary + "40" : COLORS.border,
                      marginVertical: 2,
                    }}
                  />
                )}
              </View>
              <View
                style={{
                  paddingTop: 6,
                  paddingBottom: i < steps.length - 1 ? 20 : 0,
                }}
              >
                <Text
                  style={{
                    color: i === 0 ? COLORS.text : COLORS.textMuted,
                    fontSize: FONTS.sizes.sm,
                    fontWeight: i === 0 ? "700" : "400",
                  }}
                >
                  {step.label}
                </Text>
                <Text
                  style={{
                    color: COLORS.textMuted,
                    fontSize: FONTS.sizes.xs,
                    marginTop: 2,
                  }}
                >
                  {step.sub}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── ACTIONS ── */}
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)")}
          style={{
            backgroundColor: COLORS.primary,
            paddingVertical: 16,
            borderRadius: RADIUS.full,
            alignItems: "center",
            marginBottom: 12,
            flexDirection: "row",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <Ionicons name="home" size={18} color="#fff" />
          <Text
            style={{
              color: "#fff",
              fontSize: FONTS.sizes.lg,
              fontWeight: "900",
            }}
          >
            Back to Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.replace("/(tabs)/menu")}
          style={{
            borderWidth: 1.5,
            borderColor: COLORS.primary,
            paddingVertical: 14,
            borderRadius: RADIUS.full,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <Ionicons
            name="restaurant-outline"
            size={18}
            color={COLORS.primary}
          />
          <Text
            style={{
              color: COLORS.primary,
              fontSize: FONTS.sizes.md,
              fontWeight: "700",
            }}
          >
            Order More Items
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
