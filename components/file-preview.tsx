"use client";

import * as React from "react";
import {
  X,
  Download,
  Trash2,
  Copy,
  ExternalLink,
  Info,
  Calendar,
  HardDrive,
  FileText,
  Type,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FilePreviewProps {
  file: any | null;
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
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext || ""))
    return "image";
  if (["mp4", "webm", "mov", "avi", "mkv"].includes(ext || "")) return "video";
  if (["mp3", "wav", "ogg", "m4a"].includes(ext || "")) return "audio";
  if (["pdf"].includes(ext || "")) return "pdf";
  if (
    [
      "txt",
      "md",
      "json",
      "js",
      "ts",
      "css",
      "html",
      "xml",
      "log",
      "env",
    ].includes(ext || "")
  )
    return "code";
  return "other";
};

export function FilePreview({
  file,
  onClose,
  onDelete,
  onDownload,
  onCopyLink,
}: FilePreviewProps) {
  const isOpen = !!file;
  const category = file ? getFileCategory(file.name) : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300",
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />

      {/* Slide-over Panel */}
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
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {file && (
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              <div className="aspect-video rounded-lg bg-muted flex items-center justify-center overflow-hidden border">
                {category === "image" && (
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                )}
                {category === "video" && (
                  <video
                    src={file.url}
                    className="w-full h-full object-cover"
                  />
                )}
                {category !== "image" && category !== "video" && (
                  <FileText className="h-12 w-12 text-muted-foreground opacity-20" />
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">
                    Name
                  </h4>
                  <p className="text-sm font-semibold break-all leading-tight">
                    {file.name}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 border p-3 rounded-lg bg-muted/20">
                  <div>
                    <h4 className="text-[11px] font-medium text-muted-foreground mb-1 flex items-center gap-1 uppercase tracking-wider">
                      <HardDrive className="h-3 w-3" /> Size
                    </h4>
                    <p className="text-sm font-semibold">
                      {formatSize(file.size)}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-medium text-muted-foreground mb-1 flex items-center gap-1 uppercase tracking-wider">
                      <Type className="h-3 w-3" /> Type
                    </h4>
                    <p className="text-sm font-semibold">
                      {file.name.split(".").pop() || "file"}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="text-[11px] font-medium text-muted-foreground mb-1 flex items-center gap-1 uppercase tracking-wider">
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
                >
                  <a
                    className="w-full flex items-center justify-start gap-3 h-10"
                    href={file.displayUrl || file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4" /> Open in New Tab
                  </a>
                </Button>
                <div className="pt-2">
                  <Button
                    className="w-full justify-start gap-3 h-10 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                    variant="ghost"
                    onClick={() => onDelete(file.key)}
                  >
                    <Trash2 className="h-4 w-4" /> Delete File
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        )}
      </aside>
    </>
  );
}
