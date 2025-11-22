"use client";

import React, { useState } from "react";
import { Layout, Typography, Space, Divider, Tabs } from "antd";
import { IssuesList } from "./components/issues-list";
import { ProjectsList } from "./components/projects-list";
import { CyclesList } from "./components/cycles-list";

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;

/**
 * Main Page Component
 * 
 * Real-world Linear demo showcasing:
 * - Issues management with filtering and pagination
 * - Projects tracking with progress visualization
 * - Cycles management (time-boxed work periods)
 * - Teams and members integration
 * - Server-side API key authentication
 * - Error handling with typed Linear errors
 * - Pagination support for large datasets
 * 
 * Best Practices Applied:
 * - API key stored server-side only (never exposed to client)
 * - Server-side API routes for all Linear operations
 * - Comprehensive error handling with typed error classes
 * - Pagination support for large datasets
 * - Type-safe TypeScript implementation
 * - Real-time data refresh capabilities
 */
export default function Home() {
  const [activeTab, setActiveTab] = useState("issues");

  return (
    <Layout className="min-h-screen">
      <Header className="bg-white shadow-sm">
        <div className="flex items-center justify-between h-full">
          <Title level={3} className="!mb-0">
            Linear Demo
          </Title>
        </div>
      </Header>
      <Content className="p-6">
        <div className="max-w-7xl mx-auto">
          <Space direction="vertical" size="large" className="w-full">
            <div>
              <Title level={2}>Production-Ready Linear Integration</Title>
              <Paragraph>
                This demo showcases a real-world Linear API integration following
                best practices and demonstrating key Linear features.
              </Paragraph>
            </div>

            <Divider />

            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: "issues",
                  label: "Issues",
                  children: <IssuesList />,
                },
                {
                  key: "projects",
                  label: "Projects",
                  children: <ProjectsList />,
                },
                {
                  key: "cycles",
                  label: "Cycles",
                  children: <CyclesList />,
                },
              ]}
            />

            <Divider />

            <div className="bg-gray-50 p-4 rounded-lg">
              <Title level={4}>Features Implemented</Title>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong>Server-Side Authentication:</strong> API key stored
                  securely on server, never exposed to client
                </li>
                <li>
                  <strong>Issues Management:</strong> View, filter, and browse
                  issues with team filtering and pagination
                </li>
                <li>
                  <strong>Projects Tracking:</strong> Monitor project progress
                  with visual progress indicators
                </li>
                <li>
                  <strong>Cycles Management:</strong> Track time-boxed work
                  periods with progress visualization
                </li>
                <li>
                  <strong>Error Handling:</strong> Comprehensive error handling
                  with typed Linear error classes (authentication, rate limiting,
                  invalid input)
                </li>
                <li>
                  <strong>Pagination Support:</strong> Automatic pagination for
                  large datasets (issues, projects, cycles)
                </li>
                <li>
                  <strong>Type Safety:</strong> Full TypeScript implementation
                  with type definitions for all Linear entities
                </li>
                <li>
                  <strong>Real-Time Refresh:</strong> Manual refresh capability
                  for all data views
                </li>
              </ul>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <Title level={4}>Best Practices Applied</Title>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  ✅ API key authentication server-side only (mandatory security
                  practice)
                </li>
                <li>
                  ✅ Server-side API routes for all Linear operations (never
                  expose API keys)
                </li>
                <li>
                  ✅ Typed error handling (AuthenticationLinearError,
                  RatelimitedLinearError, InvalidInputLinearError)
                </li>
                <li>
                  ✅ Pagination support for large datasets (prevents memory
                  issues)
                </li>
                <li>
                  ✅ Type-safe TypeScript implementation (prevents runtime
                  errors)
                </li>
                <li>
                  ✅ Proper async/await error handling (prevents unhandled
                  rejections)
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <Title level={4}>Setup Instructions</Title>
              <ol className="list-decimal list-inside space-y-2">
                <li>
                  Get your Linear API key from{" "}
                  <a
                    href="https://linear.app/settings/api"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    https://linear.app/settings/api
                  </a>
                </li>
                <li>
                  Create a <code className="bg-gray-200 px-1 rounded">.env.local</code> file
                  in the root directory
                </li>
                <li>
                  Add your API key:{" "}
                  <code className="bg-gray-200 px-1 rounded">
                    LINEAR_API_KEY=lin_api_xxxxxxxxxxxxx
                  </code>
                </li>
                <li>
                  Install dependencies:{" "}
                  <code className="bg-gray-200 px-1 rounded">npm install</code>
                </li>
                <li>
                  Run the development server:{" "}
                  <code className="bg-gray-200 px-1 rounded">npm run dev</code>
                </li>
                <li>
                  Open{" "}
                  <code className="bg-gray-200 px-1 rounded">
                    http://localhost:4004
                  </code>{" "}
                  in your browser
                </li>
              </ol>
            </div>
          </Space>
        </div>
      </Content>
    </Layout>
  );
}

