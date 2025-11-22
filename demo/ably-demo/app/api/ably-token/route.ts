import { NextRequest, NextResponse } from "next/server";
import * as Ably from "ably";

/**
 * Token Authentication Endpoint
 * 
 * CRITICAL: This endpoint generates short-lived tokens for client-side authentication.
 * Never expose API keys to client-side code. This is a mandatory security practice.
 * 
 * Best Practice: Tokens are short-lived (1 hour), revocable, and fine-grained.
 * API keys are persistent and suitable for trusted server environments only.
 */
export async function GET(request: NextRequest) {
  try {
    // Get API key from environment (server-side only)
    const apiKey = process.env.ABLY_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "ABLY_API_KEY not configured" },
        { status: 500 }
      );
    }

    // Initialize Ably REST client with API key (server-side only)
    // Anti-Pattern Avoided: Basic auth on client-side - we use token auth instead
    const rest = new Ably.Rest({ key: apiKey });

    // Extract clientId from query params or generate one
    // In production, you'd get this from authenticated user session
    const searchParams = request.nextUrl.searchParams;
    const clientId = searchParams.get("clientId") || `client_${Date.now()}`;

    // Generate token request with appropriate capabilities
    // Best Practice: Fine-grained capabilities per channel/feature
    const tokenRequest = {
      clientId: clientId,
      capability: {
        // Allow publish and subscribe on chat channels
        "chat:*": ["subscribe", "publish", "presence"],
        // Allow presence on chat channels
      },
      ttl: 3600000, // 1 hour - short-lived token
    };

    // Request token from Ably
    const tokenDetails = await rest.auth.requestToken(tokenRequest);

    return NextResponse.json(tokenDetails);
  } catch (error) {
    console.error("Token generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}

