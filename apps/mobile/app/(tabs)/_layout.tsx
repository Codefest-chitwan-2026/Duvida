import { View, StyleSheet } from "react-native";
import { Tabs, useRouter, usePathname } from "expo-router";

import { BottomNavBar, type TabKey } from "@/components/BottomNavBar";

const PATH_TO_TAB: Record<string, TabKey> = {
  "/": "home",
  "/quests": "quests",
  "/wallet": "wallet",
  "/profile": "profile",
};

const TAB_TO_PATH: Record<TabKey, string> = {
  home: "/",
  quests: "/quests",
  wallet: "/wallet",
  profile: "/profile",
};

export default function TabsLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const active = PATH_TO_TAB[pathname] ?? "home";

  return (
    <View style={styles.container}>
      <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: "none" } }}>
        <Tabs.Screen name="index" />
        <Tabs.Screen name="quests" />
        <Tabs.Screen name="wallet" />
        <Tabs.Screen name="profile" />
      </Tabs>

      <BottomNavBar
        active={active}
        onSelectTab={(tab) => router.navigate(TAB_TO_PATH[tab])}
        onCreatePress={() => router.push("/report/new")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
