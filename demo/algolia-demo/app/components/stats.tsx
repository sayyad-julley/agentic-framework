"use client";

import React from "react";
import { useStats } from "react-instantsearch";
import { Typography } from "antd";

const { Text } = Typography;

/**
 * Search Stats Component
 * 
 * Displays search result statistics
 */
export function Stats() {
  const { nbHits, processingTimeMS } = useStats();

  return (
    <div className="mb-4">
      <Text type="secondary">
        {nbHits.toLocaleString()} result{nbHits !== 1 ? "s" : ""} found
        {processingTimeMS !== undefined && ` in ${processingTimeMS}ms`}
      </Text>
    </div>
  );
}

