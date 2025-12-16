"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

import { useAuthForm } from "./AuthFormProvider";

export const Login = () => {
  const {
    values,
    handleChange,
    submit,
    loading,
    error,
    twoFactorRequired,
    cancelTwoFactor,
  } = useAuthForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submit();
  };

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="isim@ornek.com"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={loading}
              value={values.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Şifre</Label>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-muted-foreground hover:text-primary"
              >
                Şifremi unuttum?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              autoCapitalize="none"
              autoComplete="current-password"
              disabled={loading}
              value={values.password}
              onChange={handleChange}
              required
            />
          </div>
          <AnimatePresence initial={false}>
            {twoFactorRequired && (
              <motion.div
                key="twoFactorBlock"
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 320, damping: 30 }}
                className="rounded-xl border bg-muted/40 px-4 py-3 shadow-inner grid gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                    <ShieldCheck className="h-4 w-4" />
                    İki Aşamalı Doğrulama
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={cancelTwoFactor}
                    disabled={loading}
                  >
                    Bilgileri Düzenle
                  </Button>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="twoFactorCode">Doğrulama Kodu</Label>
                  <Input
                    id="twoFactorCode"
                    name="twoFactorCode"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="123456"
                    disabled={loading}
                    value={
                      typeof values.twoFactorCode === "string"
                        ? values.twoFactorCode
                        : ""
                    }
                    onChange={handleChange}
                    required
                  />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Authenticator uygulamanızdaki 6 haneli kodu girin. Kod her 30
                    saniyede yenilenir.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="text-sm font-medium text-destructive">{error}</div>
          )}

          <Button disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {twoFactorRequired ? "Doğrula ve Giriş Yap" : "Giriş Yap"}
          </Button>
        </div>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Veya şununla devam et
          </span>
        </div>
      </div>

      <Button variant="outline" type="button" disabled={loading}>
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <svg
            className="mr-2 h-4 w-4"
            aria-hidden="true"
            focusable="false"
            data-prefix="fab"
            data-icon="google"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 488 512"
          >
            <path
              fill="currentColor"
              d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
            ></path>
          </svg>
        )}
        Google
      </Button>
    </div>
  );
};
