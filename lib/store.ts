import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface R2Credentials {
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
    customDomain: string;
}

interface UIState {
    viewMode: "grid" | "list";
    setViewMode: (mode: "grid" | "list") => void;
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    credentials: R2Credentials;
    setCredentials: (creds: Partial<R2Credentials>) => void;
    _hasHydrated: boolean;
    setHasHydrated: (state: boolean) => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            viewMode: "grid",
            setViewMode: (mode) => set({ viewMode: mode }),
            sidebarOpen: true,
            setSidebarOpen: (open) => set({ sidebarOpen: open }),
            credentials: {
                accountId: "",
                accessKeyId: "",
                secretAccessKey: "",
                bucketName: "",
                customDomain: "",
            },
            setCredentials: (creds) =>
                set((state) => ({
                    credentials: { ...state.credentials, ...creds },
                })),
            _hasHydrated: false,
            setHasHydrated: (state) => set({ _hasHydrated: state }),
        }),
        {
            name: "ui-storage",
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        },
    ),
);
