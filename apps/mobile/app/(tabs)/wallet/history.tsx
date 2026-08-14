import { useRouter } from "expo-router";

import { WalletScreen } from "@/features/rewards/WalletScreen";

export default function WalletHistoryRoute() {
  const router = useRouter();

  return <WalletScreen onBack={() => router.back()} />;
}
