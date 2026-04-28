import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  const loadToken = async () => {
    const t = await AsyncStorage.getItem("token");
    setToken(t);
    setLoading(false);
  };

  useEffect(() => {
    loadToken();
  }, []);

  useEffect(() => {
    loadToken();
  }, [segments]);

  useEffect(() => {
    if (loading) return;

    const inAuth = segments[0] === "(auth)";

    if (!token && !inAuth) {
      router.replace("/(auth)/login");
    }

    if (token && inAuth) {
      router.replace("/(app)/dashboard");
    }
  }, [token, segments, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}