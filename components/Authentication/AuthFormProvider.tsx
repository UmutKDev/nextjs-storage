"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { signIn } from "next-auth/react";
import type { SignInResponse } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { authenticationApiFactory } from "@/Service/Factories";
import type { AuthenticationTokenResponseModel } from "@/Service/Generates/api";

type Values = {
  email: string;
  password: string;
  twoFactorCode?: string;
  [k: string]: unknown;
};

type AuthFormContextType = {
  values: Values;
  setField: (name: string, value: unknown) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  submit: () => Promise<SignInResponse | undefined>;
  loading: boolean;
  error: string | null;
  reset: () => void;
  twoFactorRequired: boolean;
  cancelTwoFactor: () => void;
};

const AuthFormContext = createContext<AuthFormContextType | undefined>(
  undefined
);

export function useAuthForm() {
  const ctx = useContext(AuthFormContext);
  if (!ctx)
    throw new Error("useAuthForm must be used inside an AuthFormProvider");
  return ctx;
}

export default function AuthFormProvider({
  children,
  initialValues = { email: "", password: "", twoFactorCode: "" } as Values,
}: React.PropsWithChildren<{ initialValues?: Values }>) {
  const router = useRouter();
  const [values, setValues] = useState<Values>(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [twoFactorToken, setTwoFactorToken] = useState<string | null>(null);

  const setField = useCallback((name: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setField(name, value);
    },
    [setField]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setError(null);
    setLoading(false);
    setTwoFactorToken(null);
  }, [initialValues]);

  const cancelTwoFactor = useCallback(() => {
    setTwoFactorToken(null);
    setValues((prev) => ({ ...prev, twoFactorCode: "" }));
    setError(null);
  }, []);

  const finalizeWithTokens = async (
    tokens: AuthenticationTokenResponseModel
  ) => {
    if (!tokens.accessToken) {
      throw new Error("Geçersiz erişim tokenı.");
    }

    const result = (await signIn("credentials", {
      redirect: false,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken ?? "",
      callbackUrl: "/",
    })) as SignInResponse | undefined;

    if (result?.error) {
      throw new Error(result.error as string);
    }

    setTwoFactorToken(null);
    setValues(initialValues);

    if (result?.ok) {
      const dest = result.url ?? "/";
      try {
        const u = new URL(dest);
        router.push(u.pathname + u.search + u.hash);
      } catch {
        router.push(dest as string);
      }
    }

    return result;
  };

  const submit = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (twoFactorToken) {
        if (!values.twoFactorCode) {
          setError("Doğrulama kodu gerekli.");
          return undefined;
        }
        const verifyRes =
          await authenticationApiFactory.verifyTwoFactorLogin({
            authenticationTwoFactorLoginRequestModel: {
              code: values.twoFactorCode as string,
              token: twoFactorToken,
            },
          });
        const tokens = verifyRes.data.result;
        if (!tokens) throw new Error("Doğrulama başarısız oldu.");
        return await finalizeWithTokens(tokens);
      }

      const loginRes = await authenticationApiFactory.login({
        authenticationSignInRequestModel: {
          email: values.email,
          password: values.password,
        },
      });

      const tokens = loginRes.data.result;
      if (!tokens) throw new Error("Giriş başarısız.");

      if (tokens.twoFactorRequired) {
        if (!tokens.twoFactorToken) {
          throw new Error("İki aşamalı doğrulama için token alınamadı.");
        }
        setTwoFactorToken(tokens.twoFactorToken);
        setError("Hesabınız için doğrulama kodu gerekiyor.");
        toast.success("Lütfen doğrulama kodunuzu girin.", { duration: 5000 });
        return undefined;
      }

      return await finalizeWithTokens(tokens);
    } catch (err) {
      const message = (err instanceof Error && err.message) || "Login failed";
      setError(message);
      toast.error(message, { duration: 6000 });
      return undefined;
    } finally {
      setLoading(false);
    }
  }, [twoFactorToken, values.email, values.password, values.twoFactorCode]);

  const ctx: AuthFormContextType = {
    values,
    setField,
    handleChange,
    submit,
    loading,
    error,
    reset,
    twoFactorRequired: !!twoFactorToken,
    cancelTwoFactor,
  };

  return (
    <AuthFormContext.Provider value={ctx}>{children}</AuthFormContext.Provider>
  );
}
