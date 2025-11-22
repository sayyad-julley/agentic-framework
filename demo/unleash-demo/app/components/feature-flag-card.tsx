"use client";

import React from "react";
import { Card, Tag, Typography, Space, Divider } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import type { FeatureFlagStatus } from "../types";

const { Title, Text, Paragraph } = Typography;

interface FeatureFlagCardProps {
  flagName: string;
  description: string;
  status: FeatureFlagStatus;
  context: {
    userId?: string;
    email?: string;
    tenantId?: string;
  };
}

export function FeatureFlagCard({
  flagName,
  description,
  status,
  context,
}: FeatureFlagCardProps) {
  return (
    <Card
      title={
        <Space>
          <Title level={4} className="!mb-0">
            {flagName}
          </Title>
          {status.enabled ? (
            <Tag color="green" icon={<CheckCircleOutlined />}>
              Enabled
            </Tag>
          ) : (
            <Tag color="red" icon={<CloseCircleOutlined />}>
              Disabled
            </Tag>
          )}
        </Space>
      }
      className="mb-4"
    >
      <Paragraph>{description}</Paragraph>
      
      {status.variant && status.variant.enabled && (
        <>
          <Divider />
          <Space direction="vertical" size="small">
            <Text strong>Variant:</Text>
            <Tag color="blue">{status.variant.name}</Tag>
            {status.variant.payload && (
              <Text type="secondary">Payload: {status.variant.payload}</Text>
            )}
          </Space>
        </>
      )}

      <Divider />
      
      <Space direction="vertical" size="small" className="w-full">
        <Text strong>Evaluation Context:</Text>
        <div className="text-sm text-gray-600">
          {context.userId && <div>User ID: {context.userId}</div>}
          {context.email && <div>Email: {context.email}</div>}
          {context.tenantId && <div>Tenant ID: {context.tenantId}</div>}
        </div>
      </Space>
    </Card>
  );
}

