"use client";

import React from "react";
import { useRefinementList } from "react-instantsearch";
import { Card, Checkbox, Typography, Space } from "antd";

const { Title } = Typography;

/**
 * Facets Component
 * 
 * Best Practices:
 * - Use filterOnly for attributes used strictly for filtering
 * - Searchable facets for high-cardinality values (10,000+)
 * - Clear visual hierarchy for better UX
 */
export function CategoryFacet() {
  const { items, refine } = useRefinementList({
    attribute: "category",
    limit: 10,
  });

  return (
    <Card size="small" className="mb-4">
      <Title level={5} className="mb-3">
        Category
      </Title>
      <Space direction="vertical" className="w-full">
        {items.map((item) => (
          <Checkbox
            key={item.value}
            checked={item.isRefined}
            onChange={() => refine(item.value)}
          >
            {item.label} ({item.count})
          </Checkbox>
        ))}
      </Space>
    </Card>
  );
}

export function BrandFacet() {
  const { items, refine } = useRefinementList({
    attribute: "brand",
    limit: 10,
  });

  return (
    <Card size="small" className="mb-4">
      <Title level={5} className="mb-3">
        Brand
      </Title>
      <Space direction="vertical" className="w-full">
        {items.map((item) => (
          <Checkbox
            key={item.value}
            checked={item.isRefined}
            onChange={() => refine(item.value)}
          >
            {item.label} ({item.count})
          </Checkbox>
        ))}
      </Space>
    </Card>
  );
}

export function PriceRangeFacet() {
  const { items, refine } = useRefinementList({
    attribute: "price_range",
    limit: 10,
  });

  return (
    <Card size="small" className="mb-4">
      <Title level={5} className="mb-3">
        Price Range
      </Title>
      <Space direction="vertical" className="w-full">
        {items.map((item) => (
          <Checkbox
            key={item.value}
            checked={item.isRefined}
            onChange={() => refine(item.value)}
          >
            {item.label} ({item.count})
          </Checkbox>
        ))}
      </Space>
    </Card>
  );
}

export function ClearRefinements() {
  const { refine } = useRefinementList({ attribute: "category" });
  // Note: This is a simplified clear. In production, use useClearRefinements hook
  // or clear all refinements programmatically

  return null; // Implement clear refinements button if needed
}

