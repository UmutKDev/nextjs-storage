"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  KeyRound,
  AlertCircle,
  Mail,
  ArrowLeft,
  Lock,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { authenticationApiFactory } from "@/Service/Factories";

type LoginStep = "EMAIL" | "CHOICE" | "PASSWORD";

export const Login = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [step, setStep] = useState<LoginStep>("EMAIL");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPasskey, setHasPasskey] = useState(false);
  const [hasTwoFactor, setHasTwoFactor] = useState(false);

  // Step 1: Email Submission & Check
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Lütfen geçerli bir e-posta adresi girin.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await authenticationApiFactory.loginCheck({
        loginCheckRequestModel: { Email: email },
      });
      const checkResult = res.data.Result;

      if (!checkResult?.Exists) {
        throw new Error("Hesap bulunamadı. Lütfen kayıt olun.");
      }

      const hasPasskeyEnabled = checkResult.HasPasskey;
      setHasPasskey(hasPasskeyEnabled);

      // Check if 2FA is enabled
      const has2FA = checkResult.HasTwoFactor || false;
      setHasTwoFactor(has2FA);

      // If user has Passkey, show choice. Otherwise go to password.
      if (hasPasskeyEnabled) {
        setStep("CHOICE");
      } else {
        setStep("PASSWORD");
      }
    } catch (err: unknown) {
      console.error(err);
      const errorObj = err as Error;
      setError(errorObj.message || "E-posta kontrolü başarısız.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Login with Password
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        twoFactorCode: hasTwoFactor ? twoFactorCode : undefined,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      window.location.href = callbackUrl;
    } catch (err: unknown) {
      console.error(err);
      const errorObj = err as Error;
      setError(errorObj.message || "Giriş yapılamadı.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Login with Passkey
  const handlePasskeyLogin = async () => {
    if (!email) {
      setError("E-posta adresi eksik.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const { startAuthentication, browserSupportsWebAuthn } =
        await import("@simplewebauthn/browser");

      if (!browserSupportsWebAuthn()) {
        throw new Error("Tarayıcı passkey desteklemiyor.");
      }

      const beginRes = await authenticationApiFactory.passkeyLoginBegin({
        passkeyLoginBeginRequestModel: { Email: email },
      });

      const options = beginRes.data?.Result?.Options;
      if (!options) throw new Error("Passkey verisi alınamadı.");

      const credential = await startAuthentication(options);

      const result = await signIn("credentials", {
        email,
        passkey: JSON.stringify(credential),
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      window.location.href = callbackUrl;
    } catch (err: unknown) {
      console.error(err);
      const errorObj = err as Error;
      let msg = "Passkey girişi başarısız.";
      if (errorObj.message && !errorObj.message.includes("{"))
        msg = errorObj.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const renderEmailStep = () => (
    <form onSubmit={handleEmailSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="email">E-posta Adresi</Label>
        <Input
          id="email"
          type="email"
          placeholder="isim@ornek.com"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect="off"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
          disabled={loading}
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          "Devam Et"
        )}
      </Button>
    </form>
  );

  const renderChoiceStep = () => (
    <div className="grid gap-4">
      <div className="flex flex-col items-center justify-center space-y-2 border-b pb-4">
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Mail className="h-4 w-4" />
          <span>{email}</span>
        </div>
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0 text-xs text-primary"
          onClick={() => setStep("EMAIL")}
          type="button"
        >
          Değiştir
        </Button>
      </div>

      <div className="grid gap-3">
        <Button
          variant="outline"
          className="w-full h-11 justify-start px-4"
          onClick={() => setStep("PASSWORD")}
        >
          <Lock className="mr-2 h-4 w-4" />
          Şifre ile devam et
        </Button>
        <Button
          variant="outline"
          className="w-full h-11 justify-start px-4"
          onClick={handlePasskeyLogin}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <KeyRound className="mr-2 h-4 w-4" />
          )}
          Passkey ile devam et
        </Button>
      </div>
    </div>
  );

  const renderPasswordStep = () => (
    <form onSubmit={handlePasswordLogin} className="grid gap-4">
      <div className="flex items-center justify-between border-b pb-4 mb-2">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4" />
          <span>{email}</span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            // If user has passkey, go back to CHOICE, otherwise EMAIL
            if (hasPasskey) {
              setStep("CHOICE");
            } else {
              setStep("EMAIL");
            }
          }}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Geri
        </Button>
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Şifre</Label>
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            Şifremi unuttum?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          autoCapitalize="none"
          autoComplete="current-password"
          disabled={loading}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoFocus
        />
      </div>

      {hasTwoFactor && (
        <div className="grid gap-2">
          <Label htmlFor="twoFactorCode">2FA Kodu</Label>
          <Input
            id="twoFactorCode"
            type="text"
            placeholder="000000"
            inputMode="numeric"
            autoComplete="one-time-code"
            disabled={loading}
            value={twoFactorCode}
            onChange={(e) => setTwoFactorCode(e.target.value)}
            maxLength={6}
            className="text-center tracking-widest"
          />
        </div>
      )}

      <Button
        type="submit"
        disabled={loading || (hasTwoFactor && !twoFactorCode)}
        className="w-full"
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : hasTwoFactor ? (
          "Doğrula ve Giriş Yap"
        ) : (
          "Giriş Yap"
        )}
      </Button>
    </form>
  );

  return (
    <div className="grid gap-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Hata</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {step === "EMAIL" && renderEmailStep()}
      {step === "CHOICE" && renderChoiceStep()}
      {step === "PASSWORD" && renderPasswordStep()}

      {step === "EMAIL" && (
        <p className="px-8 text-center text-sm text-muted-foreground">
          Hesabınız yok mu?{" "}
          <Link
            href="/register"
            className="underline underline-offset-4 hover:text-primary font-medium"
          >
            Kayıt Ol
          </Link>
        </p>
      )}
    </div>
  );
};
