/**
 * Type definitions for Unleash demo
 */

export interface FeatureFlagStatus {
  name: string;
  enabled: boolean;
  variant?: {
    name: string;
    enabled: boolean;
    payload?: string;
  };
}

export interface UserContext {
  userId?: string;
  sessionId?: string;
  email?: string;
  tenantId?: string;
  remoteAddress?: string;
}

export interface FeatureFlagDemo {
  flagName: string;
  description: string;
  enabled: boolean;
  variant?: FeatureFlagStatus['variant'];
  context: UserContext;
}

