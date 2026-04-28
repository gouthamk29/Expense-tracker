# 📱 Expense Tracker / Auth App (React Native + Expo)

A simple mobile application built with **React Native (Expo)** that includes authentication using JWT, API integration, and AsyncStorage for token persistence.

---

## 🚀 Features

- 🔐 User Login & Registration
- 🧠 JWT Authentication
- 💾 Persistent login using AsyncStorage
- 🌐 API integration using Axios
- 📱 React Native (Expo Router navigation)
- ⚡ Loading states & error handling
- 🔁 Auto navigation after login

---

## 🛠️ Tech Stack

- React Native (Expo)
- Expo Router
- Axios
- AsyncStorage
- JWT Decode
- Node.js Backend (Express)
- MongoDB (assumed backend)

## ⚙️ Installation

### 1. Clone the repo
```bash
git clone https://github.com/gouthamk29/Expense-tracker.git
```

2. Install dependencies
```bash
npm install
```

3.Environment Setup

Create an .env fileneeded:
```
API_URL=[backend api url] 
```
4. Start the app
```bash
npm start
```

🔑 Authentication Flow
User enters email & password
Backend validates credentials
JWT token is returned
Token stored in AsyncStorage
Token decoded using jwt-decode
User redirected to /dashboard

📦 Dependencies
expo-router
axios
@react-native-async-storage/async-storage
jwt-decode
react-native
expo

🖥️ Backend Requirement
Ensure backend is running 
CORS must be enabled for mobile access.


👨‍💻 Author
Goutham

📄 License
This project is open-source and free to use.
