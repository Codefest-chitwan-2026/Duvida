import type { ReactNode } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/theme/colors";
import { useAuth } from "@/lib/auth";

type IconName = keyof typeof Ionicons.glyphMap;

type ProfileStat = {
  label: string;
  value: string;
  icon: IconName;
  color: string;
};

type Achievement = {
  title: string;
  detail: string;
  icon: IconName;
  color: string;
  background: string;
};

type RecentBadge = {
  title: string;
  detail: string;
  xp: string;
  date: string;
  icon: IconName;
  color: string;
};

const PROFILE = {
  name: "Alex Sharma",
  role: "Community Champion",
  level: 12,
  currentXp: 2850,
  nextLevelXp: 4600,
};

const STATS: ProfileStat[] = [
  { label: "Quests", value: "27", icon: "document-text-outline", color: "#07833D" },
  { label: "Verified", value: "36", icon: "shield-checkmark-outline", color: "#2563EB" },
  { label: "Tokens", value: "2,450", icon: "star", color: colors.coinGold },
  { label: "Impact Score", value: "1,285", icon: "leaf-outline", color: "#07833D" },
];

const ACHIEVEMENTS: Achievement[] = [
  {
    title: "First Reporter",
    detail: "10 reports",
    icon: "megaphone",
    color: "#FACC15",
    background: "#0B4DA2",
  },
  {
    title: "Verifier",
    detail: "25 verified",
    icon: "people",
    color: "#FACC15",
    background: "#991B1B",
  },
  {
    title: "Quest Master",
    detail: "23 quests",
    icon: "trophy",
    color: "#FACC15",
    background: "#27364B",
  },
  {
    title: "Eco Warrior",
    detail: "50 actions",
    icon: "leaf",
    color: "#FFFFFF",
    background: "#087A3C",
  },
];

