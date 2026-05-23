"use client";

import {
    Calendar,
    Copy,
    Download,
    ExternalLink,
    HardDrive,
    Info,
    Maximize2,
    Trash2,
    Type,
    X,
} from "lucide-react";
import { FaFileAudio, FaFileCode, FaFilePdf, FaRegFile } from "react-icons/fa";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { FileItem } from "@/lib/types";
import { FilePreview } from "@/components/file-preview";
import { useState } from "react";

interface FileDetailProps {
    file: FileItem | null;
    onClose: () => void;
    onDelete: (key: string) => void;
    onDownload: (url: string) => void;
    onCopyLink: (url: string) => void;
}

const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const getFileCategory = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext || "")) return "image";
    if (["mp4", "webm", "mov", "avi", "mkv"].includes(ext || "")) return "video";
    if (["mp3", "wav", "ogg", "m4a"].includes(ext || "")) return "audio";
    if (["pdf"].includes(ext || "")) return "pdf";
    if (["txt", "md", "json", "js", "ts", "tsx", "css", "html", "xml", "log", "env", "csv"].includes(ext || ""))
        return "code";
    return "other";
};

export function FileDetail({ file, onClose, onDelete, onDownload, onCopyLink }: FileDetailProps) {
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const isOpen = !!file;
    const category = file ? getFileCategory(file.name) : null;

    return (
        <>
            <div
                className={cn(
                    "fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300",
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
                )}
                onClick={onClose}
            />

            <aside
                className={cn(
                    "fixed top-0 right-0 z-50 h-full w-[350px] max-w-full bg-background shadow-2xl transition-transform duration-300 ease-in-out flex flex-col border-l",
                    isOpen ? "translate-x-0" : "translate-x-full",
                )}
            >
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Info className="h-4 w-4" /> Details
                    </h3>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {file && (
                    <ScrollArea className="flex-1">
                        <div className="p-4 space-y-6">
                            <div className="aspect-video rounded-lg bg-muted flex items-center justify-center overflow-hidden border">
                                {category === "image" && (
                                    <Image
                                        src={file.url}
                                        alt={file.name}
                                        width={320}
                                        height={180}
                                        className="w-full h-full object-cover"
                                        unoptimized
                                    />
                                )}
                                {category === "video" && (
                                    <video src={file.url} className="w-full h-full object-cover" />
                                )}
                                {category === "audio" && (
                                    <FaFileAudio className="h-12 w-12 text-muted-foreground opacity-20" />
                                )}
                                {category === "pdf" && (
                                    <FaFilePdf className="h-12 w-12 text-muted-foreground opacity-20" />
                                )}
                                {category === "code" && (
                                    <FaFileCode className="h-12 w-12 text-muted-foreground opacity-20" />
                                )}
                                {category === "other" && (
                                    <FaRegFile className="h-12 w-12 text-muted-foreground opacity-20" />
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground">
                                        Name
                                    </h4>
                                    <p className="text-sm font-semibold break-all leading-tight">
                                        {file.name}
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 uppercase tracking-wider">
                                        <HardDrive className="h-3 w-3" /> Size
                                    </h4>
                                    <p className="text-sm font-semibold">{formatSize(file.size)}</p>
                                </div>

                                <div>
                                    <h4 className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 uppercase tracking-wider">
                                        <Type className="h-3 w-3" /> Type
                                    </h4>
                                    <p className="text-sm font-semibold">
                                        {file.name.split(".").pop() || "file"}
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 uppercase tracking-wider">
                                        <Calendar className="h-3 w-3" /> Last Modified
                                    </h4>
                                    <p className="text-sm font-semibold">
                                        {new Date(file.lastModified).toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-2 pb-6">
                                <Button
                                    className="w-full justify-start gap-3 h-10"
                                    variant="outline"
                                    onClick={() => setIsPreviewOpen(true)}
                                >
                                    <Maximize2 className="h-4 w-4" /> Open
                                </Button>
                                <Button
                                    className="w-full justify-start gap-3 h-10"
                                    variant="outline"
                                    onClick={() => onCopyLink(file.displayUrl || file.url)}
                                >
                                    <Copy className="h-4 w-4" /> Copy Direct Link
                                </Button>
                                <Button
                                    className="w-full justify-start gap-3 h-10"
                                    variant="outline"
                                    onClick={() => onDownload(file.displayUrl || file.url)}
                                >
                                    <Download className="h-4 w-4" /> Download File
                                </Button>
                                <Button
                                    className="w-full justify-start gap-3 h-10"
                                    variant="outline"
                                    onClick={() =>
                                        window.open(
                                            file.displayUrl || file.url,
                                            "_blank",
                                            "noopener,noreferrer",
                                        )
                                    }
                                >
                                    <ExternalLink className="h-4 w-4" /> Open in New Tab
                                </Button>
                                <Button
                                    className="w-full justify-start gap-3 h-10 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                                    variant="ghost"
                                    onClick={() => onDelete(file.key)}
                                >
                                    <Trash2 className="h-4 w-4" /> Delete File
                                </Button>
                            </div>
                        </div>
                    </ScrollArea>
                )}
            </aside>

            <FilePreview
                file={file}
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
            />
        </>
    );
}
