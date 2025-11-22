/**
 * API Route: Fetch Linear Issues
 * 
 * Server-side API route for fetching issues from Linear.
 * Uses API key authentication (never exposed to client).
 * 
 * Best Practices:
 * - Server-side only (API key security)
 * - Error handling with typed errors
 * - Pagination support
 */

import { NextResponse } from "next/server";
import { getLinearClient, fetchIssues } from "@/lib/linear";
import {
  LinearError,
  AuthenticationLinearError,
  InvalidInputLinearError,
  RatelimitedLinearError,
} from "@linear/sdk";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId") || undefined;
    const assigneeId = searchParams.get("assigneeId") || undefined;
    const stateId = searchParams.get("stateId") || undefined;
    const first = parseInt(searchParams.get("first") || "50");

    const client = getLinearClient();
    const issues = await fetchIssues(client, {
      first,
      filter: {
        teamId,
        assigneeId,
        stateId,
      },
    });

    return NextResponse.json({ issues });
  } catch (error) {
    if (error instanceof AuthenticationLinearError) {
      return NextResponse.json(
        { error: "Authentication failed. Check your LINEAR_API_KEY." },
        { status: 401 }
      );
    }

    if (error instanceof InvalidInputLinearError) {
      return NextResponse.json(
        { error: "Invalid input parameters", details: error.errors },
        { status: 400 }
      );
    }

    if (error instanceof RatelimitedLinearError) {
      return NextResponse.json(
        {
          error: "Rate limited",
          retryAfter: error.retryAfter,
        },
        { status: 429 }
      );
    }

    if (error instanceof LinearError) {
      return NextResponse.json(
        { error: "Linear API error", message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error", message: String(error) },
      { status: 500 }
    );
  }
}

