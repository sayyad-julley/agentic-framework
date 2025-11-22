---
name: implementing-algolia-search
description: Implements Algolia search functionality by applying proven patterns (radical denormalization, frontend direct search, secured API keys for multi-tenancy, custom ranking), following best practices (selective indexing, batching operations, infinite scroll, debouncing), implementing workarounds (record splitting with Distinct, atomic re-indexing, paginationLimitedTo), and avoiding anti-patterns (normalized structures, dump-and-pray indexing, backend proxying, index-per-tenant). Use when implementing search functionality, migrating from database-based search, optimizing existing Algolia implementations, or handling multi-tenant search requirements.
version: 1.0.0
dependencies:
  - algoliasearch>=4.0.0
  - react-instantsearch-hooks-web>=6.0.0
---

# Implementing Algolia Search

## Overview

Implements Algolia search functionality using search-first architecture patterns. Emphasizes the paradigm shift from RDBMS storage-centric models to read-optimized, distributed search engines. Provides procedural knowledge for data modeling, indexing strategies, search architecture, security patterns, relevance engineering, and frontend implementation while avoiding common anti-patterns.

## When to Use

Use this skill when:
- Implementing search functionality in new applications
- Migrating from database-based search to Algolia
- Optimizing existing Algolia implementations
- Handling multi-tenant search requirements
- Implementing federated search across multiple data types
- Setting up SSR/SEO-compatible search
- Implementing merchandising and business logic in search

**Input format**: Algolia account with API keys, understanding of data structure to be indexed, frontend framework requirements
**Expected output**: Fully configured Algolia search implementation following proven patterns, best practices applied, workarounds implemented, anti-patterns avoided

## Prerequisites

Before using this skill, ensure:
- Algolia account with API keys (Search-Only and Admin keys)
- Understanding of data structure to be indexed
- Frontend framework (React, Vue, vanilla JS) or backend requirements
- Access to application backend for Secured API Key generation (if multi-tenant)

## Execution Steps

### Step 1: Data Modeling - Radical Denormalization Pattern

Flatten normalized database structures into single, self-contained records. Algolia does not support joins at query time.

**Pattern**: Flatten all related data into the record itself
**Anti-pattern**: Attempting to replicate normalized database structures with separate indices

**Record Structure Template**:
```javascript
// Flattened product record
{
  objectID: "product_123",  // Must map to database PK
  name: "iPhone 15 Pro",
  price: 999,
  category: "Electronics",
  category_id: "cat_001",
  brand: "Apple",
  brand_id: "brand_001",
  // Include all display, filter, sort, and search attributes
  description: "Latest iPhone model...",
  tags: ["smartphone", "apple", "pro"],
  in_stock: true,
  popularity_score: 8500
}
```

**Best Practice**: Selective indexing - only include attributes needed for:
- Search matching (searchableAttributes)
- Display (retrievable attributes)
- Sorting (ranking attributes)
- Filtering (faceting attributes)

**Workaround**: For long-form content exceeding record size limits (10KB-100KB), use Record Splitting:
- Split document into paragraph/section chunks
- Index each chunk as separate record
- Use `distinct: true` with `attributeForDistinct: "document_id"` to return one result per document

### Step 2: Indexing Operations - Batching and Partial Updates

Group indexing operations into batches to reduce network overhead and improve performance.

**Pattern**: Batch operations (1,000-100,000 records, max 10MB per batch)
**Anti-pattern**: High-frequency single-record updates

**Batch Indexing Template**:
```javascript
import algoliasearch from 'algoliasearch';

const client = algoliasearch(APP_ID, ADMIN_API_KEY);
const index = client.initIndex('products');

async function batchIndex(records) {
  const BATCH_SIZE = 1000;
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    await index.saveObjects(batch);
  }
}
```

**Best Practice**: Use `partialUpdateObjects` for attribute changes:
```javascript
// Only update changed attributes
await index.partialUpdateObjects([{
  objectID: "product_123",
  price: 899  // Only price changed
}]);
```

**Workaround**: For structural changes requiring full re-index, use Atomic Re-indexing:
1. Index data into temporary index (`products_temp`)
2. Once complete, use `moveIndex('products_temp', 'products')` to atomically replace production index

### Step 3: Search Architecture - Frontend Direct Search

Query Algolia directly from the client to leverage geo-distributed edge network and minimize latency.

**Pattern**: Client-side direct queries to Algolia API
**Anti-pattern**: Backend proxying for "security" when Search-Only keys suffice

