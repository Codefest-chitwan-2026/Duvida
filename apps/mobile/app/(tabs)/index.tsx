import { StyleSheet, View } from "react-native";
import { StatusBar } from "expo-status-bar";

import { TopBar } from "@/components/TopBar";
import { colors } from "@/theme/colors";

// Map is paused for now — this is just an empty placeholder box until it comes back.
export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.mapPlaceholder} />

      <TopBar avatarLevel={12} coinBalance={2450} hasUnreadNotifications />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mapPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
  },
});
