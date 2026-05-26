// app/(tabs)/index.jsx
import {
  ScrollView,
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import axios from "axios";
import { COLORS, FONTS, SPACING, RADIUS } from "../../constants/theme";

const { width } = Dimensions.get("window");
const BASE_URL = "https://crave-server-main.onrender.com";

// ─── CATEGORY IMAGE MAP ──────────────────────────────────
// Maps backend category_name → Unsplash image
const CATEGORY_IMAGES = {
  Starters:
    "https://images.unsplash.com/photo-1599599810694-c6f40e9e5ad3?w=200&h=200&fit=crop",
  "Soups & Salads":
    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=200&fit=crop",
  "Noodles & Rice":
    "https://images.unsplash.com/photo-1555939594-58d7cb561d1a?w=200&h=200&fit=crop",
  "Main Course":
    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop",
  "Crave's Unique":
    "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=200&h=200&fit=crop",
  Drinks:
    "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=200&h=200&fit=crop",
  Desserts:
    "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&h=200&fit=crop",
  Sides:
    "https://images.unsplash.com/photo-1606787620884-c5f76f8360b0?w=200&h=200&fit=crop",
};
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&h=200&fit=crop";

// ─── STATIC DATA (unchanged) ─────────────────────────────
const signatureDishes = [
  {
    id: 1,
    name: "Truffle Wagyu Ramen",
    price: "৳850",
    description:
      "24-hour slow-cooked bone broth, A5 Wagyu slices, and shaved black truffle with handmade noodles.",
    image:
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=800",
    tag: "Chef's Signature",
  },
  {
    id: 2,
    name: "Golden Dragon Roll",
    price: "৳720",
    description:
      "Crispy tempura shrimp topped with fresh mango, avocado, and spicy unagi glaze.",
    image:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=800",
    tag: "Trending",
  },
  {
    id: 3,
    name: "Sichuan Fire Wok",
    price: "৳650",
    description:
      "Hand-pulled noodles tossed in fermented chili oil with crispy garlic and charred bok choy.",
    image:
      "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=800",
    tag: "Spicy",
  },
];

const whyUs = [
  {
    num: "01",
    tag: "Culinary",
    icon: "👨‍🍳",
    title: "Master Chefs",
    image:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80",
  },
  {
    num: "02",
    tag: "Freshness",
    icon: "🌿",
    title: "Fresh Ingredients",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80",
  },
  {
    num: "03",
    tag: "Flavour",
    icon: "🌶️",
    title: "Authentic Flavours",
    image:
      "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&q=80",
  },
  {
    num: "04",
    tag: "Service",
    icon: "⚡",
    title: "Fast Table Service",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80",
  },
  {
    num: "05",
    tag: "Signature",
    icon: "🔥",
    title: "Crave Originals",
    image:
      "https://images.unsplash.com/photo-1562802378-063ec186a863?w=400&q=80",
  },
  {
    num: "06",
    tag: "Ambiance",
    icon: "🕯️",
    title: "Cosy Atmosphere",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80",
  },
];

const reviews = [
  {
    name: "Tasnim Akter",
    location: "Dhanmondi, Dhaka",
    rating: 5,
    review:
      "The Volcano Rice is absolutely insane — watching it get flambéed at the table was a show in itself.",
    foodImage:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&q=80",
    foodLabel: "Volcano Rice",
    avatar: "TA",
    avatarColor: COLORS.primary,
  },
  {
    name: "Rifat Hossain",
    location: "Uttara, Dhaka",
    rating: 5,
    review:
      "Ordered the Ramen Burger on a dare and now it's my go-to order. The noodle buns are crispy and hold everything perfectly.",
    foodImage:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
    foodLabel: "Ramen Burger",
    avatar: "RH",
    avatarColor: COLORS.secondary,
  },
  {
    name: "Nusrat Jahan",
    location: "Gulshan, Dhaka",
    rating: 5,
    review:
      "Crave's Famous Ramen has the most deeply flavoured broth I've had outside Japan.",
    foodImage:
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80",
    foodLabel: "Crave's Ramen",
    avatar: "NJ",
    avatarColor: COLORS.accent,
  },
];

// ─── BANNER (unchanged) ──────────────────────────────────
function Banner({ router }) {
  return (
    <ImageBackground
      source={{
        uri: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1200&auto=format&fit=crop",
      }}
      style={{ width: "100%", height: 480 }}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.62)",
          justifyContent: "center",
          alignItems: "center",
          padding: SPACING.lg,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            borderWidth: 1,
            borderColor: COLORS.accent + "60",
            borderRadius: RADIUS.full,
            paddingHorizontal: 14,
            paddingVertical: 6,
            marginBottom: 20,
          }}
        >
          <Ionicons name="restaurant" size={13} color={COLORS.accent} />
          <Text
            style={{
              color: COLORS.accent,
              fontSize: FONTS.sizes.xs,
              fontWeight: "700",
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            Welcome to Crave
          </Text>
        </View>
        <Text
          style={{
            fontSize: 42,
            fontWeight: "900",
            color: "#fff",
            textAlign: "center",
            lineHeight: 50,
          }}
        >
          Crave the <Text style={{ color: COLORS.primary }}>Experience</Text>
        </Text>
        <Text
          style={{
            color: "rgba(255,255,255,0.75)",
            fontSize: FONTS.sizes.md,
            textAlign: "center",
            marginTop: 14,
            marginBottom: 32,
            lineHeight: 22,
          }}
        >
          Experience exceptional dining with carefully crafted dishes made from
          the finest ingredients.
        </Text>
        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/reservations")}
            style={{
              backgroundColor: COLORS.primary,
              paddingHorizontal: 24,
              paddingVertical: 14,
              borderRadius: RADIUS.full,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontWeight: "700",
                fontSize: FONTS.sizes.md,
              }}
            >
              Reserve a Table
            </Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/menu")}
            style={{
              borderWidth: 1.5,
              borderColor: "#fff",
              paddingHorizontal: 24,
              paddingVertical: 14,
              borderRadius: RADIUS.full,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Ionicons name="restaurant-outline" size={16} color="#fff" />
            <Text
              style={{
                color: "#fff",
                fontWeight: "700",
                fontSize: FONTS.sizes.md,
              }}
            >
              View Menu
            </Text>
          </TouchableOpacity>
        </View>
        <View
          style={{
            flexDirection: "row",
            gap: 24,
            marginTop: 36,
            paddingTop: 20,
            borderTopWidth: 1,
            borderTopColor: "rgba(255,255,255,0.2)",
            width: "100%",
            justifyContent: "center",
          }}
        >
          {[
            { icon: "restaurant", label: "Fine Dining", color: COLORS.primary },
            { icon: "wine", label: "Premium", color: COLORS.secondary },
            { icon: "star", label: "Award Winning", color: COLORS.accent },
          ].map((b, i) => (
            <View
              key={i}
              style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
            >
              <Ionicons name={b.icon} size={14} color={b.color} />
              <Text
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: FONTS.sizes.xs,
                }}
              >
                {b.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ImageBackground>
  );
}

// ─── CATEGORIES — NOW FROM BACKEND ───────────────────────
function CategoriesSection({ router }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/categories`)
      .then((res) => {
        if (res.data.success) setCategories(res.data.data);
      })
      .catch((err) => console.error("Categories fetch error:", err));
  }, []);

  return (
    <View
      style={{
        backgroundColor: COLORS.surface,
        paddingVertical: 32,
        paddingHorizontal: SPACING.md,
      }}
    >
      <View style={{ alignItems: "center", marginBottom: 24 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 6,
            borderWidth: 1,
            borderColor: COLORS.primary + "40",
            borderRadius: RADIUS.full,
            paddingHorizontal: 12,
            paddingVertical: 5,
            marginBottom: 12,
            backgroundColor: COLORS.primary + "10",
          }}
        >
          <Ionicons name="flame" size={13} color={COLORS.primary} />
          <Text
            style={{
              color: COLORS.primary,
              fontSize: 10,
              fontWeight: "700",
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            Explore Our Cuisine
          </Text>
        </View>
        <Text
          style={{
            fontSize: 28,
            fontWeight: "900",
            color: COLORS.text,
            textAlign: "center",
          }}
        >
          Our <Text style={{ color: COLORS.secondary }}>Categories</Text>
        </Text>
        <Text
          style={{
            color: COLORS.textMuted,
            fontSize: FONTS.sizes.sm,
            textAlign: "center",
            marginTop: 6,
          }}
        >
          Discover a world of flavors across our carefully curated food
          categories
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 16,
        }}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => router.push("/(tabs)/menu")}
            style={{ alignItems: "center", width: 72 }}
          >
            <View
              style={{
                width: 68,
                height: 68,
                borderRadius: 34,
                overflow: "hidden",
                borderWidth: 2,
                borderColor: COLORS.border,
              }}
            >
              <Image
                source={{
                  uri: CATEGORY_IMAGES[cat.category_name] || FALLBACK_IMAGE,
                }}
                style={{ width: "100%", height: "100%" }}
              />
            </View>
            <Text
              style={{
                color: COLORS.textMuted,
                fontSize: 10,
                textAlign: "center",
                marginTop: 6,
                fontWeight: "500",
                lineHeight: 13,
              }}
            >
              {cat.category_name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── SIGNATURE DISH SLIDER (unchanged) ──────────────────
function SignatureDishSlider({ router }) {
  const [index, setIndex] = useState(0);
  const dish = signatureDishes[index];
  return (
    <View
      style={{
        backgroundColor: COLORS.surface,
        paddingVertical: 32,
        paddingHorizontal: SPACING.md,
      }}
    >
      <Text
        style={{
          fontSize: 28,
          fontWeight: "900",
          color: COLORS.text,
          textAlign: "center",
          marginBottom: 20,
        }}
      >
        Don't Miss <Text style={{ color: COLORS.primary }}>It</Text>
      </Text>
      <View
        style={{
          borderRadius: 24,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: COLORS.border,
        }}
      >
        <ImageBackground source={{ uri: dish.image }} style={{ height: 380 }}>
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(26,18,8,0.78)",
              padding: SPACING.lg,
              justifyContent: "flex-end",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                marginBottom: 10,
              }}
            >
              <Ionicons name="flame" size={14} color={COLORS.primary} />
              <Text
                style={{
                  color: COLORS.primary,
                  fontSize: 10,
                  fontWeight: "900",
                  letterSpacing: 3,
                  textTransform: "uppercase",
                }}
              >
                {dish.tag}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 30,
                fontWeight: "900",
                color: "#fff",
                marginBottom: 10,
              }}
            >
              {dish.name}
            </Text>
            <View
              style={{
                borderLeftWidth: 3,
                borderLeftColor: COLORS.primary,
                paddingLeft: 12,
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: FONTS.sizes.sm,
                  fontStyle: "italic",
                  lineHeight: 20,
                }}
              >
                "{dish.description}"
              </Text>
            </View>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 16 }}
            >
              <Text
                style={{
                  fontSize: 26,
                  fontWeight: "700",
                  color: COLORS.primary,
                }}
              >
                {dish.price}
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/menu")}
                style={{
                  backgroundColor: COLORS.primary,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  borderRadius: RADIUS.full,
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "700",
                    fontSize: FONTS.sizes.sm,
                  }}
                >
                  Explore Dish
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 20,
              }}
            >
              <View style={{ flexDirection: "row", gap: 6 }}>
                {signatureDishes.map((_, i) => (
                  <View
                    key={i}
                    style={{
                      height: 4,
                      borderRadius: 2,
                      backgroundColor:
                        i === index ? COLORS.primary : COLORS.border,
                      width: i === index ? 28 : 10,
                    }}
                  />
                ))}
              </View>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity
                  onPress={() =>
                    setIndex(
                      (index - 1 + signatureDishes.length) %
                        signatureDishes.length,
                    )
                  }
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="chevron-back" size={18} color={COLORS.text} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setIndex((index + 1) % signatureDishes.length)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: COLORS.primary,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="chevron-forward" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ImageBackground>
      </View>
    </View>
  );
}

// ─── WHY CHOOSE US (unchanged) ───────────────────────────
function WhyChooseUs() {
  return (
    <View
      style={{
        backgroundColor: COLORS.surface,
        paddingVertical: 32,
        paddingHorizontal: SPACING.md,
      }}
    >
      <View style={{ alignItems: "center", marginBottom: 24 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginBottom: 10,
          }}
        >
          <View
            style={{
              height: 1,
              width: 24,
              backgroundColor: COLORS.primary + "60",
            }}
          />
          <Text
            style={{
              color: COLORS.primary,
              fontSize: 10,
              fontWeight: "500",
              letterSpacing: 4,
              textTransform: "uppercase",
            }}
          >
            ✦ The Crave Difference ✦
          </Text>
          <View
            style={{
              height: 1,
              width: 24,
              backgroundColor: COLORS.primary + "60",
            }}
          />
        </View>
        <Text
          style={{
            fontSize: 28,
            fontWeight: "900",
            color: COLORS.text,
            textAlign: "center",
            lineHeight: 34,
          }}
        >
          Why Guests Keep{"\n"}
          <Text style={{ color: COLORS.primary, fontStyle: "italic" }}>
            Coming Back
          </Text>
        </Text>
        <Text
          style={{
            color: COLORS.textMuted,
            fontSize: FONTS.sizes.sm,
            textAlign: "center",
            marginTop: 8,
          }}
        >
          Six reasons every visit feels like the first — and never the last.
        </Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 12,
          justifyContent: "center",
        }}
      >
        {whyUs.map((f) => (
          <View
            key={f.num}
            style={{
              width: (width - SPACING.md * 2 - 12) / 2,
              height: 180,
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            <ImageBackground source={{ uri: f.image }} style={{ flex: 1 }}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: "rgba(26,18,8,0.72)",
                  padding: 12,
                  justifyContent: "space-between",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.3)",
                      fontSize: 11,
                      fontWeight: "700",
                    }}
                  >
                    {f.num}
                  </Text>
                  <View
                    style={{
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.25)",
                      borderRadius: RADIUS.full,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                    }}
                  >
                    <Text
                      style={{
                        color: "rgba(255,255,255,0.7)",
                        fontSize: 9,
                        letterSpacing: 1,
                        textTransform: "uppercase",
                      }}
                    >
                      {f.tag}
                    </Text>
                  </View>
                </View>
                <View>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      backgroundColor: "rgba(255,255,255,0.1)",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ fontSize: 18 }}>{f.icon}</Text>
                  </View>
                  <Text
                    style={{
                      color: "#fff",
                      fontWeight: "700",
                      fontSize: FONTS.sizes.md,
                    }}
                  >
                    {f.title}
                  </Text>
                </View>
              </View>
            </ImageBackground>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── REVIEWS (unchanged) ─────────────────────────────────
function ReviewsSection() {
  return (
    <View
      style={{
        backgroundColor: COLORS.background,
        paddingVertical: 32,
        paddingHorizontal: SPACING.md,
      }}
    >
      <View style={{ alignItems: "center", marginBottom: 24 }}>
        <Text
          style={{
            color: COLORS.primary,
            fontSize: 10,
            fontWeight: "700",
            letterSpacing: 3,
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Real Guests · Real Reactions
        </Text>
        <Text
          style={{
            fontSize: 26,
            fontWeight: "900",
            color: COLORS.text,
            textAlign: "center",
          }}
        >
          What Our Guests{" "}
          <Text style={{ color: COLORS.primary }}>Are Saying</Text>
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginTop: 10,
          }}
        >
          <View
            style={{
              height: 1,
              width: 32,
              backgroundColor: COLORS.primary + "40",
            }}
          />
          <Ionicons name="star" size={14} color={COLORS.accent} />
          <View
            style={{
              height: 1,
              width: 32,
              backgroundColor: COLORS.primary + "40",
            }}
          />
        </View>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -SPACING.md }}
        contentContainerStyle={{ paddingHorizontal: SPACING.md, gap: 14 }}
      >
        {reviews.map((r, i) => (
          <View
            key={i}
            style={{
              width: width * 0.75,
              borderRadius: 20,
              overflow: "hidden",
              backgroundColor: COLORS.surface,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <Image
              source={{ uri: r.foodImage }}
              style={{ width: "100%", height: 140 }}
            />
            <View style={{ position: "absolute", top: 110, left: 12 }}>
              <View
                style={{
                  backgroundColor: COLORS.primary,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: RADIUS.full,
                }}
              >
                <Text
                  style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}
                >
                  {r.foodLabel}
                </Text>
              </View>
            </View>
            <View style={{ padding: 16, paddingTop: 20 }}>
              <View style={{ flexDirection: "row", gap: 3, marginBottom: 8 }}>
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Ionicons
                    key={i}
                    name="star"
                    size={12}
                    color={COLORS.accent}
                  />
                ))}
              </View>
              <Text
                style={{
                  color: COLORS.textMuted,
                  fontSize: FONTS.sizes.sm,
                  lineHeight: 20,
                  marginBottom: 14,
                  fontStyle: "italic",
                }}
              >
                "{r.review}"
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  paddingTop: 12,
                  borderTopWidth: 1,
                  borderTopColor: COLORS.border,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: r.avatarColor,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}
                  >
                    {r.avatar}
                  </Text>
                </View>
                <View>
                  <Text
                    style={{
                      color: COLORS.text,
                      fontWeight: "700",
                      fontSize: FONTS.sizes.sm,
                    }}
                  >
                    {r.name}
                  </Text>
                  <Text style={{ color: COLORS.textMuted, fontSize: 10 }}>
                    {r.location}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

// ─── LOCATION (unchanged) ────────────────────────────────
function LocationSection({ router }) {
  return (
    <View
      style={{
        backgroundColor: COLORS.background,
        paddingVertical: 32,
        paddingHorizontal: SPACING.md,
      }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: "900",
          color: COLORS.primary,
          marginBottom: 8,
        }}
      >
        Visit Crave Restaurant
      </Text>
      <Text
        style={{
          color: COLORS.textMuted,
          fontSize: FONTS.sizes.sm,
          marginBottom: 20,
          lineHeight: 20,
        }}
      >
        Experience the taste of Asia right in your neighborhood. Visit us for a
        cozy dining experience or reserve your table online.
      </Text>
      {[
        { icon: "location", label: "Dhanmondi, Dhaka, Bangladesh" },
        { icon: "call", label: "+880 1234-567890" },
        { icon: "time", label: "11:00 AM – 11:00 PM" },
      ].map((item, i) => (
        <View
          key={i}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            marginBottom: 10,
          }}
        >
          <Ionicons name={item.icon} size={16} color={COLORS.primary} />
          <Text style={{ color: COLORS.text, fontSize: FONTS.sizes.sm }}>
            {item.label}
          </Text>
        </View>
      ))}
      <TouchableOpacity
        onPress={() => router.push("/(tabs)/reservations")}
        style={{
          backgroundColor: COLORS.primary,
          paddingHorizontal: 24,
          paddingVertical: 14,
          borderRadius: RADIUS.full,
          marginTop: 16,
          alignSelf: "flex-start",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "700" }}>
          Reserve a Table
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── MAIN HOME SCREEN ────────────────────────────────────
export default function Home() {
  const router = useRouter();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      showsVerticalScrollIndicator={false}
    >
      <Banner router={router} />
      <CategoriesSection router={router} />
      <SignatureDishSlider router={router} />
      <WhyChooseUs />
      <ReviewsSection />
      <LocationSection router={router} />
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

// import {
//   ScrollView,
//   View,
//   Text,
//   ImageBackground,
//   TouchableOpacity,
//   Image,
//   FlatList,
//   Dimensions,
// } from "react-native";
// import { useRouter } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";
// import { useState } from "react";
// import { COLORS, FONTS, SPACING, RADIUS } from "../../constants/theme";

// const { width } = Dimensions.get("window");

// // ─── DATA ───────────────────────────────────────────────
// const signatureDishes = [
//   {
//     id: 1,
//     name: "Truffle Wagyu Ramen",
//     price: "৳850",
//     description:
//       "24-hour slow-cooked bone broth, A5 Wagyu slices, and shaved black truffle with handmade noodles.",
//     image:
//       "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&q=80&w=800",
//     tag: "Chef's Signature",
//   },
//   {
//     id: 2,
//     name: "Golden Dragon Roll",
//     price: "৳720",
//     description:
//       "Crispy tempura shrimp topped with fresh mango, avocado, and spicy unagi glaze.",
//     image:
//       "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&q=80&w=800",
//     tag: "Trending",
//   },
//   {
//     id: 3,
//     name: "Sichuan Fire Wok",
//     price: "৳650",
//     description:
//       "Hand-pulled noodles tossed in fermented chili oil with crispy garlic and charred bok choy.",
//     image:
//       "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=800",
//     tag: "Spicy",
//   },
// ];

// const categories = [
//   {
//     id: 1,
//     name: "Starters",
//     image:
//       "https://images.unsplash.com/photo-1599599810694-c6f40e9e5ad3?w=200&h=200&fit=crop",
//   },
//   {
//     id: 2,
//     name: "Soups & Salads",
//     image:
//       "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=200&fit=crop",
//   },
//   {
//     id: 3,
//     name: "Noodles & Rice",
//     image:
//       "https://images.unsplash.com/photo-1555939594-58d7cb561d1a?w=200&h=200&fit=crop",
//   },
//   {
//     id: 4,
//     name: "Main Course",
//     image:
//       "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop",
//   },
//   {
//     id: 5,
//     name: "Crave's Unique",
//     image:
//       "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=200&h=200&fit=crop",
//   },
//   {
//     id: 6,
//     name: "Drinks",
//     image:
//       "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=200&h=200&fit=crop",
//   },
//   {
//     id: 7,
//     name: "Desserts",
//     image:
//       "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&h=200&fit=crop",
//   },
//   {
//     id: 8,
//     name: "Sides",
//     image:
//       "https://images.unsplash.com/photo-1606787620884-c5f76f8360b0?w=200&h=200&fit=crop",
//   },
// ];

// const whyUs = [
//   {
//     num: "01",
//     tag: "Culinary",
//     icon: "👨‍🍳",
//     title: "Master Chefs",
//     image:
//       "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80",
//   },
//   {
//     num: "02",
//     tag: "Freshness",
//     icon: "🌿",
//     title: "Fresh Ingredients",
//     image:
//       "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80",
//   },
//   {
//     num: "03",
//     tag: "Flavour",
//     icon: "🌶️",
//     title: "Authentic Flavours",
//     image:
//       "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&q=80",
//   },
//   {
//     num: "04",
//     tag: "Service",
//     icon: "⚡",
//     title: "Fast Table Service",
//     image:
//       "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80",
//   },
//   {
//     num: "05",
//     tag: "Signature",
//     icon: "🔥",
//     title: "Crave Originals",
//     image:
//       "https://images.unsplash.com/photo-1562802378-063ec186a863?w=400&q=80",
//   },
//   {
//     num: "06",
//     tag: "Ambiance",
//     icon: "🕯️",
//     title: "Cosy Atmosphere",
//     image:
//       "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80",
//   },
// ];

// const reviews = [
//   {
//     name: "Tasnim Akter",
//     location: "Dhanmondi, Dhaka",
//     rating: 5,
//     review:
//       "The Volcano Rice is absolutely insane — watching it get flambéed at the table was a show in itself.",
//     foodImage:
//       "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&q=80",
//     foodLabel: "Volcano Rice",
//     avatar: "TA",
//     avatarColor: COLORS.primary,
//   },
//   {
//     name: "Rifat Hossain",
//     location: "Uttara, Dhaka",
//     rating: 5,
//     review:
//       "Ordered the Ramen Burger on a dare and now it's my go-to order. The noodle buns are crispy and hold everything perfectly.",
//     foodImage:
//       "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
//     foodLabel: "Ramen Burger",
//     avatar: "RH",
//     avatarColor: COLORS.secondary,
//   },
//   {
//     name: "Nusrat Jahan",
//     location: "Gulshan, Dhaka",
//     rating: 5,
//     review:
//       "Crave's Famous Ramen has the most deeply flavoured broth I've had outside Japan.",
//     foodImage:
//       "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400&q=80",
//     foodLabel: "Crave's Ramen",
//     avatar: "NJ",
//     avatarColor: COLORS.accent,
//   },
// ];

// // ─── BANNER ─────────────────────────────────────────────
// function Banner({ router }) {
//   return (
//     <ImageBackground
//       source={{
//         uri: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1200&auto=format&fit=crop",
//       }}
//       style={{ width: "100%", height: 480 }}
//     >
//       <View
//         style={{
//           flex: 1,
//           backgroundColor: "rgba(0,0,0,0.62)",
//           justifyContent: "center",
//           alignItems: "center",
//           padding: SPACING.lg,
//         }}
//       >
//         {/* Badge */}
//         <View
//           style={{
//             flexDirection: "row",
//             alignItems: "center",
//             gap: 6,
//             borderWidth: 1,
//             borderColor: COLORS.accent + "60",
//             borderRadius: RADIUS.full,
//             paddingHorizontal: 14,
//             paddingVertical: 6,
//             marginBottom: 20,
//           }}
//         >
//           <Ionicons name="restaurant" size={13} color={COLORS.accent} />
//           <Text
//             style={{
//               color: COLORS.accent,
//               fontSize: FONTS.sizes.xs,
//               fontWeight: "700",
//               letterSpacing: 2,
//               textTransform: "uppercase",
//             }}
//           >
//             Welcome to Crave
//           </Text>
//         </View>

//         {/* Heading */}
//         <Text
//           style={{
//             fontSize: 42,
//             fontWeight: "900",
//             color: "#fff",
//             textAlign: "center",
//             lineHeight: 50,
//           }}
//         >
//           Crave the <Text style={{ color: COLORS.primary }}>Experience</Text>
//         </Text>

//         {/* Subtitle */}
//         <Text
//           style={{
//             color: "rgba(255,255,255,0.75)",
//             fontSize: FONTS.sizes.md,
//             textAlign: "center",
//             marginTop: 14,
//             marginBottom: 32,
//             lineHeight: 22,
//           }}
//         >
//           Experience exceptional dining with carefully crafted dishes made from
//           the finest ingredients.
//         </Text>

//         {/* Buttons */}
//         <View style={{ flexDirection: "row", gap: 12 }}>
//           <TouchableOpacity
//             onPress={() => router.push("/(tabs)/reservations")}
//             style={{
//               backgroundColor: COLORS.primary,
//               paddingHorizontal: 24,
//               paddingVertical: 14,
//               borderRadius: RADIUS.full,
//               flexDirection: "row",
//               alignItems: "center",
//               gap: 8,
//             }}
//           >
//             <Text
//               style={{
//                 color: "#fff",
//                 fontWeight: "700",
//                 fontSize: FONTS.sizes.md,
//               }}
//             >
//               Reserve a Table
//             </Text>
//             <Ionicons name="arrow-forward" size={16} color="#fff" />
//           </TouchableOpacity>
//           <TouchableOpacity
//             onPress={() => router.push("/(tabs)/menu")}
//             style={{
//               borderWidth: 1.5,
//               borderColor: "#fff",
//               paddingHorizontal: 24,
//               paddingVertical: 14,
//               borderRadius: RADIUS.full,
//               flexDirection: "row",
//               alignItems: "center",
//               gap: 8,
//             }}
//           >
//             <Ionicons name="restaurant-outline" size={16} color="#fff" />
//             <Text
//               style={{
//                 color: "#fff",
//                 fontWeight: "700",
//                 fontSize: FONTS.sizes.md,
//               }}
//             >
//               View Menu
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {/* Bottom badges */}
//         <View
//           style={{
//             flexDirection: "row",
//             gap: 24,
//             marginTop: 36,
//             paddingTop: 20,
//             borderTopWidth: 1,
//             borderTopColor: "rgba(255,255,255,0.2)",
//             width: "100%",
//             justifyContent: "center",
//           }}
//         >
//           {[
//             { icon: "restaurant", label: "Fine Dining", color: COLORS.primary },
//             { icon: "wine", label: "Premium", color: COLORS.secondary },
//             { icon: "star", label: "Award Winning", color: COLORS.accent },
//           ].map((b, i) => (
//             <View
//               key={i}
//               style={{ flexDirection: "row", alignItems: "center", gap: 5 }}
//             >
//               <Ionicons name={b.icon} size={14} color={b.color} />
//               <Text
//                 style={{
//                   color: "rgba(255,255,255,0.7)",
//                   fontSize: FONTS.sizes.xs,
//                 }}
//               >
//                 {b.label}
//               </Text>
//             </View>
//           ))}
//         </View>
//       </View>
//     </ImageBackground>
//   );
// }

// // ─── CATEGORIES ─────────────────────────────────────────
// function CategoriesSection({ router }) {
//   return (
//     <View
//       style={{
//         backgroundColor: COLORS.base100,
//         paddingVertical: 32,
//         paddingHorizontal: SPACING.md,
//       }}
//     >
//       {/* Header */}
//       <View style={{ alignItems: "center", marginBottom: 24 }}>
//         <View
//           style={{
//             flexDirection: "row",
//             alignItems: "center",
//             gap: 6,
//             borderWidth: 1,
//             borderColor: COLORS.primary + "40",
//             borderRadius: RADIUS.full,
//             paddingHorizontal: 12,
//             paddingVertical: 5,
//             marginBottom: 12,
//             backgroundColor: COLORS.primary + "10",
//           }}
//         >
//           <Ionicons name="flame" size={13} color={COLORS.primary} />
//           <Text
//             style={{
//               color: COLORS.primary,
//               fontSize: 10,
//               fontWeight: "700",
//               letterSpacing: 2,
//               textTransform: "uppercase",
//             }}
//           >
//             Explore Our Cuisine
//           </Text>
//         </View>
//         <Text
//           style={{
//             fontSize: 28,
//             fontWeight: "900",
//             color: COLORS.baseContent,
//             textAlign: "center",
//           }}
//         >
//           Our <Text style={{ color: COLORS.secondary }}>Categories</Text>
//         </Text>
//         <Text
//           style={{
//             color: COLORS.textMuted,
//             fontSize: FONTS.sizes.sm,
//             textAlign: "center",
//             marginTop: 6,
//           }}
//         >
//           Discover a world of flavors across our carefully curated food
//           categories
//         </Text>
//       </View>

//       {/* Circle Grid */}
//       <View
//         style={{
//           flexDirection: "row",
//           flexWrap: "wrap",
//           justifyContent: "center",
//           gap: 16,
//         }}
//       >
//         {categories.map((cat) => (
//           <TouchableOpacity
//             key={cat.id}
//             onPress={() => router.push("/(tabs)/menu")}
//             style={{ alignItems: "center", width: 72 }}
//           >
//             <View
//               style={{
//                 width: 68,
//                 height: 68,
//                 borderRadius: 34,
//                 overflow: "hidden",
//                 borderWidth: 2,
//                 borderColor: COLORS.border,
//               }}
//             >
//               <Image
//                 source={{ uri: cat.image }}
//                 style={{ width: "100%", height: "100%" }}
//               />
//             </View>
//             <Text
//               style={{
//                 color: COLORS.textMuted,
//                 fontSize: 10,
//                 textAlign: "center",
//                 marginTop: 6,
//                 fontWeight: "500",
//                 lineHeight: 13,
//               }}
//             >
//               {cat.name}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>
//     </View>
//   );
// }

// // ─── SIGNATURE DISH SLIDER ───────────────────────────────
// function SignatureDishSlider({ router }) {
//   const [index, setIndex] = useState(0);
//   const dish = signatureDishes[index];

//   return (
//     <View
//       style={{
//         backgroundColor: COLORS.base100,
//         paddingVertical: 32,
//         paddingHorizontal: SPACING.md,
//       }}
//     >
//       <Text
//         style={{
//           fontSize: 28,
//           fontWeight: "900",
//           color: COLORS.baseContent,
//           textAlign: "center",
//           marginBottom: 20,
//         }}
//       >
//         Don't Miss <Text style={{ color: COLORS.primary }}>It</Text>
//       </Text>

//       <View
//         style={{
//           borderRadius: 24,
//           overflow: "hidden",
//           borderWidth: 1,
//           borderColor: COLORS.border,
//         }}
//       >
//         <ImageBackground source={{ uri: dish.image }} style={{ height: 380 }}>
//           <View
//             style={{
//               flex: 1,
//               backgroundColor: "rgba(26,18,8,0.78)",
//               padding: SPACING.lg,
//               justifyContent: "flex-end",
//             }}
//           >
//             {/* Tag */}
//             <View
//               style={{
//                 flexDirection: "row",
//                 alignItems: "center",
//                 gap: 6,
//                 marginBottom: 10,
//               }}
//             >
//               <Ionicons name="flame" size={14} color={COLORS.primary} />
//               <Text
//                 style={{
//                   color: COLORS.primary,
//                   fontSize: 10,
//                   fontWeight: "900",
//                   letterSpacing: 3,
//                   textTransform: "uppercase",
//                 }}
//               >
//                 {dish.tag}
//               </Text>
//             </View>

//             {/* Title */}
//             <Text
//               style={{
//                 fontSize: 30,
//                 fontWeight: "900",
//                 color: "#fff",
//                 marginBottom: 10,
//               }}
//             >
//               {dish.name}
//             </Text>

//             {/* Description */}
//             <View
//               style={{
//                 borderLeftWidth: 3,
//                 borderLeftColor: COLORS.primary,
//                 paddingLeft: 12,
//                 marginBottom: 16,
//               }}
//             >
//               <Text
//                 style={{
//                   color: "rgba(255,255,255,0.7)",
//                   fontSize: FONTS.sizes.sm,
//                   fontStyle: "italic",
//                   lineHeight: 20,
//                 }}
//               >
//                 "{dish.description}"
//               </Text>
//             </View>

//             {/* Price + Button */}
//             <View
//               style={{ flexDirection: "row", alignItems: "center", gap: 16 }}
//             >
//               <Text
//                 style={{
//                   fontSize: 26,
//                   fontWeight: "700",
//                   color: COLORS.primary,
//                 }}
//               >
//                 {dish.price}
//               </Text>
//               <TouchableOpacity
//                 onPress={() => router.push("/(tabs)/menu")}
//                 style={{
//                   backgroundColor: COLORS.primary,
//                   paddingHorizontal: 20,
//                   paddingVertical: 10,
//                   borderRadius: RADIUS.full,
//                 }}
//               >
//                 <Text
//                   style={{
//                     color: "#fff",
//                     fontWeight: "700",
//                     fontSize: FONTS.sizes.sm,
//                   }}
//                 >
//                   Explore Dish
//                 </Text>
//               </TouchableOpacity>
//             </View>

//             {/* Nav */}
//             <View
//               style={{
//                 flexDirection: "row",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//                 marginTop: 20,
//               }}
//             >
//               {/* Indicators */}
//               <View style={{ flexDirection: "row", gap: 6 }}>
//                 {signatureDishes.map((_, i) => (
//                   <View
//                     key={i}
//                     style={{
//                       height: 4,
//                       borderRadius: 2,
//                       backgroundColor:
//                         i === index ? COLORS.primary : COLORS.border,
//                       width: i === index ? 28 : 10,
//                     }}
//                   />
//                 ))}
//               </View>
//               {/* Arrows */}
//               <View style={{ flexDirection: "row", gap: 10 }}>
//                 <TouchableOpacity
//                   onPress={() =>
//                     setIndex(
//                       (index - 1 + signatureDishes.length) %
//                         signatureDishes.length,
//                     )
//                   }
//                   style={{
//                     width: 40,
//                     height: 40,
//                     borderRadius: 20,
//                     borderWidth: 1,
//                     borderColor: COLORS.border,
//                     alignItems: "center",
//                     justifyContent: "center",
//                   }}
//                 >
//                   <Ionicons
//                     name="chevron-back"
//                     size={18}
//                     color={COLORS.baseContent}
//                   />
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   onPress={() => setIndex((index + 1) % signatureDishes.length)}
//                   style={{
//                     width: 40,
//                     height: 40,
//                     borderRadius: 20,
//                     backgroundColor: COLORS.primary,
//                     alignItems: "center",
//                     justifyContent: "center",
//                   }}
//                 >
//                   <Ionicons name="chevron-forward" size={18} color="#fff" />
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//         </ImageBackground>
//       </View>
//     </View>
//   );
// }

// // ─── WHY CHOOSE US ───────────────────────────────────────
// function WhyChooseUs() {
//   return (
//     <View
//       style={{
//         backgroundColor: COLORS.base100,
//         paddingVertical: 32,
//         paddingHorizontal: SPACING.md,
//       }}
//     >
//       {/* Header */}
//       <View style={{ alignItems: "center", marginBottom: 24 }}>
//         <View
//           style={{
//             flexDirection: "row",
//             alignItems: "center",
//             gap: 8,
//             marginBottom: 10,
//           }}
//         >
//           <View
//             style={{
//               height: 1,
//               width: 24,
//               backgroundColor: COLORS.primary + "60",
//             }}
//           />
//           <Text
//             style={{
//               color: COLORS.primary,
//               fontSize: 10,
//               fontWeight: "500",
//               letterSpacing: 4,
//               textTransform: "uppercase",
//             }}
//           >
//             ✦ The Crave Difference ✦
//           </Text>
//           <View
//             style={{
//               height: 1,
//               width: 24,
//               backgroundColor: COLORS.primary + "60",
//             }}
//           />
//         </View>
//         <Text
//           style={{
//             fontSize: 28,
//             fontWeight: "900",
//             color: COLORS.baseContent,
//             textAlign: "center",
//             lineHeight: 34,
//           }}
//         >
//           Why Guests Keep{"\n"}
//           <Text style={{ color: COLORS.primary, fontStyle: "italic" }}>
//             Coming Back
//           </Text>
//         </Text>
//         <Text
//           style={{
//             color: COLORS.textMuted,
//             fontSize: FONTS.sizes.sm,
//             textAlign: "center",
//             marginTop: 8,
//           }}
//         >
//           Six reasons every visit feels like the first — and never the last.
//         </Text>
//       </View>

//       {/* 2-col Grid */}
//       <View
//         style={{
//           flexDirection: "row",
//           flexWrap: "wrap",
//           gap: 12,
//           justifyContent: "center",
//         }}
//       >
//         {whyUs.map((f) => (
//           <View
//             key={f.num}
//             style={{
//               width: (width - SPACING.md * 2 - 12) / 2,
//               height: 180,
//               borderRadius: 16,
//               overflow: "hidden",
//             }}
//           >
//             <ImageBackground source={{ uri: f.image }} style={{ flex: 1 }}>
//               <View
//                 style={{
//                   flex: 1,
//                   backgroundColor: "rgba(26,18,8,0.72)",
//                   padding: 12,
//                   justifyContent: "space-between",
//                 }}
//               >
//                 <View
//                   style={{
//                     flexDirection: "row",
//                     justifyContent: "space-between",
//                     alignItems: "flex-start",
//                   }}
//                 >
//                   <Text
//                     style={{
//                       color: "rgba(255,255,255,0.3)",
//                       fontSize: 11,
//                       fontWeight: "700",
//                     }}
//                   >
//                     {f.num}
//                   </Text>
//                   <View
//                     style={{
//                       borderWidth: 1,
//                       borderColor: "rgba(255,255,255,0.25)",
//                       borderRadius: RADIUS.full,
//                       paddingHorizontal: 8,
//                       paddingVertical: 3,
//                     }}
//                   >
//                     <Text
//                       style={{
//                         color: "rgba(255,255,255,0.7)",
//                         fontSize: 9,
//                         letterSpacing: 1,
//                         textTransform: "uppercase",
//                       }}
//                     >
//                       {f.tag}
//                     </Text>
//                   </View>
//                 </View>
//                 <View>
//                   <View
//                     style={{
//                       width: 36,
//                       height: 36,
//                       borderRadius: 10,
//                       backgroundColor: "rgba(255,255,255,0.1)",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       marginBottom: 8,
//                     }}
//                   >
//                     <Text style={{ fontSize: 18 }}>{f.icon}</Text>
//                   </View>
//                   <Text
//                     style={{
//                       color: "#fff",
//                       fontWeight: "700",
//                       fontSize: FONTS.sizes.md,
//                     }}
//                   >
//                     {f.title}
//                   </Text>
//                 </View>
//               </View>
//             </ImageBackground>
//           </View>
//         ))}
//       </View>
//     </View>
//   );
// }

// // ─── REVIEWS ─────────────────────────────────────────────
// function ReviewsSection() {
//   return (
//     <View
//       style={{
//         backgroundColor: COLORS.base200,
//         paddingVertical: 32,
//         paddingHorizontal: SPACING.md,
//       }}
//     >
//       {/* Header */}
//       <View style={{ alignItems: "center", marginBottom: 24 }}>
//         <Text
//           style={{
//             color: COLORS.primary,
//             fontSize: 10,
//             fontWeight: "700",
//             letterSpacing: 3,
//             textTransform: "uppercase",
//             marginBottom: 8,
//           }}
//         >
//           Real Guests · Real Reactions
//         </Text>
//         <Text
//           style={{
//             fontSize: 26,
//             fontWeight: "900",
//             color: COLORS.baseContent,
//             textAlign: "center",
//           }}
//         >
//           What Our Guests{" "}
//           <Text style={{ color: COLORS.primary }}>Are Saying</Text>
//         </Text>
//         <View
//           style={{
//             flexDirection: "row",
//             alignItems: "center",
//             gap: 8,
//             marginTop: 10,
//           }}
//         >
//           <View
//             style={{
//               height: 1,
//               width: 32,
//               backgroundColor: COLORS.primary + "40",
//             }}
//           />
//           <Ionicons name="star" size={14} color={COLORS.accent} />
//           <View
//             style={{
//               height: 1,
//               width: 32,
//               backgroundColor: COLORS.primary + "40",
//             }}
//           />
//         </View>
//       </View>

//       {/* Cards */}
//       <ScrollView
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         style={{ marginHorizontal: -SPACING.md }}
//         contentContainerStyle={{ paddingHorizontal: SPACING.md, gap: 14 }}
//       >
//         {reviews.map((r, i) => (
//           <View
//             key={i}
//             style={{
//               width: width * 0.75,
//               borderRadius: 20,
//               overflow: "hidden",
//               backgroundColor: COLORS.base100,
//               borderWidth: 1,
//               borderColor: COLORS.border,
//             }}
//           >
//             <Image
//               source={{ uri: r.foodImage }}
//               style={{ width: "100%", height: 140 }}
//             />
//             <View style={{ position: "absolute", top: 110, left: 12 }}>
//               <View
//                 style={{
//                   backgroundColor: COLORS.primary,
//                   paddingHorizontal: 10,
//                   paddingVertical: 4,
//                   borderRadius: RADIUS.full,
//                 }}
//               >
//                 <Text
//                   style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}
//                 >
//                   {r.foodLabel}
//                 </Text>
//               </View>
//             </View>
//             <View style={{ padding: 16, paddingTop: 20 }}>
//               <View style={{ flexDirection: "row", gap: 3, marginBottom: 8 }}>
//                 {Array.from({ length: r.rating }).map((_, i) => (
//                   <Ionicons
//                     key={i}
//                     name="star"
//                     size={12}
//                     color={COLORS.accent}
//                   />
//                 ))}
//               </View>
//               <Text
//                 style={{
//                   color: COLORS.textMuted,
//                   fontSize: FONTS.sizes.sm,
//                   lineHeight: 20,
//                   marginBottom: 14,
//                   fontStyle: "italic",
//                 }}
//               >
//                 "{r.review}"
//               </Text>
//               <View
//                 style={{
//                   flexDirection: "row",
//                   alignItems: "center",
//                   gap: 10,
//                   paddingTop: 12,
//                   borderTopWidth: 1,
//                   borderTopColor: COLORS.border,
//                 }}
//               >
//                 <View
//                   style={{
//                     width: 36,
//                     height: 36,
//                     borderRadius: 18,
//                     backgroundColor: r.avatarColor,
//                     alignItems: "center",
//                     justifyContent: "center",
//                   }}
//                 >
//                   <Text
//                     style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}
//                   >
//                     {r.avatar}
//                   </Text>
//                 </View>
//                 <View>
//                   <Text
//                     style={{
//                       color: COLORS.baseContent,
//                       fontWeight: "700",
//                       fontSize: FONTS.sizes.sm,
//                     }}
//                   >
//                     {r.name}
//                   </Text>
//                   <Text style={{ color: COLORS.textMuted, fontSize: 10 }}>
//                     {r.location}
//                   </Text>
//                 </View>
//               </View>
//             </View>
//           </View>
//         ))}
//       </ScrollView>
//     </View>
//   );
// }

// // ─── LOCATION ────────────────────────────────────────────
// function LocationSection({ router }) {
//   return (
//     <View
//       style={{
//         backgroundColor: COLORS.base200,
//         paddingVertical: 32,
//         paddingHorizontal: SPACING.md,
//       }}
//     >
//       <Text
//         style={{
//           fontSize: 24,
//           fontWeight: "900",
//           color: COLORS.primary,
//           marginBottom: 8,
//         }}
//       >
//         Visit Crave Restaurant
//       </Text>
//       <Text
//         style={{
//           color: COLORS.textMuted,
//           fontSize: FONTS.sizes.sm,
//           marginBottom: 20,
//           lineHeight: 20,
//         }}
//       >
//         Experience the taste of Asia right in your neighborhood. Visit us for a
//         cozy dining experience or reserve your table online.
//       </Text>
//       {[
//         { icon: "location", label: "Dhanmondi, Dhaka, Bangladesh" },
//         { icon: "call", label: "+880 1234-567890" },
//         { icon: "time", label: "11:00 AM – 11:00 PM" },
//       ].map((item, i) => (
//         <View
//           key={i}
//           style={{
//             flexDirection: "row",
//             alignItems: "center",
//             gap: 10,
//             marginBottom: 10,
//           }}
//         >
//           <Ionicons name={item.icon} size={16} color={COLORS.primary} />
//           <Text style={{ color: COLORS.baseContent, fontSize: FONTS.sizes.sm }}>
//             {item.label}
//           </Text>
//         </View>
//       ))}
//       <TouchableOpacity
//         onPress={() => router.push("/(tabs)/reservations")}
//         style={{
//           backgroundColor: COLORS.primary,
//           paddingHorizontal: 24,
//           paddingVertical: 14,
//           borderRadius: RADIUS.full,
//           marginTop: 16,
//           alignSelf: "flex-start",
//         }}
//       >
//         <Text style={{ color: "#fff", fontWeight: "700" }}>
//           Reserve a Table
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// // ─── MAIN HOME SCREEN ────────────────────────────────────
// export default function Home() {
//   const router = useRouter();

//   return (
//     <ScrollView
//       style={{ flex: 1, backgroundColor: COLORS.background }}
//       showsVerticalScrollIndicator={false}
//     >
//       <Banner router={router} />
//       <CategoriesSection router={router} />
//       <SignatureDishSlider router={router} />
//       <WhyChooseUs />
//       <ReviewsSection />
//       <LocationSection router={router} />
//       <View style={{ height: 20 }} />
//     </ScrollView>
//   );
// }
