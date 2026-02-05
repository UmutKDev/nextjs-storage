"use client";

import React, { useState, useEffect } from "react";
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

export default function TwoFactorManager() {
  const [setupData, setSetupData] =
    useState<TwoFactorSetupResponseModel | null>(null);
  const [code, setCode] = useState("");

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
    onSuccess: (data) => setSetupData(data ?? null),
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
      statusQuery.refetch();
    },
  });

  const disableMutation = useMutation<void, Error, string>({
    mutationFn: async (verificationCode: string) => {
      await accountSecurityApiFactory.twoFactorDisable({
        twoFactorVerifyRequestModel: { Code: verificationCode },
      });
    },
    onSuccess: () => statusQuery.refetch(),
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
