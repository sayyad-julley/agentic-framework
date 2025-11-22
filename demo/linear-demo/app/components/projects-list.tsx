"use client";

import React, { useEffect, useState } from "react";
import { Card, Spin, Alert, Empty, Progress, Tag, Button, Space } from "antd";
import { ReloadOutlined, LinkOutlined } from "@ant-design/icons";
import type { LinearProject } from "../types";

export function ProjectsList() {
  const [projects, setProjects] = useState<LinearProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/linear/projects");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch projects");
      }

      setProjects(data.projects || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleRefresh = () => {
    fetchProjects();
  };

  if (loading) {
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

  if (projects.length === 0) {
    return <Empty description="No projects found" />;
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <Card
            key={project.id}
            title={project.name}
            extra={
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500"
              >
                <LinkOutlined />
              </a>
            }
            className="h-full"
          >
            {project.description && (
              <p className="text-gray-600 mb-3 text-sm">{project.description}</p>
            )}

            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Progress</span>
                <span className="text-sm font-semibold">
                  {Math.round(project.progress * 100)}%
                </span>
              </div>
              <Progress
                percent={Math.round(project.progress * 100)}
                status={project.state === "completed" ? "success" : "active"}
              />
            </div>

            <Space wrap className="mb-2">
              <Tag color={project.state === "completed" ? "green" : "blue"}>
                {project.state}
              </Tag>
              {project.startDate && (
                <Tag>Start: {new Date(project.startDate).toLocaleDateString()}</Tag>
              )}
              {project.targetDate && (
                <Tag>Target: {new Date(project.targetDate).toLocaleDateString()}</Tag>
              )}
            </Space>
          </Card>
        ))}
      </div>
    </div>
  );
}

