'use client';

import React, { useState } from 'react';
import { Activity } from 'react';
import { Button, Card, Space, Typography, Divider, Input, Checkbox } from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';

const { Title, Paragraph, Text } = Typography;

/**
 * Example 1: Toggling Sidebar with State Preservation
 * 
 * This example demonstrates how Activity preserves component state
 * when hiding/showing a sidebar component.
 */
interface SidebarProps {
  title: string;
}

const Sidebar: React.FC<SidebarProps> = ({ title }) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const sections = ['Dashboard', 'Settings', 'Profile', 'Analytics'];

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleCheckboxChange = (item: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, item]);
    } else {
      setSelectedItems(selectedItems.filter(i => i !== item));
    }
  };

  return (
    <Card
      title={title}
      style={{
        width: 300,
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        overflowY: 'auto',
      }}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div>
          <Text strong>Search:</Text>
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ marginTop: 8 }}
          />
          {searchQuery && (
            <Paragraph style={{ marginTop: 8, fontSize: 12 }}>
              Current search: <Text code>{searchQuery}</Text>
            </Paragraph>
          )}
        </div>

        <Divider />

        <div>
          <Text strong>Navigation Sections:</Text>
          {sections.map((section) => (
            <div key={section} style={{ marginTop: 8 }}>
              <Button
                type={expandedSection === section ? 'primary' : 'default'}
                block
                onClick={() => toggleSection(section)}
              >
                {section} {expandedSection === section ? '▼' : '▶'}
              </Button>
              {expandedSection === section && (
                <div style={{ padding: '8px 0', marginLeft: 16 }}>
                  <Paragraph style={{ fontSize: 12 }}>
                    Content for {section} section
                  </Paragraph>
                </div>
              )}
            </div>
          ))}
        </div>

        <Divider />

        <div>
          <Text strong>Selected Items:</Text>
          {sections.map((item) => (
            <div key={item} style={{ marginTop: 8 }}>
              <Checkbox
                checked={selectedItems.includes(item)}
                onChange={(e: CheckboxChangeEvent) =>
                  handleCheckboxChange(item, e.target.checked)
                }
              >
                {item}
              </Checkbox>
            </div>
          ))}
          {selectedItems.length > 0 && (
            <Paragraph style={{ marginTop: 8, fontSize: 12 }}>
              Selected: {selectedItems.join(', ')}
            </Paragraph>
          )}
        </div>
      </Space>
    </Card>
  );
};

/**
 * Example 2: Tabbed Interface with Activity
 * 
 * Demonstrates how Activity can be used to pre-render tabs
 * while keeping only the active tab visible.
 */
interface TabContentProps {
  tabName: string;
  color: string;
}

