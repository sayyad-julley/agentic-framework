/**
 * Feature Service Abstraction Layer
 * 
 * Following Abstraction Layer Pattern from implementing-unleash-featureops skill:
 * - Centralize feature flag logic in dedicated service
 * - Decouple application from Unleash SDK
 * - Enable easy mocking for tests
 * - Simplify flag cleanup (flags in one place)
 * 
 * Best Practices Applied:
 * - Abstraction layer decouples application from SDK
 * - Type-safe methods for each feature flag
 * - Context building centralized
 * - Easy to mock for unit tests
 * 
 * Anti-Patterns Avoided:
 * - ❌ Direct SDK calls scattered throughout codebase (fragments control flow)
 * - ❌ Multiple flag evaluations within single request (causes inconsistency)
 */

import { Unleash, UnleashContext } from 'unleash-client';
import { getUnleash } from './unleash';

/**
 * Feature flag context builder
 * Builds complete context with all required fields for strategy evaluation
 */
export interface FeatureContext {
  userId?: string;
  sessionId?: string;
  remoteAddress?: string;
  environment?: string;
  email?: string;
  tenantId?: string;
  [key: string]: string | undefined;
}

/**
 * Feature variant result
 */
export interface FeatureVariant {
  name: string;
  enabled: boolean;
  payload?: string;
}

/**
 * Feature Service Abstraction Layer
 * 
 * Centralizes all feature flag logic, decoupling application from Unleash SDK.
 * This enables:
 * - Easy mocking for tests
 * - Faster cleanup (flags in one place)
 * - Architectural clarity
 */
export class FeatureService {
  private unleash: Unleash;

  constructor(unleash?: Unleash) {
    const unleashInstance = unleash || getUnleash();
    if (!unleashInstance) {
      throw new Error('Unleash SDK not initialized. Please check UNLEASH_SERVER_URL and UNLEASH_API_TOKEN environment variables.');
    }
    this.unleash = unleashInstance;
  }

  /**
   * Build Unleash context from application context
   * Ensures complete context with all required fields
   * 
   * CRITICAL: For "default" stickiness to work with userId, userId must always be present.
   * Default stickiness tries: userId → sessionId → random
   */
  private buildContext(context: FeatureContext): UnleashContext {
    // Ensure userId is always present for "default" stickiness
    // If not provided, derive from email or generate consistent ID
    const userId = context.userId || 
                   (context.email ? `user-${context.email}` : `anonymous-${context.sessionId || Date.now()}`);
    
    return {
      userId: userId, // ✅ Always present for default stickiness
      sessionId: context.sessionId || `session-${Date.now()}`,
      remoteAddress: context.remoteAddress,
      environment: context.environment || process.env.NODE_ENV || 'development',
      properties: {
        ...(context.email && { email: context.email }),
        ...(context.tenantId && { tenantId: context.tenantId }),
      },
    };
  }

  /**
   * Check if new recommendation engine is enabled
   * Example: Gradual rollout + internal team whitelist
   */
  isNewRecommendationEngineEnabled(context: FeatureContext): boolean {
    return this.unleash.isEnabled('feature-new-recommendations', this.buildContext(context));
  }

  /**
   * Get recommendation engine variant (for A/B testing)
   * Uses userId stickiness for consistent variant assignment
   */
  getRecommendationVariant(context: FeatureContext): FeatureVariant {
    const variant = this.unleash.getVariant('feature-new-recommendations', this.buildContext(context));
    return {
      name: variant.name,
      enabled: variant.enabled,
      payload: variant.payload,
    };
  }

  /**
   * Check if new UI design is enabled
   * Example: Multi-strategy (Gradual Rollout OR User IDs)
   */
  isNewUIEnabled(context: FeatureContext): boolean {
    return this.unleash.isEnabled('feature-new-ui', this.buildContext(context));
  }

  /**
   * Get UI variant for A/B testing
   */
  getUIVariant(context: FeatureContext): FeatureVariant {
    const variant = this.unleash.getVariant('feature-new-ui', this.buildContext(context));
    return {
      name: variant.name,
      enabled: variant.enabled,
      payload: variant.payload,
    };
  }

  /**
   * Check if premium features are enabled
   * Example: Constraint-based targeting (email domain, tenantId)
   */
  isPremiumEnabled(context: FeatureContext): boolean {
    return this.unleash.isEnabled('feature-premium', this.buildContext(context));
  }

  /**
   * Check if experimental feature is enabled
   * Example: Kill switch for emergency disable
   */
  isExperimentalFeatureEnabled(context: FeatureContext): boolean {
    return this.unleash.isEnabled('feature-experimental', this.buildContext(context));
  }

  /**
   * Generic method to check any feature flag
   * Use specific methods above when possible for better type safety
   */
  isEnabled(flagName: string, context: FeatureContext): boolean {
    return this.unleash.isEnabled(flagName, this.buildContext(context));
  }

  /**
   * Generic method to get variant for any feature flag
   */
  getVariant(flagName: string, context: FeatureContext): FeatureVariant {
    const variant = this.unleash.getVariant(flagName, this.buildContext(context));
    return {
      name: variant.name,
      enabled: variant.enabled,
      payload: variant.payload,
    };
  }
}

// Singleton instance
let featureServiceInstance: FeatureService | null = null;

/**
 * Get feature service singleton instance
 */
export function getFeatureService(): FeatureService {
  if (!featureServiceInstance) {
    featureServiceInstance = new FeatureService();
  }
  return featureServiceInstance;
}

