import axios from 'axios';
import { unwrapBackendResponse } from '@/utils/apiUtils';

export interface HomeInfo {
  title: string;
  description: string;
  version: string;
  serverTime: string;
  environment: string;
  activeUsers: number;
  status: string;
}

const API_BASE_URL = (import.meta.env as any)?.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const HOME_INFO_TTL_MS = 30_000;
let homeInfoCache: { value: HomeInfo; ts: number } | null = null;
let homeInfoInFlight: Promise<HomeInfo> | null = null;

export async function getHomeInfoAPI(): Promise<HomeInfo> {
  const now = Date.now();
  if (homeInfoCache && now - homeInfoCache.ts < HOME_INFO_TTL_MS) {
    return homeInfoCache.value;
  }

  if (homeInfoInFlight) return homeInfoInFlight;

  homeInfoInFlight = (async () => {
    const resp = await apiClient.get('/home');
    const data = unwrapBackendResponse<HomeInfo>(resp.data);
    homeInfoCache = { value: data, ts: Date.now() };
    return data;
  })().finally(() => {
    homeInfoInFlight = null;
  });

  return homeInfoInFlight;
}

export async function getHomeDetailAPI(): Promise<HomeInfo> {
  const resp = await apiClient.get('/home/detail');
  return unwrapBackendResponse<HomeInfo>(resp.data);
}

export async function pingAPI(): Promise<string> {
  const resp = await apiClient.get('/ping');
  return unwrapBackendResponse<string>(resp.data);
}

export async function healthAPI(): Promise<HomeInfo> {
  const resp = await apiClient.get('/health');
  return unwrapBackendResponse<HomeInfo>(resp.data);
}
