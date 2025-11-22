"use client";

import React from "react";
import { Layout, Typography, Space, Divider, Row, Col } from "antd";
import { InstantSearch } from "react-instantsearch";
import { searchClient, indexName } from "@/lib/algolia";
import { SearchBox } from "./components/search-box";
import { InfiniteHits } from "./components/infinite-hits";
import { CategoryFacet, BrandFacet, PriceRangeFacet } from "./components/facets";
import { Stats } from "./components/stats";

const { Header, Content, Sider } = Layout;
const { Title, Paragraph } = Typography;

/**
 * Main Search Page
 * 
 * Real-world Algolia demo showcasing:
 * - Frontend direct search (Search-Only API key)
 * - Debounced search input (300ms)
 * - Infinite scroll (better than deep pagination)
 * - Faceted search (category, brand, price)
 * - Radical denormalization pattern
 * 
 * Best Practices Applied:
 * - Search-Only keys for frontend (safe to expose)
 * - Debouncing to reduce query count
 * - Infinite scroll over pagination
 * - Selective indexing (only needed attributes)
 * - Custom ranking for business logic
 */
export default function Home() {
  return (
    <Layout className="min-h-screen">
      <Header className="bg-white shadow-sm">
        <div className="flex items-center justify-between h-full">
          <Title level={3} className="!mb-0 text-white">
            Algolia Search Demo
          </Title>
        </div>
      </Header>
      <Layout>
        <Content className="p-6">
          <div className="max-w-7xl mx-auto">
            <Space direction="vertical" size="large" className="w-full">
              <div>
                <Title level={2}>Production-Ready Algolia Implementation</Title>
                <Paragraph>
                  This demo showcases a real-world Algolia search implementation
                  following best practices and avoiding common anti-patterns.
                </Paragraph>
              </div>

              <Divider />

              <InstantSearch searchClient={searchClient} indexName={indexName}>
                <Row gutter={16}>
                  {/* Sidebar with Facets */}
                  <Col xs={24} sm={24} md={6} lg={6}>
                    <div className="sticky top-4">
                      <Title level={4}>Filters</Title>
                      <CategoryFacet />
                      <BrandFacet />
                      <PriceRangeFacet />
                    </div>
                  </Col>

                  {/* Main Search Area */}
                  <Col xs={24} sm={24} md={18} lg={18}>
                    <Space direction="vertical" size="large" className="w-full">
                      <SearchBox />
                      <Stats />
                      <InfiniteHits />
                    </Space>
                  </Col>
                </Row>
              </InstantSearch>

              <Divider />

              <div className="bg-gray-50 p-4 rounded-lg">
                <Title level={4}>Features Implemented</Title>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    <strong>Frontend Direct Search:</strong> Query Algolia
                    directly from client using Search-Only API keys
                  </li>
                  <li>
                    <strong>Debounced Search:</strong> 300ms debounce to
                    prevent queries on every keystroke
                  </li>
                  <li>
                    <strong>Infinite Scroll:</strong> Better UX than deep
                    pagination, avoids 1,000 hit limit
                  </li>
                  <li>
                    <strong>Faceted Search:</strong> Category, brand, and price
                    filters with refinement lists
                  </li>
                  <li>
                    <strong>Radical Denormalization:</strong> Flattened product
                    records with all related data
                  </li>
                  <li>
                    <strong>Selective Indexing:</strong> Only attributes needed
                    for search, display, sort, and filter
                  </li>
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <Title level={4}>Anti-Patterns Avoided</Title>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    ❌ No normalized database structures (flattened records)
                  </li>
                  <li>
                    ❌ No backend proxying when Search-Only keys suffice
                  </li>
                  <li>
                    ❌ No high-frequency single-record updates (batching used)
                  </li>
                  <li>
                    ❌ No deep pagination abuse (infinite scroll implemented)
                  </li>
                  <li>
                    ❌ No dump-and-pray indexing (selective attributes only)
                  </li>
                  <li>
                    ❌ No index-per-tenant (single index with filters)
                  </li>
                </ul>
              </div>
            </Space>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

