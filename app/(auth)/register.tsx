import InputField from "@/components/TextInput";
import API from "@/services/api";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  
const handleRegister = async () => {
  if (!email || !password) {
    Alert.alert("Error", "All fields required");
    return;
  }

  try {
    setLoading(true);

    await API.post("/auth/register", { email, password });

    Alert.alert("Success", "Account created!");

    router.replace("/login");

  } catch (err: any) {
    const message =
      err?.response?.data?.msg ||
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err.message ||
      "Something went wrong";

    Alert.alert("Error", message);
  } finally {
    setLoading(false);
  }
};

  return (
    <View style={{ padding: 20, flex: 1, justifyContent: "center" }}>
      <Text style={{ textAlign: "center", fontSize: 24, marginBottom: 20 }}>
        Sign Up
      </Text>

      <InputField
        label="Email"
        value={email}
        onChangeText={setEmail}
        placeholder="Enter email"
        keyboardType="email-address"
      />

      <InputField
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Enter password"
        secureTextEntry
        error={!password ? "Password required" : ""}
      />

      
      <TouchableOpacity
        onPress={handleRegister}
        style={{
          backgroundColor: "#28a745",
          padding: 15,
          borderRadius: 8,
          marginTop: 10,
          opacity: loading ? 0.7 : 1,
        }}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={{ color: "#fff", textAlign: "center" }}>
            Register
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
  onPress={() => router.push("/login")}
  style={{
    marginTop: 15,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#007c34",
    alignItems: "center",
  }}
>
  <Text style={{ color: "#00471a", fontWeight: "600" }}>
    Log In
  </Text>
</TouchableOpacity>
    </View>
  );
}