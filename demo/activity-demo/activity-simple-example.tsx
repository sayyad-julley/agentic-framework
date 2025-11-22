'use client';

import React, { useState } from 'react';
import { Activity } from 'react';
import { Button, Card, Space, Typography } from 'antd';

const { Title, Paragraph, Text } = Typography;

/**
 * Simple Activity Component Example
 * 
 * This demonstrates the basic usage of React's Activity component
 * to preserve component state when hiding/showing UI elements.
 */

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
 * Main App Component
 */
const SimpleActivityExample: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

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
            effects are cleaned up
          </li>
          <li>
            <Text strong>Pre-rendering:</Text> Can be used to pre-render
            components that users are likely to access next
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default SimpleActivityExample;

