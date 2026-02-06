"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QRCodeCanvas } from "qrcode.react";
import { accountSecurityApiFactory } from "@/Service/Factories";
import { useQuery, useMutation } from "@tanstack/react-query";
import type {
  TwoFactorSetupResponseModel,
  TwoFactorStatusResponseModel,
  TwoFactorBackupCodesResponseModel,
} from "@/Service/Generates/api";
import {
  ShieldCheck,
  ShieldAlert,
  Copy,
  RefreshCw,
  Loader2,
  QrCode,
  CheckCircle2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function TwoFactorManager() {
  const [setupData, setSetupData] =
    useState<TwoFactorSetupResponseModel | null>(null);
  const [code, setCode] = useState("");
  const [showSetup, setShowSetup] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Local error states
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [disableError, setDisableError] = useState<string | null>(null);
  const [regenError, setRegenError] = useState<string | null>(null);

  const statusQuery = useQuery<TwoFactorStatusResponseModel | undefined>({
    queryKey: ["auth", "2fa", "status"],
    queryFn: async () => {
      const res = await accountSecurityApiFactory.twoFactorStatus();
      return res.data?.Result;
    },
    staleTime: 30_000,
  });

  const setupMutation = useMutation<
    TwoFactorSetupResponseModel | undefined,
    Error,
    void
  >({
    mutationFn: async () => {
      const res = await accountSecurityApiFactory.twoFactorSetup();
      return res.data?.Result;
    },
    onSuccess: (data) => {
      setSetupData(data ?? null);
      setShowSetup(true);
    },
  });

  const verifyMutation = useMutation<unknown, Error, string>({
    mutationFn: async (verificationCode: string) => {
      const res = await accountSecurityApiFactory.twoFactorVerify({
        twoFactorVerifyRequestModel: { Code: verificationCode },
      });
      return res.data?.Result;
    },
    onSuccess: () => {
      setSetupData(null);
      setShowSetup(false);
      setCode("");
      setVerifyError(null);
      statusQuery.refetch();
    },
    onError: () => {
      setVerifyError("Doğrulama kodu hatalı.");
    },
  });

  const disableMutation = useMutation<void, Error, string>({
    mutationFn: async (verificationCode: string) => {
      await accountSecurityApiFactory.twoFactorDisable({
        twoFactorVerifyRequestModel: { Code: verificationCode },
      });
    },
    onSuccess: () => {
      statusQuery.refetch();
      setCode("");
      setDisableError(null);
    },
    onError: () => {
      setDisableError("Devre dışı bırakılamadı. Kod hatalı olabilir.");
    },
  });

  const regenMutation = useMutation<
    TwoFactorBackupCodesResponseModel | undefined,
    Error,
    string
  >({
    mutationFn: async (verificationCode: string) => {
      const res = await accountSecurityApiFactory.regenerateBackupCodes({
        twoFactorVerifyRequestModel: { Code: verificationCode },
      });
      return res.data?.Result;
    },
    onSuccess: () => {
      statusQuery.refetch();
      setCode("");
      setRegenError(null);
    },
    onError: () => {
      setRegenError("Kodlar yenilenemedi. Doğrulama kodu hatalı olabilir.");
    },
  });

  const handleCopySecret = () => {
    if (setupData?.Secret) {
      navigator.clipboard.writeText(setupData.Secret);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const isLoading = statusQuery.isLoading;
  const isEnabled = statusQuery.data?.IsEnabled;

  if (isLoading) {
    return (
      <Card className="border-muted/50 bg-muted/10 opacity-70">
        <CardContent className="h-40 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-muted/50 shadow-sm overflow-hidden h-full">
      <CardHeader className="bg-muted/20 pb-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`p-2 rounded-lg ${isEnabled ? "bg-emerald-500/10" : "bg-amber-500/10"}`}
            >
              {isEnabled ? (
                <ShieldCheck
                  className={`h-5 w-5 ${isEnabled ? "text-emerald-600" : "text-amber-600"}`}
                />
              ) : (
                <ShieldAlert className="h-5 w-5 text-amber-600" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">İki Faktörlü Doğrulama</CardTitle>
              <CardDescription>
                Hesabınızı SMS veya Authenticator uygulaması ile koruyun.
              </CardDescription>
            </div>
          </div>
          <Badge
            variant={isEnabled ? "default" : "secondary"}
            className={isEnabled ? "bg-emerald-600 hover:bg-emerald-700" : ""}
          >
            {isEnabled ? "Aktif" : "Pasif"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-8">
        {!isEnabled ? (
          // --- Setup Flow ---
          <div className="space-y-8">
            {!showSetup ? (
              <div className="flex flex-col items-center justify-center py-8 text-center space-y-5">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
                  <QrCode className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="max-w-xs space-y-2">
                  <h4 className="font-semibold text-foreground">
                    2FA Henüz Etkin Değil
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Hesap güvenliğinizi artırmak için iki faktörlü doğrulamayı
                    etkinleştirmenizi öneririz.
                  </p>
                </div>
                <Button
                  onClick={() => setupMutation.mutate()}
                  disabled={setupMutation.status === "pending"}
                  className="mt-2"
                >
                  {setupMutation.status === "pending" && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Kurulumu Başlat
                </Button>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="flex flex-col items-center justify-center space-y-4 p-4 bg-white rounded-xl border shadow-sm">
                    {setupData?.OtpAuthUrl && (
                      <QRCodeCanvas value={setupData.OtpAuthUrl} size={180} />
                    )}
                    <p className="text-xs text-muted-foreground text-center max-w-50">
                      Google Authenticator veya benzeri bir uygulama ile bu QR
                      kodu taratın.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Manuel Kurulum</h4>
                      <p className="text-sm text-muted-foreground">
                        QR kodu okutamıyorsanız bu anahtarı kullanın:
                      </p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 bg-muted px-3 py-2 rounded text-xs font-mono break-all border">
                          {setupData?.Secret}
                        </code>
                        <Button
                          size="icon"
                          variant="outline"
                          className="shrink-0 h-9 w-9"
                          onClick={handleCopySecret}
                        >
                          {isCopied ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Doğrulama Kodu</h4>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Uygulamadaki 6 haneli kod"
                          value={code}
                          onChange={(e) => {
                            setCode(e.target.value);
                            if (verifyError) setVerifyError(null);
                          }}
                          maxLength={6}
                          className="font-mono tracking-widest text-center"
                        />
                        <Button
                          onClick={() => verifyMutation.mutate(code)}
                          disabled={
                            verifyMutation.status === "pending" ||
                            code.length < 6
                          }
                        >
                          {verifyMutation.status === "pending" && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Doğrula
                        </Button>
                      </div>
                      {verifyError && (
                        <div className="text-xs text-destructive font-medium flex items-center gap-1 mt-2">
                          <ShieldAlert className="h-3 w-3" />
                          {verifyError}
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        Kurulumu tamamlamak için kodu girin.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSetup(false)}
                    className="text-muted-foreground"
                  >
                    İptal Et
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          // --- Main Status View ---
          <div className="space-y-6">
            <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4 stroke-emerald-600 dark:stroke-emerald-400" />
              <AlertTitle>Hesabınız Güvende</AlertTitle>
              <AlertDescription>
                İki faktörlü doğrulama şu anda etkin. Giriş yaparken doğrulama
                kodu istenecek.
              </AlertDescription>
            </Alert>

            <div className="space-y-6 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border rounded-xl bg-muted/30">
                <div className="space-y-1">
                  <p className="font-semibold text-sm">Yedek Kodlar</p>
                  {/* <p className="text-xs text-muted-foreground max-w-[200px]">
                    Kalan geçerli kod sayısı:{" "}
                    <span className="font-semibold text-foreground">
                      {statusQuery.data?.RecoveryCodesLeft ?? 0}
                    </span>
                  </p> */}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Kod"
                      className="w-24 text-center h-9 font-mono text-xs"
                      maxLength={6}
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value);
                        if (regenError) setRegenError(null);
                      }}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => regenMutation.mutate(code)}
                      disabled={regenMutation.status === "pending" || !code}
                      className="shrink-0"
                    >
                      <RefreshCw
                        className={`mr-2 h-3.5 w-3.5 ${regenMutation.status === "pending" ? "animate-spin" : ""}`}
                      />
                      Yenile
                    </Button>
                  </div>
                  {regenError && (
                    <div className="text-[10px] text-destructive font-medium">
                      {regenError}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-4 p-5 border rounded-xl border-destructive/20 bg-destructive/5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-semibold text-sm text-destructive">
                      Devre Dışı Bırak
                    </p>
                    <p className="text-xs text-destructive/80 max-w-[250px]">
                      Bu işlem hesabınızın güvenliğini azaltacaktır.
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Kod"
                        className="w-24 text-center h-9 font-mono text-xs bg-background"
                        maxLength={6}
                        value={code}
                        onChange={(e) => {
                          setCode(e.target.value);
                          if (disableError) setDisableError(null);
                        }}
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => disableMutation.mutate(code)}
                        disabled={disableMutation.status === "pending" || !code}
                        className="shrink-0 px-4"
                      >
                        Devre Dışı Bırak
                      </Button>
                    </div>
                    {disableError && (
                      <div className="text-[10px] text-destructive font-bold">
                        {disableError}
                      </div>
                    )}
                  </div>
                </div>
                {!code && !disableError && (
                  <p className="text-[10px] text-destructive/70 pt-3 border-t border-destructive/10">
                    * İşlem yapmak için geçerli bir doğrulama kodu girmeniz
                    gerekir.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
