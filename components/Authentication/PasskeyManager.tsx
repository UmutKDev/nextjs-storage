"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import { authenticationApiFactory } from "@/Service/Factories";
import { useQuery, useMutation } from "@tanstack/react-query";

export default function PasskeyManager() {
  const [deviceName, setDeviceName] = useState("");
  const [supportsPasskey, setSupportsPasskey] = useState(false);

  const passkeysQuery = useQuery<any>({
    queryKey: ["authentication", "passkeys"],
    queryFn: async () => {
      const res = await authenticationApiFactory.getPasskeys();
      // API may return a single PasskeyViewModel or array; normalize to array
      const result = res.data?.Result;
      if (!result) return [];
      return Array.isArray(result) ? result : [result];
    },
    staleTime: 60 * 1000,
  });

  const registerMutation = useMutation<any, Error, string>({
    mutationFn: async (name: string) => {
      // dynamic import to avoid dependency if not installed
      const swa = await import("@simplewebauthn/browser");
      if (!swa.browserSupportsWebAuthn()) throw new Error("Passkey desteklenmiyor");

      const beginRes = await authenticationApiFactory.passkeyRegisterBegin({
        passkeyRegistrationBeginRequestModel: { DeviceName: name },
      });

      const options = beginRes.data?.Result?.Options;
      if (!options) throw new Error("Başlatma seçenekleri alınamadı");

      const credential = await swa.startRegistration(options);

      const finishRes = await authenticationApiFactory.passkeyRegisterFinish({
        passkeyRegistrationFinishRequestModel: {
          DeviceName: name,
          Credential: credential,
        },
      });

      return finishRes.data?.Result;
    },
    onSuccess: () => passkeysQuery.refetch(),
    onError: (err: any) => toast.error(err?.message || "Kayıt başarısız"),
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      await authenticationApiFactory.deletePasskey({ passkeyId: id });
    },
    onSuccess: () => passkeysQuery.refetch(),
  });

  useEffect(() => {
    import("@simplewebauthn/browser")
      .then((swa) => setSupportsPasskey(swa.browserSupportsWebAuthn()))
      .catch(() => setSupportsPasskey(false));
  }, []);

  const handleRegister = async () => {
    if (!deviceName) return toast.error("Cihaz adı gerekli");
    try {
      await registerMutation.mutateAsync(deviceName);
      setDeviceName("");
      toast.success("Passkey kaydedildi");
    } catch (err: any) {
      console.error(err);
    }
  };

  const passkeys = Array.isArray(passkeysQuery.data) ? passkeysQuery.data : (passkeysQuery.data ? [passkeysQuery.data] : []);

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Passkey'ler</h3>
      {!supportsPasskey && (
        <p className="text-sm text-muted-foreground">Tarayıcınız passkey desteklemiyor.</p>
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        <Input
          placeholder="Cihaz adı (örn: iPhone)"
          value={deviceName}
          onChange={(e) => setDeviceName(e.target.value)}
          disabled={!supportsPasskey || registerMutation.status === 'pending'}
        />
        <Button onClick={handleRegister} disabled={!supportsPasskey || registerMutation.status === 'pending'}>
          {registerMutation.status === 'pending' ? "Kayıt yapılıyor..." : "Yeni Passkey Ekle"}
        </Button>
      </div>

      <div>
        <h4 className="text-sm font-medium">Kayıtlı Passkey'ler</h4>
        <ul className="mt-2 space-y-2">
          {passkeys.map((p: any) => (
            <li key={p.Id} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{p.DeviceName}</div>
                <div className="text-xs text-muted-foreground">{p.DeviceType} · Son kullanım: {p.LastUsedAt ? new Date(p.LastUsedAt).toLocaleString() : "-"}</div>
              </div>
              <div>
                <Button size="sm" variant="destructive" onClick={() => deleteMutation.mutate(p.Id)}>
                  Sil
                </Button>
              </div>
            </li>
          ))}
          {!passkeys.length && <li className="text-sm text-muted-foreground">Kayıtlı passkey yok.</li>}
        </ul>
      </div>
    </div>
  );
}
