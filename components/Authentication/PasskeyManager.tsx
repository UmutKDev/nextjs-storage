"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { accountSecurityApiFactory } from "@/Service/Factories";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { PasskeyViewModel } from "@/Service/Generates/api";
import {
  KeyRound,
  Smartphone,
  Laptop,
  Trash2,
  Plus,
  Loader2,
  Fingerprint,
  AlertOctagon,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PasskeyManager() {
  const [deviceName, setDeviceName] = useState("");
  const [supportsPasskey, setSupportsPasskey] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Local error states
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const passkeysQuery = useQuery({
    queryKey: ["authentication", "passkeys"],
    queryFn: async () => await accountSecurityApiFactory.getPasskeys(),
    select: (res) => res.data?.Result.Items ?? [],
    staleTime: 60 * 1000,
  });

  const registerMutation = useMutation<unknown, Error, string>({
    mutationFn: async (name: string) => {
      const swa = await import("@simplewebauthn/browser");
      if (!swa.browserSupportsWebAuthn())
        throw new Error("Passkey desteklenmiyor");

      const beginRes = await accountSecurityApiFactory.passkeyRegisterBegin({
        passkeyRegistrationBeginRequestModel: { DeviceName: name },
      });

      const options = beginRes.data?.Result?.Options;
      if (!options) throw new Error("Başlatma seçenekleri alınamadı");

      const credential = await swa.startRegistration(options);

      const finishRes = await accountSecurityApiFactory.passkeyRegisterFinish({
        passkeyRegistrationFinishRequestModel: {
          DeviceName: name,
          Credential: credential,
        },
      });

      return finishRes.data?.Result;
    },
    onSuccess: () => {
      passkeysQuery.refetch();
      setDeviceName("");
      setIsAddingNew(false);
      setRegisterError(null);
    },
    onError: (err) => {
      console.error(err);
      setRegisterError("Passkey eklenirken teknik bir hata oluştu.");
    },
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      await accountSecurityApiFactory.deletePasskey({ passkeyId: id });
    },
    onSuccess: () => {
      passkeysQuery.refetch();
      setDeleteError(null);
    },
    onError: () => {
      setDeleteError("Passkey silinemedi. Lütfen tekrar deneyin.");
    },
  });

  useEffect(() => {
    import("@simplewebauthn/browser")
      .then((swa) => setSupportsPasskey(swa.browserSupportsWebAuthn()))
      .catch(() => setSupportsPasskey(false));
  }, []);

  const handleRegister = async () => {
    if (!deviceName) return;
    try {
      await registerMutation.mutateAsync(deviceName);
    } catch {
      // handled in mutation
    }
  };

  const passkeys = Array.isArray(passkeysQuery.data)
    ? passkeysQuery.data
    : passkeysQuery.data
      ? [passkeysQuery.data]
      : [];

  const getDeviceIcon = (type: string | undefined | null) => {
    if (!type) return <KeyRound className="h-5 w-5 text-purple-500" />;
    const t = type.toLowerCase();
    if (
      t.includes("mobile") ||
      t.includes("phone") ||
      t.includes("android") ||
      t.includes("ios")
    )
      return <Smartphone className="h-5 w-5 text-blue-500" />;
    return <Laptop className="h-5 w-5 text-indigo-500" />; // Default to laptop for desktop/unknown
  };

  return (
    <Card className="border-muted/50 shadow-sm overflow-hidden h-full flex flex-col">
      <CardHeader className="bg-muted/20 pb-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Fingerprint className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <CardTitle className="text-lg">Passkey Yönetimi</CardTitle>
              <CardDescription>
                Şifresiz, biyometrik giriş anahtarları.
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1 flex flex-col relative">
        {deleteError && (
          <div className="absolute top-0 left-0 right-0 z-10 bg-destructive/10 text-destructive text-xs px-4 py-2 text-center font-medium animate-in slide-in-from-top-2">
            {deleteError}
          </div>
        )}

        {/* Add New Section */}
        <div className="p-8 border-b bg-background">
          {!supportsPasskey ? (
            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
              <AlertOctagon className="h-4 w-4" />
              Bu tarayıcı veya cihaz passkey desteklemiyor.
            </div>
          ) : (
            <div className="space-y-3">
              {!isAddingNew ? (
                <Button
                  variant="outline"
                  className="w-full border-dashed border-2 h-12 hover:bg-muted/50 hover:border-solid hover:border-primary/50 transition-all font-normal text-muted-foreground hover:text-foreground"
                  onClick={() => setIsAddingNew(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Yeni Passkey Ekle
                </Button>
              ) : (
                <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                  <label className="text-sm font-medium mb-1.5 block">
                    Cihaz İsmi
                  </label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Örn: Kişisel MacBook, iPhone 15"
                      value={deviceName}
                      onChange={(e) => {
                        setDeviceName(e.target.value);
                        if (registerError) setRegisterError(null);
                      }}
                      autoFocus
                      onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                    />
                    <Button
                      onClick={handleRegister}
                      disabled={
                        !deviceName || registerMutation.status === "pending"
                      }
                    >
                      {registerMutation.status === "pending" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Ekle"
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsAddingNew(false)}
                    >
                      <Plus className="h-4 w-4 rotate-45" />
                    </Button>
                  </div>
                  {registerError && (
                    <p className="text-xs text-destructive mt-2 font-medium bg-destructive/5 p-2 rounded">
                      {registerError}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* List Section */}
        <div className="flex-1 overflow-y-auto max-h-100">
          {passkeysQuery.isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Anahtarlar yükleniyor...
              </p>
            </div>
          ) : passkeys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center text-muted-foreground">
              <KeyRound className="h-12 w-12 stroke-1 opacity-20 mb-3" />
              <p>Henüz tanımlı bir passkey bulunmuyor.</p>
            </div>
          ) : (
            <ul className="divide-y relative">
              {passkeys.map((p) => (
                <li
                  key={p.Id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-8 gap-6 hover:bg-muted/20 transition-colors group"
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1 p-3 rounded-full bg-muted shrink-0">
                      {getDeviceIcon(p.DeviceName)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate pr-4">
                        {p.DeviceName}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground mt-1">
                        <span className="shrink-0 bg-muted px-1.5 py-0.5 rounded">
                          {p.DeviceType || "Cihaz"}
                        </span>
                        <span className="hidden sm:inline opacity-50">•</span>
                        <span className="truncate">
                          Son kullanım:{" "}
                          {p.LastUsedAt
                            ? new Date(p.LastUsedAt).toLocaleDateString("tr-TR")
                            : "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 sm:opacity-0 group-hover:opacity-100 transition-all font-normal h-9 w-9 self-end sm:self-center shrink-0"
                    onClick={() => deleteMutation.mutate(p.Id)}
                    disabled={deleteMutation.status === "pending"}
                  >
                    {deleteMutation.status === "pending" &&
                    deleteMutation.variables === p.Id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
