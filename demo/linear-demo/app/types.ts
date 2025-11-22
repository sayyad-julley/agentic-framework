/**
 * Type definitions for Linear demo
 */

export interface LinearIssue {
  id: string;
  identifier: string;
  title: string;
  description?: string;
  priority: number;
  estimate?: number;
  state?: {
    id: string;
    name: string;
    type: string;
  };
  assignee?: {
    id: string;
    name: string;
    email: string;
  };
  team?: {
    id: string;
    name: string;
    key: string;
  };
  labels?: {
    nodes: Array<{
      id: string;
      name: string;
      color: string;
    }>;
  };
  createdAt: string;
  updatedAt: string;
  url: string;
}

export interface LinearProject {
  id: string;
  name: string;
  description?: string;
  state: string;
  progress: number;
  startDate?: string;
  targetDate?: string;
  url: string;
}

export interface LinearCycle {
  id: string;
  name: string;
  number: number;
  startsAt: string;
  endsAt: string;
  progress: number;
  isActive: boolean;
  url: string;
}

export interface LinearTeam {
  id: string;
  name: string;
  key: string;
  description?: string;
  private: boolean;
}

export interface LinearUser {
  id: string;
  name: string;
  email: string;
  active: boolean;
  admin: boolean;
}

