# HMS Stack Documentation

This directory contains the Mintlify documentation for the HMS Stack project.

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Mintlify CLI installed globally or as a dev dependency

### Installation

Install Mintlify CLI globally:

```bash
npm install -g mintlify
```

Or use the project's package.json script:

```bash
npm install
```

### Local Development

Start the local development server:

```bash
# Using npm script from root
npm run docs:dev

# Or directly with Mintlify CLI
cd docs
mintlify dev
```

The documentation will be available at `http://localhost:3000`.

## Project Structure

```
docs/
├── docs.json          # Main configuration file
├── introduction.mdx   # Landing page
└── quickstart.mdx     # Quickstart guide
```

## Configuration

The main configuration is in `docs.json`. Key settings include:

- **Navigation**: Define your documentation structure
- **Theme**: Choose from `maple`, `aspen`, `palm`, or `linden`
- **Colors**: Customize the color scheme

## Adding Content

1. Create a new `.mdx` file in the appropriate directory
2. Add frontmatter with title and description:

```mdx
---
title: Page Title
description: Page description
---

# Your content here
```

3. Add the page to navigation in `docs.json`

## API Documentation

To add API documentation:

1. Create an OpenAPI 3.x specification file (OpenAPI 2.0 is not supported)
2. Reference it in navigation:

```json
{
  "navigation": [
    {
      "group": "API Reference",
      "openapi": "path/to/openapi.yaml"
    }
  ]
}
```

3. Create MDX files for each endpoint with frontmatter:

```mdx
---
openapi: path/to/openapi.yaml
api: GET /users/{id}
---
```

**Important**: 
- Use OpenAPI 3.x only (OpenAPI 2.0 results in blank pages)
- Path in frontmatter must match OpenAPI spec exactly (character-for-character)
- HTTP methods must be uppercase (GET, POST, PUT, DELETE)

## Deployment

Documentation can be deployed via:

1. **GitHub App**: Automatic deployment on push (recommended)
2. **Mintlify Dashboard**: Manual deployment
3. **CI/CD**: Integrate into your pipeline

## Custom Components

Custom React components are located in the `components/` directory. These components follow performance optimization patterns:

- Use `useMemo` for expensive computations
- Use `useCallback` for event handlers
- Lazy load non-critical components
- Modular structure to prevent cascading re-renders

See `components/CustomDemo.tsx` for an example implementation.

## Custom Styling

Custom CSS is applied via `custom.css`. This file demonstrates Workaround 2: Custom UI Element Targeting.

**Note**: Custom CSS selectors use platform identifiers that may change with Mintlify updates. Schedule maintenance reviews after platform updates.

## API Playground Configuration

The API playground is configured in `docs.json` with:

- Server URL: `https://api.example.com/v1`
- Authentication: Bearer token

For CORS configuration (Workaround 1), see `CORS_CONFIGURATION.md`.

## Conflict Resolution

The OpenAPI spec demonstrates Pattern 2: Path Conflict Resolution. The `/users` GET endpoint uses `x-mint` extension to redirect to `/api/users-overview` to avoid conflict with the MDX file at `/api/users`.

## Resources

- [Mintlify Documentation](https://mintlify.com/docs)
- [MDX Guide](https://mintlify.com/docs/mdx)
- [OpenAPI Integration](https://mintlify.com/docs/api-reference)

