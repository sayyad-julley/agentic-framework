"use client";

import React, { useState } from "react";
import { Form, Input, Button, Card, Space } from "antd";
import type { UserContext } from "../types";

interface ContextFormProps {
  onSubmit: (context: UserContext) => void;
  initialValues?: UserContext;
}

export function ContextForm({ onSubmit, initialValues }: ContextFormProps) {
  const [form] = Form.useForm();

  const handleSubmit = (values: UserContext) => {
    onSubmit(values);
  };

  return (
    <Card title="User Context" className="mb-4">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={initialValues}
      >
        <Form.Item
          label="User ID"
          name="userId"
          tooltip="Persistent identifier for stickiness (A/B testing)"
        >
          <Input placeholder="user-123" />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          tooltip="Used for User IDs strategy and email domain constraints"
        >
          <Input type="email" placeholder="user@example.com" />
        </Form.Item>

        <Form.Item
          label="Tenant ID"
          name="tenantId"
          tooltip="Used for constraint-based targeting (multi-tenant)"
        >
          <Input placeholder="tenant-premium" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Evaluate Feature Flags
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

