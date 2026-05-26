import { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, Dimensions, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { useCart } from '../../context/CartContext';

const { width } = Dimensions.get('window');
const BASE_URL = 'https://crave-server-main.onrender.com';

// ─── MENU ITEM CARD ──────────────────────────────────────
function MenuCard({ item, cartItem, onAdd, onIncrease, onDecrease }) {
  return (
    <View style={{
      backgroundColor: COLORS.surface,
      borderRadius: RADIUS.md,
      borderWidth: 1,
      borderColor: COLORS.border,
      padding: SPACING.md,
      marginBottom: 12,
    }}>
      {/* Top Row */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={{ color: COLORS.primary, fontSize: FONTS.sizes.lg, fontWeight: '700' }}>{item.item_name}</Text>
          <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: 2 }}>{item.category_name}</Text>
        </View>
        {item.is_unique ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.accent + '30', paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full }}>
            <Ionicons name="star" size={10} color={COLORS.accent} />
            <Text style={{ color: COLORS.accent, fontSize: 9, fontWeight: '700' }}>Unique</Text>
          </View>
        ) : null}
      </View>

      {/* Ingredients */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 6, marginBottom: 12 }}>
        <Ionicons name="leaf" size={13} color="#44BB44" style={{ marginTop: 2 }} />
        <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.xs, flex: 1, lineHeight: 18 }}>{item.ingredients}</Text>
      </View>

      {/* Divider */}
      <View style={{ height: 1, backgroundColor: COLORS.border, marginBottom: 12 }} />

      {/* Price + Cart */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: COLORS.primary, fontSize: FONTS.sizes.xl, fontWeight: '900' }}>
          ৳{parseInt(item.price_bdt)}
        </Text>

        {!cartItem ? (
          <TouchableOpacity
            onPress={onAdd}
            style={{ backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.sm }}
          >
            <Ionicons name="cart" size={14} color="#fff" />
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: FONTS.sizes.sm }}>Add to Cart</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <TouchableOpacity
              onPress={onDecrease}
              style={{ width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name="remove" size={16} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={{ color: COLORS.primary, fontWeight: '900', fontSize: FONTS.sizes.lg, minWidth: 20, textAlign: 'center' }}>{cartItem.quantity}</Text>
            <TouchableOpacity
              onPress={onIncrease}
              style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name="add" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── MAIN MENU SCREEN ────────────────────────────────────
export default function Menu() {
  const router = useRouter();

  // ✅ Cart from context — shared across all screens
  const { cartItems, addToCart, updateQuantity, getCartItem, cartCount } = useCart();

  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortPrice, setSortPrice] = useState('default');
  const [showSortModal, setShowSortModal] = useState(false);

  const sortLabels = {
    default: 'Default',
    'low-to-high': 'Price: Low to High',
    'high-to-low': 'Price: High to Low',
  };

  const currentCategoryName = selectedCategory === 'all'
    ? 'All Dishes'
    : categories.find(c => c.id === parseInt(selectedCategory))?.category_name || 'Category';

  // Fetch categories
  useEffect(() => {
    axios.get(`${BASE_URL}/api/categories`)
      .then(res => { if (res.data.success) setCategories(res.data.data); })
      .catch(err => console.error(err));
  }, []);

  // Fetch menu items
  useEffect(() => {
    setLoading(true);
    setError(null);
    let endpoint = `${BASE_URL}/api/menu`;
    const params = [];
    if (selectedCategory !== 'all') params.push(`category=${selectedCategory}`);
    if (sortPrice !== 'default') params.push(`sortPrice=${sortPrice}`);
    if (params.length) endpoint += `?${params.join('&')}`;

    axios.get(endpoint)
      .then(res => { if (res.data.success) setMenuItems(res.data.data); })
      .catch(() => setError('Failed to load menu. Please try again.'))
      .finally(() => setLoading(false));
  }, [selectedCategory, sortPrice]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>

      {/* ── HERO ── */}
      <View style={{ paddingVertical: 28, paddingHorizontal: SPACING.md, alignItems: 'center', backgroundColor: COLORS.primary }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Text style={{ fontSize: 26 }}>🔥</Text>
          <Text style={{ color: '#fff', fontSize: FONTS.sizes.xxl, fontWeight: '900' }}>Our Menu</Text>
        </View>
        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: FONTS.sizes.sm, textAlign: 'center' }}>
          Discover authentic Asian cuisine crafted with passion
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: RADIUS.full }}>
          <Ionicons name="warning" size={13} color="#fff" />
          <Text style={{ color: '#fff', fontSize: FONTS.sizes.xs, fontWeight: '500' }}>Scan your table QR code to order</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── FILTER BAR ── */}
        <View style={{ backgroundColor: COLORS.surface, margin: SPACING.md, borderRadius: RADIUS.md, padding: SPACING.md, borderWidth: 1, borderColor: COLORS.border }}>
          <Text style={{ color: COLORS.text, fontSize: FONTS.sizes.lg, fontWeight: '700', marginBottom: 12 }}>Filter & Sort</Text>

          <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.xs, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {[{ id: 'all', category_name: 'All' }, ...categories].map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  onPress={() => setSelectedCategory(String(cat.id))}
                  style={{
                    paddingHorizontal: 14, paddingVertical: 7, borderRadius: RADIUS.full,
                    backgroundColor: String(selectedCategory) === String(cat.id) ? COLORS.primary : COLORS.surfaceLight,
                    borderWidth: 1,
                    borderColor: String(selectedCategory) === String(cat.id) ? COLORS.primary : COLORS.border,
                  }}
                >
                  <Text style={{ color: String(selectedCategory) === String(cat.id) ? '#fff' : COLORS.textMuted, fontSize: FONTS.sizes.xs, fontWeight: '600' }}>
                    {cat.category_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.xs, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Sort by Price</Text>
          <TouchableOpacity
            onPress={() => setShowSortModal(true)}
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.surfaceLight, padding: 12, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.border }}
          >
            <Text style={{ color: COLORS.text, fontSize: FONTS.sizes.sm }}>{sortLabels[sortPrice]}</Text>
            <Ionicons name="chevron-down" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* ── SECTION TITLE ── */}
        <Text style={{ color: COLORS.text, fontSize: FONTS.sizes.xl, fontWeight: '900', textAlign: 'center', marginBottom: 16 }}>
          {currentCategoryName}
        </Text>

        {/* ── LOADING ── */}
        {loading && (
          <View style={{ paddingVertical: 60, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        )}

        {/* ── ERROR ── */}
        {error && !loading && (
          <View style={{ margin: SPACING.md, backgroundColor: '#FF444420', borderRadius: RADIUS.md, padding: SPACING.md, alignItems: 'center' }}>
            <Ionicons name="alert-circle" size={32} color={COLORS.error} />
            <Text style={{ color: COLORS.error, fontSize: FONTS.sizes.md, fontWeight: '600', marginTop: 8 }}>{error}</Text>
            <TouchableOpacity
              onPress={() => { setSelectedCategory('all'); setError(null); }}
              style={{ marginTop: 12, backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: RADIUS.full }}
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── MENU ITEMS ── */}
        {!loading && !error && menuItems.length > 0 && (
          <View style={{ paddingHorizontal: SPACING.md, paddingBottom: cartCount > 0 ? 110 : 24 }}>
            {menuItems.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                cartItem={getCartItem(item.id)}
                onAdd={() => addToCart(item)}
                onIncrease={() => updateQuantity(item.id, (getCartItem(item.id)?.quantity || 0) + 1)}
                onDecrease={() => updateQuantity(item.id, (getCartItem(item.id)?.quantity || 0) - 1)}
              />
            ))}
          </View>
        )}

        {/* ── EMPTY STATE ── */}
        {!loading && !error && menuItems.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: 60 }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>🔍</Text>
            <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.lg, fontWeight: '700', marginBottom: 8 }}>No items found</Text>
            <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.sm, marginBottom: 20 }}>Try a different category or sort</Text>
            <TouchableOpacity
              onPress={() => { setSelectedCategory('all'); setSortPrice('default'); }}
              style={{ backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: RADIUS.full }}
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>View All Items</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>

      {/* ── SORT MODAL ── */}
      <Modal visible={showSortModal} transparent animationType="slide">
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={() => setShowSortModal(false)} />
        <View style={{ backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: SPACING.lg, position: 'absolute', bottom: 0, left: 0, right: 0 }}>
          <Text style={{ color: COLORS.text, fontSize: FONTS.sizes.lg, fontWeight: '700', marginBottom: 16 }}>Sort by Price</Text>
          {Object.entries(sortLabels).map(([key, label]) => (
            <TouchableOpacity
              key={key}
              onPress={() => { setSortPrice(key); setShowSortModal(false); }}
              style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border }}
            >
              <Text style={{ color: sortPrice === key ? COLORS.primary : COLORS.text, fontSize: FONTS.sizes.md, fontWeight: sortPrice === key ? '700' : '400' }}>{label}</Text>
              {sortPrice === key && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
            </TouchableOpacity>
          ))}
        </View>
      </Modal>

      {/* ── FLOATING CART BUTTON ── */}
      {cartCount > 0 && (
        <View style={{ position: 'absolute', bottom: 20, left: SPACING.md, right: SPACING.md }}>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/cart')}
            style={{ backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, borderRadius: RADIUS.full, elevation: 8 }}
          >
            <Ionicons name="cart" size={20} color="#fff" />
            <Text style={{ color: '#fff', fontSize: FONTS.sizes.lg, fontWeight: '700' }}>View Cart</Text>
            <View style={{ backgroundColor: '#fff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.full }}>
              <Text style={{ color: COLORS.primary, fontSize: FONTS.sizes.xs, fontWeight: '900' }}>
                {cartCount} {cartCount === 1 ? 'item' : 'items'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

    </View>
  );
}