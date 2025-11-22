"use client";

import React, { useState } from "react";
import { Layout, Typography, Space, Divider, Row, Col, Alert } from "antd";
import { ContextForm } from "./components/context-form";
import { FeatureFlagsList } from "./components/feature-flags-list";
import type { UserContext } from "./types";

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;

/**
 * Main Page Component
 * 
 * Real-world Unleash demo showcasing:
 * - SPOE (Single Point of Evaluation) pattern
 * - Abstraction layer decoupling
 * - Multi-strategy evaluation (Gradual Rollout OR User IDs)
 * - Constraint-based targeting
 * - A/B testing with stickiness (userId)
 * - Server-side evaluation (never expose API tokens)
 * 
 * Best Practices Applied:
 * - Server-side SDK initialization with appName and instanceId
 * - Feature service abstraction layer
 * - SPOE pattern (evaluate once at entry point)
 * - Complete context building (userId, email, tenantId, etc.)
 * - Error handling with fallback to disabled state
 * - Telemetry-enabled governance (appName, instanceId)
 * 
 * Anti-Patterns Avoided:
 * - ❌ Flag sprawl (flags in abstraction layer for easy cleanup)
 * - ❌ Long-lived flags becoming config (proper lifecycle management)
 * - ❌ Fragmented evaluation (SPOE pattern applied)
 * - ❌ Custom strategy overload (using standard strategies with constraints)
 * - ❌ Incomplete context (complete context building)
 * - ❌ Missing telemetry (appName and instanceId provided)
 */
export default function Home() {
  const [context, setContext] = useState<UserContext>({
    userId: "demo-user-123",
    email: "demo@example.com",
    tenantId: "demo-tenant",
  });

  const handleContextSubmit = (newContext: UserContext) => {
    setContext(newContext);
  };

  return (
    <Layout className="min-h-screen">
      <Header className="bg-white shadow-sm">
        <div className="flex items-center justify-between h-full">
          <Title level={3} className="!mb-0">
            Unleash Feature Flags Demo
          </Title>
        </div>
      </Header>
      <Content className="p-6">
        <div className="max-w-7xl mx-auto">
          <Space direction="vertical" size="large" className="w-full">
            <div>
              <Title level={2}>Production-Ready Unleash Implementation</Title>
              <Paragraph>
                This demo showcases a real-world Unleash feature flag implementation
                following best practices, architectural patterns, and avoiding common
                anti-patterns.
              </Paragraph>
            </div>

            <Divider />

            <Row gutter={16}>
              {/* Context Form */}
              <Col xs={24} sm={24} md={8} lg={8}>
                <ContextForm
                  onSubmit={handleContextSubmit}
                  initialValues={context}
                />
              </Col>

              {/* Feature Flags Results */}
              <Col xs={24} sm={24} md={16} lg={16}>
                <FeatureFlagsList context={context} />
              </Col>
            </Row>

            <Divider />

            <div className="bg-gray-50 p-4 rounded-lg">
              <Title level={4}>Architectural Patterns Implemented</Title>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong>SPOE (Single Point of Evaluation):</strong> Feature flags
                  evaluated once at request entry point, results passed through system
                </li>
                <li>
                  <strong>Abstraction Layer:</strong> Feature service decouples
                  application from Unleash SDK, enables easy mocking and cleanup
                </li>
                <li>
                  <strong>Multi-Strategy Evaluation:</strong> Inclusive OR logic
                  (Gradual Rollout OR User IDs) for flexible targeting
                </li>
                <li>
                  <strong>Constraint-Based Targeting:</strong> Standard strategies
                  augmented with constraints (email domain, tenantId) instead of custom
                  strategies
                </li>
                <li>
                  <strong>A/B Testing with Stickiness:</strong> userId-based stickiness
                  for consistent variant assignment across sessions
                </li>
                <li>
                  <strong>Server-Side Evaluation:</strong> API tokens never exposed to
                  client, all evaluation happens server-side
                </li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <Title level={4}>Best Practices Applied</Title>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  ✅ SDK initialization with appName and instanceId (telemetry enabled)
                </li>
                <li>
                  ✅ Complete context building (userId, email, tenantId, remoteAddress)
                </li>
                <li>
                  ✅ Standard strategies with constraints (avoid custom strategy overload)
                </li>
                <li>
                  ✅ userId stickiness for A/B testing (consistent across devices)
                </li>
                <li>
                  ✅ Error handling with fallback to disabled state (fail-safe)
                </li>
                <li>
                  ✅ Abstraction layer for maintainability and testability
                </li>
              </ul>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <Title level={4}>Anti-Patterns Avoided</Title>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  ❌ <strong>Flag Sprawl:</strong> Flags centralized in abstraction
                  layer for easy cleanup
                </li>
                <li>
                  ❌ <strong>Long-Lived Flags:</strong> Proper lifecycle management
                  (flags archived after feature delivery)
                </li>
                <li>
                  ❌ <strong>Fragmented Evaluation:</strong> SPOE pattern ensures
                  single evaluation per request
                </li>
                <li>
                  ❌ <strong>Custom Strategy Overload:</strong> Using standard
                  strategies with constraints instead
                </li>
                <li>
                  ❌ <strong>Incomplete Context:</strong> Complete context building
                  with all required fields
                </li>
                <li>
                  ❌ <strong>Missing Telemetry:</strong> appName and instanceId
                  provided for governance metrics
                </li>
              </ul>
            </div>

            <Alert
              message="Setup Required"
              description={
                <div>
                  <p className="mb-2">
                    To use this demo, you need to:
                  </p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Set up an Unleash server (v9.2.0+ with PostgreSQL v14+ and Node.js v22+)</li>
                    <li>Create feature flags in Unleash Admin UI</li>
                    <li>Configure environment variables (UNLEASH_SERVER_URL, UNLEASH_API_TOKEN)</li>
                    <li>See README.md for detailed setup instructions</li>
                  </ol>
                </div>
              }
              type="info"
              showIcon
              className="mb-4"
            />
          </Space>
        </div>
      </Content>
    </Layout>
  );
}

