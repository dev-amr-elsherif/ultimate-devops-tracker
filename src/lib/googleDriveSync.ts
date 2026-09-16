/**
 * Google Drive Cloud Sync Utility using Google Identity Services (GIS)
 * and Google Drive v3 REST API (appDataFolder).
 * 
 * Scope: https://www.googleapis.com/auth/drive.appdata (Minimal, hidden app storage)
 * Target: devops-command-telemetry.json
 */

import { FullRoadmapArchive } from "@/lib/snapshotEngine";

export type DriveSyncPayload = FullRoadmapArchive | Record<string, any>;

export const DRIVE_FILE_NAME = "devops-command-telemetry.json";
export const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.appdata";
export const SESSION_TOKEN_KEY = "devops_drive_token";
export const SESSION_USER_KEY = "devops_drive_user";

export interface DriveUser {
  email?: string;
  name?: string;
  picture?: string;
}

export type DriveSyncStatus = "disconnected" | "connecting" | "synced" | "syncing" | "error";

interface TokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
  error?: string;
  error_description?: string;
}

interface TokenClient {
  requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
}

interface GoogleOAuth2 {
  initTokenClient: (config: {
    client_id: string;
    scope: string;
    callback: (response: TokenResponse) => void;
    error_callback?: (error: unknown) => void;
  }) => TokenClient;
  revoke?: (token: string, done?: () => void) => void;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: GoogleOAuth2;
      };
    };
  }
}

/**
 * Dynamically loads the Google Identity Services (GIS) script
 */
export function loadGsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      return resolve();
    }

    if (window.google?.accounts?.oauth2) {
      return resolve();
    }

    const existingScript = document.getElementById("google-gis-script");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve());
      existingScript.addEventListener("error", () =>
        reject(new Error("Failed to load Google Identity Services."))
      );
      return;
    }

    const script = document.createElement("script");
    script.id = "google-gis-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Identity Services."));
    document.head.appendChild(script);
  });
}

/**
 * Initiates the Google OAuth popup to grant drive.appdata access
 */
export async function initiateGoogleAuth(clientId: string): Promise<{
  accessToken: string;
  user: DriveUser | null;
}> {
  await loadGsiScript();

  if (!window.google?.accounts?.oauth2) {
    throw new Error("Google Identity Services not initialized.");
  }

  return new Promise((resolve, reject) => {
    try {
      const client = window.google!.accounts!.oauth2!.initTokenClient({
        client_id: clientId,
        scope: DRIVE_SCOPE,
        callback: async (response: TokenResponse) => {
          if (response.error) {
            return reject(new Error(response.error_description || response.error));
          }

          if (!response.access_token) {
            return reject(new Error("No access token returned by Google OAuth."));
          }

          const accessToken = response.access_token;
          let user: DriveUser | null = null;
          try {
            user = await fetchDriveUserInfo(accessToken);
          } catch {
            // Non-fatal if user info fetch fails
          }

          resolve({ accessToken, user });
        },
        error_callback: (err: unknown) => {
          reject(err instanceof Error ? err : new Error("Google authentication failed."));
        },
      });

      client.requestAccessToken({ prompt: "consent" });
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Fetches the authenticated user profile using Drive about.get
 */
export async function fetchDriveUserInfo(accessToken: string): Promise<DriveUser | null> {
  try {
    const res = await fetch("https://www.googleapis.com/drive/v3/about?fields=user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return {
      name: data.user?.displayName,
      email: data.user?.emailAddress,
      picture: data.user?.photoLink,
    };
  } catch {
    return null;
  }
}

/**
 * Searches appDataFolder for devops-command-telemetry.json and returns its contents
 */
export async function pullFromDrive(accessToken: string): Promise<DriveSyncPayload | null> {
  const query = encodeURIComponent(`name = '${DRIVE_FILE_NAME}' and trashed = false`);
  const searchUrl = `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${query}&fields=files(id,name,modifiedTime)`;

  const listRes = await fetch(searchUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!listRes.ok) {
    if (listRes.status === 401) {
      throw new Error("UNAUTHORIZED");
    }
    throw new Error(`Failed to query Google Drive appDataFolder (HTTP ${listRes.status})`);
  }

  const listData = await listRes.json();
  const files = listData.files;

  if (!files || files.length === 0) {
    return null;
  }

  const fileId = files[0].id;
  const contentRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!contentRes.ok) {
    throw new Error(`Failed to download telemetry file from Google Drive (HTTP ${contentRes.status})`);
  }

  const payload: DriveSyncPayload = await contentRes.json();
  return payload;
}

/**
 * Creates or updates devops-command-telemetry.json in appDataFolder
 */
export async function pushToDrive(
  accessToken: string,
  payload: DriveSyncPayload
): Promise<void> {
  const query = encodeURIComponent(`name = '${DRIVE_FILE_NAME}' and trashed = false`);
  const searchUrl = `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${query}&fields=files(id)`;

  const listRes = await fetch(searchUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!listRes.ok) {
    if (listRes.status === 401) {
      throw new Error("UNAUTHORIZED");
    }
    throw new Error(`Failed to check Drive telemetry file (HTTP ${listRes.status})`);
  }

  const listData = await listRes.json();
  const existingFile = listData.files?.[0];
  const payloadStr = JSON.stringify(payload, null, 2);

  if (existingFile && existingFile.id) {
    // Update existing file content
    const patchRes = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=media`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: payloadStr,
      }
    );

    if (!patchRes.ok) {
      throw new Error(`Failed to update Drive file content (HTTP ${patchRes.status})`);
    }
  } else {
    // 1. Create file with metadata in appDataFolder
    const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: DRIVE_FILE_NAME,
        parents: ["appDataFolder"],
      }),
    });

    if (!createRes.ok) {
      throw new Error(`Failed to create telemetry metadata in Drive (HTTP ${createRes.status})`);
    }

    const created = await createRes.json();
    const newFileId = created.id;

    // 2. Upload file content
    const uploadRes = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${newFileId}?uploadType=media`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: payloadStr,
      }
    );

    if (!uploadRes.ok) {
      throw new Error(`Failed to upload telemetry content to Drive (HTTP ${uploadRes.status})`);
    }
  }
}

/**
 * Revokes the Google OAuth access token if possible and clears session cache
 */
export function disconnectDrive(accessToken?: string): void {
  if (accessToken && window.google?.accounts?.oauth2?.revoke) {
    try {
      window.google.accounts.oauth2.revoke(accessToken, () => {});
    } catch {
      // Ignore revocation error
    }
  }

  try {
    sessionStorage.removeItem(SESSION_TOKEN_KEY);
    sessionStorage.removeItem(SESSION_USER_KEY);
  } catch {
    // Ignore storage error
  }
}
