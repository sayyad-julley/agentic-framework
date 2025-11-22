/**
 * API Route for Feature Flag Evaluation
 * 
 * Following SPOE (Single Point of Evaluation) Pattern:
 * - Evaluate feature flags once at request entry point
 * - Pass results through system (don't re-evaluate)
 * - Ensures consistency and simplifies cleanup
 * 
 * Best Practices Applied:
 * - Server-side evaluation (never expose API tokens to client)
 * - Complete context building with all required fields
 * - Single evaluation per request
 * - Error handling with fallback to disabled state
 * 
 * Anti-Patterns Avoided:
 * - ❌ Multiple flag evaluations within single request (causes inconsistency)
 * - ❌ Client-side SDK with exposed API tokens (security risk)
 * - ❌ Incomplete context (strategies fail to evaluate)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFeatureService, FeatureContext, FeatureVariant } from '@/lib/feature-service';
import { getUnleash, isUnleashReady, getUnleashDiagnostics, testUnleashConnection } from '@/lib/unleash';

/**
 * POST /api/features
 * 
 * Evaluates feature flags for given context
 * Following SPOE pattern: evaluate once, pass results through system
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // CRITICAL FIX: Ensure userId is always present for "default" stickiness
    // Default stickiness tries: userId → sessionId → random
    // If userId is missing, derive from email or generate consistent ID
    const userId = body.userId || 
                   (body.email ? `user-${body.email}` : `anonymous-${body.sessionId || Date.now()}`);
    
    const context: FeatureContext = {
      userId: userId, // ✅ Always present now
      sessionId: body.sessionId || `session-${Date.now()}`,
      email: body.email,
      tenantId: body.tenantId,
      remoteAddress: request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown',
      environment: process.env.NODE_ENV || 'development',
    };

    // Check SDK initialization and readiness
    const unleash = getUnleash();
    
    if (!unleash) {
      // SDK initialization failed (likely missing env vars or connection error)
      const errorMsg = 'Unleash SDK initialization failed. Please check UNLEASH_SERVER_URL and UNLEASH_API_TOKEN environment variables.';
      console.error('❌', errorMsg);
      
      return NextResponse.json(
        {
          success: false,
          error: errorMsg,
          diagnostic: {
            sdkReady: false,
            sdkInitialized: false,
            hasEnvVars: !!(process.env.UNLEASH_SERVER_URL && process.env.UNLEASH_API_TOKEN),
          },
          flags: {
            'feature-new-recommendations': { enabled: false, variant: null },
            'feature-new-ui': { enabled: false, variant: null },
            'feature-premium': { enabled: false, variant: null },
            'feature-experimental': { enabled: false, variant: null },
          },
        },
        { status: 503 } // Service Unavailable
      );
    }
    
    const sdkReady = isUnleashReady();
    const diagnostics = getUnleashDiagnostics();
    
    // IMPORTANT: Even if SDK is not "ready", it may have cached state
    // We can still evaluate flags - they might just return disabled if not synced yet
    if (!sdkReady) {
      console.warn('⚠️ Unleash SDK not ready yet. Attempting to use cached state.');
      console.warn('   Flags may return disabled if SDK has not synced yet.');
      console.warn('   Diagnostics:', diagnostics);
      
      // If there's an error, log it
      if (diagnostics.hasError && diagnostics.error) {
        console.error('   SDK Error:', diagnostics.error);
      }
      
      // If never synced, suggest connection test
      if (!diagnostics.lastSyncTime) {
        console.warn('   SDK has never synced. Testing connection...');
        const connectionTest = await testUnleashConnection();
        if (!connectionTest.success) {
          console.error('   Connection test failed:', connectionTest.message);
        } else {
          console.log('   Connection test passed:', connectionTest.message);
        }
      }
    } else {
      console.log('✅ Unleash SDK is ready - evaluating flags');
      console.log('   Last sync:', diagnostics.lastSyncTime || 'unknown');
    }

    // Diagnostic logging (helpful for debugging)
    console.log('🔍 Evaluating feature flags:', {
      userId: context.userId,
      email: context.email,
      sessionId: context.sessionId,
      tenantId: context.tenantId,
      sdkReady: sdkReady,
      environment: context.environment,
    });

    const featureService = getFeatureService();
    
    // Try to evaluate flags - even if SDK is not ready, it might have cached state
    // This allows evaluation to work even during initial sync

    // SPOE Pattern: Evaluate all flags once at entry point
    // Wrap in try-catch for each flag to handle individual failures
    const evaluateFlag = (flagName: string, evaluator: () => boolean) => {
      try {
        return evaluator();
      } catch (error) {
        console.error(`Error evaluating flag ${flagName}:`, error);
        return false; // Fail-safe: return disabled on error
      }
    };

    const evaluateVariant = (flagName: string, evaluator: () => FeatureVariant) => {
      try {
        return evaluator();
      } catch (error) {
        console.error(`Error getting variant for ${flagName}:`, error);
        return { name: 'disabled', enabled: false };
      }
    };

    const flags = {
      'feature-new-recommendations': {
        enabled: evaluateFlag('feature-new-recommendations', () => 
          featureService.isNewRecommendationEngineEnabled(context)
        ),
        variant: evaluateVariant('feature-new-recommendations', () => 
          featureService.getRecommendationVariant(context)
        ),
      },
      'feature-new-ui': {
        enabled: evaluateFlag('feature-new-ui', () => 
          featureService.isNewUIEnabled(context)
        ),
        variant: evaluateVariant('feature-new-ui', () => 
          featureService.getUIVariant(context)
        ),
      },
      'feature-premium': {
        enabled: evaluateFlag('feature-premium', () => 
          featureService.isPremiumEnabled(context)
        ),
        variant: null,
      },
      'feature-experimental': {
        enabled: evaluateFlag('feature-experimental', () => 
          featureService.isExperimentalFeatureEnabled(context)
        ),
        variant: null,
      },
    };
    
    // Log evaluation results for debugging
    console.log('📊 Flag evaluation results:', {
      'feature-new-recommendations': flags['feature-new-recommendations'].enabled,
      'feature-new-ui': flags['feature-new-ui'].enabled,
      'feature-premium': flags['feature-premium'].enabled,
      'feature-experimental': flags['feature-experimental'].enabled,
    });

    return NextResponse.json({
      success: true,
      flags,
      context: {
        userId: context.userId,
        sessionId: context.sessionId,
        email: context.email,
        tenantId: context.tenantId,
      },
      diagnostic: {
        sdkReady: isUnleashReady(),
        timestamp: new Date().toISOString(),
        ...getUnleashDiagnostics(),
      },
    });
  } catch (error) {
    // Enhanced error logging for diagnostics
    console.error('❌ Feature flag evaluation error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      unleashReady: isUnleashReady(),
      hasUnleashInstance: !!getUnleash(),
    });
    
    // Determine appropriate status code
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    let statusCode = 500;
    
    // Check if it's a configuration error
    if (errorMessage.includes('Missing Unleash configuration') || 
        errorMessage.includes('UNLEASH_SERVER_URL') || 
        errorMessage.includes('UNLEASH_API_TOKEN')) {
      statusCode = 503; // Service Unavailable
    }
    
    // Fallback: Return disabled state on errors (fail-safe)
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        diagnostic: {
          unleashReady: isUnleashReady(),
          hasUnleashInstance: !!getUnleash(),
          errorType: error instanceof Error ? error.constructor.name : 'Unknown',
          hasEnvVars: !!(process.env.UNLEASH_SERVER_URL && process.env.UNLEASH_API_TOKEN),
        },
        flags: {
          'feature-new-recommendations': { enabled: false, variant: null },
          'feature-new-ui': { enabled: false, variant: null },
          'feature-premium': { enabled: false, variant: null },
          'feature-experimental': { enabled: false, variant: null },
        },
      },
      { status: statusCode }
    );
  }
}

/**
 * GET /api/features
 * 
 * Health check and diagnostics endpoint
 */
export async function GET() {
  const diagnostics = getUnleashDiagnostics();
  const connectionTest = await testUnleashConnection();
  
  return NextResponse.json({
    success: true,
    message: 'Feature flags API is running',
    timestamp: new Date().toISOString(),
    diagnostics: {
      ...diagnostics,
      connectionTest: connectionTest,
    },
  });
}

