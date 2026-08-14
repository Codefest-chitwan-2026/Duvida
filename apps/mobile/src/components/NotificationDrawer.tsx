import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/theme/colors";

export type NotificationItem = {
  id: string;
  type: "quest" | "hazard" | "status" | "badge" | "reward";
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  actionRoute?: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconColor: string;
  iconBg: string;
};

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    type: "quest",
    title: "Quest Approved! ??",
    message: "Your photo evidence for 'Cubbon Park Cleanup' was verified. +200 XP & 50 Coins credited to your wallet.",
    time: "2m ago",
    isRead: false,
    icon: "trophy-award",
    iconColor: colors.brandGreen,
    iconBg: "rgba(34, 197, 94, 0.15)",
  },
  {
    id: "notif-2",
    type: "hazard",
    title: "Critical Hazard Nearby ??",
    message: "A deep pothole has been reported 120m from you near MG Road. Drive carefully or verify the report.",
    time: "14m ago",
    isRead: false,
    icon: "alert-octagon",
    iconColor: colors.severityHigh,
    iconBg: "rgba(239, 68, 68, 0.15)",
  },
  {
    id: "notif-3",
    type: "status",
    title: "Crew Dispatched ???",
    message: "Your submitted report 'Broken Streetlight #402' has been assigned to North Maintenance Crew.",
    time: "1h ago",
    isRead: false,
    icon: "account-hard-hat",
    iconColor: colors.pinBlue,
    iconBg: "rgba(59, 130, 246, 0.15)",
  },
  {
    id: "notif-4",
    type: "badge",
    title: "New Badge Unlocked! ??",
    message: "You reached Tier 2 'Eco Guardian' by participating in 5 community sustainability quests.",
    time: "5h ago",
    isRead: true,
    icon: "leaf",
    iconColor: colors.teal,
    iconBg: "rgba(34, 211, 238, 0.15)",
  },
  {
    id: "notif-5",
    type: "reward",
    title: "Daily Streak Bonus ?",
    message: "Day 4 streak active! +25 Civic Coins added. Keep logging in to earn the 7-day multiplier.",
    time: "Yesterday",
    isRead: true,
    icon: "lightning-bolt",
    iconColor: colors.coinGold,
    iconBg: "rgba(245, 179, 1, 0.15)",
  },
];

type NotificationDrawerProps = {
  visible: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onSelectNotification?: (item: NotificationItem) => void;
  onAddTestNotification?: () => void;
};

