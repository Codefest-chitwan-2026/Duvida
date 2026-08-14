import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { colors } from "@/theme/colors";

export type TabKey = "home" | "quests" | "wallet" | "profile";

type BottomNavBarProps = {
  active: TabKey;
  onSelectTab: (tab: TabKey) => void;
  onCreatePress: () => void;
};

const TABS: { key: TabKey; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "home", label: "Map", icon: "map" },
  { key: "quests", label: "Quests", icon: "trophy" },
  { key: "wallet", label: "Wallet", icon: "wallet" },
  { key: "profile", label: "Profile", icon: "person" },
];

export function BottomNavBar({ active, onSelectTab, onCreatePress }: BottomNavBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.bar}>
        {TABS.slice(0, 2).map((tab) => (
          <TabButton
            key={tab.key}
            tab={tab}
            isActive={active === tab.key}
            onPress={() => onSelectTab(tab.key)}
          />
        ))}

        <View style={styles.fabSpacer} />

        {TABS.slice(2).map((tab) => (
          <TabButton
            key={tab.key}
            tab={tab}
            isActive={active === tab.key}
            onPress={() => onSelectTab(tab.key)}
          />
        ))}
      </View>

      <Pressable style={styles.fabWrap} onPress={onCreatePress} hitSlop={8}>
        <View style={styles.fab}>
          <Ionicons name="add" size={28} color={colors.textOnDark} />
        </View>
        <Text style={styles.fabLabel}>Report</Text>
      </Pressable>
    </View>
  );
}

function TabButton({
  tab,
  isActive,
  onPress,
}: {
  tab: (typeof TABS)[number];
  isActive: boolean;
  onPress: () => void;
}) {
  const tint = isActive ? colors.brandGreen : colors.textMuted;
  return (
    <Pressable style={styles.tabButton} onPress={onPress} hitSlop={8}>
      <Ionicons name={tab.icon} size={22} color={tint} />
      <Text style={[styles.tabLabel, { color: tint }]}>{tab.label}</Text>
    </Pressable>
  );
}

const FAB_SIZE = 60;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 0,
    alignItems: "center",
  },
  bar: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 28,
    paddingVertical: 10,
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
  },
  fabSpacer: {
    width: FAB_SIZE + 8,
  },
  fabWrap: {
    position: "absolute",
    top: -(FAB_SIZE / 2 - 18),
    alignItems: "center",
    gap: 2,
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: colors.brandGreen,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: colors.card,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 8,
  },
  fabLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.brandGreenDark,
  },
});
