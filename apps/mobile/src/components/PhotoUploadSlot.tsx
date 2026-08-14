import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

import { PhotoPlaceholder } from "@/components/PhotoPlaceholder";
import { colors } from "@/theme/colors";

type PhotoUploadSlotProps = {
  label: string;
  requirement: "Optional" | "Required";
  helpText: string;
  uri: string | null;
  onChange: (uri: string | null) => void;
};

async function pickFrom(source: "camera" | "library"): Promise<string | null> {
  const permission =
    source === "camera"
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    Alert.alert("Permission needed", "Allow access in Settings to attach a photo.");
    return null;
  }

  const result =
    source === "camera"
      ? await ImagePicker.launchCameraAsync({ quality: 0.7, allowsEditing: true })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          quality: 0.7,
          allowsEditing: true,
        });

  if (result.canceled || result.assets.length === 0) return null;
  return result.assets[0].uri;
}

export function PhotoUploadSlot({ label, requirement, helpText, uri, onChange }: PhotoUploadSlotProps) {
  const openPicker = () => {
    Alert.alert(label, undefined, [
      {
        text: "Take Photo",
        onPress: async () => {
          const picked = await pickFrom("camera");
          if (picked) onChange(picked);
        },
      },
      {
        text: "Choose from Library",
        onPress: async () => {
          const picked = await pickFrom("library");
          if (picked) onChange(picked);
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>
          {label} <Text style={styles.requirement}>({requirement})</Text>
        </Text>
        <Pressable onPress={() => Alert.alert(label, helpText)} hitSlop={8}>
          <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.box}>
        <PhotoPlaceholder uri={uri} style={styles.photo} />

        {uri ? (
          <Pressable style={styles.clearButton} onPress={() => onChange(null)} hitSlop={8}>
            <Ionicons name="close" size={16} color={colors.textPrimary} />
          </Pressable>
        ) : null}

        <Pressable style={styles.cameraButton} onPress={openPicker} hitSlop={8}>
          <Ionicons name="camera" size={18} color={colors.textPrimary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  requirement: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.textMuted,
  },
  box: {
    aspectRatio: 1.15,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  photo: {
    borderRadius: 12,
  },
  clearButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  cameraButton: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
});