const TabContent: React.FC<TabContentProps> = ({ tabName, color }) => {
  const [counter, setCounter] = useState(0);
  const [inputValue, setInputValue] = useState('');

  return (
    <Card
      title={`${tabName} Tab`}
      style={{ borderColor: color, borderWidth: 2 }}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div>
          <Text>Counter: </Text>
          <Text strong style={{ color }}>{counter}</Text>
          <Button
            type="primary"
            onClick={() => setCounter(counter + 1)}
            style={{ marginLeft: 8 }}
          >
            Increment
          </Button>
        </div>

        <div>
          <Text>Input Value: </Text>
          <Input
            placeholder={`Type in ${tabName} tab...`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={{ marginTop: 8 }}
          />
          {inputValue && (
            <Paragraph style={{ marginTop: 8 }}>
              You typed: <Text code>{inputValue}</Text>
            </Paragraph>
          )}
        </div>

        <Paragraph>
          This tab's state (counter: {counter}, input: "{inputValue}") will be
          preserved when you switch tabs, thanks to Activity!
        </Paragraph>
      </Space>
    </Card>
  );
};

/**
 * Main App Component demonstrating Activity usage
 */
const ActivityExample: React.FC = () => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('tab1');

  const tabs = [
    { key: 'tab1', label: 'Tab 1', color: '#1890ff' },
    { key: 'tab2', label: 'Tab 2', color: '#52c41a' },
    { key: 'tab3', label: 'Tab 3', color: '#faad14' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      {/* Example 1: Sidebar Toggle */}
      <div style={{ marginBottom: 24 }}>
        <Card style={{ margin: 16 }}>
          <Title level={2}>Example 1: Sidebar with State Preservation</Title>
          <Paragraph>
            Click the toggle button to hide/show the sidebar. Notice how the
            sidebar's state (expanded sections, search query, selected items) is
            preserved when hidden and restored when shown again.
          </Paragraph>

          <Button
            type="primary"
            onClick={() => setIsSidebarVisible(!isSidebarVisible)}
            style={{ marginBottom: 16 }}
          >
            {isSidebarVisible ? 'Hide' : 'Show'} Sidebar
          </Button>

          <Activity mode={isSidebarVisible ? 'visible' : 'hidden'}>
            <Sidebar title="Navigation Sidebar" />
          </Activity>

          <div
            style={{
              marginLeft: isSidebarVisible ? 320 : 0,
              transition: 'margin-left 0.3s ease',
            }}
          >
            <Card>
              <Title level={3}>Main Content Area</Title>
              <Paragraph>
                This is the main content area. When the sidebar is visible, this
                content shifts to the right. The sidebar's internal state is
                preserved even when hidden.
              </Paragraph>
              <Paragraph>
                <Text strong>Try this:</Text>
                <ul>
                  <li>Expand a section in the sidebar</li>
                  <li>Type something in the search box</li>
                  <li>Select some checkboxes</li>
                  <li>Hide the sidebar</li>
                  <li>Show it again - all your state is preserved!</li>
                </ul>
              </Paragraph>
            </Card>
          </div>
        </Card>
      </div>

      {/* Example 2: Tabbed Interface */}
      <div style={{ marginBottom: 24 }}>
        <Card style={{ margin: 16 }}>
          <Title level={2}>Example 2: Tabbed Interface with Pre-rendering</Title>
          <Paragraph>
            This example shows how Activity can be used to pre-render tab
            content while keeping inactive tabs hidden. Each tab maintains its
            own state independently.
          </Paragraph>

          <Space style={{ marginBottom: 16 }}>
            {tabs.map((tab) => (
              <Button
                key={tab.key}
                type={activeTab === tab.key ? 'primary' : 'default'}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </Button>
            ))}
          </Space>

          <div style={{ position: 'relative', minHeight: 300 }}>
            {tabs.map((tab) => (
              <Activity
                key={tab.key}
                mode={activeTab === tab.key ? 'visible' : 'hidden'}
              >
                <div
                  style={{
                    position: activeTab === tab.key ? 'relative' : 'absolute',
                    width: '100%',
                    opacity: activeTab === tab.key ? 1 : 0,
                    pointerEvents: activeTab === tab.key ? 'auto' : 'none',
                  }}
                >
                  <TabContent tabName={tab.label} color={tab.color} />
                </div>
              </Activity>
            ))}
          </div>

          <Divider />

          <Paragraph>
            <Text strong>Key Benefits:</Text>
            <ul>
              <li>
                Each tab maintains its own state (counter, input values)
                independently
              </li>
              <li>
                Switching between tabs is instant because content is
                pre-rendered
              </li>
              <li>
                Hidden tabs are unmounted (effects cleaned up) but state is
                preserved
              </li>
            </ul>
          </Paragraph>
        </Card>
      </div>

      {/* Example 3: Conditional Content */}
      <Card style={{ margin: 16 }}>
        <Title level={2}>Example 3: Conditional Content Display</Title>
        <Paragraph>
          Activity can be used to conditionally show/hide content based on user
          interactions while preserving state.
        </Paragraph>

        <ConditionalContentExample />
      </Card>
    </div>
  );
};

/**
 * Example 3: Conditional Content with Activity
 */
const ConditionalContentExample: React.FC = () => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    advancedOption1: '',
    advancedOption2: '',
  });

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div>
        <Text strong>Basic Information:</Text>
        <Space direction="vertical" style={{ width: '100%', marginTop: 8 }}>
          <Input
            placeholder="Name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />
          <Input
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </Space>
      </div>

      <Button
        type="link"
        onClick={() => setShowAdvanced(!showAdvanced)}
      >
        {showAdvanced ? 'Hide' : 'Show'} Advanced Options
      </Button>

      <Activity mode={showAdvanced ? 'visible' : 'hidden'}>
        <Card
          title="Advanced Options"
          size="small"
          style={{ backgroundColor: '#fafafa' }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text>Advanced Option 1:</Text>
              <Input
                placeholder="Advanced setting 1"
                value={formData.advancedOption1}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    advancedOption1: e.target.value,
                  })
                }
                style={{ marginTop: 8 }}
              />
            </div>
            <div>
              <Text>Advanced Option 2:</Text>
              <Input
                placeholder="Advanced setting 2"
                value={formData.advancedOption2}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    advancedOption2: e.target.value,
                  })
                }
                style={{ marginTop: 8 }}
              />
            </div>
            <Paragraph style={{ fontSize: 12, color: '#666' }}>
              These advanced options maintain their values even when hidden.
              Toggle the visibility to see the state preservation in action.
            </Paragraph>
          </Space>
        </Card>
      </Activity>

      <Divider />

      <div>
        <Text strong>Current Form Data:</Text>
        <pre style={{ backgroundColor: '#f5f5f5', padding: 12, borderRadius: 4 }}>
          {JSON.stringify(formData, null, 2)}
        </pre>
      </div>
    </Space>
  );
};

export default ActivityExample;

