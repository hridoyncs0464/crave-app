// app/order.jsx
import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import axios from "axios";
import { COLORS, FONTS, SPACING, RADIUS } from "../constants/theme";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const BASE_URL = "https://crave-server-main.onrender.com";

export default function Order() {
  const router = useRouter();
  const {
    cartItems,
    cartTotal,
    cartCount,
    tableNumber,
    setTableNumber,
    clearCart,
  } = useCart();
  const { user } = useAuth();

  const [localTable, setLocalTable] = useState(tableNumber || "");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePlaceOrder = async () => {
    const tbl = localTable.trim();
    if (!tbl) {
      setError("Please enter your table number.");
      return;
    }
    setError("");
    setLoading(true);

    const payload = {
      table_number: tbl,
      customer_note: note.trim() || null,
      items: cartItems.map((item) => ({
        menu_item_id: item.id,
        item_name: item.item_name,
        category_name: item.category_name,
        quantity: item.quantity,
        price_per_unit: parseFloat(item.price_bdt),
        special_notes: null,
      })),
    };

    try {
      const res = await axios.post(`${BASE_URL}/api/orders/create`, payload);
      if (res.data.success) {
        setTableNumber(tbl);
        clearCart();
        router.replace({
          pathname: "/order-success",
          params: {
            orderId: res.data.order.order_id,
            tableNumber: tbl,
            totalAmount: res.data.order.total_amount,
          },
        });
      } else {
        setError(res.data.message || "Failed to place order.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Network error. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* ── HEADER ── */}
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
            Confirm Order
          </Text>
          <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.xs }}>
            {cartCount} items · ৳{parseInt(cartTotal)}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: SPACING.md, paddingBottom: 120 }}
      >
        {/* ── TABLE NUMBER ── */}
        <View
          style={{
            backgroundColor: COLORS.surface,
            borderRadius: RADIUS.md,
            borderWidth: 1,
            borderColor: COLORS.border,
            padding: SPACING.md,
            marginBottom: 16,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 12,
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: COLORS.primary + "20",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="qr-code" size={18} color={COLORS.primary} />
            </View>
            <Text
              style={{
                color: COLORS.text,
                fontSize: FONTS.sizes.lg,
                fontWeight: "700",
              }}
            >
              Table Number
            </Text>
          </View>
          <Text
            style={{
              color: COLORS.textMuted,
              fontSize: FONTS.sizes.xs,
              marginBottom: 10,
            }}
          >
            Enter the table number shown on your table card or QR code.
          </Text>
          <TextInput
            value={localTable}
            onChangeText={(t) => {
              setLocalTable(t);
              setError("");
            }}
            placeholder="e.g. T-5 or 12"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="default"
            style={{
              backgroundColor: COLORS.surfaceLight,
              color: COLORS.text,
              fontSize: FONTS.sizes.lg,
              fontWeight: "700",
              padding: 14,
              borderRadius: RADIUS.sm,
              borderWidth: 1.5,
              borderColor: error ? COLORS.error : COLORS.border,
              letterSpacing: 1,
            }}
          />
          {error ? (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                marginTop: 8,
              }}
            >
              <Ionicons name="alert-circle" size={14} color={COLORS.error} />
              <Text style={{ color: COLORS.error, fontSize: FONTS.sizes.xs }}>
                {error}
              </Text>
            </View>
          ) : null}
        </View>

        {/* ── ORDER ITEMS ── */}
        <View
          style={{
            backgroundColor: COLORS.surface,
            borderRadius: RADIUS.md,
            borderWidth: 1,
            borderColor: COLORS.border,
            padding: SPACING.md,
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              color: COLORS.text,
              fontSize: FONTS.sizes.lg,
              fontWeight: "700",
              marginBottom: 14,
            }}
          >
            Your Order
          </Text>
          {cartItems.map((item, idx) => (
            <View key={item.id}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingVertical: 10,
                }}
              >
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text
                    style={{
                      color: COLORS.text,
                      fontSize: FONTS.sizes.sm,
                      fontWeight: "600",
                    }}
                  >
                    {item.item_name}
                  </Text>
                  <Text
                    style={{
                      color: COLORS.textMuted,
                      fontSize: FONTS.sizes.xs,
                      marginTop: 2,
                    }}
                  >
                    {item.category_name} · ৳{parseInt(item.price_bdt)} each
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <View
                    style={{
                      backgroundColor: COLORS.primary + "20",
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: RADIUS.full,
                      marginBottom: 2,
                    }}
                  >
                    <Text
                      style={{
                        color: COLORS.primary,
                        fontSize: FONTS.sizes.xs,
                        fontWeight: "700",
                      }}
                    >
                      × {item.quantity}
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: COLORS.primary,
                      fontSize: FONTS.sizes.sm,
                      fontWeight: "900",
                    }}
                  >
                    ৳{parseInt(item.price_bdt * item.quantity)}
                  </Text>
                </View>
              </View>
              {idx < cartItems.length - 1 && (
                <View style={{ height: 1, backgroundColor: COLORS.border }} />
              )}
            </View>
          ))}
        </View>

        {/* ── SPECIAL NOTE ── */}
        <View
          style={{
            backgroundColor: COLORS.surface,
            borderRadius: RADIUS.md,
            borderWidth: 1,
            borderColor: COLORS.border,
            padding: SPACING.md,
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              color: COLORS.text,
              fontSize: FONTS.sizes.md,
              fontWeight: "700",
              marginBottom: 10,
            }}
          >
            Special Note (optional)
          </Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Any allergies, dietary needs, or requests..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={3}
            style={{
              backgroundColor: COLORS.surfaceLight,
              color: COLORS.text,
              fontSize: FONTS.sizes.sm,
              padding: 12,
              borderRadius: RADIUS.sm,
              borderWidth: 1,
              borderColor: COLORS.border,
              textAlignVertical: "top",
              minHeight: 80,
            }}
          />
        </View>

        {/* ── ORDER TOTAL ── */}
        <View
          style={{
            backgroundColor: COLORS.surface,
            borderRadius: RADIUS.md,
            borderWidth: 1,
            borderColor: COLORS.border,
            padding: SPACING.md,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.sm }}>
              Subtotal ({cartCount} items)
            </Text>
            <Text
              style={{
                color: COLORS.text,
                fontSize: FONTS.sizes.sm,
                fontWeight: "600",
              }}
            >
              ৳{parseInt(cartTotal)}
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.sm }}>
              Service Charge
            </Text>
            <Text
              style={{
                color: "#44BB44",
                fontSize: FONTS.sizes.sm,
                fontWeight: "600",
              }}
            >
              Free
            </Text>
          </View>
          <View
            style={{
              height: 1,
              backgroundColor: COLORS.border,
              marginBottom: 12,
            }}
          />
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <Text
              style={{
                color: COLORS.text,
                fontSize: FONTS.sizes.lg,
                fontWeight: "900",
              }}
            >
              Total
            </Text>
            <Text
              style={{
                color: COLORS.primary,
                fontSize: FONTS.sizes.xl,
                fontWeight: "900",
              }}
            >
              ৳{parseInt(cartTotal)}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* ── CONFIRM BUTTON ── */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: COLORS.background,
          padding: SPACING.md,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
        }}
      >
        <TouchableOpacity
          onPress={handlePlaceOrder}
          disabled={loading}
          style={{
            backgroundColor: loading ? COLORS.textMuted : COLORS.primary,
            paddingVertical: 16,
            borderRadius: RADIUS.full,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            elevation: 4,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={22} color="#fff" />
              <Text
                style={{
                  color: "#fff",
                  fontSize: FONTS.sizes.lg,
                  fontWeight: "900",
                }}
              >
                Confirm Order · ৳{parseInt(cartTotal)}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
