"use client";

import {
  ChevronRight,
  Copy,
  Download,
  Eye,
  Trash2,
} from "lucide-react";
import {
  FaFileAudio,
  FaFileCode,
  FaFileImage,
  FaFilePdf,
  FaFileVideo,
  FaFolder,
  FaRegFile,
} from "react-icons/fa";
import * as React from "react";

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
  loading?: boolean;
  onFolderClick: (name: string) => void;
  onFileClick: (file: any) => void;
  onDelete: (key: string) => void;
  onDownload: (url: string) => void;
  onCopyLink: (url: string) => void;
}

const getFileIcon = (
  filename: string,
  className?: string,
) => {
  const ext = filename.split(".").pop()?.toLowerCase();

  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext || ""))
    return <FaFileImage className={cn("text-blue-500", className)} />;
  if (["mp4", "webm", "mov", "avi", "mkv"].includes(ext || ""))
    return <FaFileVideo className={cn("text-purple-500", className)} />;
  if (["mp3", "wav", "ogg", "m4a"].includes(ext || ""))
    return <FaFileAudio className={cn("text-pink-500", className)} />;
  if (["pdf"].includes(ext || ""))
    return <FaFilePdf className={cn("text-red-500", className)} />;
  if (
    ["txt", "md", "json", "js", "ts", "tsx", "jsx", "html", "css", "xml", "log", "env"].includes(ext || "")
  )
    return <FaFileCode className={cn("text-green-500", className)} />;
  return <FaRegFile className={cn("text-muted-foreground", className)} />;
};

