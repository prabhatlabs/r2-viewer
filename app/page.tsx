"use client"

import * as React from "react"
import axios from "axios"
import { AppSidebar } from "@/components/app-sidebar"
import { Header } from "@/components/header"
import { TopNav } from "@/components/top-nav"
import { FileExplorer } from "@/components/file-explorer"
import { FilePreview } from "@/components/file-preview"
import { SettingsDialog } from "@/components/settings-dialog"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loader2 } from "lucide-react"
import { useUIStore } from "@/lib/store"

const api = axios.create()

api.interceptors.request.use((config) => {
  try {
    const { credentials } = useUIStore.getState()
    if (credentials.accountId) config.headers['x-r2-account-id'] = credentials.accountId
    if (credentials.accessKeyId) config.headers['x-r2-access-key-id'] = credentials.accessKeyId
    if (credentials.secretAccessKey) config.headers['x-r2-secret-access-key'] = credentials.secretAccessKey
    if (credentials.bucketName) config.headers['x-r2-bucket-name'] = credentials.bucketName
  } catch (e) {}
  return config
})

export default function Page() {
  const [currentPath, setCurrentPath] = React.useState("")
  const [history, setHistory] = React.useState<string[]>([""])
  const [historyIndex, setHistoryIndex] = React.useState(0)
  
  const [folders, setFolders] = React.useState([])
  const [files, setFiles] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  
  const { viewMode, setViewMode, _hasHydrated, credentials } = useUIStore()
  const effectiveViewMode = _hasHydrated ? viewMode : 'grid'

  const [selectedFile, setSelectedFile] = React.useState<any | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)

  const getFileUrl = React.useCallback((originalUrl: string) => {
    const domain = credentials.customDomain || process.env.NEXT_PUBLIC_R2_CUSTOM_DOMAIN
    if (!domain) return originalUrl
    try {
      const url = new URL(originalUrl)
      let cleanPath = url.pathname
      const pathParts = cleanPath.split('/').filter(Boolean)
      if (pathParts.length > 0 && pathParts[0] === credentials.bucketName) {
        pathParts.shift()
        cleanPath = '/' + pathParts.join('/')
      }
      const d = domain.endsWith('/') ? domain.slice(0, -1) : domain
      return `${d}${cleanPath}`
    } catch (e) {
      return originalUrl
    }
  }, [credentials.customDomain, credentials.bucketName])

  const fetchContent = React.useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get(
        `/api/storage?prefix=${encodeURIComponent(currentPath)}&limit=1000`
      )
      setFolders(data.folders || [])
      const processedFiles = (data.files || []).map((file: any) => ({
        ...file,
        displayUrl: getFileUrl(file.url)
      }))
      setFiles(processedFiles)
    } catch (error) {
      console.error("Failed to fetch content", error)
    } finally {
      setLoading(false)
    }
  }, [currentPath, getFileUrl])

  React.useEffect(() => {
    fetchContent()
  }, [fetchContent])

  const handleNavigate = (path: string, pushToHistory = true) => {
    setCurrentPath(path)
    setSelectedFile(null)
    
    if (pushToHistory && path !== currentPath) {
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push(path)
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
    }
  }

  const handleBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      handleNavigate(history[newIndex], false)
    }
  }

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      handleNavigate(history[newIndex], false)
    }
  }

  const handleDelete = async (key: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return
    try {
      await api.delete(`/api/storage?key=${encodeURIComponent(key)}`)
      fetchContent()
      if (selectedFile?.key === key) setSelectedFile(null)
    } catch (error) {
      alert("Failed to delete file")
    }
  }

  const handleUpload = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0]
      if (!file) return
      
      try {
        const filename = `${currentPath}${file.name}`
        const { data } = await api.post("/api/storage", { filename, contentType: file.type })
        await axios.put(data.url, file, { headers: { "Content-Type": file.type } })
        fetchContent()
      } catch (error) {
        alert("Upload failed")
      }
    }
    input.click()
  }

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      alert("Link copied to clipboard!")
    } catch (err) {
      alert("Failed to copy link")
    }
  }

  const handleDownload = (url: string) => {
    const a = document.createElement("a")
    a.href = url
    a.download = ""
    a.target = "_blank"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const filteredFolders = folders.filter((f: any) => 
    f.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredFiles = files.filter((f: any) => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        <Header 
          onUpload={handleUpload}
          onSearch={setSearchQuery}
          searchQuery={searchQuery}
          viewMode={effectiveViewMode}
          setViewMode={setViewMode}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
        
        <div className="flex flex-1 overflow-hidden min-h-0">
          <main className="flex-1 flex flex-col min-h-0 relative">
            <TopNav 
              currentPath={currentPath}
              onNavigate={(path) => handleNavigate(path)}
              onRefresh={fetchContent}
              canGoBack={historyIndex > 0}
              canGoForward={historyIndex < history.length - 1}
              onBack={handleBack}
              onForward={handleForward}
            />
            
            <ScrollArea className="flex-1 overflow-hidden">
              {loading ? (
                <div className="flex h-[400px] items-center justify-center">
                  <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <FileExplorer 
                  folders={filteredFolders}
                  files={filteredFiles}
                  viewMode={effectiveViewMode}
                  onFolderClick={(name) => handleNavigate(name)}
                  onFileClick={setSelectedFile}
                  onDelete={handleDelete}
                  onDownload={handleDownload}
                  onCopyLink={handleCopyLink}
                />
              )}
            </ScrollArea>
          </main>
        </div>
      </SidebarInset>

      <FilePreview 
        file={selectedFile}
        onClose={() => setSelectedFile(null)}
        onDelete={handleDelete}
        onDownload={handleDownload}
        onCopyLink={handleCopyLink}
      />
      
      <SettingsDialog 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        api={api}
      />
    </SidebarProvider>
  )
}
