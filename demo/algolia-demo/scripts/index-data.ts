/**
 * Sample Data Indexing Script
 * 
 * Best Practices:
 * - Batch operations (1,000-100,000 records, max 10MB per batch)
 * - Use partialUpdateObjects for attribute changes
 * - Atomic re-indexing for structural changes
 * - Radical denormalization: flatten all related data
 */

import { config } from "dotenv";
import { resolve } from "path";
import { algoliasearch } from "algoliasearch";
import { ProductHit } from "../app/types";

// Load environment variables from .env.local or .env
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const ADMIN_API_KEY = process.env.ALGOLIA_ADMIN_API_KEY;
const INDEX_NAME = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || "products";

if (!APP_ID || !ADMIN_API_KEY) {
  console.error(
    "Missing Algolia credentials. Please set NEXT_PUBLIC_ALGOLIA_APP_ID and ALGOLIA_ADMIN_API_KEY in .env or .env.local"
  );
  console.error(`APP_ID: ${APP_ID ? "✓ Set" : "✗ Missing"}`);
  console.error(`ADMIN_API_KEY: ${ADMIN_API_KEY ? "✓ Set" : "✗ Missing"}`);
  process.exit(1);
}

// Algolia v5 API - use client methods directly with indexName parameter
const client = algoliasearch(APP_ID, ADMIN_API_KEY);

/**
 * Generate sample product data
 * 
 * Pattern: Radical denormalization - all related data in single record
 */
function generateSampleProducts(): ProductHit[] {
  const categories = ["Electronics", "Clothing", "Home & Garden", "Sports", "Books"];
  const brands = ["Apple", "Samsung", "Nike", "Adidas", "Sony", "LG", "Canon"];
  const priceRanges = ["$0-$50", "$50-$100", "$100-$200", "$200-$500", "$500+"];

  const products: ProductHit[] = [];

  for (let i = 1; i <= 1000; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const price = Math.floor(Math.random() * 1000) + 10;
    const priceRange = priceRanges[Math.min(Math.floor(price / 50), priceRanges.length - 1)];

    products.push({
      objectID: `product_${i}`,
      name: `${brand} Product ${i}`,
      description: `High-quality ${category.toLowerCase()} product from ${brand}. Perfect for everyday use.`,
      price,
      category,
      category_id: `cat_${categories.indexOf(category)}`,
      brand,
      brand_id: `brand_${brands.indexOf(brand)}`,
      image: `https://picsum.photos/300/200?random=${i}`,
      in_stock: Math.random() > 0.2, // 80% in stock
      popularity_score: Math.floor(Math.random() * 10000),
      tags: [category.toLowerCase(), brand.toLowerCase(), "featured"],
      price_range: priceRange,
    });
  }

  return products;
}

/**
 * Batch index products
 * 
 * Best Practice: Batch operations (1,000-100,000 records, max 10MB per batch)
 */
async function batchIndex(records: ProductHit[]) {
  const BATCH_SIZE = 1000;
  console.log(`Indexing ${records.length} records in batches of ${BATCH_SIZE}...`);

  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    console.log(`Indexing batch ${Math.floor(i / BATCH_SIZE) + 1}...`);
    
    try {
      await client.saveObjects({
        indexName: INDEX_NAME,
        objects: batch,
      });
      console.log(`✓ Indexed ${batch.length} records`);
    } catch (error) {
      console.error(`✗ Error indexing batch:`, error);
      throw error;
    }
  }
}

/**
 * Configure index settings
 * 
 * Best Practices:
 * - Custom ranking for business logic
 * - Searchable attributes for text matching
 * - Attributes for faceting for filters
 */
async function configureIndex() {
  console.log("Configuring index settings...");

  try {
    await client.setSettings({
      indexName: INDEX_NAME,
      indexSettings: {
        // Custom ranking for business logic (popularity, sales rank)
        customRanking: ["desc(popularity_score)"],
        
        // Searchable attributes (text matching)
        searchableAttributes: [
          "name",
          "description",
          "category",
          "brand",
          "tags",
        ],
        
        // Attributes for faceting (filtering)
        attributesForFaceting: [
          "category",
          "brand",
          "price_range",
          "filterOnly(in_stock)", // Not searchable, only for filtering
        ],
        
        // Retrievable attributes (what to return in results)
        // By default, all attributes are retrievable
        
        // Highlighting
        highlightPreTag: "<mark>",
        highlightPostTag: "</mark>",
      },
    });

    console.log("✓ Index settings configured");
  } catch (error) {
    console.error("✗ Error configuring index:", error);
    throw error;
  }
}

/**
 * Main indexing function
 */
async function main() {
  try {
    console.log("Starting Algolia indexing...");
    console.log(`Index: ${INDEX_NAME}`);
    console.log("");

    // Generate sample data
    console.log("Generating sample products...");
    const products = generateSampleProducts();
    console.log(`✓ Generated ${products.length} products`);
    console.log("");

    // Configure index settings
    await configureIndex();
    console.log("");

    // Index products
    await batchIndex(products);
    console.log("");

    console.log("✓ Indexing complete!");
    console.log(`Visit https://www.algolia.com/apps/${APP_ID}/explorer/browse/${INDEX_NAME} to view your index`);
  } catch (error) {
    console.error("Indexing failed:", error);
    process.exit(1);
  }
}

main();

