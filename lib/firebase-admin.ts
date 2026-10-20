import "server-only";

import { cert, getApps, initializeApp, type ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

function getFirebaseAdminApp() {
  const existingApp = getApps().find((app) => app.name === "aurja-admin");
  if (existingApp) {
    return existingApp;
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!serviceAccountJson) {
    throw new Error(
      "Missing Firebase Admin configuration. Set FIREBASE_SERVICE_ACCOUNT_JSON.",
    );
  }

  let serviceAccount: ServiceAccount;
  try {
    const parsed: unknown = JSON.parse(serviceAccountJson);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !("project_id" in parsed) ||
      typeof parsed.project_id !== "string" ||
      !("client_email" in parsed) ||
      typeof parsed.client_email !== "string" ||
      !("private_key" in parsed) ||
      typeof parsed.private_key !== "string"
    ) {
      throw new Error("Invalid service-account fields.");
    }
    serviceAccount = {
      projectId: parsed.project_id,
      clientEmail: parsed.client_email,
      privateKey: parsed.private_key,
    };
  } catch {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_JSON must contain valid Firebase service-account JSON.",
    );
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId || serviceAccount.projectId !== projectId) {
    throw new Error(
      "Firebase Admin credentials must match NEXT_PUBLIC_FIREBASE_PROJECT_ID.",
    );
  }

  return initializeApp(
    { credential: cert(serviceAccount), projectId },
    "aurja-admin",
  );
}

export function getFirebaseAdminAuth() {
  return getAuth(getFirebaseAdminApp());
}

export function getFirebaseAdminFirestore() {
  return getFirestore(getFirebaseAdminApp());
}
