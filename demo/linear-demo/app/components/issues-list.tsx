"use client";

import React, { useEffect, useState } from "react";
import { List, Spin, Alert, Empty, Select, Button, Space } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { IssueCard } from "./issue-card";
import type { LinearIssue, LinearTeam } from "../types";

interface IssuesListProps {
  teamId?: string;
}

export function IssuesList({ teamId }: IssuesListProps) {
  const [issues, setIssues] = useState<LinearIssue[]>([]);
  const [teams, setTeams] = useState<LinearTeam[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | undefined>(teamId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIssues = async (filterTeamId?: string) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filterTeamId) {
        params.append("teamId", filterTeamId);
      }

      const response = await fetch(`/api/linear/issues?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch issues");
      }

      setIssues(data.issues || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch issues");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await fetch("/api/linear/teams");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch teams");
      }

      setTeams(data.teams || []);
    } catch (err) {
      console.error("Failed to fetch teams:", err);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    fetchIssues(selectedTeam);
  }, [selectedTeam]);

  const handleRefresh = () => {
    fetchIssues(selectedTeam);
  };

  if (loading && issues.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
        action={
          <Button size="small" onClick={handleRefresh}>
            Retry
          </Button>
        }
      />
    );
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <Space>
          <Select
            placeholder="Filter by team"
            allowClear
            style={{ width: 200 }}
            value={selectedTeam}
            onChange={setSelectedTeam}
            options={teams.map((team) => ({
              label: team.name,
              value: team.id,
            }))}
          />
        </Space>
        <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
          Refresh
        </Button>
      </div>

      {issues.length === 0 ? (
        <Empty description="No issues found" />
      ) : (
        <List
          dataSource={issues}
          renderItem={(issue) => (
            <List.Item>
              <IssueCard issue={issue} />
            </List.Item>
          )}
        />
      )}
    </div>
  );
}

