// app/admin/admin-dashboard.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
  RefreshControl, Alert, TextInput, Modal, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';

const BASE_URL = 'https://crave-server-main.onrender.com';

// ─── STATUS CONFIGS ───────────────────────────────────────
const ORDER_STATUS = {
  pending:   { bg: '#F39C1220', text: '#F39C12', label: 'Pending',   icon: 'time-outline' },
  preparing: { bg: '#3498DB20', text: '#3498DB', label: 'Preparing', icon: 'flame' },
  ready:     { bg: '#9B59B620', text: '#9B59B6', label: 'Ready',     icon: 'checkmark-circle' },
  served:    { bg: '#44BB4420', text: '#44BB44', label: 'Served',    icon: 'restaurant' },
  cancelled: { bg: '#E74C3C20', text: '#E74C3C', label: 'Cancelled', icon: 'close-circle' },
};

const RES_STATUS = {
  pending:   { bg: '#F39C1220', text: '#F39C12', label: 'Pending' },
  confirmed: { bg: '#44BB4420', text: '#44BB44', label: 'Confirmed' },
  cancelled: { bg: '#E74C3C20', text: '#E74C3C', label: 'Cancelled' },
};

const NEXT_STATUS = { pending: 'preparing', preparing: 'ready', ready: 'served' };

// ─── REUSABLE STATUS BADGE ────────────────────────────────
function StatusBadge({ status, config }) {
  const c = config[status] || config[Object.keys(config)[0]];
  return (
    <View style={{ backgroundColor: c.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      {c.icon && <Ionicons name={c.icon} size={10} color={c.text} />}
      <Text style={{ color: c.text, fontSize: FONTS.sizes.xs, fontWeight: '700' }}>{c.label}</Text>
    </View>
  );
}

// ─── SECTION HEADER ──────────────────────────────────────
function SectionHeader({ title, subtitle, action }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 }}>
      <View>
        <Text style={{ color: COLORS.text, fontSize: FONTS.sizes.xl, fontWeight: '900' }}>{title}</Text>
        {subtitle ? <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: 2 }}>{subtitle}</Text> : null}
      </View>
      {action}
    </View>
  );
}