**Frontend Search Initialization Template**:
```javascript
import algoliasearch from 'algoliasearch';

const searchClient = algoliasearch(APP_ID, SEARCH_ONLY_API_KEY);
const index = searchClient.initIndex('products');

// Search-Only keys are safe for frontend exposure
// They cannot modify index or access admin settings
```

**Best Practice**: Use Search-Only API keys (public-safe) for frontend. They cannot:
- Modify indices
- Access admin settings
- Create/delete indices

**Exception**: Backend search required for:
- SSR/SEO generation (Next.js server-side rendering)
- System-to-system queries
- Complex security logic exceeding Secured API Key payload limits

### Step 4: Multi-Tenancy - Secured API Keys Pattern

Generate HMAC-signed virtual keys on backend that enforce tenant isolation without separate indices.

**Pattern**: HMAC-signed virtual keys with embedded tenant filters
**Anti-pattern**: Index-per-tenant approach (hits infrastructure limits, operational complexity)

**Secured API Key Generation Template** (Backend):
```javascript
import algoliasearch from 'algoliasearch';

const client = algoliasearch(APP_ID, ADMIN_API_KEY);

function generateSecuredKey(tenantId) {
  return client.generateSecuredApiKey(SEARCH_ONLY_KEY, {
    filters: `tenant_id:${tenantId}`,
    validUntil: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    restrictIndices: ['products']
  });
}

// Backend endpoint
app.get('/api/search-key', (req, res) => {
  const tenantId = req.user.tenantId;
  const securedKey = generateSecuredKey(tenantId);
  res.json({ apiKey: securedKey });
});
```

**Best Practice**: Single index with filter-based isolation. Algolia validates signature and forcibly applies embedded filters - users cannot spoof or remove them.

**Workaround**: Separate indices only if data structures or relevance configurations are fundamentally different between tenants.

### Step 5: Relevance Engineering - Custom Ranking

Use custom ranking attributes for business logic rather than manipulating textual relevance criteria.

**Pattern**: Custom ranking attributes (popularity, sales rank, date) for business control
**Anti-pattern**: Over-manipulating first 7 textual relevance criteria (highly optimized defaults)

**Custom Ranking Configuration Template**:
```javascript
await index.setSettings({
  customRanking: ['desc(popularity_score)', 'desc(sales_rank)'],
  searchableAttributes: [
    'name',
    'description',
    'tags'
  ],
  attributesForFaceting: ['category', 'brand', 'price']
});
```

**Best Practice**: Use synonyms for natural language handling:
```javascript
await index.saveSynonym({
  objectID: 'pants-synonym',
  type: 'synonym',
  synonyms: ['pants', 'trousers', 'slacks']
});
```

**Workaround**: For "noise" in long descriptions, create derived attributes:
- Extract key terms into `short_description` or `keywords` attribute
- Prioritize derived attribute in `searchableAttributes` list

### Step 6: Frontend Implementation - UX Patterns

Implement infinite scroll to avoid deep pagination limitations and improve mobile UX.

**Pattern**: Infinite scroll over deep pagination
**Anti-pattern**: Deep pagination beyond 1,000 hits (default limit)

**Infinite Scroll Implementation Template** (React):
```javascript
import { useInfiniteHits } from 'react-instantsearch-hooks-web';

function ProductList() {
  const { hits, showMore, isLastPage } = useInfiniteHits();
  
  return (
    <>
      {hits.map(hit => <ProductCard key={hit.objectID} product={hit} />)}
      {!isLastPage && <button onClick={showMore}>Load More</button>}
    </>
  );
}
```

**Best Practice**: For high-cardinality facets (10,000+ values), implement Search for Facet Values:
```javascript
import { RefinementList } from 'react-instantsearch-hooks-web';

<RefinementList
  attribute="author"
  searchable={true}  // Enables mini-search in facet menu
/>
```

**Workaround**: For business-critical deep pagination, increase limit:
```javascript
await index.setSettings({
  paginationLimitedTo: 5000  // Use with caution - impacts performance
});
```

### Step 7: SSR Implementation - Next.js Pattern

Synchronize server-side search state with client to prevent hydration mismatches.

**Pattern**: Server-side search with state serialization and hydration
**Code Template**: SSR search with hydration

