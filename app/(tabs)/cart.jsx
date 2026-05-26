import { View, Text, ScrollView, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS, FONTS, SPACING, RADIUS } from "../../constants/theme";
import { useCart } from "../../context/CartContext";

export default function Cart() {
  const router = useRouter();
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    cartCount,
  } = useCart();

  if (cartItems.length === 0) {
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
        <Text style={{ fontSize: 72, marginBottom: 16 }}>🛒</Text>
        <Text
          style={{
            color: COLORS.text,
            fontSize: FONTS.sizes.xl,
            fontWeight: "900",
            marginBottom: 8,
          }}
        >
          Your cart is empty
        </Text>
        <Text
          style={{
            color: COLORS.textMuted,
            fontSize: FONTS.sizes.sm,
            textAlign: "center",
            marginBottom: 32,
          }}
        >
          Add some delicious dishes from our menu!
        </Text>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/menu")}
          style={{
            backgroundColor: COLORS.primary,
            paddingHorizontal: 32,
            paddingVertical: 14,
            borderRadius: RADIUS.full,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Ionicons name="restaurant" size={18} color="#fff" />
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
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* ── HEADER ── */}
      <View
        style={{
          backgroundColor: COLORS.surface,
          paddingHorizontal: SPACING.md,
          paddingVertical: 16,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
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
            Your Cart
          </Text>
          <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.sm }}>
            {cartCount} {cartCount === 1 ? "item" : "items"}
          </Text>
        </View>
        <TouchableOpacity
          onPress={clearCart}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: RADIUS.full,
            borderWidth: 1,
            borderColor: COLORS.error + "60",
          }}
        >
          <Ionicons name="trash-outline" size={14} color={COLORS.error} />
          <Text
            style={{
              color: COLORS.error,
              fontSize: FONTS.sizes.xs,
              fontWeight: "600",
            }}
          >
            Clear All
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING.md, paddingBottom: 140 }}
      >
        {/* ── CART ITEMS ── */}
        {cartItems.map((item) => (
          <View
            key={item.id}
            style={{
              backgroundColor: COLORS.surface,
              borderRadius: RADIUS.md,
              borderWidth: 1,
              borderColor: COLORS.border,
              padding: SPACING.md,
              marginBottom: 12,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              {/* Left: Name + Category */}
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text
                  style={{
                    color: COLORS.primary,
                    fontSize: FONTS.sizes.md,
                    fontWeight: "700",
                    marginBottom: 2,
                  }}
                >
                  {item.item_name}
                </Text>
                <Text
                  style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.xs }}
                >
                  {item.category_name}
                </Text>

                {/* Ingredients */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                    marginTop: 6,
                  }}
                >
                  <Ionicons name="leaf" size={11} color="#44BB44" />
                  <Text
                    style={{ color: COLORS.textMuted, fontSize: 10, flex: 1 }}
                    numberOfLines={1}
                  >
                    {item.ingredients}
                  </Text>
                </View>
              </View>

              {/* Right: Remove button */}
              <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                <Ionicons
                  name="close-circle"
                  size={22}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>
            </View>

            {/* Bottom: Price + Quantity */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 14,
              }}
            >
              <Text
                style={{
                  color: COLORS.primary,
                  fontSize: FONTS.sizes.lg,
                  fontWeight: "900",
                }}
              >
                ৳{parseInt(item.price_bdt * item.quantity)}
              </Text>

              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
              >
                <TouchableOpacity
                  onPress={() => updateQuantity(item.id, item.quantity - 1)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    borderWidth: 1.5,
                    borderColor: COLORS.primary,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="remove" size={16} color={COLORS.primary} />
                </TouchableOpacity>
                <Text
                  style={{
                    color: COLORS.text,
                    fontWeight: "900",
                    fontSize: FONTS.sizes.lg,
                    minWidth: 24,
                    textAlign: "center",
                  }}
                >
                  {item.quantity}
                </Text>
                <TouchableOpacity
                  onPress={() => updateQuantity(item.id, item.quantity + 1)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: COLORS.primary,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="add" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Per item price */}
            <Text
              style={{ color: COLORS.textMuted, fontSize: 10, marginTop: 4 }}
            >
              ৳{parseInt(item.price_bdt)} × {item.quantity}
            </Text>
          </View>
        ))}

        {/* ── ORDER SUMMARY ── */}
        <View
          style={{
            backgroundColor: COLORS.surface,
            borderRadius: RADIUS.md,
            borderWidth: 1,
            borderColor: COLORS.border,
            padding: SPACING.md,
            marginTop: 8,
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
            Order Summary
          </Text>

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
              marginBottom: 8,
            }}
          >
            <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.sm }}>
              Service Charge
            </Text>
            <Text
              style={{
                color: COLORS.success,
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
              marginVertical: 12,
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

        {/* ── ADD MORE ITEMS ── */}
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/menu")}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            marginTop: 16,
            paddingVertical: 12,
          }}
        >
          <Ionicons
            name="add-circle-outline"
            size={18}
            color={COLORS.primary}
          />
          <Text
            style={{
              color: COLORS.primary,
              fontSize: FONTS.sizes.sm,
              fontWeight: "600",
            }}
          >
            Add more items
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── PLACE ORDER BUTTON ── */}
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
          onPress={() => router.push("/order")}
          style={{
            backgroundColor: COLORS.primary,
            paddingVertical: 16,
            borderRadius: RADIUS.full,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            elevation: 4,
          }}
        >
          <Ionicons name="checkmark-circle" size={22} color="#fff" />
          <Text
            style={{
              color: "#fff",
              fontSize: FONTS.sizes.lg,
              fontWeight: "900",
            }}
          >
            Place Order
          </Text>
          <View
            style={{
              backgroundColor: "rgba(255,255,255,0.25)",
              paddingHorizontal: 10,
              paddingVertical: 3,
              borderRadius: RADIUS.full,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontWeight: "700",
                fontSize: FONTS.sizes.xs,
              }}
            >
              ৳{parseInt(cartTotal)}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}
