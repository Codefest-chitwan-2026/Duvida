import { useRouter } from "expo-router";

import { RegisterScreen } from "@/features/auth/RegisterScreen";
import { useAuth } from "@/lib/auth";

export default function Register() {
  const router = useRouter();
  const { signIn } = useAuth();

  return (
    <RegisterScreen
      onBack={() => router.back()}
      onRegister={signIn}
      onLogIn={() => router.push("/login")}
    />
  );
}
