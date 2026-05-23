"use client";

import type { ComponentProps } from "react";
import { useState, useEffect } from "react";
import {
    HardDrive,
    Clock,
    Star,
    Trash2,
    Database,
    Cloud,
    ChevronRight,
    ChevronDown,
} from "lucide-react";
import { FaFolder, FaFolderOpen } from "react-icons/fa";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar";

import { useUIStore } from "@/lib/store";
import { useStorageStore } from "@/lib/store-storage";
import { cn } from "@/lib/utils";

interface AppSidebarProps extends ComponentProps<typeof Sidebar> {
    currentPath: string;
    onNavigate: (path: string) => void;
}

export function AppSidebar({ currentPath, onNavigate, ...props }: AppSidebarProps) {
    const { credentials } = useUIStore();
    const { foldersTree } = useStorageStore();
    const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (currentPath) {
            setExpandedPaths((prev) => {
                const next = new Set(prev);
                const parts = currentPath.split("/").filter(Boolean);
                let current = "";
                parts.forEach((part) => {
                    current = current ? `${current}/${part}/` : `${part}/`;
                    next.add(current);
                });
                return next;
            });
        }
    }, [currentPath]);

    const toggleExpanded = (path: string, e: React.MouseEvent) => {
        e.stopPropagation(); // Avoid navigating when clicking the chevron
        setExpandedPaths((prev) => {
            const next = new Set(prev);
            if (next.has(path)) {
                next.delete(path);
            } else {
                next.add(path);
            }
            return next;
        });
    };

    const isFolderHidden = (path: string) => {
        const parts = path.split("/").filter(Boolean);
        if (parts.length <= 1) return false; // Root folders are never hidden

        // Check each parent path in the hierarchy
        let current = "";
        for (let i = 0; i < parts.length - 1; i++) {
            current = current ? `${current}/${parts[i]}/` : `${parts[i]}/`;
            if (!expandedPaths.has(current)) {
                return true; // A parent folder is collapsed, so hide this folder
            }
        }
        return false;
    };

    const hasSubfolders = (index: number) => {
        if (index >= foldersTree.length - 1) return false;
        const current = foldersTree[index];
        const next = foldersTree[index + 1];
        return next.startsWith(current);
    };

    const buckets = credentials.bucketName
        ? [{ name: credentials.bucketName, icon: Cloud, path: "" }]
        : [{ name: "No Bucket Configured", icon: Cloud, path: "" }];

    const navItems = [
        { title: "All Files", icon: Database, path: "" },
        { title: "Recent", icon: Clock, path: "" },
        { title: "Favorites", icon: Star, path: "" },
    ] as const;

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" onClick={() => onNavigate("")}>
                            <div className="flex items-center gap-2 cursor-pointer w-full text-left">
                                <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                    <HardDrive className="size-4" />
                                </div>
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-semibold">R2 Viewer</span>
                                    <span className="text-muted-foreground text-xs">v0.2.0</span>
                                </div>
                            </div>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {navItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        tooltip={item.title}
                                        isActive={item.title === "All Files" && currentPath === ""}
                                        onClick={() => onNavigate(item.path)}
                                    >
                                        <item.icon className="size-4 shrink-0" />
                                        <span>{item.title}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>Buckets</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {buckets.map((bucket) => (
                                <SidebarMenuItem key={bucket.name}>
                                    <SidebarMenuButton
                                        isActive={currentPath === ""}
                                        onClick={() => onNavigate(bucket.path)}
                                    >
                                        <bucket.icon className="size-4 shrink-0" />
                                        <span>{bucket.name}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>Folders</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {foldersTree.length === 0 ? (
                                <div className="text-xs text-muted-foreground px-4 py-2 italic">
                                    No folders found
                                </div>
                            ) : (
                                foldersTree.map((path, index) => {
                                    if (isFolderHidden(path)) return null;

                                    const parts = path.split("/").filter(Boolean);
                                    const depth = parts.length - 1;
                                    const displayName = parts[parts.length - 1] || path;
                                    const hasSubs = hasSubfolders(index);
                                    const isExpanded = expandedPaths.has(path);
                                    const isSelected = currentPath === path;

                                    return (
                                        <SidebarMenuItem key={path}>
                                            <SidebarMenuButton
                                                isActive={isSelected}
                                                tooltip={path}
                                                onClick={() => onNavigate(path)}
                                            >
                                                <div
                                                    className={cn(
                                                        "flex items-center gap-1 cursor-pointer w-full py-1 rounded-md transition-colors text-left",
                                                        isSelected ? "text-accent-foreground font-medium" : "text-foreground/80 hover:text-foreground"
                                                    )}
                                                    style={{ paddingLeft: `${depth * 12}px` }}
                                                >
                                                    {hasSubs ? (
                                                        <button
                                                            onClick={(e) => toggleExpanded(path, e)}
                                                            className="hover:bg-muted p-0.5 rounded transition-colors mr-1 flex items-center justify-center shrink-0"
                                                        >
                                                            {isExpanded ? (
                                                                <ChevronDown className="size-3.5 text-muted-foreground" />
                                                            ) : (
                                                                <ChevronRight className="size-3.5 text-muted-foreground" />
                                                            )}
                                                        </button>
                                                    ) : (
                                                        <div className="w-[19px] mr-1 shrink-0" />
                                                    )}
                                                    {isExpanded && hasSubs ? (
                                                        <FaFolderOpen className="size-4 text-amber-500 shrink-0 mr-1.5" />
                                                    ) : (
                                                        <FaFolder className="size-4 text-amber-500 shrink-0 mr-1.5" />
                                                    )}
                                                    <span className="truncate text-sm flex-1">{displayName}</span>
                                                </div>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })
                            )}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup className="mt-auto">
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="Trash" onClick={() => alert("Trash is empty!")}>
                                    <Trash2 className="size-4 shrink-0" />
                                    <span>Trash</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    );
}
