import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { badges, rewardsSummary } from "@/features/rewards/mockRewards";
import { colors } from "@/theme/colors";

type ProfileScreenProps = {
  onEditProfile?: () => void;
  onImpact?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
};

export function ProfileScreen({ onEditProfile, onImpact, onSettings, onLogout }: ProfileScreenProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 132 }]}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={32} color={colors.textOnDark} />
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelBadgeText}>Lv {rewardsSummary.level}</Text>
          </View>
        </View>
        <Text style={styles.name}>Citizen User</Text>
        <Text style={styles.xp}>{rewardsSummary.xp.toLocaleString()} XP</Text>

        <View style={styles.statsRow}>
          <Stat label="Reports" value={rewardsSummary.reportsSubmitted} />
          <Stat label="Verified" value={rewardsSummary.issuesVerified} />
          <Stat label="Quests" value={rewardsSummary.questsCompleted} />
        </View>

        <View style={styles.badgeRow}>
          {badges.map((badge) => (
            <View key={badge.id} style={styles.badgeIcon}>
              <MaterialCommunityIcons name={badge.icon} size={18} color={colors.brandGreenDark} />
            </View>
          ))}
        </View>

        <View style={styles.menu}>
          <MenuRow icon="create-outline" label="Edit Profile" onPress={onEditProfile} />
          <MenuRow icon="leaf-outline" label="Sustainability Impact" onPress={onImpact} />
          <MenuRow icon="settings-outline" label="Settings" onPress={onSettings} />
        </View>

        <Pressable style={styles.logoutButton} onPress={onLogout}>
          <Ionicons name="log-out-outline" size={18} color={colors.severityHigh} />
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MenuRow({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable style={styles.menuRow} onPress={onPress}>
      <Ionicons name={icon} size={18} color={colors.textPrimary} />
      <Text style={styles.menuRowText}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.card },
  content: { paddingHorizontal: 20, alignItems: "center" },
  avatarWrap: { position: "relative", marginBottom: 10 },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.brandGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  levelBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: colors.coinGold,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 2,
    borderColor: colors.card,
  },
  levelBadgeText: { fontSize: 10, fontWeight: "800", color: colors.textOnDark },
  name: { fontSize: 18, fontWeight: "800", color: colors.textPrimary },
  xp: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  statsRow: { flexDirection: "row", gap: 24, marginTop: 18, marginBottom: 18 },
  stat: { alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "800", color: colors.textPrimary },
  statLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  badgeRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  badgeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  menu: { width: "100%", gap: 4, marginBottom: 20 },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuRowText: { flex: 1, fontSize: 14, fontWeight: "600", color: colors.textPrimary },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
  },
  logoutText: { fontSize: 14, fontWeight: "700", color: colors.severityHigh },
});
