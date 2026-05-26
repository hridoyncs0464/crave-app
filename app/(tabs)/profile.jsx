// app/(tabs)/profile.jsx
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { COLORS, FONTS, SPACING, RADIUS } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";

export default function Profile() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      icon: "receipt-outline",
      label: "My Orders",
      onPress: () => router.push("/my-orders"),
    },
    {
      icon: "calendar-outline",
      label: "My Reservations",
      onPress: () => router.push("/my-reservations"),
    },
    { icon: "heart-outline", label: "Favourites", onPress: () => {} },
    {
      icon: "notifications-outline",
      label: "Notifications",
      onPress: () => {},
    },
    { icon: "help-circle-outline", label: "Help & Support", onPress: () => {} },
    {
      icon: "information-circle-outline",
      label: "About Crave",
      onPress: () => {},
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── PROFILE HEADER ── */}
      <View
        style={{
          backgroundColor: COLORS.surface,
          padding: SPACING.lg,
          alignItems: "center",
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
        }}
      >
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: COLORS.primary,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 32, fontWeight: "900" }}>
            {user?.displayName?.[0]?.toUpperCase() ||
              user?.email?.[0]?.toUpperCase() ||
              "?"}
          </Text>
        </View>
        <Text
          style={{
            color: COLORS.text,
            fontSize: FONTS.sizes.xl,
            fontWeight: "900",
            marginBottom: 4,
          }}
        >
          {user?.displayName || "Guest User"}
        </Text>
        <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.sm }}>
          {user?.email || "Not logged in"}
        </Text>

        {!user && (
          <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
            <TouchableOpacity
              onPress={() => router.push("/auth/login")}
              style={{
                backgroundColor: COLORS.primary,
                paddingHorizontal: 24,
                paddingVertical: 10,
                borderRadius: RADIUS.full,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/auth/register")}
              style={{
                borderWidth: 1.5,
                borderColor: COLORS.primary,
                paddingHorizontal: 24,
                paddingVertical: 10,
                borderRadius: RADIUS.full,
              }}
            >
              <Text style={{ color: COLORS.primary, fontWeight: "700" }}>
                Register
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── MENU ITEMS ── */}
      <View
        style={{
          margin: SPACING.md,
          backgroundColor: COLORS.surface,
          borderRadius: RADIUS.md,
          borderWidth: 1,
          borderColor: COLORS.border,
          overflow: "hidden",
        }}
      >
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={item.onPress}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              padding: SPACING.md,
              borderBottomWidth: index < menuItems.length - 1 ? 1 : 0,
              borderBottomColor: COLORS.border,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: COLORS.primary + "20",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name={item.icon} size={18} color={COLORS.primary} />
              </View>
              <Text
                style={{
                  color: COLORS.text,
                  fontSize: FONTS.sizes.md,
                  fontWeight: "500",
                }}
              >
                {item.label}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={COLORS.textMuted}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* ── LOGOUT ── */}
      {user && (
        <TouchableOpacity
          onPress={handleLogout}
          style={{
            margin: SPACING.md,
            marginTop: 0,
            backgroundColor: COLORS.surface,
            borderRadius: RADIUS.md,
            borderWidth: 1,
            borderColor: COLORS.error + "40",
            padding: SPACING.md,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
          <Text
            style={{
              color: COLORS.error,
              fontWeight: "700",
              fontSize: FONTS.sizes.md,
            }}
          >
            Logout
          </Text>
        </TouchableOpacity>
      )}

      {/* ── APP VERSION ── */}
      <Text
        style={{
          color: COLORS.textMuted,
          fontSize: FONTS.sizes.xs,
          textAlign: "center",
          marginBottom: 8,
        }}
      >
        Crave v1.0.0 · Made with ❤️
      </Text>

      {/* ── HIDDEN STAFF / ADMIN LOGIN ── */}
      {/* Small, subtle — staff know it's there */}
      <TouchableOpacity
        onPress={() => router.push("/staff/waiter-login")}
        style={{
          alignSelf: "center",
          marginBottom: 32,
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: RADIUS.full,
          borderWidth: 1,
          borderColor: COLORS.border,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Ionicons name="shield-outline" size={12} color={COLORS.textMuted} />
          <Text
            style={{
              color: COLORS.textMuted,
              fontSize: 10,
              fontWeight: "600",
              letterSpacing: 1,
            }}
          >
            STAFF / ADMIN LOGIN
          </Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

// import { View, Text, TouchableOpacity, ScrollView } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import { COLORS, FONTS, SPACING, RADIUS } from "../../constants/theme";
// import { useAuth } from "../../context/AuthContext";

// export default function Profile() {
//   const router = useRouter();
//   const { user, logout } = useAuth();

//   const menuItems = [
//     { icon: "receipt-outline", label: "My Orders", onPress: () => {} },
//     {
//       icon: "calendar-outline",
//       label: "My Reservations",
//       onPress: () => router.push("/(tabs)/reservations"),
//     },
//     { icon: "heart-outline", label: "Favourites", onPress: () => {} },
//     {
//       icon: "notifications-outline",
//       label: "Notifications",
//       onPress: () => {},
//     },
//     { icon: "help-circle-outline", label: "Help & Support", onPress: () => {} },
//     {
//       icon: "information-circle-outline",
//       label: "About Crave",
//       onPress: () => {},
//     },
//   ];

//   const handleLogout = async () => {
//     try {
//       await logout();
//     } catch (e) {
//       console.error(e);
//     }
//   };

//   return (
//     <ScrollView
//       style={{ flex: 1, backgroundColor: COLORS.background }}
//       showsVerticalScrollIndicator={false}
//     >
//       {/* ── PROFILE HEADER ── */}
//       <View
//         style={{
//           backgroundColor: COLORS.surface,
//           padding: SPACING.lg,
//           alignItems: "center",
//           borderBottomWidth: 1,
//           borderBottomColor: COLORS.border,
//         }}
//       >
//         <View
//           style={{
//             width: 80,
//             height: 80,
//             borderRadius: 40,
//             backgroundColor: COLORS.primary,
//             alignItems: "center",
//             justifyContent: "center",
//             marginBottom: 12,
//           }}
//         >
//           {user?.photoURL ? (
//             <Text style={{ fontSize: 36 }}>👤</Text>
//           ) : (
//             <Text style={{ color: "#fff", fontSize: 32, fontWeight: "900" }}>
//               {user?.displayName?.[0]?.toUpperCase() ||
//                 user?.email?.[0]?.toUpperCase() ||
//                 "?"}
//             </Text>
//           )}
//         </View>
//         <Text
//           style={{
//             color: COLORS.text,
//             fontSize: FONTS.sizes.xl,
//             fontWeight: "900",
//             marginBottom: 4,
//           }}
//         >
//           {user?.displayName || "Guest User"}
//         </Text>
//         <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.sm }}>
//           {user?.email || "Not logged in"}
//         </Text>

//         {!user && (
//           <View style={{ flexDirection: "row", gap: 12, marginTop: 16 }}>
//             <TouchableOpacity
//               onPress={() => router.push("/auth/login")}
//               style={{
//                 backgroundColor: COLORS.primary,
//                 paddingHorizontal: 24,
//                 paddingVertical: 10,
//                 borderRadius: RADIUS.full,
//               }}
//             >
//               <Text style={{ color: "#fff", fontWeight: "700" }}>Login</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               onPress={() => router.push("/auth/register")}
//               style={{
//                 borderWidth: 1.5,
//                 borderColor: COLORS.primary,
//                 paddingHorizontal: 24,
//                 paddingVertical: 10,
//                 borderRadius: RADIUS.full,
//               }}
//             >
//               <Text style={{ color: COLORS.primary, fontWeight: "700" }}>
//                 Register
//               </Text>
//             </TouchableOpacity>
//           </View>
//         )}
//       </View>

//       {/* ── MENU ITEMS ── */}
//       <View
//         style={{
//           margin: SPACING.md,
//           backgroundColor: COLORS.surface,
//           borderRadius: RADIUS.md,
//           borderWidth: 1,
//           borderColor: COLORS.border,
//           overflow: "hidden",
//         }}
//       >
//         {menuItems.map((item, index) => (
//           <TouchableOpacity
//             key={index}
//             onPress={item.onPress}
//             style={{
//               flexDirection: "row",
//               alignItems: "center",
//               justifyContent: "space-between",
//               padding: SPACING.md,
//               borderBottomWidth: index < menuItems.length - 1 ? 1 : 0,
//               borderBottomColor: COLORS.border,
//             }}
//           >
//             <View
//               style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
//             >
//               <View
//                 style={{
//                   width: 36,
//                   height: 36,
//                   borderRadius: 10,
//                   backgroundColor: COLORS.primary + "20",
//                   alignItems: "center",
//                   justifyContent: "center",
//                 }}
//               >
//                 <Ionicons name={item.icon} size={18} color={COLORS.primary} />
//               </View>
//               <Text
//                 style={{
//                   color: COLORS.text,
//                   fontSize: FONTS.sizes.md,
//                   fontWeight: "500",
//                 }}
//               >
//                 {item.label}
//               </Text>
//             </View>
//             <Ionicons
//               name="chevron-forward"
//               size={16}
//               color={COLORS.textMuted}
//             />
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* ── LOGOUT ── */}
//       {user && (
//         <TouchableOpacity
//           onPress={handleLogout}
//           style={{
//             margin: SPACING.md,
//             marginTop: 0,
//             backgroundColor: COLORS.surface,
//             borderRadius: RADIUS.md,
//             borderWidth: 1,
//             borderColor: COLORS.error + "40",
//             padding: SPACING.md,
//             flexDirection: "row",
//             alignItems: "center",
//             justifyContent: "center",
//             gap: 10,
//           }}
//         >
//           <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
//           <Text
//             style={{
//               color: COLORS.error,
//               fontWeight: "700",
//               fontSize: FONTS.sizes.md,
//             }}
//           >
//             Logout
//           </Text>
//         </TouchableOpacity>
//       )}

//       {/* ── APP VERSION ── */}
//       <Text
//         style={{
//           color: COLORS.textMuted,
//           fontSize: FONTS.sizes.xs,
//           textAlign: "center",
//           marginBottom: 32,
//         }}
//       >
//         Crave v1.0.0 · Made with ❤️
//       </Text>
//     </ScrollView>
//   );
// }
