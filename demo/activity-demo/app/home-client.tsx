'use client';

import React, { useState } from 'react';
import { Activity } from 'react';
import { Button, Card, Space, Typography } from 'antd';

const { Title, Paragraph, Text } = Typography;

interface CounterProps {
  label: string;
}

const Counter: React.FC<CounterProps> = ({ label }) => {
  const [count, setCount] = useState(0);
  const [inputValue, setInputValue] = useState('');

  return (
    <Card title={label} style={{ margin: 16 }}>
      <Space direction="vertical" size="middle">
        <div>
          <Text>Count: </Text>
          <Text strong style={{ fontSize: 24 }}>
            {count}
          </Text>
          <Button
            type="primary"
            onClick={() => setCount(count + 1)}
            style={{ marginLeft: 16 }}
          >
            Increment
          </Button>
          <Button
            onClick={() => setCount(count - 1)}
            style={{ marginLeft: 8 }}
          >
            Decrement
          </Button>
        </div>

        <div>
          <Text>Input: </Text>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type something..."
            style={{
              padding: '8px 12px',
              marginLeft: 8,
              border: '1px solid #d9d9d9',
              borderRadius: 4,
            }}
          />
        </div>

        {inputValue && (
          <Paragraph>
            You typed: <Text code>{inputValue}</Text>
          </Paragraph>
        )}

        <Paragraph style={{ color: '#666', fontSize: 12 }}>
          This component's state (count: {count}, input: "{inputValue}") will
          be preserved when hidden using Activity!
        </Paragraph>
      </Space>
    </Card>
  );
};

/**
 * Client Component for Home Page
 * Contains all interactive features that require client-side code
 */
export function HomeClient() {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <>
      <Card style={{ marginBottom: 24, backgroundColor: '#f6ffed', borderColor: '#b7eb8f' }}>
        <Paragraph>
          <Text strong>✓ Using React Activity Component:</Text> This demo uses the actual{' '}
          <Text code>{'<Activity />'}</Text> component from React 19 canary, which preserves
          component state when hiding/showing UI elements.
        </Paragraph>
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Button
              type="primary"
              size="large"
              onClick={() => setIsVisible(!isVisible)}
            >
              {isVisible ? 'Hide' : 'Show'} Counter Component
            </Button>
          </div>

          <Activity mode={isVisible ? 'visible' : 'hidden'}>
            <Counter label="Counter with State Preservation" />
          </Activity>

          <Paragraph>
            <Text strong>Try this:</Text>
            <ol>
              <li>Increment the counter a few times</li>
              <li>Type something in the input field</li>
              <li>Click "Hide Counter Component"</li>
              <li>Click "Show Counter Component"</li>
              <li>
                Notice how both the counter value and input text are preserved!
              </li>
            </ol>
          </Paragraph>
        </Space>
      </Card>

      <Card>
        <Title level={3}>Key Features</Title>
        <ul>
          <li>
            <Text strong>State Preservation:</Text> Component state is
            maintained even when hidden
          </li>
          <li>
            <Text strong>Performance:</Text> Hidden components are unmounted and
            effects are cleaned up (in real Activity)
          </li>
          <li>
            <Text strong>Pre-rendering:</Text> Can be used to pre-render
            components that users are likely to access next
          </li>
        </ul>
      </Card>
    </>
  );
}

