import API from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import React, { createContext, useEffect, useState } from "react";

type AuthContextType = {
  user: any;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email:string,password:string)=> Promise<void>;
};

export const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);


  const isTokenValid = (token: string) => {
    try {
      const decoded: any = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  };


  useEffect(() => {
    const loadUser = async () => {
      const storedToken = await AsyncStorage.getItem("token");

      if (storedToken && isTokenValid(storedToken)) {
        setToken(storedToken);
        const decoded: any = jwtDecode(storedToken);
        setUser({ id: decoded.userId });
      } else {
        await AsyncStorage.removeItem("token");
      }

      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await API.post("/login", { email, password });
    const token = res.data.token;
    if (!token) {
    throw new Error("Token not received");
  }

    await AsyncStorage.setItem("token", token);
    setToken(token);
    const decoded: any = jwtDecode(token);
    setUser({ id: decoded.userId });
    console.log(token,decoded)
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const register = async (email: string, password: string) => {
  const res = await API.post("/register", { email, password });
  const token = res.data.token;
  if (!token) {
    throw new Error("Token not received");
  }
  await AsyncStorage.setItem("token", token);
  setToken(token);
  const decoded: any = jwtDecode(token);
  setUser({ id: decoded.userId });
 };
  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout,register}}
    >
      {children}
    </AuthContext.Provider>
  );
};