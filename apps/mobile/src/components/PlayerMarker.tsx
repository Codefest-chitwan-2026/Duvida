import { useEffect, useState } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/theme/colors";

/**
 * The citizen's own position on the map: an avatar dot sitting inside a
 * pulsing radar ring, matching the "you are here" marker in the reference
 * design.
 */
export function PlayerMarker() {
  const [pulse] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(pulse, {
        toValue: 1,
        duration: 1800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.8] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });

  return (
    <View style={styles.wrap}>
      <Animated.View
        style={[styles.ring, { transform: [{ scale: ringScale }], opacity: ringOpacity }]}
      />
      <View style={styles.avatar}>
        <Ionicons name="walk" size={18} color={colors.textOnDark} />
      </View>
    </View>
  );
}

const RING_SIZE = 64;

const styles = StyleSheet.create({
  wrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    position: "absolute",
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 2,
    borderColor: colors.teal,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.teal,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.textOnDark,
  },
});
