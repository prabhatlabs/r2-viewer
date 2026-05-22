"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { HardDrive, Clock, Star, Trash2, Database, Cloud } from "lucide-react";

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

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
    const { credentials } = useUIStore();

    const buckets = credentials.bucketName
        ? [{ name: credentials.bucketName, icon: Cloud }]
        : [{ name: "No Bucket Configured", icon: Cloud }];

    const navItems = [
        { title: "All Files", icon: Database },
        { title: "Recent", icon: Clock },
        { title: "Favorites", icon: Star },
    ] as const;

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg">
                            <Link href="#" className="flex items-center gap-2">
                                <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                    <HardDrive className="size-4" />
                                </div>
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-semibold">R2 Viewer</span>
                                    <span className="text-muted-foreground text-xs">v0.1.0</span>
                                </div>
                            </Link>
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
                                    <SidebarMenuButton tooltip={item.title}>
                                        <Link href="#" className="flex items-center gap-2">
                                            <item.icon className="size-4" />
                                            <span>{item.title}</span>
                                        </Link>
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
                                    <SidebarMenuButton>
                                        <Link href="#" className="flex items-center gap-2">
                                            <bucket.icon className="size-4" />
                                            <span>{bucket.name}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup className="mt-auto">
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="Trash">
                                    <Link href="#" className="flex items-center gap-2">
                                        <Trash2 className="size-4" />
                                        <span>Trash</span>
                                    </Link>
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
