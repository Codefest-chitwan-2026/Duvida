import { useRouter } from "expo-router";

import { ProfileScreen } from "@/features/profile/ProfileScreen";
import { useAuth } from "@/lib/auth";

export default function ProfileRoute() {
  const router = useRouter();
  const { signOut } = useAuth();

  return (
    <ProfileScreen
      onEditProfile={() => router.push("/profile/edit")}
      onImpact={() => router.push("/profile/impact")}
      onSettings={() => router.push("/profile/settings")}
      onLogout={signOut}
    />
  );
}
