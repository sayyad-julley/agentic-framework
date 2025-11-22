/**
 * API Route: Fetch Linear Cycles
 */

import { NextResponse } from "next/server";
import { getLinearClient, fetchCycles } from "@/lib/linear";
import {
  LinearError,
  AuthenticationLinearError,
  RatelimitedLinearError,
} from "@linear/sdk";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("teamId") || undefined;

    const client = getLinearClient();
    const cycles = await fetchCycles(client, teamId);

    return NextResponse.json({ cycles });
  } catch (error) {
    if (error instanceof AuthenticationLinearError) {
      return NextResponse.json(
        { error: "Authentication failed. Check your LINEAR_API_KEY." },
        { status: 401 }
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

