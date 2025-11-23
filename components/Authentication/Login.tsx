"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import Link from "next/link";

import { useAuthForm } from "./AuthFormProvider";

export const Login = () => {
  const { values, handleChange, submit, loading, error } = useAuthForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // submit handles sign-in and navigation centrally inside the provider
    await submit();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={values.email}
            placeholder="m@example.com"
            onChange={handleChange}
            required
          />
        </div>

        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <Link href="#" className="ml-auto inline-block text-sm underline">
              Forgot your password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            value={values.password}
            onChange={handleChange}
            required
          />
        </div>

        {error && <div className="text-sm text-red-500">{error}</div>}

        <Button className="w-full" type="submit" disabled={loading}>
          {loading ? "Signing in…" : "Login"}
        </Button>

        <Button variant="outline" className="w-full" type="button">
          Login with Google
        </Button>
      </CardContent>
    </form>
  );
};
