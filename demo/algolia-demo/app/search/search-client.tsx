"use client";

import React from "react";
import { Layout, Typography, Row, Col } from "antd";
import { InstantSearch } from "react-instantsearch";
import { searchClient, indexName } from "@/lib/algolia";
import { SearchBox } from "../components/search-box";
import { InfiniteHits } from "../components/infinite-hits";
import { CategoryFacet, BrandFacet, PriceRangeFacet } from "../components/facets";
import { Stats } from "../components/stats";

const { Content, Sider } = Layout;
const { Title } = Typography;

export function Search({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  return (
    <Layout className="min-h-screen">
      <Content className="p-6">
        <div className="max-w-7xl mx-auto">
          <Title level={2} className="mb-6">
            Search (SSR)
          </Title>

          <InstantSearch
            searchClient={searchClient}
            indexName={indexName}
            initialUiState={{
              [indexName]: {
                query: searchParams.q || "",
              },
            }}
          >
            <Row gutter={16}>
              <Col xs={24} sm={24} md={6} lg={6}>
                <div className="sticky top-4">
                  <Title level={4}>Filters</Title>
                  <CategoryFacet />
                  <BrandFacet />
                  <PriceRangeFacet />
                </div>
              </Col>

              <Col xs={24} sm={24} md={18} lg={18}>
                <div className="space-y-4">
                  <SearchBox />
                  <Stats />
                  <InfiniteHits />
                </div>
              </Col>
            </Row>
          </InstantSearch>
        </div>
      </Content>
    </Layout>
  );
}

