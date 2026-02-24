"use client";

import React, { Suspense } from "react";

export default function TeamsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense>{children}</Suspense>;
}