const formatSize = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="aspect-square flex flex-col items-center justify-center p-1 rounded-xl">
          <div className="flex-1 flex items-center justify-center w-full">
            <div className="h-20 w-20 rounded-lg bg-muted animate-pulse" />
          </div>
          <div className="w-full mt-auto py-2 px-1">
            <div className="h-3 w-3/4 mx-auto rounded bg-muted animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="**:data-[slot=table-container]:overflow-visible">
      <Table>
        <TableHeader className="sticky top-0 z-30 bg-background">
          <TableRow>
            <TableHead className="w-100">Name</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Last Modified</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-muted animate-pulse" />
                  <div className="h-4 w-48 rounded bg-muted animate-pulse" />
                </div>
              </TableCell>
              <TableCell>
                <div className="h-4 w-16 rounded bg-muted animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="h-4 w-12 rounded bg-muted animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="h-4 w-32 rounded bg-muted animate-pulse" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function FileExplorer({
  folders,
  files,
  viewMode,
  loading,
  onFolderClick,
  onFileClick,
  onDelete,
  onDownload,
  onCopyLink,
}: FileExplorerProps) {
  if (loading) {
    return viewMode === "list" ? <SkeletonList /> : <SkeletonGrid />;
  }
  const [contextMenu, setContextMenu] = React.useState<{
    x: number;
    y: number;
    file?: any;
    folder?: any;
  } | null>(null);

  const [hoveredItem, setHoveredItem] = React.useState<{
    item: any;
    type: "file" | "folder";
    rect: DOMRect;
  } | null>(null);

  const [hoverVisible, setHoverVisible] = React.useState(false);

  const hoverVisibleRef = React.useRef(false);

  const hoverShowTimer = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const hoverHideTimer = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  React.useEffect(() => {
    if (!contextMenu) return;
    const close = () => setContextMenu(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [contextMenu]);

  const handleHoverEnter = (
    e: React.MouseEvent,
    item: any,
    type: "file" | "folder",
  ) => {
    if (hoverShowTimer.current) clearTimeout(hoverShowTimer.current);
    if (hoverHideTimer.current) clearTimeout(hoverHideTimer.current);
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredItem({ item, type, rect });
    if (!hoverVisibleRef.current) {
      hoverShowTimer.current = setTimeout(() => {
        setHoverVisible(true);
        hoverVisibleRef.current = true;
      }, 1000);
    }
  };

  const handleHoverLeave = () => {
    if (hoverShowTimer.current) clearTimeout(hoverShowTimer.current);
    if (hoverHideTimer.current) clearTimeout(hoverHideTimer.current);
    hoverHideTimer.current = setTimeout(() => {
      setHoverVisible(false);
      hoverVisibleRef.current = false;
      setTimeout(() => {
        setHoveredItem(null);
      }, 300);
    }, 300);
  };

  const handleContextMenu = (
    e: React.MouseEvent,
    item: any,
    type: "file" | "folder",
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, [type]: item });
  };

  const renderContextMenu = () => {
    if (!contextMenu) return null;
    return (
      <>
        <div
          className="fixed inset-0 z-40"
          onClick={() => setContextMenu(null)}
        />
        <div
          className="fixed z-50 min-w-40 rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {contextMenu.folder ? (
            <div
              className="relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground"
              onClick={() => {
                onFolderClick(contextMenu.folder!.name);
                setContextMenu(null);
              }}
            >
              <ChevronRight className="h-4 w-4" /> Open
            </div>
          ) : (
            <>
              <div
                className="relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground"
                onClick={() => {
                  onFileClick(contextMenu.file!);
                  setContextMenu(null);
                }}
              >
                <Eye className="mr-2 h-4 w-4" /> Details
              </div>
              <div
                className="relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground"
                onClick={() => {
                  onCopyLink(
                    contextMenu.file!.displayUrl || contextMenu.file!.url,
                  );
                  setContextMenu(null);
                }}
              >
                <Copy className="mr-2 h-4 w-4" /> Copy Link
              </div>
              <div
                className="relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground"
                onClick={() => {
                  onDownload(
                    contextMenu.file!.displayUrl || contextMenu.file!.url,
                  );
                  setContextMenu(null);
                }}
              >
                <Download className="mr-2 h-4 w-4" /> Download
              </div>
              <div className="-mx-1 my-1 h-px bg-border" />
              <div
                className="relative flex cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-sm outline-none select-none text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => {
                  onDelete(contextMenu.file!.key);
                  setContextMenu(null);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </div>
            </>
          )}
        </div>
      </>
    );
  };

  const renderHoverCard = () => {
    if (!hoveredItem) return null;
    const { item, type, rect } = hoveredItem;
    return (
      <div
        className={cn(
          "fixed z-50 min-w-44 rounded-lg bg-popover p-3 text-popover-foreground shadow-md ring-1 ring-foreground/10 text-xs space-y-1.5 transition-opacity duration-300",
          hoverVisible ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        style={{
          left: rect.left + rect.width / 2,
          top: rect.top - 8,
          transform: "translate(-50%, -100%)",
        }}
        onMouseEnter={() => {
          if (hoverShowTimer.current) clearTimeout(hoverShowTimer.current);
          if (hoverHideTimer.current) clearTimeout(hoverHideTimer.current);
          setHoverVisible(true);
          hoverVisibleRef.current = true;
        }}
        onMouseLeave={() => {
          if (hoverShowTimer.current) clearTimeout(hoverShowTimer.current);
          if (hoverHideTimer.current) clearTimeout(hoverHideTimer.current);
          hoverHideTimer.current = setTimeout(() => {
            setHoverVisible(false);
            hoverVisibleRef.current = false;
            setTimeout(() => {
              setHoveredItem(null);
            }, 300);
          }, 300);
        }}
      >
        <div className="font-medium text-sm truncate max-w-40">
          {type === "folder" ? item.displayName : item.name}
        </div>
        {type === "folder" ? (
          <div className="text-muted-foreground">Type: Folder</div>
        ) : (
          <>
            <div className="text-muted-foreground">
              Size: {formatSize(item.size)}
            </div>
            <div className="text-muted-foreground">
              Type: {item.name.split(".").pop() || "file"}
            </div>
            <div className="text-muted-foreground">
              Modified: {new Date(item.lastModified).toLocaleDateString()}
            </div>
          </>
        )}
      </div>
    );
  };

  if (viewMode === "list") {
    return (
      <div className="**:data-[slot=table-container]:overflow-visible">
        <Table>
          <TableHeader className="sticky top-0 z-30 bg-background">
            <TableRow>
              <TableHead className="w-100">Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Last Modified</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {folders.map((folder) => (
              <TableRow
                key={folder.name}
                className="cursor-pointer"
                onClick={() => onFolderClick(folder.name)}
                onContextMenu={(e) => handleContextMenu(e, folder, "folder")}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <FaFolder className="h-4 w-4 text-amber-500" />
                    {folder.displayName}
                  </div>
                </TableCell>
                <TableCell>--</TableCell>
                <TableCell>Folder</TableCell>
                <TableCell>--</TableCell>
              </TableRow>
            ))}
            {files.map((file) => (
              <TableRow
                key={file.key}
                className="cursor-pointer"
                onClick={() => onFileClick(file)}
                onContextMenu={(e) => handleContextMenu(e, file, "file")}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {getFileIcon(file.name, "h-4 w-4")}
                    {file.name}
                  </div>
                </TableCell>
                <TableCell>{formatSize(file.size)}</TableCell>
                <TableCell>{file.name.split(".").pop() || "file"}</TableCell>
                <TableCell>
                  {new Date(file.lastModified).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
            {folders.length === 0 && files.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-muted-foreground"
                >
                  No files or folders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {renderContextMenu()}
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
          onContextMenu={(e) => handleContextMenu(e, folder, "folder")}
          onMouseEnter={(e) => handleHoverEnter(e, folder, "folder")}
          onMouseLeave={handleHoverLeave}
        >
          <div className="flex-1 flex items-center justify-center w-full">
            <FaFolder className="h-20 w-20 text-amber-500" />
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
            onContextMenu={(e) => handleContextMenu(e, file, "file")}
            onMouseEnter={(e) => handleHoverEnter(e, file, "file")}
            onMouseLeave={handleHoverLeave}
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
                  {getFileIcon(file.name, "h-16 w-16")}
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
          </div>
        );
      })}
      {folders.length === 0 && files.length === 0 && (
        <div className="col-span-full h-40 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl m-2">
          <FaRegFile className="h-8 w-8 mb-2 opacity-20" />
          <p>No files or folders found.</p>
        </div>
      )}
      {renderHoverCard()}
      {renderContextMenu()}
    </div>
  );
}
