// app/staff/waiter-login.jsx
import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';

const BASE_URL = 'https://crave-server-main.onrender.com';

export default function StaffLogin() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) { setError('Please fill in all fields.'); return; }
    setError(''); setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/api/staff/login`, { email: email.trim(), password });
      if (res.data.success) {
        const { token, staff } = res.data;
        await AsyncStorage.setItem('staff_token', token);
        await AsyncStorage.setItem('staff_data', JSON.stringify(staff));
        // Route based on role
        if (staff.role === 'waiter') router.replace('/staff/waiter-dashboard');
        else if (staff.role === 'chef') router.replace('/staff/chef-dashboard');
        else if (staff.role === 'admin') router.replace('/admin/admin-dashboard');
        else setError('Unknown role: ' + staff.role);
      } else {
        setError(res.data.message || 'Login failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials or network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: COLORS.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: SPACING.lg }}>

        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} style={{ alignSelf: 'flex-start', marginBottom: 32, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Ionicons name="arrow-back" size={18} color={COLORS.textMuted} />
          <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.sm }}>Back</Text>
        </TouchableOpacity>

        {/* Icon + Title */}
        <View style={{ alignItems: 'center', marginBottom: 36 }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary + '20', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 2, borderColor: COLORS.primary + '40' }}>
            <Text style={{ fontSize: 36 }}>👨‍🍽️</Text>
          </View>
          <Text style={{ color: COLORS.text, fontSize: 28, fontWeight: '900', marginBottom: 6 }}>Staff Login</Text>
          <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.sm, textAlign: 'center' }}>
            For waiters, chefs, and administrators
          </Text>
        </View>

        {/* Form */}
        <View style={{ gap: 14, marginBottom: 24 }}>
          {/* Email */}
          <View>
            <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.xs, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Staff Email</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.sm, borderWidth: 1.5, borderColor: COLORS.border, paddingHorizontal: 14 }}>
              <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} style={{ marginRight: 10 }} />
              <TextInput
                value={email}
                onChangeText={t => { setEmail(t); setError(''); }}
                placeholder="staff@crave.com"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                style={{ flex: 1, color: COLORS.text, fontSize: FONTS.sizes.md, paddingVertical: 14 }}
              />
            </View>
          </View>
          {/* Password */}
          <View>
            <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.xs, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Password</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.sm, borderWidth: 1.5, borderColor: COLORS.border, paddingHorizontal: 14 }}>
              <Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} style={{ marginRight: 10 }} />
              <TextInput
                value={password}
                onChangeText={t => { setPassword(t); setError(''); }}
                placeholder="••••••••"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry={!showPass}
                style={{ flex: 1, color: COLORS.text, fontSize: FONTS.sizes.md, paddingVertical: 14 }}
              />
              <TouchableOpacity onPress={() => setShowPass(p => !p)}>
                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Error */}
        {error ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.error + '15', padding: 12, borderRadius: RADIUS.sm, borderWidth: 1, borderColor: COLORS.error + '30', marginBottom: 16 }}>
            <Ionicons name="alert-circle" size={16} color={COLORS.error} />
            <Text style={{ color: COLORS.error, fontSize: FONTS.sizes.sm, flex: 1 }}>{error}</Text>
          </View>
        ) : null}

        {/* Login Button */}
        <TouchableOpacity
          onPress={handleLogin}
          disabled={loading}
          style={{ backgroundColor: loading ? COLORS.textMuted : COLORS.primary, paddingVertical: 16, borderRadius: RADIUS.full, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10 }}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <>
            <Ionicons name="log-in-outline" size={20} color="#fff" />
            <Text style={{ color: '#fff', fontSize: FONTS.sizes.lg, fontWeight: '900' }}>Sign In</Text>
          </>}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}