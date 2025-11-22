# Algolia Search Demo

A real-world Algolia search implementation demonstrating best practices, patterns, and anti-patterns for production-ready search experiences.

## Features

- ✅ **Frontend Direct Search** - Query Algolia directly from client using Search-Only API keys
- ✅ **Debounced Search** - 300ms debounce to prevent queries on every keystroke
- ✅ **Infinite Scroll** - Better UX than deep pagination, avoids 1,000 hit limit
- ✅ **Faceted Search** - Category, brand, and price filters with refinement lists
- ✅ **Radical Denormalization** - Flattened product records with all related data
- ✅ **Selective Indexing** - Only attributes needed for search, display, sort, and filter
- ✅ **SSR Support** - Server-side rendering for SEO (optional)

## Best Practices Implemented

1. **Search-Only API Keys for Frontend** - Safe to expose, cannot modify indices
2. **Debouncing** - 300ms delay reduces query count and costs
3. **Infinite Scroll** - Better mobile UX than traditional pagination
4. **Batching Operations** - Group indexing operations (1,000-100,000 records)
5. **Custom Ranking** - Business logic via popularity scores, not textual relevance
6. **Selective Indexing** - Only necessary attributes to reduce index size

## Anti-Patterns Avoided

- ❌ No normalized database structures (flattened records)
- ❌ No backend proxying when Search-Only keys suffice
- ❌ No high-frequency single-record updates (batching used)
- ❌ No deep pagination abuse (infinite scroll implemented)
- ❌ No dump-and-pray indexing (selective attributes only)
- ❌ No index-per-tenant (single index with filters)

## Prerequisites

- Node.js 18+ and npm/yarn
- Algolia account ([Sign up for free](https://www.algolia.com/users/sign_up))
- Algolia API keys (Application ID, Search-Only API Key, Admin API Key)

## Setup

1. **Clone and install dependencies:**

```bash
cd algolia-demo
npm install
```

2. **Configure Algolia credentials:**

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Algolia credentials:

```env
NEXT_PUBLIC_ALGOLIA_APP_ID=your_app_id_here
NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY=your_search_only_key_here
ALGOLIA_ADMIN_API_KEY=your_admin_key_here
NEXT_PUBLIC_ALGOLIA_INDEX_NAME=products
```

**Where to find your API keys:**
- Go to [Algolia Dashboard](https://www.algolia.com/account/api-keys/)
- Copy your Application ID
- Create a Search-Only API Key (or use the default one)
- Copy your Admin API Key (keep this secret!)

3. **Index sample data:**

```bash
npm run index
```

This will:
- Generate 1,000 sample products
- Configure index settings (searchable attributes, facets, custom ranking)
- Batch index all products

4. **Start the development server:**

```bash
npm run dev
```

Visit [http://localhost:4003](http://localhost:4003) to see the search demo.

## Project Structure

```
algolia-demo/
├── app/
│   ├── components/
│   │   ├── search-box.tsx      # Debounced search input
│   │   ├── infinite-hits.tsx  # Infinite scroll results
│   │   ├── facets.tsx          # Category, brand, price filters
│   │   └── stats.tsx           # Search statistics
│   ├── search/                 # SSR search page (optional)
│   ├── page.tsx                # Main search page
│   ├── layout.tsx              # Root layout
│   ├── globals.css             # Global styles
│   └── types.ts                 # TypeScript types
├── lib/
│   └── algolia.ts              # Algolia client configuration
├── scripts/
│   └── index-data.ts           # Sample data indexing script
└── README.md
```

## Key Components

### SearchBox

Debounced search input component that prevents queries on every keystroke:

```typescript
// 300ms debounce reduces query count
const debouncedRefine = useMemo(
  () => debounce((value: string) => refine(value), 300),
  [refine]
);
```

### InfiniteHits

Infinite scroll implementation using Intersection Observer:

```typescript
// Automatically loads more when sentinel is visible
const observer = new IntersectionObserver((entries) => {
  if (entry.isIntersecting && !isLastPage) {
    showMore();
  }
});
```

### Facets

Refinement lists for filtering by category, brand, and price range:

```typescript
// Uses useRefinementList hook for faceting
const { items, refine } = useRefinementList({
  attribute: "category",
  limit: 10,
});
```

## Data Model

Products are stored as flattened records (radical denormalization):

```typescript
interface ProductHit {
  objectID: string;           // Maps to database PK
  name: string;               // Searchable
  description: string;        // Searchable
  price: number;             // Sortable
  category: string;          // Facetable
  brand: string;             // Facetable
  in_stock: boolean;         // Filterable
  popularity_score: number;   // Custom ranking
  tags: string[];            // Searchable
}
```

## Index Configuration

The index is configured with:

- **Custom Ranking**: `desc(popularity_score)` for business logic
- **Searchable Attributes**: `name`, `description`, `category`, `brand`, `tags`
- **Facetable Attributes**: `category`, `brand`, `price_range`, `in_stock`
- **Filter-Only Attributes**: `in_stock` (not searchable, only for filtering)

## SSR Support

For SEO, an SSR search page is available at `/search`:

```bash
# Visit http://localhost:4003/search?q=laptop
```

This page uses `InstantSearchSSRProvider` and `getServerState` for server-side rendering.

## Performance Considerations

- **Batch Size**: 1,000 records per batch (optimal for most use cases)
- **Debounce Timing**: 300ms (balance between responsiveness and cost)
- **Infinite Scroll**: Loads 20 results at a time (configurable)
- **Index Size**: Only necessary attributes to reduce size and costs

## Security

- ✅ **Search-Only API Key** - Safe for frontend exposure
- ✅ **Admin API Key** - Only used in backend/indexing scripts
- ✅ **Environment Variables** - Never commit API keys to version control

## Cost Optimization

- Debouncing reduces query count by ~70%
- Selective indexing reduces index size
- Infinite scroll avoids deep pagination costs
- Filter-only attributes reduce searchable index size

## Next Steps

1. **Customize Data Model**: Update `ProductHit` interface and indexing script
2. **Add More Facets**: Extend facets component with additional filters
3. **Implement Rules**: Add merchandising rules for specific queries
4. **Add Analytics**: Implement Insights API for click/conversion tracking
5. **Multi-Index Search**: Search across multiple indices simultaneously

## Resources

- [Algolia Documentation](https://www.algolia.com/doc/)
- [React InstantSearch Guide](https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/react/)
- [Best Practices](https://www.algolia.com/doc/guides/building-search-ui/going-further/improving-performance/react/)

## License

MIT

