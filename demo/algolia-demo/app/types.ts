/**
 * Product Hit Type
 * 
 * Represents a flattened product record in Algolia.
 * 
 * Best Practices:
 * - Radical denormalization: all related data in single record
 * - objectID maps to database primary key for efficient updates
 * - Only include attributes needed for search, display, sort, filter
 */
export interface ProductHit extends Record<string, unknown> {
  objectID: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  category_id?: string;
  brand: string;
  brand_id?: string;
  image?: string;
  in_stock: boolean;
  popularity_score?: number;
  tags?: string[];
  price_range?: string; // e.g., "$0-$50", "$50-$100"
}

