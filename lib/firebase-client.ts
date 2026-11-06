"use client";

import { getApp, getApps, initializeApp } from "@firebase/app";
import { getAuth } from "@firebase/auth";

const requiredConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (Object.values(requiredConfig).some((value) => !value)) {
  throw new Error(
    "Firebase is not configured. Set the NEXT_PUBLIC_FIREBASE_* environment variables.",
  );
}

export const firebaseAuth = getAuth(
  getApps().length
    ? getApp()
    : initializeApp({
        apiKey: requiredConfig.apiKey,
        authDomain: requiredConfig.authDomain,
        projectId: requiredConfig.projectId,
        appId: requiredConfig.appId,
      }),
);
