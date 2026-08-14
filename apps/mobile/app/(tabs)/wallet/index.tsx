import { useRouter } from "expo-router";

import { RewardsScreen } from "@/features/rewards/RewardsScreen";

export default function RewardsRoute() {
  const router = useRouter();

  return <RewardsScreen onViewWallet={() => router.push("/wallet/history")} />;
}
