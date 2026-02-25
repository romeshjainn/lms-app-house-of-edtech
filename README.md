# LMS App – Expo (React Native)

A modern Learning Management System (LMS) mobile application built using Expo and React Native.
The app allows users to browse courses, enroll, track progress, and receive AI-powered recommendations.

---

## Description

This project is a production-ready mobile LMS application developed with Expo SDK 54 and React Native 0.81.5.

It includes:

* Recommended courses section
* Redux Toolkit state management
* Persistent storage using Redux Persist
* Secure token storage using Expo Secure Store
* Biometric authentication (Fingerprint / Face ID support)
* AI-powered recommendations (via OpenAI API)
* Push notifications using Expo Notifications
* Analytics integration for user activity tracking
* Modern UI built with NativeWind (Tailwind CSS for React Native)
* API integration using Axios

The project follows scalable architecture practices suitable for real-world mobile applications.

---

## Tech Stack

* Expo SDK 54
* React 19
* React Native 0.81.5
* Expo Router v6 (File-based routing)
* React Navigation v7
* Redux Toolkit
* Redux Persist
* Axios
* Formik + Yup
* NativeWind (Tailwind CSS)
* Expo Secure Store
* Expo Local Authentication
* Expo Notifications
* OpenAI API

---

## Installation

Clone the repository:

```bash
git clone https://github.com/romeshjainn/lms-app-house-of-edtech.git
cd lms-app-house-of-edtech
```

Install dependencies:

```bash
npm install
```

---

## Environment Variables

Create a `.env` file in the root directory:

```
EXPO_PUBLIC_API_BASE_URL=your_api_base_url_here
EXPO_PUBLIC_OPENAI_KEY=your_openai_api_key_here
```

### Environment Variables Explanation

* `EXPO_PUBLIC_API_BASE_URL` – Base URL of the backend API.
* `EXPO_PUBLIC_OPENAI_KEY` – OpenAI API key used for AI-based recommendations.

Important:

* Do not commit the `.env` file.
* Ensure `.env` is included in `.gitignore`.

After updating environment variables, restart the server:

```bash
npx expo start -c
```

---

## Running the App

Start development server:

```bash
npx expo start
```

Then:

* Press `a` to run on Android
* Press `i` to run on iOS
* Or scan the QR code using Expo Go

---

## Preview / Internal Build (EAS)

Install EAS CLI:

```bash
npm install -g eas-cli
eas login
```

Configure build (first time only):

```bash
eas build:configure
```

Run preview build:

```bash
eas build --profile preview --platform android
```

---

## Project Structure

```
├── .expo/                # Expo local configuration
├── .vscode/              # VSCode workspace settings
├── android/              # Native Android project (prebuild)
├── assets/               # Images, fonts, static assets
├── scripts/              # Utility and reset scripts
├── src/                  # Main application source code
│   ├── app/              # Expo Router entry & route definitions
│   ├── components/       # Reusable UI components
│   ├── constants/        # Global constants
│   ├── features/         # Redux slices / feature modules
│   ├── hooks/            # Custom React hooks
│   ├── navigation/       # Navigation configuration
│   ├── providers/        # Context providers (Theme, Auth, etc.)
│   ├── screens/          # Screen-level components
│   ├── services/         # API layer & integrations
│   ├── store/            # Redux store configuration
│   ├── theme/            # Design system & styling tokens
│   ├── types/            # TypeScript definitions
│   ├── utils/            # Helper utilities
│   └── web/              # Web-specific logic/config
├── node_modules/
└── package.json
```

---

## Features

* Secure authentication flow
* Persistent login state
* Course enrollment tracking
* Cource Caching
* App Analytics 
* Loading and empty state handling
* Error handling UI
* Biometric login support
* Clean and modern mobile UI
* AI-powered course recommendations

---

## Requirements

* Node.js 18+
* Expo CLI
* Android Studio (for Android builds)
* Xcode (for iOS builds – macOS only)

---

## Author

Romesh Jain   
Software Developer

LinkedIn: https://linkedin.com/in/romeshjain  
GitHub: https://github.com/romeshjainn