**SSR Search Template** (Next.js):
```javascript
// app/search/page.tsx
import { InstantSearchSSRProvider, getServerState } from 'react-instantsearch-hooks-web';
import { searchClient } from '@/lib/algolia';

export default async function SearchPage({ searchParams }) {
  const serverState = await getServerState(
    <Search searchParams={searchParams} />
  );

  return (
    <InstantSearchSSRProvider {...serverState}>
      <Search searchParams={searchParams} />
    </InstantSearchSSRProvider>
  );
}
```

**Best Practice**: Use URL-based routing for deep links:
```javascript
import { useRouter } from 'next/router';

<InstantSearch
  routing={{
    stateMapping: {
      stateToRoute(uiState) {
        return { q: uiState.query };
      },
      routeToState(routeState) {
        return { query: routeState.q };
      }
    }
  }}
/>
```

**Workaround**: Initialize client with `initialUiState` from server to prevent duplicate requests.

### Step 8: Advanced Features - Rules and Analytics

Use Rules strategically for merchandising exceptions, not for fixing global relevance issues.

**Pattern**: Strategic use of Rules for merchandising (pinning, burying, contextual promotion)
**Anti-pattern**: Over-reliance on Rules to fix relevance (creates maintenance nightmare)

**Rule Creation Structure Template**:
```javascript
await index.saveRule({
  objectID: 'black-friday-rule',
  condition: {
    pattern: 'laptop',
    anchoring: 'contains'
  },
  consequence: {
    promote: [
      { objectID: 'laptop_premium', position: 1 }
    ],
    params: {
      query: 'laptop'
    }
  }
});
```

**Best Practice**: Implement Insights API for click/conversion tracking:
```javascript
import { insights } from 'search-insights';

insights('clickedObjectIDsAfterSearch', {
  eventName: 'Product Clicked',
  index: 'products',
  queryID: searchResponse.queryID,
  objectIDs: [hit.objectID],
  positions: [hit.__position]
});
```

**Workaround**: A/B testing with replica indices:
1. Create replica index with proposed configuration
2. Configure A/B test in dashboard (traffic split)
3. Engine automatically tracks performance difference using Insights data

### Step 9: Cost Optimization - Performance Patterns

Implement debouncing and caching to reduce search operations and control costs.

**Pattern**: Debouncing queries and leveraging built-in caching
**Code Template**: Debounced search function

**Debouncing Template**:
```javascript
import { useSearchBox } from 'react-instantsearch-hooks-web';
import { useMemo } from 'react';
import { debounce } from 'lodash';

function SearchBox() {
  const { query, refine } = useSearchBox();
  
  const debouncedRefine = useMemo(
    () => debounce((value) => refine(value), 300),
    [refine]
  );
  
  return (
    <input
      onChange={(e) => debouncedRefine(e.target.value)}
      defaultValue={query}
    />
  );
}
```

**Best Practice**: Use `filterOnly` for attributes used strictly for filtering:
```javascript
await index.setSettings({
  attributesForFaceting: [
    'filterOnly(is_public)',  // Not searchable, only for filtering
    'category',
    'brand'
  ]
});
```

**Workaround**: Use `searchFunction` wrapper to prevent empty queries:
```javascript
<InstantSearch
  searchClient={{
    ...searchClient,
    search(requests) {
      if (requests[0].params.query === '') {
        return Promise.resolve({ results: [] });
      }
      return searchClient.search(requests);
    }
  }}
/>
```

## Transformation Rules

1. **Data Flattening Rules**: Transform normalized data to flat records by:
   - Including all related entity attributes directly in record
   - Mapping database PK to `objectID`
   - Duplicating data across records if needed (redundancy is acceptable for speed)

2. **Attribute Selection Rules**: Include only attributes needed for:
   - Search matching (textual content)
   - Display (product name, image, price)
   - Sorting (popularity, date, price)
   - Filtering (category, brand, availability)

3. **Security Rules**: Use:
   - Search-Only keys for public frontend search
   - Secured API Keys for multi-tenant scenarios
   - Admin keys only on backend, never expose

4. **Relevance Rules**: Prioritize:
   - Custom ranking for business logic (90% of cases)
   - Rules only for strategic exceptions and merchandising
   - Synonyms for natural language, not for fixing ranking

## Anti-Patterns

1. **Normalized Database Structure**: Attempting to replicate SQL joins or normalized tables in Algolia. The engine doesn't support joins - flatten data at indexing time.

2. **Dump and Pray**: Indexing entire database rows including unnecessary metadata, binary blobs, or base64 images. This bloats index size and increases costs.

