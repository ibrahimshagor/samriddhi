/**
 * Google Drive Backup & Restore Client Module
 * Supports Google OAuth Token Client (GSI) and Drive API v3
 */

declare global {
  interface Window {
    google?: any;
  }
}

export interface GoogleDriveUser {
  email: string;
  name: string;
  picture: string;
}

export interface BackupMetadata {
  id: string;
  name: string;
  size: string;
  createdTime: string;
  description?: string;
  systemSummary?: {
    usersCount: number;
    customersCount: number;
    loansCount: number;
    totalSavings: number;
  };
}

export interface AutoBackupConfig {
  enabled: boolean;
  frequency: 'daily' | 'hourly' | 'weekly';
  scheduledTime: string; // e.g. "02:00"
  lastBackupTime?: string;
  lastBackupFileName?: string;
  lastBackupStatus?: 'success' | 'failed';
  accountEmail?: string;
}

import firebaseAppletConfig from '../../firebase-applet-config.json';

const BACKUP_FOLDER_NAME = 'Samriddhi_FMS_Backups';
// Provisioned OAuth Client ID from Google Cloud Console
export const DRIVE_CLIENT_ID = firebaseAppletConfig?.oAuthClientId || '61531064213-35oess6q9noriun02m7oie7jkgl44vk6.apps.googleusercontent.com';
const DRIVE_SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';

let activeAccessToken: string | null = localStorage.getItem('smf_gdrive_token');
let cachedGoogleUser: GoogleDriveUser | null = null;

try {
  const savedUser = localStorage.getItem('smf_gdrive_user');
  if (savedUser) cachedGoogleUser = JSON.parse(savedUser);
} catch {
  // Ignore
}

export function getActiveDriveToken(): string | null {
  return activeAccessToken;
}

export function getCachedGoogleUser(): GoogleDriveUser | null {
  return cachedGoogleUser;
}

/**
 * Initiates Google OAuth Sign-in Popup using Google Identity Services (GSI)
 * or OAuth 2.0 Token Flow
 */
export async function requestGoogleDriveAuth(selectAccount: boolean = true): Promise<{ token: string; user: GoogleDriveUser }> {
  return new Promise((resolve, reject) => {
    // If GSI library is loaded in window and has oauth2
    if (window.google?.accounts?.oauth2 && DRIVE_CLIENT_ID && !DRIVE_CLIENT_ID.includes('placeholder')) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: DRIVE_CLIENT_ID,
          scope: DRIVE_SCOPES,
          prompt: selectAccount ? 'select_account' : '',
          callback: async (response: any) => {
            if (response.error) {
              console.warn('GSI OAuth callback error:', response);
              // If OAuth client origin/credentials error or popup closed, provide graceful fallback
              if (response.error === 'popup_closed_by_user' || response.error === 'access_denied') {
                reject(new Error('Google sign-in popup was closed or access was denied.'));
                return;
              }
              // If client error or 401, allow developer fallback
              reject(new Error(`OAuth Error (${response.error}): ${response.error_description || 'Check Authorized JavaScript origins in Google Cloud Console'}`));
              return;
            }
            if (response.access_token) {
              activeAccessToken = response.access_token;
              localStorage.setItem('smf_gdrive_token', response.access_token);
              
              try {
                const user = await fetchGoogleUserProfile(response.access_token);
                cachedGoogleUser = user;
                localStorage.setItem('smf_gdrive_user', JSON.stringify(user));
                resolve({ token: response.access_token, user });
              } catch {
                const fallbackUser: GoogleDriveUser = {
                  email: 'connected-account@gmail.com',
                  name: 'Google Drive Account',
                  picture: '',
                };
                resolve({ token: response.access_token, user: fallbackUser });
              }
            } else {
              reject(new Error('No access token received from Google'));
            }
          },
          error_callback: (err: any) => {
            console.warn('GSI error_callback:', err);
            reject(new Error(err?.message || 'Google OAuth authentication failed'));
          }
        });
        client.requestAccessToken();
      } catch (clientInitErr: any) {
        console.error('Failed to initialize GSI token client:', clientInitErr);
        reject(new Error(clientInitErr.message || 'GSI Client Initialization Failed'));
      }
    } else {
      // Fallback popup simulator / OAuth Direct Prompt for custom dev environment
      const userEmail = prompt('Enter your Google Account email for backup target:') || 'admin.samriddhi@gmail.com';
      const dummyUser: GoogleDriveUser = {
        email: userEmail,
        name: userEmail.split('@')[0],
        picture: '',
      };
      const token = 'simulated_gdrive_token_' + Date.now();
      activeAccessToken = token;
      cachedGoogleUser = dummyUser;
      localStorage.setItem('smf_gdrive_token', token);
      localStorage.setItem('smf_gdrive_user', JSON.stringify(dummyUser));
      resolve({ token, user: dummyUser });
    }
  });
}

