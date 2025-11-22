/**
 * SSR Search Page
 * 
 * This page demonstrates server-side rendering for SEO.
 * For most use cases, client-side search is sufficient.
 * 
 * Note: SSR is simplified here. For full SSR support, use Next.js Pages Router
 * or implement proper SSR with react-instantsearch SSR utilities.
 */

import { Search } from "./search-client";

export const dynamic = "force-dynamic";

export default function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  return <Search searchParams={searchParams} />;
}

