import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { StorageResponse, FileItem } from "@/lib/types";

interface CacheEntry {
    data: StorageResponse;
    timestamp: number;
}

interface StorageState {
    cache: Record<string, CacheEntry>;
    fetchFiles: (prefix: string, force?: boolean) => Promise<StorageResponse | null>;
    updateFiles: (prefix: string, updater: (prev: StorageResponse) => StorageResponse) => void;
    invalidateCache: (prefix?: string) => void;
}

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export const useStorageStore = create<StorageState>()(
    persist(
        (set, get) => ({
            cache: {},
            fetchFiles: async (prefix: string, force: boolean = false) => {
                const now = Date.now();
                const cached = get().cache[prefix];

                if (!force && cached && now - cached.timestamp < CACHE_DURATION) {
                    return cached.data;
                }

                try {
                    const response = await fetch(`/api/storage?prefix=${encodeURIComponent(prefix)}`);
                    if (!response.ok) throw new Error("Failed to fetch");
                    const data: StorageResponse = await response.json();

                    set((state) => ({
                        cache: {
                            ...state.cache,
                            [prefix]: { data, timestamp: now },
                        },
                    }));
                    return data;
                } catch (error) {
                    console.error("Storage fetch error:", error);
                    return null;
                }
            },
            updateFiles: (prefix, updater) => {
                set((state) => {
                    const cached = state.cache[prefix];
                    if (!cached) return state;
                    return {
                        cache: {
                            ...state.cache,
                            [prefix]: {
                                ...cached,
                                data: updater(cached.data),
                            },
                        },
                    };
                });
            },
            invalidateCache: (prefix) => {
                if (prefix) {
                    set((state) => {
                        const newCache = { ...state.cache };
                        delete newCache[prefix];
                        return { cache: newCache };
                    });
                } else {
                    set({ cache: {} });
                }
            },
        }),
        {
            name: "storage-cache",
            storage: createJSONStorage(() => localStorage),
        },
    ),
);
