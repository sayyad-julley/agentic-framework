"use client";

import React from "react";
import { Card, Tag, Space, Typography, Avatar } from "antd";
import {
  BugOutlined,
  RocketOutlined,
  QuestionCircleOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import type { LinearIssue } from "../types";

const { Text, Paragraph } = Typography;

interface IssueCardProps {
  issue: LinearIssue;
}

/**
 * Priority mapping for Linear issues
 */
const PRIORITY_CONFIG = {
  0: { label: "No Priority", color: "default", icon: null },
  1: { label: "Urgent", color: "red", icon: <ThunderboltOutlined /> },
  2: { label: "High", color: "orange", icon: <RocketOutlined /> },
  3: { label: "Medium", color: "blue", icon: <QuestionCircleOutlined /> },
  4: { label: "Low", color: "green", icon: null },
};

/**
 * State type mapping for colors
 */
const STATE_COLORS: Record<string, string> = {
  backlog: "default",
  unstarted: "default",
  started: "processing",
  completed: "success",
  canceled: "error",
};

export function IssueCard({ issue }: IssueCardProps) {
  const priorityConfig = PRIORITY_CONFIG[issue.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG[0];
  const stateColor = STATE_COLORS[issue.state?.type || ""] || "default";

  return (
    <Card
      hoverable
      className="mb-4"
      actions={[
        <a key="view" href={issue.url} target="_blank" rel="noopener noreferrer">
          View in Linear
        </a>,
      ]}
    >
      <div className="flex justify-between items-start mb-2">
        <Space>
          <Text strong>{issue.identifier}</Text>
          <Text type="secondary">{issue.title}</Text>
        </Space>
        {priorityConfig.icon && (
          <Tag color={priorityConfig.color} icon={priorityConfig.icon}>
            {priorityConfig.label}
          </Tag>
        )}
      </div>

      {issue.description && (
        <Paragraph
          ellipsis={{ rows: 2, expandable: true }}
          className="text-gray-600 mb-3"
        >
          {issue.description}
        </Paragraph>
      )}

      <Space wrap className="mb-2">
        {issue.state && (
          <Tag color={stateColor}>{issue.state.name}</Tag>
        )}
        {issue.team && (
          <Tag>{issue.team.name}</Tag>
        )}
        {issue.estimate && (
          <Tag>Est: {issue.estimate}</Tag>
        )}
      </Space>

      {issue.labels && issue.labels.nodes.length > 0 && (
        <div className="mt-2">
          <Space wrap>
            {issue.labels.nodes.map((label) => (
              <Tag key={label.id} color={label.color}>
                {label.name}
              </Tag>
            ))}
          </Space>
        </div>
      )}

      {issue.assignee && (
        <div className="mt-3 flex items-center gap-2">
          <Avatar size="small">{issue.assignee.name.charAt(0)}</Avatar>
          <Text type="secondary" className="text-sm">
            {issue.assignee.name}
          </Text>
        </div>
      )}
    </Card>
  );
}

