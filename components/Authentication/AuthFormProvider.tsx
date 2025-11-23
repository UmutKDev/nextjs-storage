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
    [setField]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setError(null);
    setLoading(false);
  }, [initialValues]);

  const submit = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = (await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
        callbackUrl: "/",
      })) as SignInResponse | undefined;

      if (result?.error) {
        const message = (result.error as string) ?? "Login failed";
        setError(message);
        toast.error(message, { duration: 6000 });
      } else if (result?.ok) {
        // handle absolute url -> path
        const dest = result?.url ?? "/";
        try {
          const u = new URL(dest);
          router.push(u.pathname + u.search + u.hash);
        } catch {
          router.push(dest as string);
        }
      }

      return result;
    } catch (err) {
      const message = (err instanceof Error && err.message) || "Login failed";
      setError(message);
      toast.error(message, { duration: 6000 });
      return undefined;
    } finally {
      setLoading(false);
    }
  }, [router, values.email, values.password]);

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