3. **High-Frequency Single-Record Updates**: Sending individual `saveObject` calls for each record change. This stresses the indexing queue and incurs network overhead.

4. **Backend Proxying When Unnecessary**: Routing all search requests through backend API "for security" when Search-Only keys are sufficient. This negates geo-distribution benefits and adds latency.

5. **Index-per-Tenant**: Creating separate indices for each customer in multi-tenant SaaS. This hits infrastructure limits (typically 1,000 indices) and creates operational complexity.

6. **Over-Reliance on Rules**: Creating thousands of manual rules to fix relevance issues one query at a time. This creates maintenance nightmares and brittle systems.

7. **Deep Pagination Abuse**: Implementing pagination beyond 1,000 hits without `paginationLimitedTo` or using infinite scroll. This degrades performance and UX.

8. **Not Using Distinct for Chunked Records**: Splitting documents into chunks but not using `distinct: true`, causing search results to flood with multiple results from the same document.

## Best Practices

1. **Selective Indexing**: Only index data necessary for search, display, sorting, or filtering. Exclude large binary data, extensive metadata, or internal-only fields.

2. **Batching Operations**: Group indexing operations into batches of 1,000-100,000 records (max 10MB per batch) to reduce network calls and improve efficiency.

3. **Frontend Direct Search**: Query Algolia directly from client using Search-Only API keys to leverage geo-distributed edge network and minimize latency.

4. **Secured API Keys for Multi-Tenancy**: Use HMAC-signed virtual keys with embedded tenant filters instead of separate indices per tenant.

5. **Custom Ranking for Business Logic**: Use custom ranking attributes (popularity, sales rank) for business control rather than manipulating textual relevance criteria.

6. **Infinite Scroll for UX**: Implement infinite scroll over deep pagination to avoid 1,000 hit limit and improve mobile experience.

7. **Debouncing for Cost Optimization**: Implement 300ms debounce on search input to prevent queries on every keystroke, reducing operation count.

8. **Monitoring "No Results" Queries**: Regularly analyze queries returning zero results to identify missing synonyms, inventory gaps, or indexing issues.

9. **ObjectID = Database PK**: Always map database primary key to `objectID` to enable efficient updates and deletions.

10. **Consistent Attribute Naming**: Maintain consistent attribute names across records (e.g., always `category`, never mix `category` and `categories`) for effective faceting.

## Workarounds

1. **Record Splitting for Long-Form Content**: For documents exceeding record size limits (10KB-100KB), split into paragraph/section chunks and index each as separate record. Use `distinct: true` with `attributeForDistinct: "document_id"` to return one result per document.

2. **Atomic Re-indexing for Structural Changes**: For massive structural changes requiring full re-index, index into temporary index (`products_temp`) then use `moveIndex('products_temp', 'products')` to atomically replace production index without downtime.

3. **paginationLimitedTo for Deep Pagination**: For business-critical deep pagination requirements, increase limit via `paginationLimitedTo` setting (e.g., 5,000 or 20,000). Use with caution as it impacts query performance.

4. **Derived Attributes for Noise Reduction**: For long descriptions causing relevance "noise," extract key terms into `short_description` or `keywords` attribute and prioritize in `searchableAttributes` list to focus engine on high-signal data.

5. **Backend Search for SSR/SEO**: For Next.js SSR or SEO requirements, execute search queries on server, serialize results into HTML payload, and hydrate client with `initialUiState` to prevent duplicate requests and enable crawler indexing.

## Examples

### Example 1: E-commerce Product Search

**Scenario**: Implementing product search with custom ranking and infinite scroll.

**Minimal Implementation**:
```javascript
// 1. Flattened product record
const product = {
  objectID: "prod_123",
  name: "iPhone 15 Pro",
  price: 999,
  category: "Electronics",
  brand: "Apple",
  popularity_score: 8500,
  in_stock: true
};

// 2. Index configuration
await index.setSettings({
  customRanking: ['desc(popularity_score)'],
  searchableAttributes: ['name', 'category', 'brand']
});

// 3. Frontend search with infinite scroll
import { InstantSearch, InfiniteHits } from 'react-instantsearch-hooks-web';

<InstantSearch searchClient={searchClient} indexName="products">
  <SearchBox />
  <InfiniteHits hitComponent={ProductCard} />
</InstantSearch>
```

### Example 2: Multi-Tenant SaaS Search

