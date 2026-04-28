import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const baseURL = process.env.EXPO_PUBLIC_API_URL;
console.log(baseURL)

const API = axios.create({
   baseURL: baseURL, 
});

API.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

API.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await AsyncStorage.removeItem("token");
    }
    return Promise.reject(err);
  }
);

export default API;