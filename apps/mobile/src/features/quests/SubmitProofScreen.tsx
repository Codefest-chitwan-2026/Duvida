import { useMemo, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BottomNavBar } from "@/components/BottomNavBar";
import { PhotoPlaceholder } from "@/components/PhotoPlaceholder";
import { PhotoUploadSlot } from "@/components/PhotoUploadSlot";
import { ProgressRing } from "@/components/ProgressRing";
import { env } from "@/lib/env";
import { colors } from "@/theme/colors";

const NOTES_MAX_LENGTH = 300;
/** Clears the floating BottomNavBar (nav pill + overlapping FAB). */
const NAV_BAR_CLEARANCE = 100;

type SubmitProofScreenProps = {
  questId: string;
  title: string;
  description: string;
  tokens: number;
  progressPercent: number;
  coinBalance: number;
};

function inferFilenameAndType(uri: string): { filename: string; type: string } {
  const match = /\.(\w+)(?:\?.*)?$/.exec(uri);
  const ext = match ? match[1].toLowerCase() : "jpg";
  const type = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
  return { filename: `proof.${ext}`, type };
}

export function SubmitProofScreen({
  questId,
  title,
  description,
  tokens,
  progressPercent,
  coinBalance,
}: SubmitProofScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [beforeUri, setBeforeUri] = useState<string | null>(null);
  const [afterUri, setAfterUri] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const detectedAt = useMemo(
    () =>
      new Date().toLocaleString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
    []
  );

  const canSubmit = afterUri !== null && !uploading;

  const handleSubmit = async () => {
    if (afterUri === null) {
      Alert.alert("After photo required", "Add an after photo before submitting proof.");
      return;
    }

    setUploading(true);
    setUploadError(null);
    try {
      const { filename, type } = inferFilenameAndType(afterUri);
      const fileResponse = await fetch(afterUri);
      const blob = await fileResponse.blob();

      const formData = new FormData();
      formData.append("file", new Blob([blob], { type }), filename);

      const response = await fetch(`${env.advisorApiUrl}/quests/${questId}/proof`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`);
      }

      Alert.alert("Proof submitted", "Your quest is now marked as submitted.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setUploadError(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Submit Proof</Text>
        <View style={styles.coinPill}>
          <MaterialCommunityIcons name="hexagon" size={14} color={colors.coinGold} />
          <Text style={styles.coinText}>{coinBalance.toLocaleString()}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: NAV_BAR_CLEARANCE + 16 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.questCard}>
          <PhotoPlaceholder style={styles.questThumb} />
          <View style={styles.questInfo}>
            <View style={styles.questTitleRow}>
              <View style={styles.questIconBadge}>
                <MaterialCommunityIcons name="delete" size={14} color={colors.brandGreenDark} />
              </View>
              <Text style={styles.questTitle}>{title}</Text>
            </View>
            <Text style={styles.questDescription}>{description}</Text>
            <View style={styles.questStatsRow}>
              <View style={styles.questStat}>
                <MaterialCommunityIcons name="hexagon" size={14} color={colors.coinGold} />
                <Text style={styles.questStatValue}>{tokens}</Text>
                <Text style={styles.questStatLabel}>Points</Text>
              </View>
            </View>
          </View>
          <View style={styles.progressWrap}>
            <ProgressRing percent={progressPercent} />
            <Text style={styles.progressLabel}>Progress</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Upload Proof</Text>

        <View style={styles.infoBanner}>
          <View style={styles.infoIconBadge}>
            <Ionicons name="shield-checkmark" size={16} color={colors.brandGreenDark} />
          </View>
          <View style={styles.infoTextWrap}>
            <Text style={styles.infoText}>
              Upload clear photos as proof that you completed the quest.
            </Text>
            <Text style={styles.infoText}>Make sure the photos are recent and from this location.</Text>
          </View>
        </View>

        <View style={styles.photoRow}>
          <PhotoUploadSlot
            label="Before Photo"
            requirement="Optional"
            helpText="A photo of the area before you started, if you have one."
            uri={beforeUri}
            onChange={setBeforeUri}
          />
          <PhotoUploadSlot
            label="After Photo"
            requirement="Required"
            helpText="A clear photo of the completed work, taken at this location."
            uri={afterUri}
            onChange={setAfterUri}
          />
        </View>

        <Text style={styles.sectionTitle}>
          Additional Notes <Text style={styles.optionalLabel}>(Optional)</Text>
        </Text>
        <View style={styles.notesBox}>
          <TextInput
            style={styles.notesInput}
            multiline
            maxLength={NOTES_MAX_LENGTH}
            value={notes}
            onChangeText={setNotes}
            placeholder="Describe what you did..."
            placeholderTextColor={colors.textMuted}
          />
          <Text style={styles.notesCount}>
            {notes.length}/{NOTES_MAX_LENGTH}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaCard}>
            <Ionicons name="calendar" size={16} color={colors.brandGreenDark} />
            <Text style={styles.metaLabel}>Date & Time</Text>
            <Text style={styles.metaValue}>{detectedAt}</Text>
            <Text style={styles.metaHint}>Auto-detected</Text>
          </View>
        </View>

        <View style={styles.tipsCard}>
          <View style={styles.tipsIconBadge}>
            <Ionicons name="bulb" size={16} color={colors.tipsBlue} />
          </View>
          <View style={styles.tipsTextWrap}>
            <Text style={styles.tipsTitle}>Proof Tips</Text>
            <TipRow text="Make sure the after photo shows the cleaned area clearly." />
            <TipRow text="Avoid editing or using old photos." />
          </View>
        </View>

        {uploadError && <Text style={styles.uploadErrorText}>{uploadError}</Text>}

        <Pressable
          style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmit}
        >
          {uploading ? (
            <ActivityIndicator size="small" color={colors.textOnDark} />
          ) : (
            <Text style={styles.submitButtonText}>Submit Proof</Text>
          )}
        </Pressable>
      </ScrollView>

      <BottomNavBar
        active="quests"
        onSelectTab={(tab) => router.replace(TAB_TO_PATH[tab])}
        onCreatePress={() => router.push("/report/new")}
      />
    </View>
  );
}

const TAB_TO_PATH = {
  home: "/",
  quests: "/quests",
  wallet: "/wallet",
  advisor: "/advisor",
  profile: "/profile",
} as const;

function TipRow({ text }: { text: string }) {
  return (
    <View style={styles.tipRow}>
      <Ionicons name="checkmark-circle" size={14} color={colors.tipsBlue} />
      <Text style={styles.tipText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.card,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  coinPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  coinText: {
    fontWeight: "700",
    fontSize: 13,
    color: colors.textPrimary,
  },
  content: {
    paddingHorizontal: 16,
    gap: 16,
  },
  questCard: {
    flexDirection: "row",
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  questThumb: {
    width: 84,
    height: 84,
    borderRadius: 10,
  },
  questInfo: {
    flex: 1,
    gap: 4,
  },
  questTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  questIconBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.infoIconBg,
    alignItems: "center",
    justifyContent: "center",
  },
  questTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  questDescription: {
    fontSize: 12,
    color: colors.textMuted,
  },
  questStatsRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 4,
  },
  questStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  questStatValue: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  questStatLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  progressWrap: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  progressLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  optionalLabel: {
    fontWeight: "500",
    color: colors.textMuted,
  },
  infoBanner: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: colors.infoBg,
    borderRadius: 12,
    padding: 12,
    marginTop: -8,
  },
  infoIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.infoIconBg,
    alignItems: "center",
    justifyContent: "center",
  },
  infoTextWrap: {
    flex: 1,
    gap: 2,
  },
  infoText: {
    fontSize: 12,
    color: colors.textPrimary,
  },
  photoRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: -8,
  },
  notesBox: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    marginTop: -8,
  },
  notesInput: {
    minHeight: 64,
    fontSize: 13,
    color: colors.textPrimary,
    textAlignVertical: "top",
  },
  notesCount: {
    alignSelf: "flex-end",
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: "row",
    gap: 12,
  },
  metaCard: {
    flex: 1,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: 2,
  },
  metaValue: {
    fontSize: 12,
    color: colors.textMuted,
  },
  metaHint: {
    fontSize: 11,
    color: colors.brandGreenDark,
    fontWeight: "600",
  },
  metaLinkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginTop: 2,
  },
  metaLink: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.brandGreenDark,
  },
  tipsCard: {
    flexDirection: "row",
    gap: 10,
    backgroundColor: colors.tipsBg,
    borderRadius: 12,
    padding: 12,
  },
  tipsIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  tipsTextWrap: {
    flex: 1,
    gap: 6,
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    color: colors.textPrimary,
  },
  submitButton: {
    backgroundColor: colors.brandGreen,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: colors.textOnDark,
    fontSize: 15,
    fontWeight: "700",
  },
  uploadErrorText: {
    fontSize: 12.5,
    color: "#DC2626",
    marginTop: -8,
  },
});
