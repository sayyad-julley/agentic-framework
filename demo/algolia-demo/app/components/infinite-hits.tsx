"use client";

import React, { useRef, useEffect } from "react";
import { useInfiniteHits } from "react-instantsearch";
import { Card, Button, Spin, Empty } from "antd";
import { ProductHit } from "@/app/types";

/**
 * Infinite Scroll Hits Component
 * 
 * Best Practices:
 * - Infinite scroll over deep pagination (avoids 1,000 hit limit)
 * - Better mobile UX than traditional pagination
 * - Uses Intersection Observer for performance
 */
export function InfiniteHits() {
  const { hits, showMore, isLastPage } = useInfiniteHits<ProductHit>();
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isLastPage) {
            showMore();
          }
        });
      },
      { rootMargin: "100px" }
    );

    observer.observe(sentinelRef.current);

    return () => {
      observer.disconnect();
    };
  }, [isLastPage, showMore]);

  if (hits.length === 0) {
    return (
      <Empty
        description="No products found"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hits.map((hit) => (
          <ProductCard key={hit.objectID} hit={hit} />
        ))}
      </div>

      {/* Sentinel element for infinite scroll */}
      <div ref={sentinelRef} className="flex justify-center py-4">
        {!isLastPage && (
          <Button type="primary" onClick={showMore} loading={false}>
            Load More
          </Button>
        )}
      </div>
    </div>
  );
}

function ProductCard({ hit }: { hit: ProductHit }) {
  return (
    <Card
      hoverable
      className="h-full"
      cover={
        hit.image ? (
          <img
            alt={hit.name}
            src={hit.image}
            className="h-48 object-cover"
          />
        ) : (
          <div className="h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No Image</span>
          </div>
        )
      }
    >
      <Card.Meta
        title={hit.name}
        description={
          <div className="space-y-2">
            <p className="text-sm text-gray-600 line-clamp-2">
              {hit.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-blue-600">
                ${hit.price?.toFixed(2) || "N/A"}
              </span>
              {hit.in_stock && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  In Stock
                </span>
              )}
            </div>
            {hit.category && (
              <div className="flex flex-wrap gap-1 mt-2">
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {hit.category}
                </span>
                {hit.brand && (
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {hit.brand}
                  </span>
                )}
              </div>
            )}
          </div>
        }
      />
    </Card>
  );
}

