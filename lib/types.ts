export interface FileItem {
    key: string;
    name: string;
    size: number;
    lastModified: number | string;
    url: string;
    displayUrl?: string;
    type?: string;
}

export interface FolderItem {
    name: string;
    displayName: string;
}

export interface StorageResponse {
    folders: FolderItem[];
    files: FileItem[];
}