// ─────────────────────────────────────────────────────────
// TAB: OVERVIEW
// ─────────────────────────────────────────────────────────
function OverviewTab({ stats, orders, refreshing, onRefresh, onViewOrders, token }) {
  const recentOrders = orders.slice(0, 8);

  const statCards = [
    { label: "Today's Orders",  value: stats?.total_orders_today ?? '—',                             icon: 'receipt',    color: COLORS.primary },
    { label: "Today's Revenue", value: `৳${parseInt(stats?.total_revenue_today || 0)}`,              icon: 'cash',       color: '#44BB44' },
    { label: 'Pending',         value: stats?.orders_by_status?.pending ?? 0,                        icon: 'time',       color: '#F39C12' },
    { label: 'Preparing',       value: stats?.orders_by_status?.preparing ?? 0,                      icon: 'flame',      color: '#3498DB' },
  ];

  return (
    <ScrollView
      contentContainerStyle={{ padding: SPACING.md, paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.sm, marginBottom: 16 }}>Good day! Here's your snapshot.</Text>

      {/* ── STAT CARDS ── */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        {statCards.map((s, i) => (
          <View key={i} style={{ width: '47.5%', backgroundColor: COLORS.surface, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md }}>
            <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: s.color + '20', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <Ionicons name={s.icon} size={18} color={s.color} />
            </View>
            <Text style={{ color: COLORS.text, fontSize: 26, fontWeight: '900' }}>{s.value}</Text>
            <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: 2 }}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* ── ORDERS BY STATUS ── */}
      {stats?.orders_by_status && (
        <View style={{ backgroundColor: COLORS.surface, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md, marginBottom: 16 }}>
          <Text style={{ color: COLORS.text, fontWeight: '700', fontSize: FONTS.sizes.md, marginBottom: 12 }}>All Orders by Status</Text>
          {Object.entries(stats.orders_by_status).map(([status, count]) => {
            const c = ORDER_STATUS[status] || ORDER_STATUS.pending;
            const total = Object.values(stats.orders_by_status).reduce((a, b) => a + parseInt(b), 0);
            const pct = total > 0 ? (parseInt(count) / total) * 100 : 0;
            return (
              <View key={status} style={{ marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ color: COLORS.text, fontSize: FONTS.sizes.xs, textTransform: 'capitalize', fontWeight: '600' }}>{status}</Text>
                  <Text style={{ color: c.text, fontSize: FONTS.sizes.xs, fontWeight: '700' }}>{count}</Text>
                </View>
                <View style={{ height: 6, backgroundColor: COLORS.surfaceLight, borderRadius: 3 }}>
                  <View style={{ height: 6, width: `${pct}%`, backgroundColor: c.text, borderRadius: 3 }} />
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* ── RECENT ORDERS ── */}
      <View style={{ backgroundColor: COLORS.surface, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, overflow: 'hidden' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
          <Text style={{ color: COLORS.text, fontWeight: '700', fontSize: FONTS.sizes.md }}>Recent Orders</Text>
          <TouchableOpacity onPress={onViewOrders}>
            <Text style={{ color: COLORS.primary, fontSize: FONTS.sizes.xs, fontWeight: '600' }}>View all →</Text>
          </TouchableOpacity>
        </View>
        {recentOrders.length === 0 ? (
          <View style={{ padding: SPACING.lg, alignItems: 'center' }}>
            <Text style={{ color: COLORS.textMuted }}>No orders yet today</Text>
          </View>
        ) : recentOrders.map((o, i) => (
          <View key={o.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SPACING.md, borderBottomWidth: i < recentOrders.length - 1 ? 1 : 0, borderBottomColor: COLORS.border }}>
            <View>
              <Text style={{ color: COLORS.text, fontWeight: '700', fontSize: FONTS.sizes.sm }}>Table {o.table_number}</Text>
              <Text style={{ color: COLORS.textMuted, fontSize: 10, fontFamily: 'monospace' }}>{o.order_id}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <StatusBadge status={o.status} config={ORDER_STATUS} />
              <Text style={{ color: COLORS.primary, fontWeight: '900', fontSize: FONTS.sizes.xs }}>৳{parseInt(o.total_amount)}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* ── STAFF OVERVIEW ── */}
      {stats?.staff_by_role && (
        <View style={{ backgroundColor: COLORS.surface, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md, marginTop: 16 }}>
          <Text style={{ color: COLORS.text, fontWeight: '700', fontSize: FONTS.sizes.md, marginBottom: 12 }}>Active Staff</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {Object.entries(stats.staff_by_role).map(([role, count]) => (
              <View key={role} style={{ flex: 1, backgroundColor: COLORS.surfaceLight, borderRadius: RADIUS.sm, padding: 12, alignItems: 'center' }}>
                <Text style={{ fontSize: 22, marginBottom: 4 }}>{role === 'chef' ? '👨‍🍳' : role === 'waiter' ? '🧑‍🍽️' : '🔑'}</Text>
                <Text style={{ color: COLORS.primary, fontSize: FONTS.sizes.xl, fontWeight: '900' }}>{count}</Text>
                <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.xs, textTransform: 'capitalize' }}>{role}s</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────
// TAB: ORDERS  (with detail panel + status progression)
// ─────────────────────────────────────────────────────────
function OrdersTab({ token, refreshing, onRefresh }) {
  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null); // full detail
  const [detailLoading, setDetailLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchOrders = useCallback(async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const res = await axios.get(`${BASE_URL}/api/orders`, { headers, params });
      if (res.data.success) setOrders(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filter, token]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const loadDetail = async (orderId) => {
    setDetailLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/orders/${orderId}`, { headers });
      if (res.data.success) setSelectedOrder(res.data.data);
    } catch (e) { console.error(e); }
    finally { setDetailLoading(false); }
  };

  const updateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await axios.put(`${BASE_URL}/api/orders/${orderId}/status`, { status: newStatus }, { headers });
      fetchOrders();
      if (selectedOrder?.order?.id === orderId) loadDetail(orderId);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to update status.');
    } finally { setUpdatingId(null); }
  };

  const filters = ['all', 'pending', 'preparing', 'ready', 'served', 'cancelled'];

  return (
    <View style={{ flex: 1 }}>
      {/* Filter pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 52 }} contentContainerStyle={{ paddingHorizontal: SPACING.md, paddingVertical: 10, gap: 8 }}>
        {filters.map(f => (
          <TouchableOpacity key={f} onPress={() => setFilter(f)} style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: RADIUS.full, backgroundColor: filter === f ? COLORS.primary : COLORS.surface, borderWidth: 1, borderColor: filter === f ? COLORS.primary : COLORS.border }}>
            <Text style={{ color: filter === f ? '#fff' : COLORS.textMuted, fontSize: FONTS.sizes.xs, fontWeight: '600', textTransform: 'capitalize' }}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator color={COLORS.primary} /></View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: SPACING.md, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        >
          {orders.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.md }}>No {filter !== 'all' ? filter : ''} orders found</Text>
            </View>
          )}
          {orders.map(order => {
            const c = ORDER_STATUS[order.status] || ORDER_STATUS.pending;
            const next = NEXT_STATUS[order.status];
            return (
              <TouchableOpacity
                key={order.id}
                onPress={() => loadDetail(order.id)}
                style={{ backgroundColor: COLORS.surface, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md, marginBottom: 10 }}
                activeOpacity={0.85}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <View>
                    <Text style={{ color: COLORS.text, fontWeight: '900', fontSize: FONTS.sizes.lg }}>Table {order.table_number}</Text>
                    <Text style={{ color: COLORS.textMuted, fontSize: 10, marginTop: 2 }}>{order.order_id} · {order.item_count} items</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <StatusBadge status={order.status} config={ORDER_STATUS} />
                    <Text style={{ color: COLORS.primary, fontWeight: '900', fontSize: FONTS.sizes.sm }}>৳{parseInt(order.total_amount)}</Text>
                  </View>
                </View>

                <Text style={{ color: COLORS.textMuted, fontSize: 10, marginBottom: next || order.status === 'pending' ? 10 : 0 }}>
                  {new Date(order.created_at).toLocaleString('en-BD', { dateStyle: 'short', timeStyle: 'short' })}
                </Text>

                {/* Advance status button */}
                {next && (
                  <TouchableOpacity
                    onPress={() => updateStatus(order.id, next)}
                    disabled={updatingId === order.id}
                    style={{ backgroundColor: COLORS.primary + '15', borderWidth: 1, borderColor: COLORS.primary + '40', paddingVertical: 8, borderRadius: RADIUS.sm, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}
                  >
                    {updatingId === order.id
                      ? <ActivityIndicator size="small" color={COLORS.primary} />
                      : <>
                          <Ionicons name="arrow-forward-circle" size={14} color={COLORS.primary} />
                          <Text style={{ color: COLORS.primary, fontWeight: '700', fontSize: FONTS.sizes.xs }}>Mark as {next} →</Text>
                        </>
                    }
                  </TouchableOpacity>
                )}
                {/* Cancel button for pending */}
                {order.status === 'pending' && (
                  <TouchableOpacity
                    onPress={() => Alert.alert('Cancel Order?', `Cancel ${order.order_id}?`, [
                      { text: 'No', style: 'cancel' },
                      { text: 'Cancel Order', style: 'destructive', onPress: () => updateStatus(order.id, 'cancelled') },
                    ])}
                    style={{ marginTop: 6, paddingVertical: 6, alignItems: 'center' }}
                  >
                    <Text style={{ color: COLORS.error, fontSize: FONTS.sizes.xs, fontWeight: '600' }}>Cancel order</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* ── ORDER DETAIL MODAL ── */}
      <Modal visible={!!selectedOrder} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
          <View style={{ backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: SPACING.lg, maxHeight: '85%' }}>
            {detailLoading ? (
              <View style={{ paddingVertical: 40, alignItems: 'center' }}><ActivityIndicator color={COLORS.primary} /></View>
            ) : selectedOrder ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Detail header */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <Text style={{ color: COLORS.text, fontSize: FONTS.sizes.lg, fontWeight: '900' }}>Order Detail</Text>
                  <TouchableOpacity onPress={() => setSelectedOrder(null)} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.surfaceLight, alignItems: 'center', justifyContent: 'center' }}>
                    <Ionicons name="close" size={16} color={COLORS.text} />
                  </TouchableOpacity>
                </View>

                {/* Meta */}
                {[
                  { label: 'Order ID',     value: selectedOrder.order?.order_id },
                  { label: 'Table',        value: `Table ${selectedOrder.order?.table_number}` },
                  { label: 'Total',        value: `৳${parseInt(selectedOrder.order?.total_amount)}` },
                ].map((row, i) => (
                  <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
                    <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.sm }}>{row.label}</Text>
                    <Text style={{ color: COLORS.text, fontWeight: '600', fontSize: FONTS.sizes.sm }}>{row.value}</Text>
                  </View>
                ))}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.border, marginBottom: 14 }}>
                  <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.sm }}>Status</Text>
                  <StatusBadge status={selectedOrder.order?.status} config={ORDER_STATUS} />
                </View>

                {/* Customer note */}
                {selectedOrder.order?.customer_note ? (
                  <View style={{ backgroundColor: COLORS.accent + '15', borderRadius: RADIUS.sm, padding: 10, marginBottom: 14, flexDirection: 'row', gap: 8 }}>
                    <Ionicons name="chatbubble-outline" size={14} color={COLORS.accent} />
                    <Text style={{ color: COLORS.text, fontSize: FONTS.sizes.xs, flex: 1 }}>{selectedOrder.order.customer_note}</Text>
                  </View>
                ) : null}

                {/* Items */}
                <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.xs, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Items</Text>
                {(selectedOrder.items || []).map((item, i) => (
                  <View key={item.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: i < selectedOrder.items.length - 1 ? 1 : 0, borderBottomColor: COLORS.border }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: COLORS.text, fontSize: FONTS.sizes.sm, fontWeight: '600' }}>{item.item_name}</Text>
                      <Text style={{ color: COLORS.textMuted, fontSize: 10 }}>× {item.quantity}</Text>
                    </View>
                    <Text style={{ color: COLORS.primary, fontWeight: '900', fontSize: FONTS.sizes.sm }}>৳{parseInt(item.subtotal)}</Text>
                  </View>
                ))}

                {/* Timeline */}
                {(selectedOrder.tracking || []).length > 0 && (
                  <>
                    <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.xs, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginTop: 16, marginBottom: 10 }}>Timeline</Text>
                    {selectedOrder.tracking.map((t, i) => (
                      <View key={t.id} style={{ flexDirection: 'row', gap: 10, marginBottom: 8 }}>
                        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary, marginTop: 5 }} />
                        <View style={{ flex: 1 }}>
                          <Text style={{ color: COLORS.text, fontSize: FONTS.sizes.xs, fontWeight: '600' }}>{t.message}</Text>
                          <Text style={{ color: COLORS.textMuted, fontSize: 10 }}>
                            {new Date(t.timestamp).toLocaleString('en-BD', { dateStyle: 'short', timeStyle: 'short' })}
                            {t.changed_by ? ` · ${t.changed_by}` : ''}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </>
                )}
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─────────────────────────────────────────────────────────
// TAB: MENU MANAGEMENT
// ─────────────────────────────────────────────────────────
function MenuTab({ token, refreshing, onRefresh }) {
  const [items, setItems]           = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filterCat, setFilterCat]   = useState('all');
  const [editItem, setEditItem]     = useState(null);
  const [editPrice, setEditPrice]   = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchMenu = useCallback(async () => {
    try {
      const [mRes, cRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/menu`),
        axios.get(`${BASE_URL}/api/categories`),
      ]);
      if (mRes.data.success) setItems(mRes.data.data);
      if (cRes.data.success) setCategories(cRes.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchMenu(); }, []);

  const toggleAvailability = async (item) => {
    setTogglingId(item.id);
    try {
      await axios.put(`${BASE_URL}/api/admin/menu/${item.id}`, { is_available: !item.is_available }, { headers });
      fetchMenu();
    } catch { Alert.alert('Error', 'Failed to update item.'); }
    finally { setTogglingId(null); }
  };

  const savePrice = async () => {
    if (!editPrice || isNaN(editPrice) || parseFloat(editPrice) <= 0) {
      Alert.alert('Invalid', 'Please enter a valid price.'); return;
    }
    setEditLoading(true);
    try {
      await axios.put(`${BASE_URL}/api/admin/menu/${editItem.id}`, { price_bdt: parseFloat(editPrice) }, { headers });
      setEditItem(null);
      fetchMenu();
    } catch { Alert.alert('Error', 'Failed to update price.'); }
    finally { setEditLoading(false); }
  };

  const filtered = filterCat === 'all' ? items : items.filter(i => String(i.category_id) === String(filterCat));

  return (
    <View style={{ flex: 1 }}>
      {/* Category filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 52 }} contentContainerStyle={{ paddingHorizontal: SPACING.md, paddingVertical: 10, gap: 8 }}>
        {[{ id: 'all', category_name: 'All' }, ...categories].map(c => (
          <TouchableOpacity key={c.id} onPress={() => setFilterCat(String(c.id))} style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: RADIUS.full, backgroundColor: filterCat === String(c.id) ? COLORS.primary : COLORS.surface, borderWidth: 1, borderColor: filterCat === String(c.id) ? COLORS.primary : COLORS.border }}>
            <Text style={{ color: filterCat === String(c.id) ? '#fff' : COLORS.textMuted, fontSize: FONTS.sizes.xs, fontWeight: '600' }}>{c.category_name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator color={COLORS.primary} /></View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: SPACING.md, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        >
          <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginBottom: 12 }}>
            {filtered.length} items · Tap price to edit · Toggle to enable/disable
          </Text>
          {filtered.map(item => (
            <View key={item.id} style={{ backgroundColor: COLORS.surface, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md, marginBottom: 10, opacity: item.is_available ? 1 : 0.55 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <Text style={{ color: COLORS.text, fontWeight: '700', fontSize: FONTS.sizes.md }}>{item.item_name}</Text>
                    {item.is_unique ? (
                      <View style={{ backgroundColor: COLORS.accent + '25', paddingHorizontal: 6, paddingVertical: 2, borderRadius: RADIUS.full }}>
                        <Text style={{ color: COLORS.accent, fontSize: 9, fontWeight: '700' }}>★ Unique</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: 2 }}>{item.category_name}</Text>
                </View>

                {/* Price + availability */}
                <View style={{ alignItems: 'flex-end', gap: 6 }}>
                  {/* Tappable price */}
                  <TouchableOpacity
                    onPress={() => { setEditItem(item); setEditPrice(String(parseInt(item.price_bdt))); }}
                    style={{ backgroundColor: COLORS.primary + '20', paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.primary + '40', flexDirection: 'row', alignItems: 'center', gap: 4 }}
                  >
                    <Text style={{ color: COLORS.primary, fontWeight: '900', fontSize: FONTS.sizes.sm }}>৳{parseInt(item.price_bdt)}</Text>
                    <Ionicons name="pencil" size={10} color={COLORS.primary} />
                  </TouchableOpacity>

                  {/* Availability toggle */}
                  <TouchableOpacity
                    onPress={() => toggleAvailability(item)}
                    disabled={togglingId === item.id}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: item.is_available ? '#44BB4418' : COLORS.error + '18', paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.full, borderWidth: 1, borderColor: item.is_available ? '#44BB4440' : COLORS.error + '40' }}
                  >
                    {togglingId === item.id
                      ? <ActivityIndicator size="small" color={item.is_available ? '#44BB44' : COLORS.error} />
                      : <>
                          <Ionicons name={item.is_available ? 'checkmark-circle' : 'close-circle'} size={12} color={item.is_available ? '#44BB44' : COLORS.error} />
                          <Text style={{ color: item.is_available ? '#44BB44' : COLORS.error, fontSize: 10, fontWeight: '700' }}>
                            {item.is_available ? 'Available' : 'Unavailable'}
                          </Text>
                        </>
                    }
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Edit Price Modal */}
      <Modal visible={!!editItem} transparent animationType="slide">
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={() => setEditItem(null)} />
        <View style={{ backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: SPACING.lg, position: 'absolute', bottom: 0, left: 0, right: 0 }}>
          <Text style={{ color: COLORS.text, fontSize: FONTS.sizes.lg, fontWeight: '900', marginBottom: 4 }}>Edit Price</Text>
          <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.sm, marginBottom: 16 }}>{editItem?.item_name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surfaceLight, borderRadius: RADIUS.sm, borderWidth: 1.5, borderColor: COLORS.border, paddingHorizontal: 14, marginBottom: 16 }}>
            <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.xl, marginRight: 8 }}>৳</Text>
            <TextInput
              value={editPrice}
              onChangeText={setEditPrice}
              keyboardType="numeric"
              autoFocus
              style={{ flex: 1, color: COLORS.text, fontSize: FONTS.sizes.xxl, fontWeight: '900', paddingVertical: 14 }}
            />
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity onPress={() => setEditItem(null)} style={{ flex: 1, borderWidth: 1.5, borderColor: COLORS.border, paddingVertical: 13, borderRadius: RADIUS.full, alignItems: 'center' }}>
              <Text style={{ color: COLORS.textMuted, fontWeight: '700' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={savePrice} disabled={editLoading} style={{ flex: 2, backgroundColor: COLORS.primary, paddingVertical: 13, borderRadius: RADIUS.full, alignItems: 'center' }}>
              {editLoading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '900', fontSize: FONTS.sizes.md }}>Save Price</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─────────────────────────────────────────────────────────
// TAB: RESERVATIONS
// ─────────────────────────────────────────────────────────
function ReservationsTab({ token, refreshing, onRefresh }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [updatingId, setUpdatingId]     = useState(null);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchRes = useCallback(async () => {
    try {
      const params = filterStatus !== 'all' ? { status: filterStatus } : {};
      const res = await axios.get(`${BASE_URL}/api/reservations`, { headers, params });
      if (res.data.success) setReservations(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filterStatus, token]);

  useEffect(() => { fetchRes(); }, [fetchRes]);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await axios.put(`${BASE_URL}/api/admin/reservations/${id}/status`, { status }, { headers });
      fetchRes();
    } catch (e) { Alert.alert('Error', e.response?.data?.message || 'Failed to update.'); }
    finally { setUpdatingId(null); }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 52 }} contentContainerStyle={{ paddingHorizontal: SPACING.md, paddingVertical: 10, gap: 8 }}>
        {['all', 'pending', 'confirmed', 'cancelled'].map(f => (
          <TouchableOpacity key={f} onPress={() => setFilterStatus(f)} style={{ paddingHorizontal: 14, paddingVertical: 6, borderRadius: RADIUS.full, backgroundColor: filterStatus === f ? COLORS.primary : COLORS.surface, borderWidth: 1, borderColor: filterStatus === f ? COLORS.primary : COLORS.border }}>
            <Text style={{ color: filterStatus === f ? '#fff' : COLORS.textMuted, fontSize: FONTS.sizes.xs, fontWeight: '600', textTransform: 'capitalize' }}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator color={COLORS.primary} /></View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: SPACING.md, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        >
          {reservations.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <Text style={{ color: COLORS.textMuted }}>No reservations found</Text>
            </View>
          )}
          {reservations.map(r => {
            const sc = RES_STATUS[r.status] || RES_STATUS.pending;
            const isPending = !r.status || r.status === 'pending';
            return (
              <View key={r.id} style={{ backgroundColor: COLORS.surface, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md, marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={{ color: COLORS.text, fontWeight: '900', fontSize: FONTS.sizes.md }}>{r.customer_name}</Text>
                    <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: 2 }}>{r.customer_phone}</Text>
                    {r.customer_email ? <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.xs }}>{r.customer_email}</Text> : null}
                  </View>
                  <View style={{ backgroundColor: sc.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full }}>
                    <Text style={{ color: sc.text, fontSize: FONTS.sizes.xs, fontWeight: '700' }}>{sc.label}</Text>
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 14, marginBottom: r.special_requests ? 10 : 0 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="calendar-outline" size={12} color={COLORS.textMuted} />
                    <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.xs }}>
                      {new Date(r.reservation_date).toLocaleDateString('en-BD', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="time-outline" size={12} color={COLORS.textMuted} />
                    <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.xs }}>{r.reservation_time}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Ionicons name="people-outline" size={12} color={COLORS.textMuted} />
                    <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.xs }}>{r.number_of_guests} guests</Text>
                  </View>
                </View>

                {r.special_requests ? (
                  <View style={{ backgroundColor: COLORS.surfaceLight, borderRadius: RADIUS.sm, padding: 8, marginBottom: 10, flexDirection: 'row', gap: 6 }}>
                    <Ionicons name="chatbubble-outline" size={12} color={COLORS.textMuted} />
                    <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.xs, fontStyle: 'italic', flex: 1 }}>"{r.special_requests}"</Text>
                  </View>
                ) : null}

                {isPending && (
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                    <TouchableOpacity
                      onPress={() => updateStatus(r.id, 'confirmed')}
                      disabled={updatingId === r.id}
                      style={{ flex: 1, backgroundColor: '#44BB4418', borderWidth: 1, borderColor: '#44BB4440', paddingVertical: 9, borderRadius: RADIUS.sm, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 5 }}
                    >
                      {updatingId === r.id ? <ActivityIndicator size="small" color="#44BB44" /> : <>
                        <Ionicons name="checkmark" size={14} color="#44BB44" />
                        <Text style={{ color: '#44BB44', fontWeight: '700', fontSize: FONTS.sizes.xs }}>Confirm</Text>
                      </>}
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => Alert.alert('Cancel Reservation?', `Cancel ${r.customer_name}'s booking?`, [
                        { text: 'No', style: 'cancel' },
                        { text: 'Cancel Booking', style: 'destructive', onPress: () => updateStatus(r.id, 'cancelled') },
                      ])}
                      disabled={updatingId === r.id}
                      style={{ flex: 1, backgroundColor: COLORS.error + '18', borderWidth: 1, borderColor: COLORS.error + '40', paddingVertical: 9, borderRadius: RADIUS.sm, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 5 }}
                    >
                      <Ionicons name="close" size={14} color={COLORS.error} />
                      <Text style={{ color: COLORS.error, fontWeight: '700', fontSize: FONTS.sizes.xs }}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────
// TAB: STAFF MANAGEMENT
// ─────────────────────────────────────────────────────────
function StaffTab({ token, refreshing, onRefresh }) {
  const [staff, setStaff]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm]             = useState({ name: '', email: '', password: '', role: 'waiter' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError]   = useState('');
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showPass, setShowPass]     = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchStaff = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/staff`, { headers });
      if (res.data.success) setStaff(res.data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchStaff(); }, []);

  const addStaff = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setFormError('All fields are required.'); return;
    }
    setFormLoading(true); setFormError('');
    try {
      await axios.post(`${BASE_URL}/api/admin/staff`, form, { headers });
      setShowAddModal(false);
      setForm({ name: '', email: '', password: '', role: 'waiter' });
      fetchStaff();
    } catch (e) {
      setFormError(e.response?.data?.message || 'Failed to add staff.');
    } finally { setFormLoading(false); }
  };

  const toggleStaff = async (id) => {
    setTogglingId(id);
    try {
      await axios.put(`${BASE_URL}/api/admin/staff/${id}/toggle`, {}, { headers });
      fetchStaff();
    } catch { Alert.alert('Error', 'Failed to update staff.'); }
    finally { setTogglingId(null); }
  };

  const removeStaff = (s) => {
    Alert.alert(
      'Remove Staff Member?',
      `This will permanently delete ${s.name}. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove', style: 'destructive',
          onPress: async () => {
            setDeletingId(s.id);
            try {
              await axios.delete(`${BASE_URL}/api/admin/staff/${s.id}`, { headers });
              fetchStaff();
            } catch { Alert.alert('Error', 'Failed to remove staff.'); }
            finally { setDeletingId(null); }
          },
        },
      ]
    );
  };

  const ROLE_COLORS = {
    admin:  { bg: COLORS.error + '20',     text: COLORS.error,     emoji: '🔑' },
    chef:   { bg: COLORS.secondary + '25', text: COLORS.secondary, emoji: '👨‍🍳' },
    waiter: { bg: COLORS.primary + '20',   text: COLORS.primary,   emoji: '🧑‍🍽️' },
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: SPACING.md, paddingBottom: 0 }}>
        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          style={{ backgroundColor: COLORS.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 13, borderRadius: RADIUS.full, marginBottom: 14 }}
        >
          <Ionicons name="person-add" size={18} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: FONTS.sizes.md }}>Add Staff Member</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator color={COLORS.primary} /></View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: SPACING.md, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        >
          {staff.length === 0 && (
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <Text style={{ color: COLORS.textMuted }}>No staff members yet</Text>
            </View>
          )}
          {staff.map(s => {
            const rc = ROLE_COLORS[s.role] || ROLE_COLORS.waiter;
            return (
              <View key={s.id} style={{ backgroundColor: COLORS.surface, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, padding: SPACING.md, marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  {/* Avatar */}
                  <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: rc.bg, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: rc.text + '40' }}>
                    <Text style={{ fontSize: 22 }}>{rc.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ color: COLORS.text, fontWeight: '700', fontSize: FONTS.sizes.md }}>{s.name}</Text>
                      <View style={{ backgroundColor: rc.bg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.full }}>
                        <Text style={{ color: rc.text, fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.role}</Text>
                      </View>
                    </View>
                    <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: 2 }}>{s.email}</Text>
                  </View>
                  {/* Active indicator */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <View style={{ width: 7, height: 7, borderRadius: 3.5, backgroundColor: s.is_active ? '#44BB44' : COLORS.textMuted }} />
                    <Text style={{ color: s.is_active ? '#44BB44' : COLORS.textMuted, fontSize: 10, fontWeight: '600' }}>
                      {s.is_active ? 'Active' : 'Inactive'}
                    </Text>
                  </View>
                </View>

                {/* Actions row */}
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => toggleStaff(s.id)}
                    disabled={togglingId === s.id}
                    style={{ flex: 1, backgroundColor: s.is_active ? COLORS.error + '15' : '#44BB4415', borderWidth: 1, borderColor: s.is_active ? COLORS.error + '30' : '#44BB4430', paddingVertical: 8, borderRadius: RADIUS.sm, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 5 }}
                  >
                    {togglingId === s.id ? <ActivityIndicator size="small" color={s.is_active ? COLORS.error : '#44BB44'} /> : <>
                      <Ionicons name={s.is_active ? 'pause-circle' : 'play-circle'} size={14} color={s.is_active ? COLORS.error : '#44BB44'} />
                      <Text style={{ color: s.is_active ? COLORS.error : '#44BB44', fontWeight: '700', fontSize: FONTS.sizes.xs }}>
                        {s.is_active ? 'Deactivate' : 'Activate'}
                      </Text>
                    </>}
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => removeStaff(s)}
                    disabled={deletingId === s.id}
                    style={{ backgroundColor: COLORS.error + '15', borderWidth: 1, borderColor: COLORS.error + '30', paddingVertical: 8, paddingHorizontal: 14, borderRadius: RADIUS.sm, alignItems: 'center', flexDirection: 'row', gap: 4 }}
                  >
                    {deletingId === s.id ? <ActivityIndicator size="small" color={COLORS.error} /> : <>
                      <Ionicons name="trash-outline" size={14} color={COLORS.error} />
                      <Text style={{ color: COLORS.error, fontWeight: '700', fontSize: FONTS.sizes.xs }}>Remove</Text>
                    </>}
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* ── ADD STAFF MODAL ── */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }} onPress={() => { setShowAddModal(false); setFormError(''); }} />
        <View style={{ backgroundColor: COLORS.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: SPACING.lg, position: 'absolute', bottom: 0, left: 0, right: 0 }}>
          <Text style={{ color: COLORS.text, fontSize: FONTS.sizes.lg, fontWeight: '900', marginBottom: 16 }}>Add Staff Member</Text>

          {/* Name */}
          <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.xs, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Full Name</Text>
          <TextInput value={form.name} onChangeText={v => setForm(p => ({ ...p, name: v }))} placeholder="John Doe" placeholderTextColor={COLORS.textMuted} style={{ backgroundColor: COLORS.surfaceLight, color: COLORS.text, padding: 12, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.border, fontSize: FONTS.sizes.md, marginBottom: 12 }} />

          {/* Email */}
          <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.xs, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Email</Text>
          <TextInput value={form.email} onChangeText={v => setForm(p => ({ ...p, email: v }))} placeholder="staff@crave.com" placeholderTextColor={COLORS.textMuted} keyboardType="email-address" autoCapitalize="none" style={{ backgroundColor: COLORS.surfaceLight, color: COLORS.text, padding: 12, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.border, fontSize: FONTS.sizes.md, marginBottom: 12 }} />

          {/* Password */}
          <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.xs, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Password</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surfaceLight, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 12, marginBottom: 12 }}>
            <TextInput value={form.password} onChangeText={v => setForm(p => ({ ...p, password: v }))} placeholder="••••••••" placeholderTextColor={COLORS.textMuted} secureTextEntry={!showPass} style={{ flex: 1, color: COLORS.text, padding: 12, fontSize: FONTS.sizes.md }} />
            <TouchableOpacity onPress={() => setShowPass(p => !p)}>
              <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Role selector */}
          <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.xs, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Role</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            {['waiter', 'chef', 'admin'].map(r => (
              <TouchableOpacity key={r} onPress={() => setForm(p => ({ ...p, role: r }))} style={{ flex: 1, paddingVertical: 10, borderRadius: RADIUS.sm, alignItems: 'center', backgroundColor: form.role === r ? COLORS.primary : COLORS.surfaceLight, borderWidth: 1, borderColor: form.role === r ? COLORS.primary : COLORS.border }}>
                <Text style={{ fontSize: 16, marginBottom: 2 }}>{ROLE_COLORS[r]?.emoji}</Text>
                <Text style={{ color: form.role === r ? '#fff' : COLORS.textMuted, fontWeight: '700', fontSize: FONTS.sizes.xs, textTransform: 'capitalize' }}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Error */}
          {formError ? (
            <View style={{ backgroundColor: COLORS.error + '15', borderRadius: RADIUS.sm, padding: 10, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="alert-circle" size={14} color={COLORS.error} />
              <Text style={{ color: COLORS.error, fontSize: FONTS.sizes.xs, flex: 1 }}>{formError}</Text>
            </View>
          ) : null}

          {/* Submit */}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity onPress={() => { setShowAddModal(false); setFormError(''); }} style={{ flex: 1, borderWidth: 1.5, borderColor: COLORS.border, paddingVertical: 13, borderRadius: RADIUS.full, alignItems: 'center' }}>
              <Text style={{ color: COLORS.textMuted, fontWeight: '700' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={addStaff} disabled={formLoading} style={{ flex: 2, backgroundColor: COLORS.primary, paddingVertical: 13, borderRadius: RADIUS.full, alignItems: 'center' }}>
              {formLoading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '900', fontSize: FONTS.sizes.md }}>Add Staff Member</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ─────────────────────────────────────────────────────────
// MAIN ADMIN DASHBOARD
// ─────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab]       = useState('stats');
  const [token, setToken]   = useState('');
  const [admin, setAdmin]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Shared data for Overview tab
  const [stats, setStats]   = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => { loadAdmin(); }, []);

  const loadAdmin = async () => {
    const t = await AsyncStorage.getItem('staff_token');
    const s = await AsyncStorage.getItem('staff_data');
    if (!t || !s) { router.replace('/staff/waiter-login'); return; }
    const parsed = JSON.parse(s);
    if (parsed.role !== 'admin') { router.replace('/staff/waiter-login'); return; }
    setToken(t);
    setAdmin(parsed);
    await fetchOverview(t);
    setLoading(false);
  };

  const fetchOverview = async (t) => {
    try {
      const h = { Authorization: `Bearer ${t || token}` };
      const [statsRes, ordersRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/admin/dashboard`, { headers: h }),
        axios.get(`${BASE_URL}/api/orders`, { headers: h }),
      ]);
      if (statsRes.data.success)  setStats(statsRes.data.data);
      if (ordersRes.data.success) setOrders(ordersRes.data.data);
    } catch (e) { console.error(e); }
    finally { setRefreshing(false); }
  };

  const onRefresh = () => { setRefreshing(true); fetchOverview(token); };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('staff_token');
    await AsyncStorage.removeItem('staff_data');
    router.replace('/staff/waiter-login');
  };

  const TABS = [
    { key: 'stats',  icon: 'stats-chart',  label: 'Overview' },
    { key: 'orders', icon: 'receipt',       label: 'Orders' },
    { key: 'menu',   icon: 'restaurant',    label: 'Menu' },
    { key: 'res',    icon: 'calendar',      label: 'Reservations' },
    { key: 'staff',  icon: 'people',        label: 'Staff' },
  ];

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ color: COLORS.textMuted, marginTop: 12 }}>Loading admin panel...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* ── HEADER ── */}
      <View style={{ backgroundColor: COLORS.surface, paddingHorizontal: SPACING.md, paddingTop: 48, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.xs, textTransform: 'uppercase', letterSpacing: 1 }}>Admin Panel</Text>
            <Text style={{ color: COLORS.text, fontSize: FONTS.sizes.xl, fontWeight: '900' }}>🔥 Crave</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: COLORS.text, fontSize: FONTS.sizes.xs, fontWeight: '700' }}>{admin?.name}</Text>
              <View style={{ backgroundColor: COLORS.error + '20', paddingHorizontal: 7, paddingVertical: 2, borderRadius: RADIUS.full }}>
                <Text style={{ color: COLORS.error, fontSize: 9, fontWeight: '700', textTransform: 'uppercase' }}>Admin</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleLogout} style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.error + '20', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="log-out-outline" size={16} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ── TAB BAR ── */}
      <View style={{ backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 8, paddingVertical: 8, gap: 4 }}>
          {TABS.map(t => (
            <TouchableOpacity
              key={t.key}
              onPress={() => setTab(t.key)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.full, backgroundColor: tab === t.key ? COLORS.primary : COLORS.surfaceLight }}
            >
              <Ionicons name={t.icon} size={13} color={tab === t.key ? '#fff' : COLORS.textMuted} />
              <Text style={{ color: tab === t.key ? '#fff' : COLORS.textMuted, fontWeight: '700', fontSize: FONTS.sizes.xs }}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── TAB CONTENT ── */}
      <View style={{ flex: 1 }}>
        {tab === 'stats'  && <OverviewTab stats={stats} orders={orders} refreshing={refreshing} onRefresh={onRefresh} onViewOrders={() => setTab('orders')} token={token} />}
        {tab === 'orders' && <OrdersTab token={token} refreshing={refreshing} onRefresh={onRefresh} />}
        {tab === 'menu'   && <MenuTab token={token} refreshing={refreshing} onRefresh={onRefresh} />}
        {tab === 'res'    && <ReservationsTab token={token} refreshing={refreshing} onRefresh={onRefresh} />}
        {tab === 'staff'  && <StaffTab token={token} refreshing={refreshing} onRefresh={onRefresh} />}
      </View>
    </View>
  );
} 

