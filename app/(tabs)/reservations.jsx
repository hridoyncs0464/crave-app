import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SPACING, RADIUS } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

const BASE_URL = "https://crave-server-main.onrender.com";

const timeSlots = [
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "01:00 PM",
  "01:30 PM",
  "02:00 PM",
  "02:30 PM",
  "06:00 PM",
  "06:30 PM",
  "07:00 PM",
  "07:30 PM",
  "08:00 PM",
  "08:30 PM",
  "09:00 PM",
  "09:30 PM",
];

const guestOptions = ["1", "2", "3", "4", "5", "6", "7", "8+"];

export default function Reservations() {
  const { user } = useAuth();

  const [name, setName] = useState(user?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [guests, setGuests] = useState("2");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!name || !email || !phone || !date || !selectedTime) {
      setError("Please fill all required fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await axios.post(`${BASE_URL}/api/reservations`, {
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        reservation_date: date,
        reservation_time: selectedTime,
        guests: parseInt(guests),
        special_requests: notes,
      });
      setSuccess(true);
    } catch (e) {
      setError("Failed to make reservation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
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
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: COLORS.success + "20",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <Ionicons name="checkmark-circle" size={52} color={COLORS.success} />
        </View>
        <Text
          style={{
            color: COLORS.text,
            fontSize: FONTS.sizes.xxl,
            fontWeight: "900",
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          Reservation Confirmed!
        </Text>
        <Text
          style={{
            color: COLORS.textMuted,
            fontSize: FONTS.sizes.md,
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          {name}, your table for {guests} is booked
        </Text>
        <Text
          style={{
            color: COLORS.primary,
            fontSize: FONTS.sizes.lg,
            fontWeight: "700",
            marginBottom: 32,
          }}
        >
          {date} at {selectedTime}
        </Text>
        <TouchableOpacity
          onPress={() => {
            setSuccess(false);
            setDate("");
            setSelectedTime("");
            setPhone("");
            setNotes("");
          }}
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
            Make Another
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── HERO ── */}
      <View
        style={{
          backgroundColor: COLORS.surface,
          padding: SPACING.lg,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            marginBottom: 6,
          }}
        >
          <Text style={{ fontSize: 28 }}>🍽️</Text>
          <Text
            style={{
              color: COLORS.text,
              fontSize: FONTS.sizes.xxl,
              fontWeight: "900",
            }}
          >
            Reserve a Table
          </Text>
        </View>
        <Text style={{ color: COLORS.textMuted, fontSize: FONTS.sizes.sm }}>
          Book your dining experience at Crave
        </Text>
      </View>

      <View style={{ padding: SPACING.md }}>
        {/* Error */}
        {error ? (
          <View
            style={{
              backgroundColor: COLORS.error + "20",
              borderRadius: RADIUS.sm,
              padding: 12,
              marginBottom: 16,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Ionicons name="alert-circle" size={18} color={COLORS.error} />
            <Text
              style={{ color: COLORS.error, fontSize: FONTS.sizes.sm, flex: 1 }}
            >
              {error}
            </Text>
          </View>
        ) : null}

        {/* ── PERSONAL INFO ── */}
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
            Personal Information
          </Text>

          {/* Name */}
          <Text
            style={{
              color: COLORS.textMuted,
              fontSize: FONTS.sizes.xs,
              fontWeight: "600",
              marginBottom: 6,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Full Name *
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: COLORS.surfaceLight,
              borderRadius: RADIUS.sm,
              borderWidth: 1,
              borderColor: COLORS.border,
              marginBottom: 14,
              paddingHorizontal: 12,
            }}
          >
            <Ionicons
              name="person-outline"
              size={16}
              color={COLORS.textMuted}
            />
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Your full name"
              placeholderTextColor={COLORS.textMuted}
              style={{
                flex: 1,
                color: COLORS.text,
                fontSize: FONTS.sizes.md,
                paddingVertical: 12,
                paddingLeft: 10,
              }}
            />
          </View>

          {/* Email */}
          <Text
            style={{
              color: COLORS.textMuted,
              fontSize: FONTS.sizes.xs,
              fontWeight: "600",
              marginBottom: 6,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Email *
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: COLORS.surfaceLight,
              borderRadius: RADIUS.sm,
              borderWidth: 1,
              borderColor: COLORS.border,
              marginBottom: 14,
              paddingHorizontal: 12,
            }}
          >
            <Ionicons name="mail-outline" size={16} color={COLORS.textMuted} />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              style={{
                flex: 1,
                color: COLORS.text,
                fontSize: FONTS.sizes.md,
                paddingVertical: 12,
                paddingLeft: 10,
              }}
            />
          </View>

          {/* Phone */}
          <Text
            style={{
              color: COLORS.textMuted,
              fontSize: FONTS.sizes.xs,
              fontWeight: "600",
              marginBottom: 6,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Phone *
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: COLORS.surfaceLight,
              borderRadius: RADIUS.sm,
              borderWidth: 1,
              borderColor: COLORS.border,
              paddingHorizontal: 12,
            }}
          >
            <Ionicons name="call-outline" size={16} color={COLORS.textMuted} />
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="+880 1XXX-XXXXXX"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="phone-pad"
              style={{
                flex: 1,
                color: COLORS.text,
                fontSize: FONTS.sizes.md,
                paddingVertical: 12,
                paddingLeft: 10,
              }}
            />
          </View>
        </View>

        {/* ── BOOKING DETAILS ── */}
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
            Booking Details
          </Text>

          {/* Date */}
          <Text
            style={{
              color: COLORS.textMuted,
              fontSize: FONTS.sizes.xs,
              fontWeight: "600",
              marginBottom: 6,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Date * (YYYY-MM-DD)
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: COLORS.surfaceLight,
              borderRadius: RADIUS.sm,
              borderWidth: 1,
              borderColor: COLORS.border,
              marginBottom: 14,
              paddingHorizontal: 12,
            }}
          >
            <Ionicons
              name="calendar-outline"
              size={16}
              color={COLORS.textMuted}
            />
            <TextInput
              value={date}
              onChangeText={setDate}
              placeholder="2026-06-15"
              placeholderTextColor={COLORS.textMuted}
              style={{
                flex: 1,
                color: COLORS.text,
                fontSize: FONTS.sizes.md,
                paddingVertical: 12,
                paddingLeft: 10,
              }}
            />
          </View>

          {/* Time Slots */}
          <Text
            style={{
              color: COLORS.textMuted,
              fontSize: FONTS.sizes.xs,
              fontWeight: "600",
              marginBottom: 10,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Select Time *
          </Text>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 14,
            }}
          >
            {timeSlots.map((time) => (
              <TouchableOpacity
                key={time}
                onPress={() => setSelectedTime(time)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: RADIUS.sm,
                  borderWidth: 1.5,
                  backgroundColor:
                    selectedTime === time
                      ? COLORS.primary
                      : COLORS.surfaceLight,
                  borderColor:
                    selectedTime === time ? COLORS.primary : COLORS.border,
                }}
              >
                <Text
                  style={{
                    color: selectedTime === time ? "#fff" : COLORS.textMuted,
                    fontSize: FONTS.sizes.xs,
                    fontWeight: "600",
                  }}
                >
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Guests */}
          <Text
            style={{
              color: COLORS.textMuted,
              fontSize: FONTS.sizes.xs,
              fontWeight: "600",
              marginBottom: 10,
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            Number of Guests
          </Text>
          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            {guestOptions.map((g) => (
              <TouchableOpacity
                key={g}
                onPress={() => setGuests(g)}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor:
                    guests === g ? COLORS.primary : COLORS.surfaceLight,
                  borderWidth: 1.5,
                  borderColor: guests === g ? COLORS.primary : COLORS.border,
                }}
              >
                <Text
                  style={{
                    color: guests === g ? "#fff" : COLORS.textMuted,
                    fontWeight: "700",
                    fontSize: FONTS.sizes.sm,
                  }}
                >
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── SPECIAL REQUESTS ── */}
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
          <Text
            style={{
              color: COLORS.text,
              fontSize: FONTS.sizes.lg,
              fontWeight: "700",
              marginBottom: 14,
            }}
          >
            Special Requests
          </Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Any dietary requirements, special occasions, seating preferences..."
            placeholderTextColor={COLORS.textMuted}
            multiline
            numberOfLines={4}
            style={{
              color: COLORS.text,
              fontSize: FONTS.sizes.sm,
              backgroundColor: COLORS.surfaceLight,
              borderRadius: RADIUS.sm,
              borderWidth: 1,
              borderColor: COLORS.border,
              padding: 12,
              minHeight: 100,
              textAlignVertical: "top",
            }}
          />
        </View>

        {/* ── SUBMIT ── */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={{
            backgroundColor: COLORS.primary,
            paddingVertical: 16,
            borderRadius: RADIUS.full,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
            gap: 10,
            marginBottom: 40,
            elevation: 4,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="calendar-check" size={20} color="#fff" />
              <Text
                style={{
                  color: "#fff",
                  fontWeight: "900",
                  fontSize: FONTS.sizes.lg,
                }}
              >
                Confirm Reservation
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
