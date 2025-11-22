"use client";

import React from "react";
import { Badge } from "antd";
import { useAbly } from "../providers/ably-provider";
import type { Types } from "ably";

/**
 * Connection Status Component
 * 
 * Displays real-time Ably connection state with visual indicators.
 * 
 * Connection States:
 * - initialized: Client created, not yet connected
 * - connecting: Connection attempt in progress
 * - connected: Successfully connected
 * - disconnected: Temporarily disconnected (state retained for 2 minutes)
 * - suspended: Connection lost for >2 minutes (state lost, requires History API recovery)
 * - closing: Connection closing
 * - closed: Connection closed
 * - failed: Connection failed
 */
export function ConnectionStatus() {
  const { connectionState, connectionError } = useAbly();

  const getStatusColor = (state: Types.ConnectionState): string => {
    switch (state) {
      case "connected":
        return "success";
      case "connecting":
        return "processing";
      case "disconnected":
        return "warning";
      case "suspended":
        return "error";
      case "failed":
        return "error";
      case "closed":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusText = (state: Types.ConnectionState): string => {
    switch (state) {
      case "initialized":
        return "Initialized";
      case "connecting":
        return "Connecting...";
      case "connected":
        return "Connected";
      case "disconnected":
        return "Disconnected (reconnecting...)";
      case "suspended":
        return "Suspended (state lost)";
      case "closing":
        return "Closing...";
      case "closed":
        return "Closed";
      case "failed":
        return "Failed";
      default:
        return state;
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Badge status={getStatusColor(connectionState) as any} />
      <span className="text-sm">
        {getStatusText(connectionState)}
        {connectionError && (
          <span className="text-red-500 ml-2">
            ({connectionError.message})
          </span>
        )}
      </span>
    </div>
  );
}

