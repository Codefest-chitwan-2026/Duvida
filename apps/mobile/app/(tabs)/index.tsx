import React, { useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MapControls } from "@/components/MapControls";
import { CharacterCompanion } from "@/components/CharacterCompanion";
import { NotificationDrawer, INITIAL_NOTIFICATIONS, type NotificationItem } from "@/components/NotificationDrawer";
import { TopBar } from "@/components/TopBar";
import { HomeMapView, type HomeMapHandle } from "@/features/map/HomeMapView";
import { mockIssues } from "@/features/map/mockIssues";
import { useUserLocation } from "@/services/location/useUserLocation";
import { colors } from "@/theme/colors";

const CATEGORY_FILTERS = [
  { id: "all", label: "All Pins", icon: "map-marker-multiple", count: 7 },
  { id: "hazards", label: "Hazards", icon: "alert-octagon", count: 3 },
  { id: "waste", label: "Clean & Waste", icon: "delete", count: 2 },
  { id: "quests", label: "Quests", icon: "trophy", count: 2 },
] as const;

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<HomeMapHandle>(null);

  const { coordinate } = useUserLocation();
  const [is3D, setIs3D] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const selectedIssue = mockIssues.find((issue) => issue.id === selectedIssueId);

  const handleIssuePress = (issueId: string) => {
    setSelectedIssueId((prev) => (prev === issueId ? null : issueId));
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
  };

  const handleSelectNotification = (item: NotificationItem) => {
    if (item.type === "hazard") {
      setSelectedIssueId("pothole");
      setShowNotifications(false);
    } else if (item.type === "quest") {
      setSelectedIssueId("clean-park");
      setShowNotifications(false);
    }
  };

  const handleAddTestNotification = () => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      type: "quest",
      title: "New Community Challenge! 🌟",
      message: "New 'Zero Plastic Drive' launched near Central Hub. Complete it to earn +300 XP & 80 Coins!",
      time: "Just now",
      isRead: false,
      icon: "star-shooting",
      iconColor: colors.coinGold,
      iconBg: "rgba(245, 179, 1, 0.15)",
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleActionPress = () => {
    if (!selectedIssue) return;
    if (selectedIssue.kind === "quest") {
      router.push(`/quests/${selectedIssue.id}/submit-proof` as any);
    } else {
      router.push({
        pathname: "/report/new",
        params: { issueId: selectedIssue.id },
      });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Main Interactive 3D Map Surface */}
      <HomeMapView
        ref={mapRef}
        center={coordinate}
        is3D={is3D}
        selectedCategory={selectedCategory}
        selectedIssueId={selectedIssueId}
        onIssuePress={handleIssuePress}
      />

      {/* Top Bar (Profile, Coins, Notifications) */}
      <TopBar
        avatarLevel={12}
        coinBalance={2450}
        hasUnreadNotifications={unreadCount > 0}
        onAvatarPress={() => router.navigate("/profile")}
        onNotificationsPress={() => setShowNotifications(true)}
      />

      {/* Slide-in Notifications Drawer from Right */}
      <NotificationDrawer
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onClearAll={handleClearAllNotifications}
        onSelectNotification={handleSelectNotification}
        onAddTestNotification={handleAddTestNotification}
      />

      {/* Floating Category Filter Chips (Below TopBar) */}
      <View style={[styles.filterBar, { top: insets.top + 68 }]} pointerEvents="box-none">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {CATEGORY_FILTERS.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.8}
                style={[
                  styles.filterChip,
                  isActive && styles.filterChipActive,
                ]}
              >
                <MaterialCommunityIcons
                  name={cat.icon as any}
                  size={15}
                  color={isActive ? colors.textOnDark : colors.textMuted}
                />
                <Text
                  style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
                <View
                  style={[
                    styles.filterBadge,
                    isActive && styles.filterBadgeActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterBadgeText,
                      isActive && styles.filterBadgeTextActive,
                    ]}
                  >
                    {cat.count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Live GPS Telemetry Badge (Bottom Left) */}
      <View style={[styles.telemetryBadge, { bottom: insets.bottom + 90 }]} pointerEvents="none">
        <View style={styles.telemetryDot} />
        <Text style={styles.telemetryText}>
          GPS 3D Live • {coordinate.latitude.toFixed(4)}° N, {coordinate.longitude.toFixed(4)}° E
        </Text>
      </View>

      {/* Floating Map Controls (Compass, Recenter, 3D Toggle, Zoom) */}
      <MapControls
        bottomOffset={insets.bottom + (selectedIssue ? 230 : 90)}
        is3D={is3D}
        onCompassPress={() => mapRef.current?.resetBearing()}
        onLocatePress={() => mapRef.current?.recenter()}
        onToggle3D={() => setIs3D((prev) => !prev)}
        onZoomIn={() => mapRef.current?.zoomIn?.()}
        onZoomOut={() => mapRef.current?.zoomOut?.()}
      />

      {/* Side-animated Character Companion with speech bubble */}
      {!selectedIssue && (
        <CharacterCompanion
          bottomOffset={insets.bottom + 85}
          onQuestShortcut={() => setSelectedCategory("quests")}
        />
      )}

      {/* Selected Marker Detail Card / Bottom Drawer */}
      {selectedIssue && (
        <View style={[styles.drawerCard, { bottom: insets.bottom + 85 }]}>
          <View style={styles.drawerHeader}>
            <View style={styles.drawerTagRow}>
              <View
                style={[
                  styles.drawerCategoryBadge,
                  { backgroundColor: `${selectedIssue.pinColor}25` },
                ]}
              >
                <MaterialCommunityIcons
                  name={selectedIssue.icon}
                  size={14}
                  color={selectedIssue.pinColor}
                />
                <Text
                  style={[
                    styles.drawerCategoryText,
                    { color: selectedIssue.pinColor },
                  ]}
                >
                  {selectedIssue.kind === "quest" ? "Community Quest" : "Civic Incident"}
                </Text>
              </View>

              <View
                style={[
                  styles.drawerSeverityBadge,
                  { backgroundColor: `${selectedIssue.tagColor}20` },
                ]}
              >
                <Text
                  style={[
                    styles.drawerSeverityText,
                    { color: selectedIssue.tagColor },
                  ]}
                >
                  {selectedIssue.tag} Priority
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setSelectedIssueId(null)}
              hitSlop={12}
              style={styles.drawerCloseButton}
            >
              <Ionicons name="close" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={styles.drawerTitle}>{selectedIssue.title}</Text>

          <View style={styles.drawerInfoRow}>
            <View style={styles.drawerInfoItem}>
              <Ionicons name="location-sharp" size={14} color={colors.teal} />
              <Text style={styles.drawerInfoText}>~120m away • Sector 4</Text>
            </View>
            <View style={styles.drawerRewardItem}>
              <MaterialCommunityIcons name="star-four-points" size={14} color={colors.coinGold} />
              <Text style={styles.drawerRewardText}>+150 XP</Text>
              <MaterialCommunityIcons name="hexagon" size={13} color={colors.coinGold} style={{ marginLeft: 4 }} />
              <Text style={styles.drawerRewardText}>+50 Coins</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleActionPress}
            activeOpacity={0.85}
            style={[
              styles.drawerActionButton,
              { backgroundColor: selectedIssue.kind === "quest" ? colors.brandGreen : colors.pinRed },
            ]}
          >
            <Ionicons
              name={selectedIssue.kind === "quest" ? "checkbox-outline" : "camera"}
              size={18}
              color={colors.textOnDark}
            />
            <Text style={styles.drawerActionText}>
              {selectedIssue.kind === "quest" ? "Start Quest & Submit Proof" : "Verify & Report Details"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterBar: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 15,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: "center",
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(17, 24, 39, 0.88)",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  filterChipActive: {
    backgroundColor: colors.brandGreen,
    borderColor: colors.brandGreenDark,
  },
  filterChipText: {
    color: colors.textMuted,
    fontSize: 12.5,
    fontWeight: "600",
  },
  filterChipTextActive: {
    color: colors.textOnDark,
    fontWeight: "700",
  },
  filterBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  filterBadgeActive: {
    backgroundColor: "rgba(0, 0, 0, 0.25)",
  },
  filterBadgeText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "700",
  },
  filterBadgeTextActive: {
    color: colors.textOnDark,
  },
  telemetryBadge: {
    position: "absolute",
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    zIndex: 10,
  },
  telemetryDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.brandGreen,
  },
  telemetryText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 10.5,
    fontWeight: "600",
    fontFamily: "monospace",
  },
  drawerCard: {
    position: "absolute",
    left: 16,
    right: 16,
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.15)",
    padding: 16,
    zIndex: 30,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  drawerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  drawerTagRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  drawerCategoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  drawerCategoryText: {
    fontSize: 11,
    fontWeight: "700",
  },
  drawerSeverityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  drawerSeverityText: {
    fontSize: 11,
    fontWeight: "700",
  },
  drawerCloseButton: {
    padding: 4,
  },
  drawerTitle: {
    color: colors.textOnDark,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8,
  },
  drawerInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.08)",
  },
  drawerInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  drawerInfoText: {
    color: "rgba(255, 255, 255, 0.65)",
    fontSize: 12,
  },
  drawerRewardItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  drawerRewardText: {
    color: colors.coinGold,
    fontSize: 12,
    fontWeight: "700",
  },
  drawerActionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  drawerActionText: {
    color: colors.textOnDark,
    fontSize: 14,
    fontWeight: "700",
  },
});
