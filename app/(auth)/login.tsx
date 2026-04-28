import InputField from "@/components/TextInput";
import API from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { jwtDecode } from "jwt-decode";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Error", "All fields required");
      return;
    }
    try {
      setLoading(true);

      
      const res = await API.post("/auth/login", { email, password });

      const token = res.data.token;

      if (!token) {
        throw new Error("Token not received");
      }     
      await AsyncStorage.setItem("token", token); 
      const decoded: any = jwtDecode(token);
      console.log("User:", decoded.id);
      Alert.alert("Success", "Logged in!");   
      router.replace("/dashboard");
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20, flex: 1, justifyContent: "center" }}>
      <Text style={{ textAlign: "center", fontSize: 24, marginBottom: 20 }}>
        Log In
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
        onPress={handleSubmit}
        style={{
          backgroundColor: "#007bff",
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
            Login
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/register")}
        style={{
        marginTop: 15,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#007bff",
        alignItems: "center",
        }}  
      >
      <Text style={{ color: "#007bff", fontWeight: "600" }}>
        Sign up
      </Text>
      </TouchableOpacity>
    </View>
  );
}