export function NotificationDrawer({
  visible,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onSelectNotification,
  onAddTestNotification,
}: NotificationDrawerProps) {
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get("window").width;
  const drawerWidth = Math.min(screenWidth * 0.88, 380);

  const slideAnim = useRef(new Animated.Value(drawerWidth)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(drawerWidth);
      fadeAnim.setValue(0);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [visible, drawerWidth, slideAnim, fadeAnim]);

  if (!visible) return null;

  const filteredList = notifications.filter((n) =>
    filter === "unread" ? !n.isRead : true
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 999 }]} pointerEvents="box-none">
      {/* Dimmed Backdrop */}
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel="Close notifications"
        />
      </Animated.View>

      {/* Slide-in Drawer from Right */}
      <Animated.View
        style={[
          styles.drawer,
          {
            width: drawerWidth,
            paddingTop: Math.max(insets.top, 16) + 8,
            paddingBottom: Math.max(insets.bottom, 16) + 12,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        {/* Drawer Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.bellIconWrap}>
              <Ionicons name="notifications" size={18} color={colors.textOnDark} />
            </View>
            <View>
              <Text style={styles.title}>Notifications</Text>
              <Text style={styles.subtitle}>
                {unreadCount > 0
                  ? `${unreadCount} unread update${unreadCount > 1 ? "s" : ""}`
                  : "All caught up"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.closeButton}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Quick Actions Bar (Filter Tabs + Mark All) */}
        <View style={styles.actionRow}>
          <View style={styles.filterPills}>
            <TouchableOpacity
              onPress={() => setFilter("all")}
              style={[
                styles.pill,
                filter === "all" && styles.pillActive,
              ]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.pillText,
                  filter === "all" && styles.pillTextActive,
                ]}
              >
                All ({notifications.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setFilter("unread")}
              style={[
                styles.pill,
                filter === "unread" && styles.pillActive,
              ]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.pillText,
                  filter === "unread" && styles.pillTextActive,
                ]}
              >
                Unread ({unreadCount})
              </Text>
            </TouchableOpacity>
          </View>

          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={onMarkAllAsRead}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={styles.markAllBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="checkmark-done" size={14} color={colors.teal} />
              <Text style={styles.markAllText}>Read all</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Notification Feed List */}
        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredList.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrap}>
                <Ionicons
                  name={filter === "unread" ? "checkmark-circle-outline" : "notifications-off-outline"}
                  size={42}
                  color={colors.textMuted}
                />
              </View>
              <Text style={styles.emptyTitle}>
                {filter === "unread" ? "No unread alerts" : "No notifications here"}
              </Text>
              <Text style={styles.emptySub}>
                {filter === "unread"
                  ? "You have acknowledged all your current telemetry & quest updates."
                  : "You're all caught up! Real-time alerts on hazards and quests will appear right here."}
              </Text>
              {onAddTestNotification && (
                <TouchableOpacity
                  onPress={onAddTestNotification}
                  style={styles.testAlertBtn}
                  activeOpacity={0.8}
                >
                  <Ionicons name="sparkles" size={14} color={colors.textOnDark} />
                  <Text style={styles.testAlertText}>Generate Test Notification</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            filteredList.map((item) => {
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => {
                    onMarkAsRead(item.id);
                    onSelectNotification?.(item);
                  }}
                  activeOpacity={0.75}
                  style={[
                    styles.notifCard,
                    !item.isRead && styles.notifCardUnread,
                  ]}
                >
                  <View style={styles.cardTopRow}>
                    <View
                      style={[
                        styles.iconBadge,
                        { backgroundColor: item.iconBg },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={item.icon}
                        size={18}
                        color={item.iconColor}
                      />
                    </View>

                    <View style={styles.cardHeaderInfo}>
                      <Text
                        style={[
                          styles.cardTitle,
                          !item.isRead && styles.cardTitleUnread,
                        ]}
                        numberOfLines={1}
                      >
                        {item.title}
                      </Text>
                      <Text style={styles.cardTime}>{item.time}</Text>
                    </View>

                    {!item.isRead && <View style={styles.unreadDot} />}
                  </View>

                  <Text style={styles.cardMessage}>{item.message}</Text>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>

        {/* Footer Bar */}
        {notifications.length > 0 && (
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={onClearAll}
              style={styles.clearBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={14} color={colors.textMuted} />
              <Text style={styles.clearBtnText}>Clear all alerts</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    zIndex: 90,
  },
  drawer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#0F172A",
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255, 255, 255, 0.12)",
    zIndex: 100,
    shadowColor: "#000",
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: -6, height: 0 },
    elevation: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bellIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: colors.textOnDark,
    fontSize: 16,
    fontWeight: "800",
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 11.5,
    marginTop: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.06)",
  },
  filterPills: {
    flexDirection: "row",
    gap: 6,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.06)",
  },
  pillActive: {
    backgroundColor: colors.brandGreen,
  },
  pillText: {
    color: colors.textMuted,
    fontSize: 11.5,
    fontWeight: "600",
  },
  pillTextActive: {
    color: colors.textOnDark,
    fontWeight: "700",
  },
  markAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  markAllText: {
    color: colors.teal,
    fontSize: 11.5,
    fontWeight: "600",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  notifCard: {
    backgroundColor: "rgba(30, 41, 59, 0.45)",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  notifCardUnread: {
    backgroundColor: "rgba(30, 41, 59, 0.85)",
    borderColor: "rgba(56, 189, 248, 0.3)",
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cardHeaderInfo: {
    flex: 1,
  },
  cardTitle: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 13,
    fontWeight: "600",
  },
  cardTitleUnread: {
    color: colors.textOnDark,
    fontWeight: "700",
  },
  cardTime: {
    color: "rgba(255, 255, 255, 0.45)",
    fontSize: 10.5,
    marginTop: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.teal,
    marginLeft: 4,
  },
  cardMessage: {
    color: "rgba(255, 255, 255, 0.72)",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
    paddingLeft: 42,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    color: colors.textOnDark,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
  },
  emptySub: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16,
  },
  testAlertBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.brandGreen,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 6,
  },
  testAlertText: {
    color: colors.textOnDark,
    fontSize: 12,
    fontWeight: "700",
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
    alignItems: "center",
  },
  clearBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  clearBtnText: {
    color: colors.textMuted,
    fontSize: 11.5,
    fontWeight: "600",
  },
});
