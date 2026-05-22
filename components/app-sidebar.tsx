"use client";

import * as React from "react";
import {
  FileText,
  Folder,
  HardDrive,
  Clock,
  Star,
  Trash2,
  Settings2,
  Database,
  Cloud,
  ChevronRight,
} from "lucide-react";

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

const data = {
  navMain: [
    {
      title: "Storage",
      url: "#",
      icon: HardDrive,
      isActive: true,
      items: [
        {
          title: "All Files",
          url: "#",
          icon: Database,
        },
        {
          title: "Recent",
          url: "#",
          icon: Clock,
        },
        {
          title: "Favorites",
          url: "#",
          icon: Star,
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "Bucket Config",
          url: "#",
        },
        {
          title: "CORS Rules",
          url: "#",
        },
      ],
    },
  ],
  buckets: [
    {
      name: "r2-main-bucket",
      icon: Cloud,
    },
  ],
};

import { useUIStore } from "@/lib/store";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { credentials } = useUIStore();

  const buckets = credentials.bucketName
    ? [{ name: credentials.bucketName, icon: Cloud }]
    : [{ name: "No Bucket Configured", icon: Cloud }];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <a href="#" className="flex items-center gap-2">
                <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <HardDrive className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">R2 Viewer</span>
                  <span className="text-muted-foreground text-xs">v0.1.0</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain[0].items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton tooltip={item.title}>
                    <a href={item.url} className="flex items-center gap-2">
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </a>
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
                    <a href="#" className="flex items-center gap-2">
                      <bucket.icon className="size-4" />
                      <span>{bucket.name}</span>
                    </a>
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
                  <a href="#" className="flex items-center gap-2">
                    <Trash2 className="size-4" />
                    <span>Trash</span>
                  </a>
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
