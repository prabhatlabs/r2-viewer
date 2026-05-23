"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import type { FileItem } from "@/lib/types";
import { Loader2 } from "lucide-react";

interface FilePreviewProps {
    file: FileItem | null;
    isOpen: boolean;
    onClose: () => void;
}

const getFileCategory = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext || "")) return "image";
    if (["mp4", "webm", "mov", "avi", "mkv"].includes(ext || "")) return "video";
    if (["txt", "md", "json", "js", "ts", "tsx", "css", "html", "xml", "log", "env", "csv", "yml", "yaml", "sh", "py"].includes(ext || ""))
        return "text";
    return "other";
};

export function FilePreview({ file, isOpen, onClose }: FilePreviewProps) {
    const [textContent, setTextContent] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const category = file ? getFileCategory(file.name) : null;

    useEffect(() => {
        if (file && category === "text" && isOpen) {
            setLoading(true);
            setError(null);
            fetch(file.url)
                .then((res) => {
                    if (!res.ok) throw new Error(`Failed to fetch content: ${res.statusText}`);
                    return res.text();
                })
                .then((text) => {
                    const ext = file.name.split(".").pop()?.toLowerCase();
                    if (ext === "json") {
                        try {
                            setTextContent(JSON.stringify(JSON.parse(text), null, 2));
                        } catch {
                            setTextContent(text);
                        }
                    } else {
                        setTextContent(text);
                    }
                    setLoading(false);
                })
                .catch((err) => {
                    console.error("Failed to fetch text content:", err);
                    setError(err.message || "Failed to load content.");
                    setLoading(false);
                });
        } else {
            setTextContent(null);
            setError(null);
        }
    }, [file, category, isOpen]);

    if (!file) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-5xl w-[95vw] h-[90vh] sm:max-w-5xl flex flex-col p-0 overflow-hidden gap-0">
                <DialogHeader className="p-4 border-b">
                    <DialogTitle className="truncate pr-8">{file.name}</DialogTitle>
                    <DialogDescription className="sr-only">
                        Preview of {file.name}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-hidden flex items-center justify-center bg-muted/20 relative">
                    {category === "image" && (
                        <div className="relative w-full h-full flex items-center justify-center">
                            <Image
                                src={file.url}
                                alt={file.name}
                                fill
                                className="object-contain"
                                unoptimized
                            />
                        </div>
                    )}
                    {category === "video" && (
                        <video
                            src={file.url}
                            controls
                            autoPlay
                            className="max-w-full max-h-full"
                        />
                    )}
                    {category === "text" && (
                        <div className="w-full h-full">
                            {loading ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                </div>
                            ) : error ? (
                                <div className="p-8 text-center text-destructive">
                                    <p>{error}</p>
                                </div>
                            ) : (
                                <ScrollArea className="h-full w-full">
                                    <pre className="p-6 text-sm font-mono whitespace-pre-wrap break-all">
                                        {textContent}
                                    </pre>
                                </ScrollArea>
                            )}
                        </div>
                    )}
                    {category === "other" && (
                        <div className="p-12 text-center">
                            <p className="text-muted-foreground text-lg mb-4">Preview not available for this file type.</p>
                            <p className="text-sm">Try opening it in a new tab or downloading it.</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
