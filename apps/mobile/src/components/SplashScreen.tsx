import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/theme/colors";

export function SplashScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Ionicons name="leaf" size={32} color={colors.textOnDark} />
      </View>
      <Text style={styles.title}>Team Everest</Text>
      <Text style={styles.subtitle}>Sustainable Community Digital Twin</Text>
      <ActivityIndicator style={styles.spinner} color={colors.brandGreen} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.brandGreen,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    color: colors.textOnDark,
    fontSize: 20,
    fontWeight: "800",
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 4,
  },
  spinner: {
    marginTop: 24,
  },
});
