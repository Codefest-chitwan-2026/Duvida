import {
  Image,
  StyleSheet,
  View,
  type ImageSourcePropType,
  type ImageStyle,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/theme/colors";

type PhotoPlaceholderProps = {
  uri?: string | null;
  fallbackSource?: ImageSourcePropType;
  /** Plain sizing/shape styles (width, height, borderRadius) shared by both the Image and empty-state View. */
  style?: StyleProp<ImageStyle & ViewStyle>;
};

/**
 * Shows a picked photo, or a neutral placeholder (no bundled demo photos
 * ship with this scaffold) so photo slots still read as a photo area
 * before the user attaches evidence.
 */
export function PhotoPlaceholder({ uri, fallbackSource, style }: PhotoPlaceholderProps) {
  if (uri) {
    return <Image source={{ uri }} style={[styles.image, style]} resizeMode="cover" />;
  }

  if (fallbackSource) {
    return <Image source={fallbackSource} style={[styles.image, style]} resizeMode="cover" />;
  }

  return (
    <View style={[styles.image, styles.empty, style]}>
      <Ionicons name="image-outline" size={28} color={colors.textMuted} />
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: "100%",
  },
  empty: {
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
});
