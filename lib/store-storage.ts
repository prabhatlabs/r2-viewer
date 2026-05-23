import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { StorageResponse, FileItem } from "@/lib/types";
import { api } from "@/lib/api";

interface CacheEntry {
    data: StorageResponse;
    timestamp: number;
}

interface StorageState {
    cache: Record<string, CacheEntry>;
    useCache: boolean;
    setUseCache: (useCache: boolean) => void;
    foldersTree: string[];
    fetchFoldersTree: (force?: boolean) => Promise<void>;
    fetchFiles: (prefix: string, force?: boolean) => Promise<StorageResponse | null>;
    updateFiles: (prefix: string, updater: (prev: StorageResponse) => StorageResponse) => void;
    invalidateCache: (prefix?: string) => void;
}

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export const useStorageStore = create<StorageState>()(
    persist(
        (set, get) => ({
            cache: {},
            useCache: true,
            setUseCache: (useCache) => set({ useCache }),
            foldersTree: [],
            fetchFoldersTree: async (force = false) => {
                if (!force && get().foldersTree.length > 0) return;

                try {
                    const response = await api.get(`/api/storage?includeAllStats=true`);
                    const allFiles = response.data.allFiles || [];
                    const uniqueFolders = new Set<string>();

                    allFiles.forEach((file: FileItem) => {
                        const parts = file.key.split("/");
                        parts.pop(); // Remove file name
                        let current = "";
                        parts.forEach((part: string) => {
                            current = current ? `${current}/${part}/` : `${part}/`;
                            uniqueFolders.add(current);
                        });
                    });

                    const foldersTree = Array.from(uniqueFolders).sort();
                    set({ foldersTree });
                } catch (error) {
                    console.error("Failed to fetch folders tree:", error);
                }
            },
            fetchFiles: async (prefix: string, force: boolean = false) => {
                const now = Date.now();
                const cached = get().cache[prefix];

                if (!force && get().useCache && cached && now - cached.timestamp < CACHE_DURATION) {
                    return cached.data;
                }

                try {
                    const response = await api.get<StorageResponse>(`/api/storage?prefix=${encodeURIComponent(prefix)}`);
                    const data = response.data;

                    if (get().useCache) {
                        set((state) => ({
                            cache: {
                                ...state.cache,
                                [prefix]: { data, timestamp: now },
                            },
                        }));
                    }
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
