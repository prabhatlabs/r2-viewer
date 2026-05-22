"use client";

import {
  ChevronRight,
  Copy,
  Download,
  Eye,
  File,
  FileAudio,
  FileCode,
  FileText,
  FileVideo,
  Folder,
  MoreVertical,
  Trash2,
} from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface FileExplorerProps {
  folders: any[];
  files: any[];
  viewMode: "grid" | "list";
  onFolderClick: (name: string) => void;
  onFileClick: (file: any) => void;
  onDelete: (key: string) => void;
  onDownload: (url: string) => void;
  onCopyLink: (url: string) => void;
}

const getFileIcon = (
  filename: string,
  props?: React.SVGProps<SVGSVGElement>,
) => {
  const ext = filename.split(".").pop()?.toLowerCase();
  const baseProps = { fill: "currentColor", stroke: "none", ...props };

  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || ""))
    return (
      <File {...baseProps} className={cn("text-blue-500", props?.className)} />
    );
  if (["mp4", "webm", "mov"].includes(ext || ""))
    return (
      <FileVideo
        {...baseProps}
        className={cn("text-purple-500", props?.className)}
      />
    );
  if (["mp3", "wav", "ogg"].includes(ext || ""))
    return (
      <FileAudio
        {...baseProps}
        className={cn("text-pink-500", props?.className)}
      />
    );
  if (["pdf"].includes(ext || ""))
    return (
      <FileText
        {...baseProps}
        className={cn("text-red-500", props?.className)}
      />
    );
  if (
    ["js", "ts", "tsx", "jsx", "html", "css", "json", "md"].includes(ext || "")
  )
    return (
      <FileCode
        {...baseProps}
        className={cn("text-green-500", props?.className)}
      />
    );
  return (
    <File
      {...baseProps}
      className={cn("text-muted-foreground", props?.className)}
    />
  );
};

const formatSize = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

export function FileExplorer({
  folders,
  files,
  viewMode,
  onFolderClick,
  onFileClick,
  onDelete,
  onDownload,
  onCopyLink,
}: FileExplorerProps) {
  if (viewMode === "list") {
    return (
      <div className="**:data-[slot=table-container]:overflow-visible">
        <Table>
          <TableHeader className="sticky top-0 z-30 bg-background">
            <TableRow className="">
              <TableHead className="w-100">Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Last Modified</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {folders.map((folder) => (
              <TableRow
                key={folder.name}
                className="cursor-pointer"
                onClick={() => onFolderClick(folder.name)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Folder
                      className="h-4 w-4 fill-amber-500 text-amber-500"
                      stroke="none"
                    />
                    {folder.displayName}
                  </div>
                </TableCell>
                <TableCell>--</TableCell>
                <TableCell>Folder</TableCell>
                <TableCell>--</TableCell>
                <TableCell className="text-right">
                  <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ))}
            {files.map((file) => (
              <TableRow
                key={file.key}
                className="cursor-pointer"
                onClick={() => onFileClick(file)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {getFileIcon(file.name, { className: "h-4 w-4" })}
                    {file.name}
                  </div>
                </TableCell>
                <TableCell>{formatSize(file.size)}</TableCell>
                <TableCell>{file.name.split(".").pop() || "file"}</TableCell>
                <TableCell>
                  {new Date(file.lastModified).toLocaleDateString()}
                </TableCell>

                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onFileClick(file)}>
                        <Eye className="mr-2 h-4 w-4" /> Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onCopyLink(file.displayUrl || file.url)}
                      >
                        <Copy className="mr-2 h-4 w-4" /> Copy Link
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDownload(file.displayUrl || file.url)}
                      >
                        <Download className="mr-2 h-4 w-4" /> Download
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDelete(file.key)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {folders.length === 0 && files.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  No files or folders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  }

  const getFileCategory = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext || ""))
      return "image";
    return "other";
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
      {folders.map((folder) => (
        <div
          key={folder.name}
          className="group relative aspect-square flex flex-col items-center justify-center p-1 rounded-xl hover:bg-accent/50 transition-colors cursor-pointer text-center"
          onClick={() => onFolderClick(folder.name)}
        >
          <div className="flex-1 flex items-center justify-center w-full">
            <Folder
              className="h-20 w-20 text-amber-500"
              fill="currentColor"
              stroke="none"
            />
          </div>
          <div className="w-full mt-auto py-1 px-1">
            <span className="text-[11px] font-medium truncate block w-full text-foreground/70 group-hover:text-foreground transition-colors">
              {folder.displayName}
            </span>
          </div>
        </div>
      ))}
      {files.map((file) => {
        const category = getFileCategory(file.name);
        return (
          <div
            key={file.key}
            className="group relative aspect-square flex flex-col items-center justify-center p-1 rounded-xl hover:bg-accent/50 transition-colors cursor-pointer text-center"
            onClick={() => onFileClick(file)}
          >
            <div className="flex-1 flex items-center justify-center w-full overflow-hidden rounded-lg">
              {category === "image" ? (
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity border bg-muted/30"
                />
              ) : (
                <div className="flex items-center justify-center">
                  {getFileIcon(file.name, { className: "h-16 w-16" })}
                </div>
              )}
            </div>
            <div className="w-full mt-auto py-1 px-1">
              <span
                className="text-[11px] font-medium truncate block w-full text-foreground/70 group-hover:text-foreground transition-colors"
                title={file.name}
              >
                {file.name}
              </span>
            </div>

            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <DropdownMenu>
                <DropdownMenuTrigger
                  asChild
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 bg-background/80 backdrop-blur-md border shadow-sm"
                  >
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onFileClick(file)}>
                    <Eye className="mr-2 h-4 w-4" /> Preview
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onCopyLink(file.displayUrl || file.url)}
                  >
                    <Copy className="mr-2 h-4 w-4" /> Copy Link
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDownload(file.displayUrl || file.url)}
                  >
                    <Download className="mr-2 h-4 w-4" /> Download
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDelete(file.key)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        );
      })}
      {folders.length === 0 && files.length === 0 && (
        <div className="col-span-full h-40 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl m-2">
          <File className="h-8 w-8 mb-2 opacity-20" />
          <p>No files or folders found.</p>
        </div>
      )}
    </div>
  );
}
