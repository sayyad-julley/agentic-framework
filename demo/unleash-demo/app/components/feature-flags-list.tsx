"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Spin, Alert, Space, Typography, Button } from "antd";
import { WarningOutlined, ReloadOutlined } from "@ant-design/icons";
import { FeatureFlagCard } from "./feature-flag-card";
import type { FeatureFlagStatus, UserContext } from "../types";

const { Title } = Typography;

interface FeatureFlagsListProps {
  context: UserContext;
}

interface FlagsResponse {
  success: boolean;
  flags: {
    [key: string]: {
      enabled: boolean;
      variant: {
        name: string;
        enabled: boolean;
        payload?: string;
      } | null;
    };
  };
  context: UserContext;
  error?: string;
  diagnostic?: {
    sdkReady?: boolean;
    sdkInitialized?: boolean;
    timestamp?: string;
    unleashReady?: boolean;
    errorType?: string;
    hasEnvVars?: boolean;
    hasUnleashInstance?: boolean;
  };
}

export function FeatureFlagsList({ context }: FeatureFlagsListProps) {
  const [loading, setLoading] = useState(true);
  const [flags, setFlags] = useState<FlagsResponse["flags"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState<boolean | null>(null);
  
  const evaluateFlags = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/features", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(context),
      });

      if (!response.ok) {
        // Handle HTTP errors (500, 503, etc.)
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.error || `Server error: ${response.status} ${response.statusText}`;
        
        // Check if it's a configuration error
        if (errorData.diagnostic?.hasEnvVars === false) {
          setError(
            'Unleash SDK not configured. Please set UNLEASH_SERVER_URL and UNLEASH_API_TOKEN in .env file'
          );
        } else if (errorData.diagnostic?.sdkInitialized === false) {
          setError(
            'Unleash SDK initialization failed. Please check your environment variables and server connection.'
          );
        } else {
          setError(errorMsg);
        }
        
        if (errorData.diagnostic) {
          console.error('Feature flag evaluation failed:', {
            error: errorMsg,
            diagnostic: errorData.diagnostic,
            status: response.status,
          });
        }
        return;
      }

      const data: FlagsResponse = await response.json();

      if (data.success) {
        setFlags(data.flags);
        
        // Store SDK readiness state for UI display
        if (data.diagnostic) {
          setSdkReady(data.diagnostic.sdkReady ?? null);
          if (!data.diagnostic.sdkReady) {
            console.warn('⚠️ Unleash SDK not ready. Flags may return disabled. Wait 15-20 seconds after server start.');
          } else {
            console.log('✅ Unleash SDK is ready - flags evaluated successfully');
          }
        }
      } else {
        const errorMsg = data.error || "Failed to evaluate feature flags";
        if (data.diagnostic) {
          console.error('Feature flag evaluation failed:', {
            error: errorMsg,
            diagnostic: data.diagnostic,
          });
        }
        setError(errorMsg);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [context]);

  useEffect(() => {
    if (context.userId || context.email) {
      evaluateFlags();
    } else {
      setLoading(false);
    }
  }, [context, evaluateFlags]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    // Check if it's a configuration error
    const isConfigError = error.includes('UNLEASH_SERVER_URL') || 
                          error.includes('UNLEASH_API_TOKEN') ||
                          error.includes('not configured') ||
                          error.includes('initialization failed');
    
    return (
      <Alert
        message="Error"
        description={
          <div>
            <p className="mb-2">{error}</p>
            {isConfigError && (
              <div className="mt-2 text-sm">
                <p className="font-semibold mb-1">To fix this:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Create a <code className="bg-gray-200 px-1 rounded">.env</code> file in the <code className="bg-gray-200 px-1 rounded">unleash-demo</code> directory</li>
                  <li>Add your Unleash configuration:
                    <pre className="bg-gray-100 p-2 rounded mt-1 text-xs">
{`UNLEASH_SERVER_URL=https://your-instance.com
UNLEASH_API_TOKEN=your_token_here`}
                    </pre>
                  </li>
                  <li>Restart the development server</li>
                </ol>
              </div>
            )}
          </div>
        }
        type="error"
        showIcon
        className="mb-4"
      />
    );
  }

  if (!flags) {
    return (
      <Alert
        message="No Context"
        description="Please provide user context (User ID or Email) to evaluate feature flags."
        type="info"
        showIcon
        className="mb-4"
      />
    );
  }

  const flagDescriptions: Record<string, string> = {
    "feature-new-recommendations":
      "New recommendation engine with A/B testing. Uses gradual rollout + internal team whitelist. Variants: control, variant-a, variant-b",
    "feature-new-ui":
      "New UI design with multi-strategy evaluation (Gradual Rollout OR User IDs). Internal team always enabled.",
    "feature-premium":
      "Premium features with constraint-based targeting (email domain, tenantId). Standard strategy with constraints.",
    "feature-experimental":
      "Experimental feature with kill switch capability. Can be disabled instantly in production.",
  };

  return (
    <Space direction="vertical" size="large" className="w-full">
      <div className="flex justify-between items-center">
        <Title level={3} className="!mb-0">Feature Flag Evaluation Results</Title>
        <Button 
          icon={<ReloadOutlined />} 
          onClick={evaluateFlags}
          loading={loading}
        >
          Refresh
        </Button>
      </div>
      
      {sdkReady === false && (
        <Alert
          message="SDK Not Ready"
          description={
            <div>
              <p>The Unleash SDK is still synchronizing with the server. Flags may return disabled.</p>
              <p className="mt-2">
                <strong>Troubleshooting Steps:</strong>
              </p>
              <ol className="list-decimal list-inside mt-1 ml-2 space-y-1">
                <li>Check server logs for "Unleash client synchronized" or error messages</li>
                <li>Verify your flag is enabled in Unleash UI (correct environment: "development")</li>
                <li>Verify your strategy is active and configured correctly</li>
                <li>Check that UNLEASH_SERVER_URL and UNLEASH_API_TOKEN are set in .env file</li>
                <li>Test connection: Visit <code className="bg-gray-200 px-1 rounded">/api/features</code> (GET) to see diagnostics</li>
                <li>Click "Refresh" button to retry evaluation</li>
              </ol>
              {flags && (
                <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                  <p className="font-semibold">Note:</p>
                  <p>Flags are being evaluated but may return disabled if SDK hasn't synced yet. Check server console for detailed diagnostics.</p>
                </div>
              )}
            </div>
          }
          type="warning"
          icon={<WarningOutlined />}
          showIcon
          className="mb-4"
          action={
            <Button size="small" onClick={evaluateFlags} loading={loading}>
              Retry
            </Button>
          }
        />
      )}
      
      {Object.entries(flags).map(([flagName, flagStatus]) => (
        <FeatureFlagCard
          key={flagName}
          flagName={flagName}
          description={flagDescriptions[flagName] || "Feature flag"}
          status={{
            name: flagName,
            enabled: flagStatus.enabled,
            variant: flagStatus.variant || undefined,
          }}
          context={context}
        />
      ))}
    </Space>
  );
}
