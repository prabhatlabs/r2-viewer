import axios from "axios";
import { useUIStore } from "@/lib/store";

export const api = axios.create();

api.interceptors.request.use((config) => {
  try {
    const { credentials } = useUIStore.getState();
    if (credentials.accountId) config.headers["x-r2-account-id"] = credentials.accountId;
    if (credentials.accessKeyId) config.headers["x-r2-access-key-id"] = credentials.accessKeyId;
    if (credentials.secretAccessKey) config.headers["x-r2-secret-access-key"] = credentials.secretAccessKey;
    if (credentials.bucketName) config.headers["x-r2-bucket-name"] = credentials.bucketName;
  } catch {}
  return config;
});
