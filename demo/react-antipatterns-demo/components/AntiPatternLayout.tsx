'use client';

import { Card, Typography, Tabs, Tag, Space, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { ReactNode } from 'react';

const { Title, Paragraph, Text } = Typography;

interface AntiPatternLayoutProps {
  title: string;
  description: string;
  impact: string;
  antipatternCode: string | ReactNode;
  workaroundCode: string | ReactNode;
  antipatternExplanation?: string;
  workaroundExplanation?: string;
}

export default function AntiPatternLayout({
  title,
  description,
  impact,
  antipatternCode,
  workaroundCode,
  antipatternExplanation,
  workaroundExplanation,
}: AntiPatternLayoutProps) {
  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <Space direction="vertical" size="large" className="w-full">
          <div>
            <Link href="/">
              <Button icon={<ArrowLeftOutlined />} className="mb-4">
                Back to Home
              </Button>
            </Link>
            <Title level={1}>{title}</Title>
            <Paragraph className="text-lg">{description}</Paragraph>
            <Tag color="red" className="mt-2">
              Impact: {impact}
            </Tag>
          </div>

          <Tabs
            defaultActiveKey="antipattern"
            items={[
              {
                key: 'antipattern',
                label: (
                  <span>
                    <Tag color="red">❌ Anti-Pattern</Tag>
                  </span>
                ),
                children: (
                  <Card>
                    {antipatternExplanation && (
                      <Paragraph className="mb-4 text-gray-600 dark:text-gray-400">
                        {antipatternExplanation}
                      </Paragraph>
                    )}
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                      <pre className="text-sm overflow-x-auto">
                        <code>{antipatternCode}</code>
                      </pre>
                    </div>
                  </Card>
                ),
              },
              {
                key: 'workaround',
                label: (
                  <span>
                    <Tag color="green">✅ Workaround</Tag>
                  </span>
                ),
                children: (
                  <Card>
                    {workaroundExplanation && (
                      <Paragraph className="mb-4 text-gray-600 dark:text-gray-400">
                        {workaroundExplanation}
                      </Paragraph>
                    )}
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                      <pre className="text-sm overflow-x-auto">
                        <code>{workaroundCode}</code>
                      </pre>
                    </div>
                  </Card>
                ),
              },
            ]}
          />
        </Space>
      </div>
    </div>
  );
}

