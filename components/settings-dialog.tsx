"use client";

import {
    Settings,
    Key,
    ShieldCheck,
    Save,
    Loader2,
    Info,
    Network,
    Sun,
    Moon,
    Monitor,
    Palette,
    FileText,
    Database,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";
import { useUIStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface SettingsDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

interface MethodsState {
    GET: boolean;
    PUT: boolean;
    POST: boolean;
    DELETE: boolean;
    HEAD: boolean;
}

export function SettingsDialog({ isOpen, onClose }: SettingsDialogProps) {
    const { theme, setTheme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [origins, setOrigins] = useState("*");
    const [headers, setHeaders] = useState("*");
    const [methods, setMethods] = useState<MethodsState>({
        GET: true,
        PUT: true,
        POST: true,
        DELETE: true,
        HEAD: true,
    });

    const { credentials, setCredentials } = useUIStore();
    const [localCreds, setLocalCreds] = useState(credentials);

    useEffect(() => {
        if (!isOpen) return;
        setLocalCreds(credentials);
        const doFetch = async () => {
            setLoading(true);
            try {
                const { data } = await api.get("/api/settings");
                if (data.rules && data.rules.length > 0) {
                    const rule = data.rules[0];
                    setOrigins(rule.AllowedOrigins?.join(", ") || "*");
                    setHeaders(rule.AllowedHeaders?.join(", ") || "*");
                    const newMethods: MethodsState = {
                        GET: false,
                        PUT: false,
                        POST: false,
                        DELETE: false,
                        HEAD: false,
                    };
                    rule.AllowedMethods?.forEach(
                        (m: string) => (newMethods[m as keyof MethodsState] = true),
                    );
                    setMethods(newMethods);
                }
            } catch {
                console.error("Failed to load settings");
            } finally {
                setLoading(false);
            }
        };
        doFetch();
    }, [isOpen, credentials]);

    const handleSaveCredentials = () => {
        setCredentials(localCreds);
        alert("Credentials saved!");
    };

    const handleParseEnv = (envContent: string) => {
        const lines = envContent.split("\n");
        const newCreds = { ...localCreds };
        lines.forEach((line) => {
            const [key, ...valueParts] = line.split("=");
            const value = valueParts
                .join("=")
                .trim()
                .replace(/^['"]|['"]$/g, "");
            if (!key || !value) return;

            const k = key.trim();
            if (k.includes("ACCOUNT_ID")) newCreds.accountId = value;
            if (k.includes("BUCKET_NAME")) newCreds.bucketName = value;
            if (k.includes("ACCESS_KEY_ID")) newCreds.accessKeyId = value;
            if (k.includes("SECRET_ACCESS_KEY")) newCreds.secretAccessKey = value;
        });
        setLocalCreds(newCreds);
    };

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            const selectedMethods = Object.keys(methods).filter(
                (k) => methods[k as keyof MethodsState],
            );
            const rule = {
                AllowedOrigins: origins.split(",").map((s) => s.trim()),
                AllowedMethods: selectedMethods,
                AllowedHeaders: headers.split(",").map((s) => s.trim()),
                ExposeHeaders: ["ETag", "Content-Length", "Content-Type"],
                MaxAgeSeconds: 3600,
            };
            await api.post("/api/settings", { rules: [rule] });
            alert("Settings saved! Please wait 1-2 minutes for propagation.");
        } catch {
            alert("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden gap-0">
                <div className="flex h-[550px]">
                    <Tabs
                        defaultValue="credentials"
                        orientation="vertical"
                        className="flex-1 flex overflow-hidden"
                    >
                        {/* Sidebar Switcher */}
                        <aside className="w-56 border-r bg-muted/30 flex flex-col">
                            <div className="p-4">
                                <h2 className="text-sm font-semibold flex items-center gap-2">
                                    <Settings className="h-4 w-4" /> Preferences
                                </h2>
                            </div>
                            <Separator />
                            <TabsList className="flex flex-col items-stretch h-auto bg-transparent p-2 gap-1">
                                <TabsTrigger
                                    value="credentials"
                                    className="justify-start gap-2 h-9 px-3"
                                >
                                    <Key className="h-4 w-4" /> Credentials
                                </TabsTrigger>
                                <TabsTrigger value="cors" className="justify-start gap-2 h-9 px-3">
                                    <Network className="h-4 w-4" /> CORS Rules
                                </TabsTrigger>
                                <TabsTrigger
                                    value="display"
                                    className="justify-start gap-2 h-9 px-3"
                                >
                                    <Palette className="h-4 w-4" /> Display
                                </TabsTrigger>
                                <TabsTrigger
                                    value="advanced"
                                    className="justify-start gap-2 h-9 px-3"
                                >
                                    <ShieldCheck className="h-4 w-4" /> Advanced
                                </TabsTrigger>
                            </TabsList>

                            <div className="mt-auto p-4 border-t">
                                <DialogDescription className="text-[10px]">
                                    Cloudflare R2 Viewer v0.1.0
                                </DialogDescription>
                            </div>
                        </aside>

                        {/* Content Area */}
                        <div className="flex-1 flex flex-col min-w-0 bg-background">
                            <ScrollArea className="flex-1">
                                <div className="p-6">
                                    <TabsContent value="credentials" className="m-0 space-y-6">
                                        <div>
                                            <h3 className="text-lg font-medium">R2 Credentials</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Configure your bucket access keys and endpoint
                                                settings.
                                            </p>
                                        </div>
                                        <Separator />
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="accountId">Account ID</Label>
                                                <Input
                                                    id="accountId"
                                                    value={localCreds.accountId}
                                                    onChange={(e) =>
                                                        setLocalCreds({
                                                            ...localCreds,
                                                            accountId: e.target.value,
                                                        })
                                                    }
                                                    placeholder="12a506c096..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="bucketName">Bucket Name</Label>
                                                <Input
                                                    id="bucketName"
                                                    value={localCreds.bucketName}
                                                    onChange={(e) =>
                                                        setLocalCreds({
                                                            ...localCreds,
                                                            bucketName: e.target.value,
                                                        })
                                                    }
                                                    placeholder="my-bucket"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="accessKeyId">Access Key ID</Label>
                                            <Input
                                                id="accessKeyId"
                                                value={localCreds.accessKeyId}
                                                onChange={(e) =>
                                                    setLocalCreds({
                                                        ...localCreds,
                                                        accessKeyId: e.target.value,
                                                    })
                                                }
                                                placeholder="88e6159c82f..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="secretAccessKey">
                                                Secret Access Key
                                            </Label>
                                            <Input
                                                id="secretAccessKey"
                                                type="password"
                                                value={localCreds.secretAccessKey}
                                                onChange={(e) =>
                                                    setLocalCreds({
                                                        ...localCreds,
                                                        secretAccessKey: e.target.value,
                                                    })
                                                }
                                                placeholder="Enter your secret key"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="customDomain">
                                                Custom Domain (Optional)
                                            </Label>
                                            <Input
                                                id="customDomain"
                                                value={localCreds.customDomain}
                                                onChange={(e) =>
                                                    setLocalCreds({
                                                        ...localCreds,
                                                        customDomain: e.target.value,
                                                    })
                                                }
                                                placeholder="https://files.example.com"
                                            />
                                        </div>

                                        <div className="relative flex items-center gap-2">
                                            <Separator />
                                            <span className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 bg-background px-2 text-muted-foreground">
                                                or
                                            </span>
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="env-import"
                                                className="flex items-center gap-2"
                                            >
                                                <FileText className="h-4 w-4" /> Import from .env
                                            </Label>
                                            <Textarea
                                                id="env-import"
                                                placeholder={`R2_ACCOUNT_ID=\nR2_BUCKET_NAME=\nR2_ACCESS_KEY_ID=\nR2_SECRET_ACCESS_KEY=`}
                                                className="font-mono text-xs min-h-40"
                                                onChange={(e) => handleParseEnv(e.target.value)}
                                            />
                                        </div>

                                        <div className="pt-2">
                                            <Button
                                                onClick={handleSaveCredentials}
                                                className="w-full sm:w-auto gap-2"
                                            >
                                                <Save className="h-4 w-4" /> Save Credentials
                                            </Button>
                                        </div>

                                        <Alert className="bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
                                            <Info className="h-4 w-4" />
                                            <AlertTitle>Security Note</AlertTitle>
                                            <AlertDescription className="text-xs">
                                                Credentials are saved in your browser&apos;s local
                                                storage and used for direct API calls to your R2
                                                bucket.
                                            </AlertDescription>
                                        </Alert>
                                    </TabsContent>

                                    <TabsContent value="cors" className="m-0 space-y-6">
                                        <div>
                                            <h3 className="text-lg font-medium">
                                                CORS Configuration
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Manage Cross-Origin Resource Sharing rules for your
                                                bucket.
                                            </p>
                                        </div>
                                        <Separator />
                                        {loading ? (
                                            <div className="flex h-40 items-center justify-center">
                                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                            </div>
                                        ) : (
                                            <>
                                                <div className="space-y-2">
                                                    <Label htmlFor="origins">Allowed Origins</Label>
                                                    <Input
                                                        id="origins"
                                                        value={origins}
                                                        onChange={(e) => setOrigins(e.target.value)}
                                                        placeholder="*, https://your-site.com"
                                                    />
                                                    <p className="text-[10px] text-muted-foreground">
                                                        Comma-separated list of origins allowed to
                                                        access the bucket.
                                                    </p>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="headers">Allowed Headers</Label>
                                                    <Input
                                                        id="headers"
                                                        value={headers}
                                                        onChange={(e) => setHeaders(e.target.value)}
                                                        placeholder="*"
                                                    />
                                                </div>
                                                <div className="space-y-3">
                                                    <Label>Allowed Methods</Label>
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                        {Object.keys(methods).map((m) => (
                                                            <div
                                                                key={m}
                                                                className="flex items-center space-x-2 border rounded-md p-2 hover:bg-muted/50 transition-colors"
                                                            >
                                                                <Checkbox
                                                                    id={`method-${m}`}
                                                                    checked={
                                                                        methods[
                                                                            m as keyof MethodsState
                                                                        ]
                                                                    }
                                                                    onCheckedChange={(checked) =>
                                                                        setMethods({
                                                                            ...methods,
                                                                            [m]: checked,
                                                                        })
                                                                    }
                                                                />
                                                                <Label
                                                                    htmlFor={`method-${m}`}
                                                                    className="text-sm font-normal cursor-pointer flex-1"
                                                                >
                                                                    {m}
                                                                </Label>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="pt-2">
                                                    <Button
                                                        onClick={handleSaveSettings}
                                                        className="w-full sm:w-auto gap-2"
                                                        disabled={saving}
                                                    >
                                                        {saving ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <ShieldCheck className="h-4 w-4" />
                                                        )}
                                                        Update Policy
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </TabsContent>

                                    <TabsContent value="display" className="m-0 space-y-6">
                                        <div>
                                            <h3 className="text-lg font-medium">
                                                Display Settings
                                            </h3>
                                            <p className="text-sm text-muted-foreground">
                                                Personalize how the application looks for you.
                                            </p>
                                        </div>
                                        <Separator />
                                        <div className="space-y-4">
                                            <Label>Appearance</Label>
                                            <div className="grid grid-cols-3 gap-3">
                                                <Button
                                                    variant={
                                                        theme === "light" ? "secondary" : "outline"
                                                    }
                                                    className={cn(
                                                        "flex-col h-auto py-4 gap-2",
                                                        theme === "light" && "border-primary",
                                                    )}
                                                    onClick={() => setTheme("light")}
                                                >
                                                    <Sun className="h-5 w-5" />
                                                    <span className="text-xs">Light</span>
                                                </Button>
                                                <Button
                                                    variant={
                                                        theme === "dark" ? "secondary" : "outline"
                                                    }
                                                    className={cn(
                                                        "flex-col h-auto py-4 gap-2",
                                                        theme === "dark" && "border-primary",
                                                    )}
                                                    onClick={() => setTheme("dark")}
                                                >
                                                    <Moon className="h-5 w-5" />
                                                    <span className="text-xs">Dark</span>
                                                </Button>
                                                <Button
                                                    variant={
                                                        theme === "system" ? "secondary" : "outline"
                                                    }
                                                    className={cn(
                                                        "flex-col h-auto py-4 gap-2",
                                                        theme === "system" && "border-primary",
                                                    )}
                                                    onClick={() => setTheme("system")}
                                                >
                                                    <Monitor className="h-5 w-5" />
                                                    <span className="text-xs">System</span>
                                                </Button>
                                            </div>
                                        </div>
                                    </TabsContent>
                                    <TabsContent value="advanced" className="m-0 space-y-6">
                                        <div>
                                            <h3 className="text-lg font-medium">Advanced</h3>
                                            <p className="text-sm text-muted-foreground">
                                                Advanced configuration and experimental features.
                                            </p>
                                        </div>
                                        <Separator />
                                        <div className="flex items-center justify-between border rounded-lg p-4">
                                            <div className="space-y-0.5">
                                                <Label className="text-base flex items-center gap-2">
                                                    <Database className="h-4 w-4" /> Enable Cache
                                                </Label>
                                                <p className="text-sm text-muted-foreground">
                                                    Use a 30-minute local cache for file list requests to improve performance.
                                                </p>
                                            </div>
                                            <Checkbox
                                                checked={useCache}
                                                onCheckedChange={(checked) => setUseCache(!!checked)}
                                            />
                                        </div>
                                    </TabsContent>
                                </div>
                            </ScrollArea>
                        </div>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}
