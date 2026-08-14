import { StyleSheet, Text, View } from "react-native";

import { IssueMarker } from "@/components/IssueMarker";
import { PlayerMarker } from "@/components/PlayerMarker";
import { colors } from "@/theme/colors";
import { mockIssues } from "@/features/map/mockIssues";

type HomeMapFallbackProps = {
  onIssuePress?: (issueId: string) => void;
};

/**
 * Rendered instead of Mapbox.MapView when EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN
 * isn't set yet (and @rnmapbox/maps needs a custom dev client to run at
 * all). Approximates marker positions from the same offsets used on the
 * live map so the screen still previews the full layout.
 */
export function HomeMapFallback({ onIssuePress }: HomeMapFallbackProps) {
  return (
    <View style={styles.container}>
      <View style={styles.notice}>
        <Text style={styles.noticeText}>
          Map preview — add EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN and run a dev client build to load
          the live Mapbox map.
        </Text>
      </View>

      {mockIssues.map((issue) => {
        const left = 50 + issue.offset.lng * 6000;
        const top = 50 - issue.offset.lat * 9000;
        return (
          <View
            key={issue.id}
            style={[styles.markerSlot, { left: `${left}%`, top: `${top}%` }]}
          >
            <IssueMarker issue={issue} onPress={() => onIssuePress?.(issue.id)} />
          </View>
        );
      })}

      <View style={styles.player}>
        <PlayerMarker />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.background,
    overflow: "hidden",
  },
  notice: {
    position: "absolute",
    top: "42%",
    left: 24,
    right: 24,
    alignItems: "center",
  },
  noticeText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    textAlign: "center",
  },
  markerSlot: {
    position: "absolute",
    transform: [{ translateX: -50 }, { translateY: -50 }],
  },
  player: {
    position: "absolute",
    left: "50%",
    top: "72%",
    transform: [{ translateX: -32 }, { translateY: -32 }],
  },
});
