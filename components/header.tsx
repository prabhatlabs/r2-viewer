"use client";

import * as React from "react";
import { Search, Upload, Settings, LayoutGrid, List } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onUpload: () => void;
  onSearch: (query: string) => void;
  searchQuery: string;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  onOpenSettings: () => void;
}

export function Header({
  onUpload,
  onSearch,
  searchQuery,
  viewMode,
  setViewMode,
  onOpenSettings,
}: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 bg-background z-20">
      <div className="flex items-center shrink-0">
        <SidebarTrigger className="" />
        <Separator orientation="vertical" className="mx-2 h-7" />
        <div className="font-semibold text-sm hidden sm:block">
          R2 Cloud Storage
        </div>
      </div>

      <div className="flex items-center gap-4 w-full mx-4">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search files..."
            className="w-full bg-muted/50 pl-8 h-8"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center border rounded-md bg-muted/30">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => setViewMode("grid")}
            className="h-8 w-8"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => setViewMode("list")}
            className="h-8 w-8"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        <Button size="sm" onClick={onUpload} className="gap-2 h-9">
          <Upload className="h-4 w-4" />
          <span className="hidden sm:inline">Upload</span>
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onOpenSettings}
          className="h-9 w-9"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
