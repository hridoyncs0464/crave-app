// app/(tabs)/_layout.jsx
import { Tabs } from 'expo-router';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../../context/CartContext';
import { COLORS } from '../../constants/theme';

function CartTabIcon({ color, size }) {
  const { cartCount } = useCart();
  return (
    <View style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name="cart" size={size} color={color} />
      {cartCount > 0 && (
        <View style={{
          position: 'absolute', top: -4, right: -6,
          backgroundColor: COLORS.primary,
          borderRadius: 10, minWidth: 16, height: 16,
          alignItems: 'center', justifyContent: 'center',
          paddingHorizontal: 3,
        }}>
          <Text style={{ color: '#fff', fontSize: 9, fontWeight: '900' }}>{cartCount}</Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const TAB_HEIGHT = 56 + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: TAB_HEIGHT,
          paddingBottom: insets.bottom + 4,
          paddingTop: 8,
          elevation: 8,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: 1 },
        headerStyle: { backgroundColor: COLORS.surface, elevation: 0, shadowOpacity: 0 },
        headerShadowVisible: false,
        headerTitle: () => null,
        headerLeft: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginLeft: 16 }}>
            <Text style={{ fontSize: 18 }}>🔥</Text>
            <Text style={{ color: COLORS.primary, fontWeight: '900', fontSize: 18, letterSpacing: 1 }}>
              CRAVE
            </Text>
          </View>
        ),
      }}
    >
      <Tabs.Screen name="index"        options={{ title: 'Home',    tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} /> }} />
      <Tabs.Screen name="menu"         options={{ title: 'Menu',    tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'restaurant' : 'restaurant-outline'} size={size} color={color} /> }} />
      <Tabs.Screen name="cart"         options={{ title: 'Cart',    tabBarIcon: ({ color, size }) => <CartTabIcon color={color} size={size} /> }} />
      <Tabs.Screen name="reservations" options={{ title: 'Reserve', tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={size} color={color} /> }} />
      <Tabs.Screen name="profile"      options={{ title: 'Profile', tabBarIcon: ({ color, size, focused }) => <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} /> }} />
    </Tabs>
  );
} 
// import { Tabs } from "expo-router";
// import { COLORS, FONTS } from "../../constants/theme";
// import { Ionicons } from "@expo/vector-icons";
// import { View, Text } from "react-native";
// import { useCart } from "../../context/CartContext";

// function CartTabIcon({ color, size }) {
//   const cart = useCart();
//   const cartCount = cart?.cartCount || 0;
//   return (
//     <View
//       style={{
//         width: 32,
//         height: 32,
//         alignItems: "center",
//         justifyContent: "center",
//       }}
//     >
//       <Ionicons name="cart" size={size} color={color} />
//       {cartCount > 0 && (
//         <View
//           style={{
//             position: "absolute",
//             top: -4,
//             right: -6,
//             backgroundColor: COLORS.primary,
//             borderRadius: 10,
//             minWidth: 16,
//             height: 16,
//             alignItems: "center",
//             justifyContent: "center",
//             paddingHorizontal: 3,
//           }}
//         >
//           <Text style={{ color: "#fff", fontSize: 9, fontWeight: "900" }}>
//             {cartCount}
//           </Text>
//         </View>
//       )}
//     </View>
//   );
// }

// export default function TabLayout() {
//   return (
//     <Tabs
//       screenOptions={{
//         tabBarStyle: {
//           backgroundColor: COLORS.base200,
//           borderTopColor: COLORS.border,
//           borderTopWidth: 1,
//           height: 65,
//           paddingBottom: 8,
//           paddingTop: 6,
//         },
//         tabBarActiveTintColor: COLORS.primary,
//         tabBarInactiveTintColor: COLORS.textMuted,
//         tabBarLabelStyle: { fontSize: 10, fontWeight: "600", marginTop: 2 },
//         headerStyle: { backgroundColor: COLORS.base100 },
//         headerShadowVisible: false,
//         headerTitle: "",
//         headerLeft: () => (
//           <View
//             style={{
//               flexDirection: "row",
//               alignItems: "center",
//               gap: 6,
//               marginLeft: 16,
//             }}
//           >
//             <Text style={{ fontSize: 18 }}>🔥</Text>
//             <Text
//               style={{
//                 color: COLORS.primary,
//                 fontWeight: "900",
//                 fontSize: 18,
//                 letterSpacing: 1,
//               }}
//             >
//               CRAVE
//             </Text>
//           </View>
//         ),
//       }}
//     >
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: "Home",
//           tabBarIcon: ({ color, size, focused }) => (
//             <Ionicons
//               name={focused ? "home" : "home-outline"}
//               size={size}
//               color={color}
//             />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="menu"
//         options={{
//           title: "Menu",
//           tabBarIcon: ({ color, size, focused }) => (
//             <Ionicons
//               name={focused ? "restaurant" : "restaurant-outline"}
//               size={size}
//               color={color}
//             />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="cart"
//         options={{
//           title: "Cart",
//           tabBarIcon: ({ color, size }) => (
//             <CartTabIcon color={color} size={size} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="reservations"
//         options={{
//           title: "Reserve",
//           tabBarIcon: ({ color, size, focused }) => (
//             <Ionicons
//               name={focused ? "calendar" : "calendar-outline"}
//               size={size}
//               color={color}
//             />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="profile"
//         options={{
//           title: "Profile",
//           tabBarIcon: ({ color, size, focused }) => (
//             <Ionicons
//               name={focused ? "person" : "person-outline"}
//               size={size}
//               color={color}
//             />
//           ),
//         }}
//       />
//     </Tabs>
//   );
// }
