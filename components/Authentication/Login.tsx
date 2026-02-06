"use client";

import React, { useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  KeyRound,
  AlertCircle,
  Mail,
  ArrowLeft,
  Lock,
  Shield,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { authenticationApiFactory } from "@/Service/Factories";
import { cn } from "@/lib/utils";

type LoginStep = "EMAIL" | "CHOICE" | "PASSWORD";

const stepOrder: LoginStep[] = ["EMAIL", "CHOICE", "PASSWORD"];

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -40 : 40,
    opacity: 0,
  }),
};

const slideTransition = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
};

const inputClassName =
  "pl-10 h-11 rounded-xl border-white/[0.08] bg-white/[0.04] text-white placeholder:text-zinc-500 focus-visible:border-zinc-400/50 focus-visible:ring-zinc-400/20 transition-colors";

const primaryButtonClassName =
  "w-full h-11 rounded-xl bg-white text-zinc-950 font-medium hover:bg-zinc-200 transition-all duration-300 shadow-lg shadow-white/10 hover:shadow-white/20 active:scale-[0.98] border-0";

export const Login = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [step, setStep] = useState<LoginStep>("EMAIL");
  const [direction, setDirection] = useState<1 | -1>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPasskey, setHasPasskey] = useState(false);
  const [hasTwoFactor, setHasTwoFactor] = useState(false);

  // OTP input refs for 6 individual digit boxes
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const otpDigits = Array.from({ length: 6 }, (_, i) => twoFactorCode[i] || "");

  const handleOtpChange = (index: number, value: string) => {
    // Allow only digits
    const digit = value.replace(/\D/g, "").slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    const newCode = newDigits.join("");
    setTwoFactorCode(newCode);

    // Auto-advance to next box
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !otpDigits[index]?.trim() && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    setTwoFactorCode(pasted);
    // Focus on the next empty box or last box
    const focusIndex = Math.min(pasted.length, 5);
    otpRefs.current[focusIndex]?.focus();
  };

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
      setDirection(1);
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

  const visibleSteps = stepOrder.filter((s) => s !== "CHOICE" || hasPasskey);
  const currentStepIndex = stepOrder.indexOf(step);

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 py-1">
      {visibleSteps.map((s) => (
        <motion.div
          key={s}
          className={cn(
            "h-1.5 rounded-full transition-colors duration-300",
            step === s
              ? "bg-white w-6"
              : currentStepIndex > stepOrder.indexOf(s)
                ? "bg-white/40 w-1.5"
                : "bg-white/15 w-1.5",
          )}
          layout
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      ))}
    </div>
  );

  const renderEmailStep = () => (
    <form onSubmit={handleEmailSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="email" className="text-sm font-medium text-zinc-300">
          E-posta Adresi
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 pointer-events-none" />
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
            className={inputClassName}
          />
        </div>
      </div>
      <Button
        type="submit"
        className={primaryButtonClassName}
        disabled={loading}
      >
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
      <div className="flex flex-col items-center justify-center space-y-2 border-b border-white/[0.08] pb-4">
        <div className="flex items-center space-x-2 text-zinc-400">
          <Mail className="h-4 w-4" />
          <span className="text-sm">{email}</span>
        </div>
        <button
          className="text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          onClick={() => {
            setDirection(-1);
            setStep("EMAIL");
          }}
          type="button"
        >
          Değiştir
        </button>
      </div>

      <div className="grid gap-3">
        <motion.button
          onClick={() => {
            setDirection(1);
            setStep("PASSWORD");
          }}
          className="flex w-full items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 text-sm text-white transition-colors hover:bg-white/[0.06] hover:border-white/[0.12]"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06]">
            <Lock className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="text-left">
            <div className="font-medium">Şifre ile devam et</div>
            <div className="text-xs text-zinc-500">
              Şifrenizi kullanarak giriş yapın
            </div>
          </div>
        </motion.button>

        <motion.button
          onClick={handlePasskeyLogin}
          disabled={loading}
          className="flex w-full items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 text-sm text-white transition-colors hover:bg-white/[0.06] hover:border-white/[0.12] disabled:opacity-50 disabled:pointer-events-none"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06]">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
            ) : (
              <KeyRound className="h-4 w-4 text-zinc-400" />
            )}
          </div>
          <div className="text-left">
            <div className="font-medium">Passkey ile devam et</div>
            <div className="text-xs text-zinc-500">
              Biyometrik veya güvenlik anahtarı kullanın
            </div>
          </div>
        </motion.button>
      </div>
    </div>
  );

  const renderPasswordStep = () => (
    <form onSubmit={handlePasswordLogin} className="grid gap-4">
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-2">
        <div className="flex items-center space-x-2 text-sm text-zinc-400">
          <Mail className="h-4 w-4" />
          <span>{email}</span>
        </div>
        <button
          type="button"
          className="flex items-center text-sm text-zinc-400 hover:text-white transition-colors"
          onClick={() => {
            if (hasPasskey) {
              setDirection(-1);
              setStep("CHOICE");
            } else {
              setDirection(-1);
              setStep("EMAIL");
            }
          }}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Geri
        </button>
      </div>

      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label
            htmlFor="password"
            className="text-sm font-medium text-zinc-300"
          >
            Şifre
          </Label>
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            Şifremi unuttum?
          </Link>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 pointer-events-none" />
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
            className={inputClassName}
          />
        </div>
      </div>

      {hasTwoFactor && (
        <motion.div
          className="grid gap-3"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Shield className="h-4 w-4 text-zinc-500" />
            <Label className="text-sm font-medium text-zinc-300">
              Doğrulama Kodu
            </Label>
          </div>
          <div className="flex justify-center gap-2">
            {otpDigits.map((digit, i) => (
              <React.Fragment key={i}>
                {i === 3 && (
                  <div className="flex items-center px-1">
                    <div className="h-px w-3 bg-white/[0.12]" />
                  </div>
                )}
                <input
                  ref={(el) => {
                    otpRefs.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  value={digit.trim()}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  onPaste={i === 0 ? handleOtpPaste : undefined}
                  disabled={loading}
                  className="h-12 w-10 rounded-lg border border-white/[0.08] bg-white/[0.04] text-center text-lg font-medium text-white caret-white transition-all focus:border-zinc-400/50 focus:ring-1 focus:ring-zinc-400/20 focus:outline-none disabled:opacity-50"
                />
              </React.Fragment>
            ))}
          </div>
          <p className="text-center text-xs text-zinc-500">
            Authenticator uygulamanızdaki 6 haneli kodu girin
          </p>
        </motion.div>
      )}

      <Button
        type="submit"
        disabled={loading || (hasTwoFactor && twoFactorCode.length < 6)}
        className={primaryButtonClassName}
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
    <div className="grid gap-5">
      {/* Error alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <Alert
              variant="destructive"
              className="border-red-500/30 bg-red-500/10 backdrop-blur-sm"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Hata</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step indicator */}
      {renderStepIndicator()}

      {/* Step content with transitions */}
      <AnimatePresence mode="wait" custom={direction}>
        {step === "EMAIL" && (
          <motion.div
            key="email"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
          >
            {renderEmailStep()}
          </motion.div>
        )}

        {step === "CHOICE" && (
          <motion.div
            key="choice"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
          >
            {renderChoiceStep()}
          </motion.div>
        )}

        {step === "PASSWORD" && (
          <motion.div
            key="password"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={slideTransition}
          >
            {renderPasswordStep()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Register link */}
      <AnimatePresence>
        {step === "EMAIL" && (
          <motion.p
            key="register-link"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="text-center text-sm text-zinc-500"
          >
            Hesabınız yok mu?{" "}
            <Link
              href="/register"
              className="font-medium text-zinc-300 hover:text-white transition-colors"
            >
              Kayıt Ol
            </Link>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};
