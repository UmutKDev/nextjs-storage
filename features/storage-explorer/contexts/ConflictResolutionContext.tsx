"use client";

import React from "react";
import { isAxiosError } from "axios";
import type { ConflictDetailsResponseModel } from "@/Service/Generates/api";
import type { ConflictStrategy } from "@/components/Storage/ConflictResolutionModal";
import ConflictResolutionModal from "@/components/Storage/ConflictResolutionModal";

type PendingResolution = {
  conflicts: ConflictDetailsResponseModel;
  operationLabel: string;
  resolve: (strategy: ConflictStrategy | null) => void;
};

type ConflictResolutionContextValue = {
  /**
   * Prompt the user to resolve conflicts. Returns the chosen strategy,
   * or `null` if the user cancelled.
   */
  promptConflictResolution: (
    conflicts: ConflictDetailsResponseModel,
    operationLabel?: string,
  ) => Promise<ConflictStrategy | null>;
};

const ConflictResolutionContext =
  React.createContext<ConflictResolutionContextValue | null>(null);

export function ConflictResolutionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [pending, setPending] = React.useState<PendingResolution | null>(null);
  const [loading, setLoading] = React.useState(false);

  const promptConflictResolution = React.useCallback(
    (
      conflicts: ConflictDetailsResponseModel,
      operationLabel = "Operation",
    ): Promise<ConflictStrategy | null> => {
      return new Promise<ConflictStrategy | null>((resolve) => {
        setPending({ conflicts, operationLabel, resolve });
        setLoading(false);
      });
    },
    [],
  );

  const handleResolve = React.useCallback(
    (strategy: ConflictStrategy) => {
      if (!pending) return;
      setLoading(true);
      pending.resolve(strategy);
      setPending(null);
      setLoading(false);
    },
    [pending],
  );

  const handleClose = React.useCallback(() => {
    if (!pending) return;
    pending.resolve(null);
    setPending(null);
    setLoading(false);
  }, [pending]);

  return (
    <ConflictResolutionContext.Provider value={{ promptConflictResolution }}>
      {children}
      <ConflictResolutionModal
        open={pending !== null}
        onClose={handleClose}
        conflicts={pending?.conflicts ?? null}
        onResolve={handleResolve}
        loading={loading}
        operationLabel={pending?.operationLabel}
      />
    </ConflictResolutionContext.Provider>
  );
}

export function useConflictResolution() {
  const context = React.useContext(ConflictResolutionContext);
  if (!context) {
    throw new Error(
      "useConflictResolution must be used within ConflictResolutionProvider",
    );
  }
  return context;
}

/**
 * Extract ConflictDetailsResponseModel from a 409 Axios error, or return null.
 *
 * The global HttpExceptionFilter wraps the thrown ConflictDetailsResponseModel
 * inside Status.Messages[0], so the actual response body looks like:
 * { Result: null, Status: { Messages: [{ Conflicts, TotalItems, ConflictCount }], Code: 409, ... } }
 */
export function extractConflictDetails(
  error: unknown,
): ConflictDetailsResponseModel | null {
  if (!isAxiosError(error) || error.response?.status !== 409) {
    return null;
  }
  const data = error.response.data;

  // Path: Status.Messages[0].Conflicts
  const firstMessage = data?.Status?.Messages?.[0];
  if (
    firstMessage &&
    typeof firstMessage === "object" &&
    "Conflicts" in firstMessage
  ) {
    return firstMessage as ConflictDetailsResponseModel;
  }

  return null;
}
