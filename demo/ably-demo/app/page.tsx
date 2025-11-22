"use client";

import React from "react";
import { Layout, Typography, Space, Divider } from "antd";
import { Chat } from "./components/chat";
import { Presence } from "./components/presence";
import { ConnectionStatus } from "./components/connection-status";

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;

/**
 * Main Page Component
 * 
 * Real-world Ably demo showcasing:
 * - Real-time chat with message history recovery
 * - Presence management (who's online)
 * - Connection state monitoring
 * - Token authentication
 * - Singleton SDK instance
 * 
 * Channel Architecture:
 * - chat:general - Main chat room (logical grouping, not per-user)
 * 
 * Best Practices:
 * - Ephemeral channels (no pre-provisioning)
 * - History API recovery for suspended state
 * - Token authentication (mandatory for client-side)
 * - Singleton SDK instance
 */
export default function Home() {
  const channelName = "chat:general";

  return (
    <Layout className="min-h-screen">
      <Header className="bg-white shadow-sm">
        <div className="flex items-center justify-between h-full">
          <Title level={3} className="!mb-0">
            Ably Realtime Demo
          </Title>
          <ConnectionStatus />
        </div>
      </Header>
      <Content className="p-6">
        <div className="max-w-7xl mx-auto">
          <Space direction="vertical" size="large" className="w-full">
            <div>
              <Title level={2}>Production-Ready Ably Implementation</Title>
              <Paragraph>
                This demo showcases a real-world Ably implementation following
                best practices and avoiding common anti-patterns.
              </Paragraph>
            </div>

            <Divider />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chat Component - Takes 2 columns on large screens */}
              <div className="lg:col-span-2">
                <Chat channelName={channelName} />
              </div>

              {/* Presence Component - Takes 1 column on large screens */}
              <div className="lg:col-span-1">
                <Presence channelName={channelName} />
              </div>
            </div>

            <Divider />

            <div className="bg-gray-50 p-4 rounded-lg">
              <Title level={4}>Features Implemented</Title>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong>Singleton SDK Instance:</strong> Ably client reused
                  throughout application lifecycle
                </li>
                <li>
                  <strong>Token Authentication:</strong> Secure token-based
                  auth for client-side (mandatory)
                </li>
                <li>
                  <strong>Ephemeral Channels:</strong> Logical channel grouping
                  (chat:general) - no pre-provisioning
                </li>
                <li>
                  <strong>History API Recovery:</strong> Automatic message
                  recovery on reconnection after suspension
                </li>
                <li>
                  <strong>Connection State Monitoring:</strong> Real-time
                  connection status tracking
                </li>
                <li>
                  <strong>Presence Management:</strong> Live user presence
                  tracking
                </li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <Title level={4}>Anti-Patterns Avoided</Title>
              <ul className="list-disc list-inside space-y-2">
                <li>❌ No channel proliferation (logical grouping used)</li>
                <li>
                  ❌ No basic auth on client-side (token auth only)
                </li>
                <li>
                  ❌ No improper instantiation (singleton pattern)
                </li>
                <li>
                  ❌ No ignored state loss (History API recovery implemented)
                </li>
                <li>
                  ❌ No retry storms (exponential backoff in SDK)
                </li>
              </ul>
            </div>
          </Space>
        </div>
      </Content>
    </Layout>
  );
}

