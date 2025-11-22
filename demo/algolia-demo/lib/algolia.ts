import { liteClient } from 'algoliasearch/lite';

/**
 * Algolia Search Client Configuration
 * 
 * Best Practices:
 * - Use Search-Only API key for frontend (safe to expose)
 * - Search-Only keys cannot modify indices or access admin settings
 * - Direct client-side queries leverage geo-distributed edge network
 */
export const searchClient = liteClient(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
  process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY!
);

/**
 * Admin client for indexing operations (backend only)
 * NEVER expose this in frontend code
 */
export const adminClient = typeof window === 'undefined' 
  ? liteClient(
      process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
      process.env.ALGOLIA_ADMIN_API_KEY!
    )
  : null;

export const indexName = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || 'products';

