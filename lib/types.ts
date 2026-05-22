export interface FileItem {
    key: string;
    name: string;
    size: number;
    lastModified: number;
    url: string;
    displayUrl?: string;
}

export interface FolderItem {
    name: string;
    displayName: string;
}

export interface StorageResponse {
    folders: FolderItem[];
    files: FileItem[];
}