const RECENT_BADGES: RecentBadge[] = [
  {
    title: "Community Hero",
    detail: "Completed 20 quests",
    xp: "+120 XP",
    date: "2 days ago",
    icon: "sparkles",
    color: "#0B4DA2",
  },
  {
    title: "Top Verifier",
    detail: "Verified 25 reports",
    xp: "+150 XP",
    date: "5 days ago",
    icon: "shield-checkmark",
    color: "#07833D",
  },
  {
    title: "Green Ambassador",
    detail: "Completed sustainability challenges",
    xp: "+250 XP",
    date: "1 week ago",
    icon: "leaf",
    color: "#07833D",
  },
];

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signOut } = useAuth();
  const progress = Math.min(100, (PROFILE.currentXp / PROFILE.nextLevelXp) * 100);

  const showComingSoon = (feature: string) => {
    Alert.alert(feature, `${feature} will be available soon.`);
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 126 }]}
      >
        <View style={[styles.hero, { paddingTop: insets.top + 8 }]}>
          <View style={styles.sunGlow} />
          <View style={[styles.skyline, styles.skylineLeft]} />
          <View style={[styles.skyline, styles.skylineMiddle]} />
          <View style={[styles.skyline, styles.skylineRight]} />
          <View style={[styles.tree, styles.treeLeft]} />
          <View style={[styles.tree, styles.treeRight]} />
          <View style={styles.park} />

          <View style={styles.header}>
            <Pressable
              accessibilityLabel="Back to map"
              hitSlop={10}
              onPress={() => router.navigate("/")}
              style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
            >
              <Ionicons name="arrow-back" size={26} color={colors.textPrimary} />
            </Pressable>
            <Text style={styles.headerTitle}>My Profile</Text>
            <Pressable
              accessibilityLabel="Profile settings"
              hitSlop={10}
              onPress={() => showComingSoon("Profile settings")}
              style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
            >
              <Ionicons name="settings-outline" size={27} color={colors.textPrimary} />
            </Pressable>
          </View>

          <View style={styles.identity}>
            <View style={styles.avatarRing}>
              <View style={styles.avatar}>
                <View style={styles.avatarGlow} />
                <Ionicons name="person" size={104} color="#245276" />
              </View>
              <Pressable
                accessibilityLabel="Change profile photo"
                onPress={() => showComingSoon("Profile photo")}
                style={({ pressed }) => [styles.cameraButton, pressed && styles.pressed]}
              >
                <Ionicons name="camera-outline" size={22} color={colors.textPrimary} />
              </Pressable>
            </View>
            <Text style={styles.name}>{PROFILE.name}</Text>
            <View style={styles.rolePill}>
              <View style={styles.roleShield}>
                <Ionicons name="leaf" size={12} color={colors.card} />
              </View>
              <Text style={styles.roleText}>{PROFILE.role}</Text>
              <View style={styles.roleStar}>
                <Ionicons name="star" size={10} color={colors.card} />
              </View>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <View style={[styles.card, styles.progressCard]}>
            <View style={styles.levelRow}>
              <Text style={styles.levelText}>Level {PROFILE.level}</Text>
              <Text style={styles.xpText}>
                {PROFILE.currentXp.toLocaleString()} / {PROFILE.nextLevelXp.toLocaleString()} XP
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>

            <View style={styles.divider} />
            <View style={styles.statsRow}>
              {STATS.map((stat, index) => (
                <View
                  key={stat.label}
                  style={[styles.statItem, index > 0 && styles.statDivider]}
                >
                  <Ionicons name={stat.icon} size={25} color={stat.color} />
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <SectionCard title="Achievements" onViewAll={() => showComingSoon("Achievements")}>
            <View style={styles.achievementsRow}>
              {ACHIEVEMENTS.map((achievement) => (
                <View key={achievement.title} style={styles.achievementItem}>
                  <View style={[styles.badgeFrame, { borderColor: achievement.color }]}>
                    <View style={[styles.badge, { backgroundColor: achievement.background }]}>
                      <Ionicons
                        name={achievement.icon}
                        size={25}
                        color={achievement.color}
                      />
                    </View>
                  </View>
                  <Text style={styles.achievementTitle} numberOfLines={2}>
                    {achievement.title}
                  </Text>
                  <Text style={styles.achievementDetail}>{achievement.detail}</Text>
                </View>
              ))}
            </View>
          </SectionCard>

          <SectionCard title="Recent Badges" onViewAll={() => showComingSoon("Badges")}>
            <View style={styles.recentList}>
              {RECENT_BADGES.map((badge, index) => (
                <View
                  key={badge.title}
                  style={[styles.recentRow, index > 0 && styles.recentDivider]}
                >
                  <View style={[styles.recentIcon, { backgroundColor: badge.color }]}>
                    <Ionicons
                      name={badge.icon}
                      size={22}
                      color={colors.card}
                      style={styles.recentIconGlyph}
                    />
                  </View>
                  <View style={styles.recentCopy}>
                    <Text style={styles.recentTitle}>{badge.title}</Text>
                    <Text style={styles.recentDetail} numberOfLines={1}>
                      {badge.detail}
                    </Text>
                  </View>
                  <View style={styles.recentMeta}>
                    <Text style={styles.recentXp}>{badge.xp}</Text>
                    <Text style={styles.recentDate}>{badge.date}</Text>
                  </View>
                </View>
              ))}
            </View>
          </SectionCard>

          <Pressable
            accessibilityLabel="Log out"
            onPress={() => signOut()}
            style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}
          >
            <Ionicons name="log-out-outline" size={18} color="#DC2626" />
            <Text style={styles.logoutText}>Log Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function SectionCard({
  title,
  onViewAll,
  children,
}: {
  title: string;
  onViewAll: () => void;
  children: ReactNode;
}) {
  return (
    <View style={[styles.card, styles.sectionCard]}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Pressable onPress={onViewAll} hitSlop={8}>
          <Text style={styles.viewAll}>View All</Text>
        </Pressable>
      </View>
      {children}
    </View>
  );
}

const cardShadow = {
  shadowColor: "#15321F",
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 5 },
  elevation: 3,
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5F8F5",
  },
  scrollContent: {
    flexGrow: 1,
  },
  hero: {
    minHeight: 410,
    overflow: "hidden",
    backgroundColor: "#DDF5FF",
    paddingHorizontal: 18,
  },
  sunGlow: {
    position: "absolute",
    top: -80,
    right: -30,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(255,255,255,0.42)",
  },
  skyline: {
    position: "absolute",
    bottom: 105,
    width: 58,
    borderRadius: 5,
    backgroundColor: "rgba(73, 157, 194, 0.18)",
  },
  skylineLeft: {
    left: 10,
    height: 126,
  },
  skylineMiddle: {
    left: "23%",
    height: 86,
  },
  skylineRight: {
    right: 8,
    height: 146,
  },
  tree: {
    position: "absolute",
    bottom: 74,
    width: 106,
    height: 106,
    borderRadius: 53,
    backgroundColor: "rgba(61, 187, 87, 0.35)",
  },
  treeLeft: {
    left: -28,
  },
  treeRight: {
    right: -20,
  },
  park: {
    position: "absolute",
    left: -50,
    right: -50,
    bottom: -78,
    height: 215,
    borderRadius: 120,
    backgroundColor: "#CDEFB8",
  },
  header: {
    zIndex: 2,
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.55,
  },
  headerTitle: {
    fontSize: 23,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  identity: {
    zIndex: 2,
    alignItems: "center",
    paddingTop: 8,
  },
  avatarRing: {
    width: 176,
    height: 176,
    borderRadius: 88,
    borderWidth: 6,
    borderColor: colors.card,
    backgroundColor: "#CBD8E2",
    alignItems: "center",
    justifyContent: "flex-end",
    ...cardShadow,
  },
  avatar: {
    width: 164,
    height: 164,
    borderRadius: 82,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "flex-end",
    backgroundColor: "#DCE7EF",
  },
  avatarGlow: {
    position: "absolute",
    top: -35,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.68)",
  },
  cameraButton: {
    position: "absolute",
    right: -8,
    bottom: 8,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    ...cardShadow,
  },
  name: {
    marginTop: 10,
    fontSize: 27,
    lineHeight: 33,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  rolePill: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "rgba(255,255,255,0.78)",
  },
  roleShield: {
    width: 23,
    height: 23,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#087A3C",
  },
  roleText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  roleStar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.coinGold,
  },
  content: {
    marginTop: -8,
    paddingHorizontal: 14,
    gap: 14,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
    marginBottom: 8,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FCA5A5",
    backgroundColor: "#FEF2F2",
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#DC2626",
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#EDF0ED",
    ...cardShadow,
  },
  progressCard: {
    overflow: "hidden",
    paddingTop: 18,
  },
  levelRow: {
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  levelText: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  xpText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#526078",
  },
  progressTrack: {
    height: 10,
    marginTop: 13,
    marginHorizontal: 20,
    overflow: "hidden",
    borderRadius: 5,
    backgroundColor: colors.progressTrack,
  },
  progressFill: {
    height: "100%",
    borderRadius: 5,
    backgroundColor: "#07833D",
  },
  divider: {
    height: 1,
    marginTop: 20,
    backgroundColor: colors.border,
  },
  statsRow: {
    flexDirection: "row",
    paddingVertical: 18,
  },
  statItem: {
    flex: 1,
    minWidth: 0,
    alignItems: "center",
    paddingHorizontal: 3,
    gap: 5,
  },
  statDivider: {
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  statValue: {
    marginTop: 2,
    fontSize: 18,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 11,
    textAlign: "center",
    color: "#526078",
  },
  sectionCard: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 18,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  viewAll: {
    fontSize: 13,
    fontWeight: "800",
    color: "#07833D",
  },
  achievementsRow: {
    flexDirection: "row",
  },
  achievementItem: {
    width: "25%",
    alignItems: "center",
    paddingHorizontal: 3,
  },
  badgeFrame: {
    width: 58,
    height: 58,
    borderRadius: 17,
    borderWidth: 3,
    padding: 3,
    backgroundColor: "#FBBF24",
    transform: [{ rotate: "45deg" }],
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "-45deg" }],
  },
  achievementTitle: {
    minHeight: 32,
    marginTop: 11,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: "800",
    textAlign: "center",
    color: colors.textPrimary,
  },
  achievementDetail: {
    marginTop: 1,
    fontSize: 10,
    textAlign: "center",
    color: "#526078",
  },
  recentList: {
    marginTop: -5,
  },
  recentRow: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 10,
  },
  recentDivider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  recentIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: "#F6C343",
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "45deg" }],
  },
  recentCopy: {
    flex: 1,
    minWidth: 0,
  },
  recentIconGlyph: {
    transform: [{ rotate: "-45deg" }],
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  recentDetail: {
    marginTop: 3,
    fontSize: 11,
    color: "#526078",
  },
  recentMeta: {
    alignItems: "flex-end",
    paddingLeft: 4,
  },
  recentXp: {
    fontSize: 13,
    fontWeight: "800",
    color: "#07833D",
  },
  recentDate: {
    marginTop: 5,
    fontSize: 10,
    color: "#526078",
  },
});