**Scenario**: Implementing secure multi-tenant search with single index and Secured API Keys.

**Minimal Implementation**:
```javascript
// 1. Backend: Generate Secured API Key
app.get('/api/search-key', authenticate, (req, res) => {
  const securedKey = client.generateSecuredApiKey(SEARCH_ONLY_KEY, {
    filters: `tenant_id:${req.user.tenantId}`,
    validUntil: Math.floor(Date.now() / 1000) + 3600
  });
  res.json({ apiKey: securedKey });
});

// 2. Frontend: Use Secured Key
const { apiKey } = await fetch('/api/search-key').then(r => r.json());
const searchClient = algoliasearch(APP_ID, apiKey);

// 3. Records include tenant_id
const record = {
  objectID: "doc_123",
  tenant_id: "company_A",  // Filtered automatically
  title: "Document Title",
  content: "Document content..."
};
```

## Error Handling

**Indexing Failures**:
- Implement retry logic with exponential backoff for transient failures
- Log failed records for manual review
- Use `waitTask` to ensure indexing completion before querying

**Query Errors**:
- Handle rate limiting (429 errors) with retry logic
- Validate API keys before making requests
- Provide fallback UI when search is unavailable

**API Key Validation Errors**:
- Verify key permissions match operation (Search-Only vs Admin)
- Check key expiration for Secured API Keys
- Validate key format before initialization

**Rate Limiting**:
- Implement request queuing for high-volume scenarios
- Use debouncing to reduce query frequency
- Monitor usage in Algolia dashboard to anticipate limits

## Security and Guidelines

**CRITICAL**: Never hardcode sensitive information:
- ❌ No Admin API keys in frontend code
- ❌ No API keys in SKILL.md or example code
- ❌ No credentials in version control
- ✅ Use environment variables for all API keys
- ✅ Use Search-Only keys for frontend (safe to expose)
- ✅ Generate Secured API Keys on backend for multi-tenancy
- ✅ Route sensitive operations through secure backend channels

**Operational Constraints**:
- Search-Only keys are safe for frontend exposure (cannot modify indices)
- Admin keys must remain on backend only
- Secured API Keys should have expiration (`validUntil`) for session management
- Monitor key usage and rotate regularly

## Dependencies

This skill requires the following packages (listed in frontmatter):
- `algoliasearch>=4.0.0`: Core Algolia JavaScript client for indexing and search operations
- `react-instantsearch-hooks-web>=6.0.0`: React InstantSearch hooks for building search UIs (if using React)

**Note**: For API-based deployments, all dependencies must be pre-installed in the execution environment. The skill cannot install packages at runtime.

**Additional Framework-Specific Libraries** (as needed):
- `vue-instantsearch`: For Vue.js applications
- `instantsearch.js`: For vanilla JavaScript applications
- `search-insights`: For analytics and click tracking

## Performance Considerations

**Batch Size Optimization**:
- Recommended batch size: 1,000-100,000 records depending on record size
- Hard limit: 10MB per batch
- Monitor indexing latency to find optimal batch size for your data

**Index Size Optimization**:
- Use `filterOnly` for attributes used only for filtering
- Exclude unnecessary attributes to reduce index size
- Monitor index size in dashboard to stay within plan limits

**Query Debouncing Timing**:
- Recommended: 300ms delay after user stops typing
- Adjust based on user experience requirements
- Balance between responsiveness and cost optimization

**Caching Strategies**:
- Leverage built-in InstantSearch caching for same queries within session
- Implement application-level caching for frequently accessed results
- Use CDN caching for static search result pages (SSR)

## Related Resources

For extensive reference materials, see:
- Algolia Documentation: https://www.algolia.com/doc/
- InstantSearch Libraries: https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/js/
- Best Practices Guide: https://www.algolia.com/doc/guides/building-search-ui/going-further/improving-performance/js/

## Notes

- Algolia uses a "tie-breaking" ranking algorithm, not a single relevance score. Results are sorted sequentially by: Typo → Geo → Words → Filters → Proximity → Attribute → Exact → Custom
- The first 7 criteria are highly optimized defaults. Focus custom ranking efforts on the Custom step (Step 8)
- Record size limits vary by plan: typically 10KB-100KB. Check your plan's specific limits
- Federated search (multi-index) is supported via parallel queries in a single network request
- A/B testing requires replica indices and dashboard configuration for traffic splitting
- Insights API enables personalization and dynamic re-ranking based on historical click/conversion data

