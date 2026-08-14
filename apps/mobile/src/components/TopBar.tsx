import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/theme/colors";

type TopBarProps = {
  avatarLevel: number;
  coinBalance: number;
  hasUnreadNotifications?: boolean;
  onAvatarPress?: () => void;
  onNotificationsPress?: () => void;
};

export function TopBar({
  avatarLevel,
  coinBalance,
  hasUnreadNotifications,
  onAvatarPress,
  onNotificationsPress,
}: TopBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { top: insets.top + 8 }]} pointerEvents="box-none">
      <View style={styles.avatarWrap}>
        <TouchableOpacity
          style={styles.avatarButton}
          onPress={onAvatarPress}
          activeOpacity={0.8}
        >
          <Ionicons name="person" size={26} color={colors.textOnDark} />
        </TouchableOpacity>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{avatarLevel}</Text>
        </View>
      </View>

      <View style={styles.coinPill}>
        <MaterialCommunityIcons name="hexagon" size={16} color={colors.coinGold} />
        <Text style={styles.coinText}>{coinBalance.toLocaleString()}</Text>
      </View>

      <TouchableOpacity
        style={styles.bellButton}
        onPress={onNotificationsPress}
        activeOpacity={0.8}
        hitSlop={8}
      >
        <Ionicons name="notifications" size={22} color={colors.textPrimary} />
        {hasUnreadNotifications ? <View style={styles.bellDot} /> : null}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 50,
  },
  avatarWrap: {
    width: 52,
    height: 52,
  },
  avatarButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#374151",
    borderWidth: 2,
    borderColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  levelBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 4,
    backgroundColor: colors.brandGreen,
    borderWidth: 2,
    borderColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  levelText: {
    color: colors.textOnDark,
    fontSize: 11,
    fontWeight: "700",
  },
  coinPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.overlayDark,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },
  coinText: {
    color: colors.textOnDark,
    fontWeight: "700",
    fontSize: 15,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  bellDot: {
    position: "absolute",
    top: 8,
    right: 9,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.severityHigh,
    borderWidth: 1.5,
    borderColor: colors.card,
  },
});
