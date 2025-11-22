import React from 'react';
import { Typography } from 'antd';
import { HomeClient } from './home-client';

const { Title, Paragraph, Text } = Typography;

/**
 * Main App Component (Server Component)
 * This page is now a Server Component for better performance.
 * Client-side interactive features are extracted to HomeClient component.
 */
export default function Home() {
  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <Title level={1}>React Activity Component Example</Title>

      <Paragraph>
        The <Text code>{'<Activity />'}</Text> component allows you to hide and
        restore parts of your UI while preserving their internal state. When a
        component is wrapped in <Text code>{'<Activity>'}</Text> and its{' '}
        <Text code>mode</Text> is set to <Text code>'hidden'</Text>, React
        unmounts its effects and deprioritizes updates, but retains the
        component's state.
      </Paragraph>

      <HomeClient />
    </div>
  );
}
