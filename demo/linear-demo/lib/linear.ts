/**
 * Linear API Client Utilities
 * 
 * Server-side Linear client initialization and helper functions.
 * Uses API key authentication (recommended for server-side).
 * 
 * Best Practices:
 * - API key stored in environment variable (never in code)
 * - Server-side only (API key should never be exposed to client)
 * - Error handling with typed Linear error classes
 * - Pagination support for large datasets
 */

import { LinearClient } from "@linear/sdk";
import type { LinearIssue, LinearProject, LinearCycle, LinearTeam } from "@/app/types";

/**
 * Initialize Linear client with API key from environment
 * 
 * CRITICAL: API key must be set in environment variable LINEAR_API_KEY
 * Get your API key from: https://linear.app/settings/api
 */
export function getLinearClient(): LinearClient {
  const apiKey = process.env.LINEAR_API_KEY;

  if (!apiKey) {
    throw new Error(
      "LINEAR_API_KEY environment variable is not set. " +
      "Get your API key from https://linear.app/settings/api"
    );
  }

  return new LinearClient({
    apiKey,
  });
}

/**
 * Fetch issues with pagination support
 */
export async function fetchIssues(
  client: LinearClient,
  options?: {
    first?: number;
    filter?: {
      teamId?: string;
      assigneeId?: string;
      stateId?: string;
    };
  }
): Promise<LinearIssue[]> {
  const issues = await client.issues({
    first: options?.first || 50,
    filter: options?.filter,
  });

  const allIssues: LinearIssue[] = [];

  // Process first page
  for (const issue of issues.nodes) {
    const state = await issue.state;
    const assignee = await issue.assignee;
    const team = await issue.team;
    const labels = await issue.labels();

    allIssues.push({
      id: issue.id,
      identifier: issue.identifier,
      title: issue.title,
      description: issue.description || undefined,
      priority: issue.priority,
      estimate: issue.estimate || undefined,
      state: state
        ? {
            id: state.id,
            name: state.name,
            type: state.type,
          }
        : undefined,
      assignee: assignee
        ? {
            id: assignee.id,
            name: assignee.name,
            email: assignee.email,
          }
        : undefined,
      team: team
        ? {
            id: team.id,
            name: team.name,
            key: team.key,
          }
        : undefined,
      labels: {
        nodes: labels.nodes.map((label) => ({
          id: label.id,
          name: label.name,
          color: label.color,
        })),
      },
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
      url: issue.url,
    });
  }

  // Paginate if needed
  let currentPage = issues;
  while (currentPage.pageInfo.hasNextPage) {
    currentPage = await currentPage.fetchNext();
    for (const issue of currentPage.nodes) {
      const state = await issue.state;
      const assignee = await issue.assignee;
      const team = await issue.team;
      const labels = await issue.labels();

      allIssues.push({
        id: issue.id,
        identifier: issue.identifier,
        title: issue.title,
        description: issue.description || undefined,
        priority: issue.priority,
        estimate: issue.estimate || undefined,
        state: state
          ? {
              id: state.id,
              name: state.name,
              type: state.type,
            }
          : undefined,
        assignee: assignee
          ? {
              id: assignee.id,
              name: assignee.name,
              email: assignee.email,
            }
          : undefined,
        team: team
          ? {
              id: team.id,
              name: team.name,
              key: team.key,
            }
          : undefined,
        labels: {
          nodes: labels.nodes.map((label) => ({
            id: label.id,
            name: label.name,
            color: label.color,
          })),
        },
        createdAt: issue.createdAt,
        updatedAt: issue.updatedAt,
        url: issue.url,
      });
    }
  }

  return allIssues;
}

/**
 * Fetch projects
 */
export async function fetchProjects(
  client: LinearClient
): Promise<LinearProject[]> {
  const projects = await client.projects({ first: 50 });

  const allProjects: LinearProject[] = [];

  for (const project of projects.nodes) {
    allProjects.push({
      id: project.id,
      name: project.name,
      description: project.description || undefined,
      state: project.state,
      progress: project.progress,
      startDate: project.startDate || undefined,
      targetDate: project.targetDate || undefined,
      url: project.url,
    });
  }

  return allProjects;
}

/**
 * Fetch cycles for a team
 */
export async function fetchCycles(
  client: LinearClient,
  teamId?: string
): Promise<LinearCycle[]> {
  let cycles;

  if (teamId) {
    const team = await client.team(teamId);
    cycles = await team.cycles({ first: 20 });
  } else {
    // Get cycles from first team (fallback)
    const teams = await client.teams({ first: 1 });
    if (teams.nodes.length === 0) {
      return [];
    }
    const team = teams.nodes[0];
    cycles = await team.cycles({ first: 20 });
  }

  const allCycles: LinearCycle[] = [];

  for (const cycle of cycles.nodes) {
    allCycles.push({
      id: cycle.id,
      name: cycle.name,
      number: cycle.number,
      startsAt: cycle.startsAt,
      endsAt: cycle.endsAt,
      progress: cycle.progress,
      isActive: cycle.isActive,
      url: cycle.url,
    });
  }

  return allCycles;
}

/**
 * Fetch teams
 */
export async function fetchTeams(client: LinearClient): Promise<LinearTeam[]> {
  const teams = await client.teams({ first: 50 });

  const allTeams: LinearTeam[] = [];

  for (const team of teams.nodes) {
    allTeams.push({
      id: team.id,
      name: team.name,
      key: team.key,
      description: team.description || undefined,
      private: team.private,
    });
  }

  return allTeams;
}

