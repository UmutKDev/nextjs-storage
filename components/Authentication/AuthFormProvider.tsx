"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { signIn } from "next-auth/react";
import type { SignInResponse } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

type Values = {
  email: string;
  password: string;
  [k: string]: unknown;
};

type ParsedAuthError = {
  kind: "message";
  message: string;
} | null;

type NextAuthSignInPayload = {
  email?: string;
  password?: string;
};

const parseAuthError = (error?: string | null): ParsedAuthError => {
  if (!error) return null;

  try {
    const parsed = JSON.parse(error);
    if (parsed && typeof parsed.message === "string") {
      return { kind: "message", message: parsed.message };
    }
  } catch {
    /* best-effort parse */
  }

  return { kind: "message", message: error };
};

type AuthFormContextType = {
  values: Values;
  setField: (name: string, value: unknown) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  submit: () => Promise<SignInResponse | undefined>;
  loading: boolean;
  error: string | null;
  reset: () => void;
};

const AuthFormContext = createContext<AuthFormContextType | undefined>(
  undefined,
);

export function useAuthForm() {
  const ctx = useContext(AuthFormContext);
  if (!ctx)
    throw new Error("useAuthForm must be used inside an AuthFormProvider");
  return ctx;
}

export default function AuthFormProvider({
  children,
  initialValues = { email: "", password: "" } as Values,
}: React.PropsWithChildren<{ initialValues?: Values }>) {
  const router = useRouter();
  const [values, setValues] = useState<Values>(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setField = useCallback((name: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setField(name, value);
    },
    [setField],
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setError(null);
    setLoading(false);
  }, [initialValues]);

  const handleNextAuthSignIn = useCallback(
    async (payload: NextAuthSignInPayload) => {
      const result = (await signIn("credentials", {
        redirect: false,
        callbackUrl: "/",
        ...payload,
      })) as SignInResponse | undefined;

      if (!result) {
        throw new Error("Kimlik doğrulama yanıtı alınamadı.");
      }

      if (result.error) {
        const parsed = parseAuthError(result.error);
        const message =
          parsed?.kind === "message"
            ? parsed.message
            : "Kimlik doğrulama başarısız oldu.";
        throw new Error(message);
      }

      setValues(initialValues);

      if (result.ok) {
        const dest = result.url ?? "/";
        try {
          const u = new URL(dest);
          router.push(u.pathname + u.search + u.hash);
        } catch {
          router.push(dest as string);
        }
      }

      return result;
    },
    [initialValues, router, setValues],
  );

  const submit = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      return await handleNextAuthSignIn({
        email: values.email,
        password: values.password,
      });
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Giriş işlemi başarısız oldu.";
      setError(message);
      toast.error(message, { duration: 6000 });
      return undefined;
    } finally {
      setLoading(false);
    }
  }, [
    values.email,
    values.password,
    handleNextAuthSignIn,
    setError,
    setLoading,
  ]);

  const ctx: AuthFormContextType = {
    values,
    setField,
    handleChange,
    submit,
    loading,
    error,
    reset,
  };

  return (
    <AuthFormContext.Provider value={ctx}>{children}</AuthFormContext.Provider>
  );
}
