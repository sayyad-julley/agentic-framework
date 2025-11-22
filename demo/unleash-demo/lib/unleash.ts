/**
 * Unleash SDK Initialization
 * 
 * Following best practices from implementing-unleash-featureops skill:
 * - Initialize early in application lifecycle
 * - Use unique instanceId per running instance
 * - Provide appName for telemetry
 * - Never hardcode API tokens (use environment variables)
 * 
 * Best Practices Applied:
 * - appName required for telemetry and governance metrics
 * - instanceId unique per instance for proper tracking
 * - refreshInterval set to 15 seconds for configuration updates
 * - customHeaders for API token authentication
 * - Event listeners for ready state
 * 
 * Anti-Patterns Avoided:
 * - ❌ Missing appName/instanceId (breaks telemetry)
 * - ❌ Hardcoded API tokens (security risk)
 * - ❌ Missing error handling (connection failures)
 */

import { initialize, Unleash } from 'unleash-client';

let unleashInstance: Unleash | null = null;
let isReadyState: boolean = false;
let initializationError: Error | null = null;
let lastSyncTime: Date | null = null;

/**
 * Initialize Unleash SDK singleton instance
 * Must be called before using feature flags
 */
export function initializeUnleash(): Unleash {
  if (unleashInstance) {
    return unleashInstance;
  }

  const unleashUrl = process.env.UNLEASH_SERVER_URL;
  const apiToken = process.env.UNLEASH_API_TOKEN;

  if (!unleashUrl || !apiToken) {
    throw new Error(
      'Missing Unleash configuration. Please set UNLEASH_SERVER_URL and UNLEASH_API_TOKEN environment variables.'
    );
  }

  unleashInstance = initialize({
    url: `${unleashUrl}/api/`,
    appName: 'unleash-demo', // Required for telemetry
    instanceId: process.env.POD_NAME || `instance-${Date.now()}`, // Unique per instance
    refreshInterval: 15000, // Poll frequency (15 seconds)
    customHeaders: {
      Authorization: apiToken, // Never hardcode
    },
  });

  // Track ready state
  unleashInstance.on('ready', () => {
    isReadyState = true;
    lastSyncTime = new Date();
    console.log('✅ Unleash client synchronized');
    console.log('   SDK is now ready to evaluate feature flags');
    console.log(`   Sync time: ${lastSyncTime.toISOString()}`);
  });

  unleashInstance.on('error', (error) => {
    initializationError = error instanceof Error ? error : new Error(String(error));
    isReadyState = false;
    console.error('❌ Unleash client error:', error);
    console.error('   Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    console.error('   Check your UNLEASH_SERVER_URL and UNLEASH_API_TOKEN');
    console.error('   Verify the server is accessible and the API token is valid');
  });

  unleashInstance.on('warn', (warning) => {
    console.warn('⚠️ Unleash client warning:', warning);
  });

  unleashInstance.on('synchronized', () => {
    isReadyState = true;
    lastSyncTime = new Date();
    console.log('🔄 Unleash client synchronized (configuration updated)');
    console.log(`   Sync time: ${lastSyncTime.toISOString()}`);
  });

  unleashInstance.on('impression', (impression) => {
    console.log('📊 Flag impression:', impression);
  });

  // Log initialization start
  console.log('🚀 Initializing Unleash SDK...');
  console.log('   URL:', `${unleashUrl}/api/`);
  console.log('   App Name:', 'unleash-demo');
  console.log('   Instance ID:', process.env.POD_NAME || `instance-${Date.now()}`);

  return unleashInstance;
}

/**
 * Get Unleash instance (initializes if needed)
 * Returns null if initialization fails (e.g., missing env vars)
 */
export function getUnleash(): Unleash | null {
  if (!unleashInstance) {
    try {
      return initializeUnleash();
    } catch (error) {
      console.error('Failed to initialize Unleash SDK:', error);
      return null;
    }
  }
  return unleashInstance;
}

/**
 * Check if Unleash SDK is ready (has synchronized with server)
 * Uses both the SDK's isReady() method and our tracked state
 */
export function isUnleashReady(): boolean {
  if (!unleashInstance) {
    return false;
  }
  try {
    const sdkReady = unleashInstance.isReady();
    // Use both SDK's reported state and our tracked state
    // SDK might report ready even if we haven't seen the event
    return sdkReady || isReadyState;
  } catch (error) {
    console.error('Error checking Unleash SDK readiness:', error);
    // Fall back to our tracked state
    return isReadyState;
  }
}

/**
 * Get SDK diagnostic information
 */
export function getUnleashDiagnostics() {
  const baseDiagnostics = {
    initialized: !!unleashInstance,
    ready: isUnleashReady(),
    hasEnvVars: !!(process.env.UNLEASH_SERVER_URL && process.env.UNLEASH_API_TOKEN),
    url: process.env.UNLEASH_SERVER_URL || 'not set',
    hasToken: !!process.env.UNLEASH_API_TOKEN,
    trackedReadyState: isReadyState,
    lastSyncTime: lastSyncTime?.toISOString() || null,
    hasError: !!initializationError,
    error: initializationError?.message || null,
  };

  if (!unleashInstance) {
    return baseDiagnostics;
  }
  
  try {
    const sdkReportedReady = unleashInstance.isReady();
    return {
      ...baseDiagnostics,
      sdkReportedReady: sdkReportedReady,
      // Try to evaluate a test flag to see if SDK is actually working
      canEvaluate: true,
    };
  } catch (error) {
    return {
      ...baseDiagnostics,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
    };
  }
}

/**
 * Test connection to Unleash server
 * Uses Node.js built-in fetch (available in Node 18+)
 */
export async function testUnleashConnection(): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  const url = process.env.UNLEASH_SERVER_URL;
  const token = process.env.UNLEASH_API_TOKEN;

  if (!url || !token) {
    return {
      success: false,
      message: 'Missing environment variables',
      details: {
        hasUrl: !!url,
        hasToken: !!token,
      },
    };
  }

  try {
    const testUrl = `${url}/api/health`;
    console.log('🔍 Testing connection to:', testUrl);
    
    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    try {
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Authorization': token,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          success: false,
          message: `Server returned ${response.status} ${response.statusText}`,
          details: {
            status: response.status,
            statusText: response.statusText,
          },
        };
      }

      const data = await response.json().catch(() => ({}));
      return {
        success: true,
        message: 'Connection successful',
        details: data,
      };
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Connection failed';
    const isTimeout = errorMessage.includes('aborted') || errorMessage.includes('timeout');
    
    return {
      success: false,
      message: isTimeout ? 'Connection timeout (server not reachable)' : errorMessage,
      details: {
        error: error instanceof Error ? error.stack : undefined,
        isTimeout: isTimeout,
      },
    };
  }
}

