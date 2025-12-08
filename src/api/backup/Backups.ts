// import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// export interface BackupMeta {
//   comments?: string | null;
//   created_by?: number | null;
//   created_at?: string | null;
//   uploaded_by?: number | null;
//   uploaded_at?: string | null;
// }

// export interface BackupEntry {
//   name: string;
//   path: string;
//   size: number;
//   created_at: string;
//   meta?: BackupMeta;
// }

// let api: AxiosInstance;

// function createInstance(baseURL?: string) {
//   api = axios.create({
//     baseURL: baseURL ?? (process.env.REACT_APP_API_URL || '/api'),
//     headers: {
//       'Accept': 'application/json',
//     },
//     withCredentials: false,
//   });
// }

// createInstance();

// export function setApiBaseUrl(url: string) {
//   createInstance(url);
// }

// export function setAuthToken(token?: string | null) {
//   if (!api) createInstance();
//   if (token) {
//     api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//   } else {
//     delete api.defaults.headers.common['Authorization'];
//   }
// }

// export async function listBackups(): Promise<BackupEntry[]> {
//   const res = await api.get<BackupEntry[]>('/backups');
//   return res.data;
// }

// export async function createBackup(options: { compression?: 'No' | 'gzip' | 'zip'; comments?: string }, config?: AxiosRequestConfig) {
//   const body = {
//     compression: options.compression ?? 'No',
//     comments: options.comments ?? '',
//   };
//   const res = await api.post('/backups', body, config);
//   return res.data;
// }

// export async function downloadBackup(filename: string) {
//   const res = await api.get(`/backups/download/${encodeURIComponent(filename)}`, { responseType: 'blob' });
//   return res.data as Blob;
// }

// export function downloadBlob(blob: Blob, filename: string) {
//   const url = window.URL.createObjectURL(blob);
//   const link = document.createElement('a');
//   link.href = url;
//   link.setAttribute('download', filename);
//   document.body.appendChild(link);
//   link.click();
//   link.remove();
//   window.URL.revokeObjectURL(url);
// }

// export async function deleteBackup(filename: string) {
//   const res = await api.delete(`/backups/${encodeURIComponent(filename)}`);
//   return res.data;
// }

// export async function uploadBackup(file: File, onProgress?: (ev: ProgressEvent) => void) {
//   const fd = new FormData();
//   fd.append('file', file, file.name);
//   const res = await api.post('/backups/upload', fd, {
//     headers: { 'Content-Type': 'multipart/form-data' },
//     onUploadProgress: onProgress,
//   });
//   return res.data;
// }

// export async function restoreBackupByFilename(filename: string) {
//   const res = await api.post('/backups/restore', { filename });
//   return res.data;
// }

// export async function restoreBackupFromFile(file: File, onProgress?: (ev: ProgressEvent) => void) {
//   const fd = new FormData();
//   fd.append('file', file, file.name);
//   const res = await api.post('/backups/restore', fd, {
//     headers: { 'Content-Type': 'multipart/form-data' },
//     onUploadProgress: onProgress,
//   });
//   return res.data;
// }

// export default {
//   setAuthToken,
//   setApiBaseUrl,
//   listBackups,
//   createBackup,
//   downloadBackup,
//   downloadBlob,
//   deleteBackup,
//   uploadBackup,
//   restoreBackupByFilename,
//   restoreBackupFromFile,
// };
