"use client"

import * as React from "react"
import { 
  ChevronLeft, 
  ChevronRight,
  RefreshCw
} from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"

interface TopNavProps {
  currentPath: string
  onNavigate: (path: string) => void
  onRefresh: () => void
  canGoBack?: boolean
  canGoForward?: boolean
  onBack?: () => void
  onForward?: () => void
}

export function TopNav({
  currentPath,
  onNavigate,
  onRefresh,
  canGoBack = false,
  canGoForward = false,
  onBack,
  onForward
}: TopNavProps) {
  const pathParts = currentPath.split("/").filter(Boolean)

  return (
    <div className="flex h-12 shrink-0 items-center gap-2 border-b px-4 bg-background/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-1 mr-2">
        <Button 
          variant="outline" 
          size="icon-sm" 
          className="h-8 w-8" 
          disabled={!canGoBack}
          onClick={onBack}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon-sm" 
          className="h-8 w-8" 
          disabled={!canGoForward}
          onClick={onForward}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon-sm" 
          className="h-8 w-8 ml-1" 
          onClick={onRefresh}
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </div>

      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink 
              href="#" 
              onClick={(e) => { e.preventDefault(); onNavigate(""); }}
            >
              Root
            </BreadcrumbLink>
          </BreadcrumbItem>
          {pathParts.map((part, index) => (
            <React.Fragment key={index}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {index === pathParts.length - 1 ? (
                  <BreadcrumbPage>{part}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink 
                    href="#" 
                    onClick={(e) => { 
                      e.preventDefault(); 
                      onNavigate(pathParts.slice(0, index + 1).join("/") + "/");
                    }}
                  >
                    {part}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}
