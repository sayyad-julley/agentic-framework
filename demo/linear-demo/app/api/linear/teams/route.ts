/**
 * API Route: Fetch Linear Teams
 */

import { NextResponse } from "next/server";
import { getLinearClient, fetchTeams } from "@/lib/linear";
import {
  LinearError,
  AuthenticationLinearError,
  RatelimitedLinearError,
} from "@linear/sdk";

export async function GET() {
  try {
    const client = getLinearClient();
    const teams = await fetchTeams(client);

    return NextResponse.json({ teams });
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

