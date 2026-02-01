"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QRCodeCanvas } from "qrcode.react";
import toast from "react-hot-toast";
import { authenticationApiFactory } from "@/Service/Factories";
import { useQuery, useMutation } from "@tanstack/react-query";

export default function TwoFactorManager() {
  const [setupData, setSetupData] = useState<any | null>(null);
  const [code, setCode] = useState("");

  const statusQuery = useQuery<any>({
    queryKey: ["auth", "2fa", "status"],
    queryFn: async () => {
      const res = await authenticationApiFactory.twoFactorStatus();
      return res.data?.Result;
    },
    staleTime: 30_000,
  });

  const setupMutation = useMutation<any, Error, void>({
    mutationFn: async () => {
      const res = await authenticationApiFactory.twoFactorSetup();
      return res.data?.Result;
    },
    onSuccess: (data) => setSetupData(data),
  });

  const verifyMutation = useMutation<any, Error, string>({
    mutationFn: async (verificationCode: string) => {
      const res = await authenticationApiFactory.twoFactorVerify({
        twoFactorVerifyRequestModel: { Code: verificationCode },
      });
      return res.data?.Result;
    },
    onSuccess: (data) => {
      toast.success("2FA etkinleştirildi");
      setSetupData(null);
      statusQuery.refetch();
    },
  });

  const disableMutation = useMutation<void, Error, string>({
    mutationFn: async (verificationCode: string) => {
      await authenticationApiFactory.twoFactorDisable({
        twoFactorVerifyRequestModel: { Code: verificationCode },
      });
    },
    onSuccess: () => statusQuery.refetch(),
  });

  const regenMutation = useMutation<any, Error, string>({
    mutationFn: async (verificationCode: string) => {
      const res = await authenticationApiFactory.regenerateBackupCodes({
        twoFactorVerifyRequestModel: { Code: verificationCode },
      });
      return res.data?.Result;
    },
    onSuccess: () => statusQuery.refetch(),
  });
  useEffect(() => {
    if (setupData?.OtpAuthUrl) {
      // nothing else — we just render QR
    }
  }, [setupData]);

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">İki Faktörlü Doğrulama (TOTP)</h3>

      {statusQuery.isLoading ? (
        <p className="text-sm text-muted-foreground">Yükleniyor...</p>
      ) : (
        <div className="space-y-3">
          <p className="text-sm">
            Durum: {statusQuery.data?.IsEnabled ? "Etkin" : "Devre Dışı"}
          </p>

          {!statusQuery.data?.IsEnabled ? (
            <div>
              <Button
                onClick={() => setupMutation.mutate()}
                disabled={setupMutation.status === "pending"}
              >
                {setupMutation.status === "pending"
                  ? "Hazırlanıyor..."
                  : "2FA Kur"}
              </Button>

              {setupData && (
                <div className="mt-3">
                  <QRCodeCanvas value={setupData.OtpAuthUrl} size={160} />
                  <p className="text-sm text-muted-foreground mt-2">
                    Secret: <code>{setupData.Secret}</code>
                  </p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <Input
                      placeholder="6 haneli kod"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                    />
                    <Button
                      onClick={() => verifyMutation.mutate(code)}
                      disabled={verifyMutation.status === "pending"}
                    >
                      Doğrula
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Yedek kodlarınız: {statusQuery.data?.BackupCodesRemaining ?? 0}{" "}
                kaldı
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                <Input
                  placeholder="Mevcut kod"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                <Button
                  onClick={() => disableMutation.mutate(code)}
                  disabled={disableMutation.status === "pending"}
                >
                  2FA Devre Dışı Bırak
                </Button>
                <Button
                  onClick={() => regenMutation.mutate(code)}
                  disabled={regenMutation.status === "pending"}
                >
                  Yedek Kodları Yenile
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