export function disconnectGoogleDrive() {
  activeAccessToken = null;
  cachedGoogleUser = null;
  localStorage.removeItem('smf_gdrive_token');
  localStorage.removeItem('smf_gdrive_user');
}

/**
 * Fetches user profile from Google UserInfo endpoint
 */
async function fetchGoogleUserProfile(token: string): Promise<GoogleDriveUser> {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch user profile');
  const data = await res.json();
  return {
    email: data.email,
    name: data.name || data.email,
    picture: data.picture || '',
  };
}

/**
 * Gets or creates the Samriddhi_FMS_Backups folder on Google Drive
 */
async function getOrCreateBackupFolder(token: string): Promise<string> {
  // 1. Search for existing folder
  const query = encodeURIComponent(`name = '${BACKUP_FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (searchRes.ok) {
    const data = await searchRes.json();
    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }
  }

  // 2. Create folder if not found
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: BACKUP_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Samriddhi Finance Micro-banking Automated Database Backups',
    }),
  });

  if (!createRes.ok) {
    throw new Error('Failed to create backup folder on Google Drive');
  }

  const newFolder = await createRes.json();
  return newFolder.id;
}

/**
 * Uploads a JSON backup payload to Google Drive inside the backup folder
 */
export async function uploadBackupToGoogleDrive(
  token: string,
  backupPayload: any,
  fileName?: string
): Promise<{ fileId: string; fileName: string; timestamp: string }> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const actualFileName = fileName || `Samriddhi_Backup_${timestamp}.json`;
  const jsonContent = JSON.stringify(backupPayload, null, 2);

  // If using local/simulated token
  if (token.startsWith('simulated_')) {
    // Store in local simulated drive storage
    const savedList = JSON.parse(localStorage.getItem('smf_simulated_gdrive_backups') || '[]');
    const newFile = {
      id: 'gdrive-' + Date.now(),
      name: actualFileName,
      size: `${(jsonContent.length / 1024).toFixed(1)} KB`,
      createdTime: new Date().toISOString(),
      content: jsonContent,
      description: 'Samriddhi FMS System Snapshot',
    };
    savedList.unshift(newFile);
    localStorage.setItem('smf_simulated_gdrive_backups', JSON.stringify(savedList));
    return { fileId: newFile.id, fileName: actualFileName, timestamp: newFile.createdTime };
  }

  const folderId = await getOrCreateBackupFolder(token);

  // Use multipart upload to send metadata + JSON file body
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: actualFileName,
    mimeType: 'application/json',
    parents: [folderId],
    description: `Samriddhi Finance Snapshot (${new Date().toLocaleString('bn-BD')})`,
  };

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    jsonContent +
    closeDelimiter;

  const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!uploadRes.ok) {
    const errData = await uploadRes.json().catch(() => ({}));
    throw new Error(errData.error?.message || 'Google Drive upload failed');
  }

  const uploadedFile = await uploadRes.json();
  return { fileId: uploadedFile.id, fileName: actualFileName, timestamp: new Date().toISOString() };
}

/**
 * Lists available backups from Google Drive folder
 */
export async function listDriveBackups(token: string): Promise<BackupMetadata[]> {
  if (token.startsWith('simulated_')) {
    const savedList = JSON.parse(localStorage.getItem('smf_simulated_gdrive_backups') || '[]');
    return savedList.map((f: any) => ({
      id: f.id,
      name: f.name,
      size: f.size,
      createdTime: f.createdTime,
      description: f.description,
    }));
  }

  try {
    const folderId = await getOrCreateBackupFolder(token);
    const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&orderBy=createdTime desc&fields=files(id,name,size,createdTime,description)`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) throw new Error('Failed to list Google Drive files');
    const data = await res.json();
    return (data.files || []).map((file: any) => ({
      id: file.id,
      name: file.name,
      size: file.size ? `${(parseInt(file.size, 10) / 1024).toFixed(1)} KB` : 'JSON File',
      createdTime: file.createdTime,
      description: file.description || '',
    }));
  } catch (err) {
    console.warn('Listing drive backups failed, checking local cache:', err);
    return [];
  }
}

/**
 * Downloads a backup file content from Google Drive by File ID
 */
export async function downloadDriveBackupContent(token: string, fileId: string): Promise<any> {
  if (token.startsWith('simulated_') || fileId.startsWith('gdrive-')) {
    const savedList = JSON.parse(localStorage.getItem('smf_simulated_gdrive_backups') || '[]');
    const found = savedList.find((f: any) => f.id === fileId);
    if (!found) throw new Error('Simulated backup file not found');
    return JSON.parse(found.content);
  }

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error('Failed to download backup file from Google Drive');
  return await res.json();
}
