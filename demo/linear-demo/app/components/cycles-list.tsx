"use client";

import React, { useEffect, useState } from "react";
import { Card, Spin, Alert, Empty, Progress, Tag, Button, Space, Select } from "antd";
import { ReloadOutlined, LinkOutlined } from "@ant-design/icons";
import type { LinearCycle, LinearTeam } from "../types";

export function CyclesList() {
  const [cycles, setCycles] = useState<LinearCycle[]>([]);
  const [teams, setTeams] = useState<LinearTeam[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCycles = async (teamId?: string) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (teamId) {
        params.append("teamId", teamId);
      }

      const response = await fetch(`/api/linear/cycles?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch cycles");
      }

      setCycles(data.cycles || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch cycles");
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
    fetchCycles(selectedTeam);
  }, [selectedTeam]);

  const handleRefresh = () => {
    fetchCycles(selectedTeam);
  };

  if (loading && cycles.length === 0) {
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

  if (cycles.length === 0) {
    return <Empty description="No cycles found" />;
  }

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
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
        <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cycles.map((cycle) => (
          <Card
            key={cycle.id}
            title={cycle.name}
            extra={
              <a
                href={cycle.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500"
              >
                <LinkOutlined />
              </a>
            }
            className="h-full"
          >
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Progress</span>
                <span className="text-sm font-semibold">
                  {Math.round(cycle.progress * 100)}%
                </span>
              </div>
              <Progress
                percent={Math.round(cycle.progress * 100)}
                status={cycle.isActive ? "active" : "normal"}
              />
            </div>

            <Space wrap className="mb-2">
              {cycle.isActive && <Tag color="green">Active</Tag>}
              <Tag>#{cycle.number}</Tag>
            </Space>

            <div className="text-sm text-gray-600 mt-2">
              <div>
                Start: {new Date(cycle.startsAt).toLocaleDateString()}
              </div>
              <div>
                End: {new Date(cycle.endsAt).toLocaleDateString()}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

