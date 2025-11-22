"use client";

import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import * as Ably from "ably";
import type { Types } from "ably";

/**
 * Ably Provider Component
 * 
 * Implements Singleton SDK Instance pattern (Best Practice)
 * - Reuses Ably client throughout application lifecycle
 * - Manages connection state and recovery
 * - Provides connection state monitoring
 * 
 * Anti-Pattern Avoided: Improper Instantiation
 * - Single instance prevents error 80021 (Max New Connections Rate Exceeded)
 */
interface AblyContextType {
  ably: Ably.Realtime | null;
  connectionState: Types.ConnectionState;
  connectionError: Types.ErrorInfo | null;
}

const AblyContext = createContext<AblyContextType>({
  ably: null,
  connectionState: "initialized",
  connectionError: null,
});

/**
 * Singleton Ably Client Instance
 * 
 * Best Practice: Reuse SDK instance throughout application lifecycle
 * This prevents connection overhead and rate limit issues
 */
let ablyClient: Ably.Realtime | null = null;

function getAblyClient(): Ably.Realtime {
  // Singleton pattern: reuse existing instance
  if (ablyClient) {
    return ablyClient;
  }

  // Initialize with token authentication (mandatory for client-side)
  // Anti-Pattern Avoided: Basic auth on client-side
  ablyClient = new Ably.Realtime({
    authUrl: "/api/ably-token",
    authMethod: "GET",
    // Prevent auto-connect during SSR in Next.js
    autoConnect: typeof window !== "undefined",
    // Connection state retention: 2 minutes
    // Beyond this, state is lost (suspended) and requires History API recovery
  });

  return ablyClient;
}

export function AblyProvider({ children }: { children: React.ReactNode }) {
  const [ably, setAbly] = useState<Ably.Realtime | null>(null);
  const [connectionState, setConnectionState] = useState<Types.ConnectionState>("initialized");
  const [connectionError, setConnectionError] = useState<Types.ErrorInfo | null>(null);

  useEffect(() => {
    // Initialize singleton client
    const client = getAblyClient();
    setAbly(client);

    // Monitor connection state changes
    // Best Practice: Monitor connection state to detect suspended state
    client.connection.on((stateChange: Types.ConnectionStateChange) => {
      setConnectionState(stateChange.current);
      setConnectionError(stateChange.reason || null);

      // Handle suspended state (connection lost for >2 minutes)
      if (stateChange.current === "suspended") {
        console.warn("Connection suspended - state lost. History API recovery required.");
      }

      // Handle connection errors
      if (stateChange.reason) {
        console.error("Connection error:", stateChange.reason);
      }
    });

    // Cleanup: Don't close connection on unmount (singleton pattern)
    // The connection should persist for the application lifecycle
    return () => {
      // Note: We don't close the connection here to maintain singleton pattern
      // Connection will be reused if component remounts
    };
  }, []);

  const value = useMemo(
    () => ({
      ably,
      connectionState,
      connectionError,
    }),
    [ably, connectionState, connectionError]
  );

  return <AblyContext.Provider value={value}>{children}</AblyContext.Provider>;
}

export function useAbly() {
  const context = useContext(AblyContext);
  if (!context) {
    throw new Error("useAbly must be used within AblyProvider");
  }
  return context;
}

