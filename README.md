# Baby Care - Mobile App

React Native (Expo) mobile app for Baby Care, a smart baby monitoring system with live camera streaming, real-time motion/cry detection, sleep tracking, environmental sensors, dark mode, and English/Nepali language support.

Backend repo: https://github.com/PrakashGrg/Baby-care
Live backend: https://baby-care-8ewi.onrender.com

## Tech Stack

- Expo SDK 54 + React Native + TypeScript
- React Navigation (native stack + bottom tabs)
- Axios with JWT auto-refresh interceptors
- expo-camera, expo-av - live video/audio capture
- expo-linear-gradient, @expo/vector-icons (Ionicons) - UI
- expo-secure-store - secure token storage
- @react-native-async-storage/async-storage - theme/language/notification preferences

## Features

- JWT authentication (login, register, auto token refresh)
- Home dashboard with live motion/cry counts and sleep status
- Live tab: camera preview, WebSocket connection, real-time motion/cry alerts, live sensor readings
- Child Mode: turns the device into the camera watching the baby (front/back camera toggle)
- Sleep tracking: current status, today's duration, transition timeline
- Insights: unified chronological event feed
- Settings: Baby Profile (CRUD), Devices, Notifications preferences, Privacy, Dark Mode, Language (English/Nepali), Help and Support, About
- Full app-wide dark mode and English/Nepali translation via React Context

## Project Structure

    src/
      api/           Axios client (JWT refresh), WebSocket connection helper
      context/       AuthContext, ThemeContext, LanguageContext
      navigation/    Stack + bottom tab navigators
      screens/       All app screens
      translations.ts  English/Nepali string dictionary
      theme.ts       Design tokens: colors (light/dark), gradients, spacing, typography

## Local Setup

    git clone https://github.com/PrakashGrg/baby.git
    cd baby
    npm install

Update the backend URL in src/api/client.ts and src/api/websocket.ts if running against a local backend instead of the live Render deployment:

    const BASE_URL = 'https://baby-care-8ewi.onrender.com/api';
    const WS_BASE_URL = 'wss://baby-care-8ewi.onrender.com';

    npx expo start

Scan the QR code with Expo Go (Android/iOS).

## Known Limitations

- Remote push notifications are not available when running through Expo Go - this was removed for Android in Expo SDK 53. A development build (EAS Build) would be required to enable this; the app registers push tokens and is otherwise fully wired for it.
- Live camera and Child Mode both point to a single hardcoded room (room1) - multi-room/multi-camera support is not yet implemented.
- Camera-based motion detection quality depends on lighting and device camera quality.

## Author

Prakash Gurung
Final Year Project - Baby Care Smart Monitoring System