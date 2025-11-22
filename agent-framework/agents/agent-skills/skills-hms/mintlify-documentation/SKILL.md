---
name: mintlify-documentation
description: Implements and configures Mintlify documentation sites following best practices, avoiding common anti-patterns, and applying workarounds for API reference integration, personalization, and customization. Use when setting up new Mintlify sites, troubleshooting blank API pages, configuring OpenAPI integration, implementing personalization features, or applying custom styling workarounds.
version: 1.0.0
dependencies: []
---

# Mintlify Documentation Implementation

## Overview

Mintlify is a managed documentation platform that abstracts infrastructure complexity, enabling rapid deployment and scaling of developer documentation. This skill provides procedural knowledge for configuring Mintlify sites, integrating API references, implementing personalization, and applying customization workarounds while avoiding common configuration failures.

## When to Use

Use this skill when:
- Setting up a new Mintlify documentation site
- Configuring OpenAPI/API reference pages
- Troubleshooting blank API pages or configuration errors
- Implementing personalization or authentication features
- Applying custom styling workarounds
- Setting up CI/CD workflows for documentation

## Prerequisites

- Mintlify account and repository access
- OpenAPI 3.x specification (for API documentation)
- Access to code repository for code-based workflow
- Node.js environment for local development (`mint dev`)

## Execution Steps

### Step 1: Core Configuration (docs.json)

The `docs.json` file is the foundational blueprint for site configuration.

**Required Minimum Configuration**:
```json
{
  "$schema": "https://mintlify.com/docs.json",
  "name": "Your Documentation",
  "theme": "maple",
  "colors": {
    "primary": "#0EA5E9"
  },
  "navigation": []
}
```

**Critical Practices**:
- Always include `$schema` reference for validation and autocomplete
- Select theme strategically: `maple` (modern, clean), `aspen` (complex navigation), `palm` (fintech), `linden` (retro)
- Define navigation structure based on content organization

**Theme Selection Guide**:
- `maple`: Modern, clean aesthetics for AI/SaaS products
- `aspen`: Handles complex navigation schemes and custom components
- `palm`: Fintech-focused branding
- `linden`: Retro aesthetic

### Step 2: API Reference Configuration

Mintlify requires strict OpenAPI 3.x compliance for API documentation.

**OpenAPI Integration Pattern**:
```markdown
---
openapi: path/to/openapi.yaml
api: GET /users/{id}
---
```

**Critical Requirements**:
- **OpenAPI 3.x only**: OpenAPI 2.0 results in blank pages (anti-pattern)
- **Exact path matching**: MDX frontmatter path must match OpenAPI spec character-for-character
- **Uppercase HTTP methods**: GET, POST, PUT, DELETE (not get, post)
- **Trailing slash consistency**: Path in frontmatter must match spec exactly (including trailing slashes)

**Navigation Inclusion Patterns**:
- **Automatic**: Let Mintlify generate all operations from spec
- **Manual**: Explicitly list every operation (disables auto-generation for entire spec)
- **Mixed**: Not supported - choose one strategy

**Visibility Control**:
Use `x-hidden: true` in OpenAPI spec to generate page but hide from navigation:
```yaml
paths:
  /internal/endpoint:
    get:
      x-hidden: true
```

### Step 3: Anti-Pattern Avoidance

**Anti-Pattern 1: OpenAPI 2.0 Usage**
- **Issue**: Results in completely blank API pages
- **Resolution**: Mandatory conversion to OpenAPI 3.x
- **Validation**: Use `mint openapi-check` or Swagger Editor

**Anti-Pattern 2: Path Mismatch**
- **Issue**: Trailing slash differences cause blank pages
- **Example**: Frontmatter has `GET /users/{id}/` but spec has `/users/{id}`
- **Resolution**: Enforce exact character-for-character matching
- **Check**: Verify OpenAPI filename/alias matches exactly

**Anti-Pattern 3: Case Sensitivity Failure**
- **Issue**: Lowercase HTTP methods prevent page generation
- **Example**: Navigation uses `get /users` instead of `GET /users`
- **Resolution**: Strict uppercase enforcement in all configurations

**Anti-Pattern 4: Partial Inclusion Pitfall**
- **Issue**: Manual inclusion of any endpoint disables auto-generation for entire spec
- **Resolution**: Choose fully automatic OR fully manual - no mixing
- **Workaround**: If mixing needed, explicitly list all required endpoints

**Anti-Pattern 5: File/Operation Conflict**
- **Issue**: MDX file exists at same path as OpenAPI operation
- **Resolution**: Use `x-mint` extension to set custom href:
```yaml
paths:
  /users:
    get:
      x-mint:
        href: /custom-users-page
```

**Validation Checklist**:
- [ ] OpenAPI 3.x specification validated
- [ ] Path strings match exactly (including slashes)
- [ ] HTTP methods uppercase in all configs
- [ ] Navigation strategy chosen (auto or manual)
- [ ] File conflicts resolved with x-mint extension

### Step 4: Personalization Setup

Mintlify supports three authentication strategies with different security guarantees.

**Strategy Selection**:
- **Full Authentication**: Complete privacy, all content protected, full customization
- **Partial Authentication**: Page-by-page access control, public/private mix
- **Personalization**: Content customization only, no security (publicly accessible)

**Handshake Methods**:
- **JWT**: Maximum security control, custom login flows
- **Shared Session**: Lowest complexity, existing session-based auth
- **OAuth 2.0**: Third-party provider integration

**API Key Prefilling Configuration**:
User data must include `apiPlaygroundInputs` with exact field name matching:
```json
{
  "apiPlaygroundInputs": {
    "headers": {
      "Authorization": "Bearer token"
    },
    "query": {
      "api_key": "value"
    }
  }
}
```

**Critical Requirement**: Field names in `apiPlaygroundInputs` must exactly match API playground configuration.

**Page Visibility Tiering**:
Add `groups` field to page frontmatter for access control:
```markdown
---
groups: ["admin", "enterprise"]
---
```

### Step 5: Customization Workarounds

Mintlify limits deep UI customization to maintain stability. Customization requires calculated technical debt.

**Tailwind CSS Integration**:
- Supported: Tailwind CSS v3 utility classes (`w-full`, `aspect-video`, `dark:hidden`)
- Not supported: Arbitrary values (use `style` prop instead)
- Apply directly to HTML elements or custom React components

**Custom CSS Files**:
Add CSS files to repository for custom classes applied across MDX files.

**Platform Identifier Targeting** (High-Risk Workaround):
- Use browser inspection to find platform identifiers (e.g., `APIPlaygroundInput`)
- Apply custom CSS against these selectors
- **Warning**: Selectors subject to change - schedule maintenance reviews after platform updates
- Accept maintenance debt as trade-off for customization

**React Component Integration**:
```tsx
import { useMemo, useCallback } from 'react';

export function CustomComponent({ data }) {
  const processed = useMemo(() => {
    // Expensive computation
  }, [data]);
  
  const handler = useCallback(() => {
    // Event handler
  }, []);
  
  return <div>{processed}</div>;
}
```

**Performance Best Practices**:
- Use `useMemo`/`useCallback` for expensive operations
- Implement lazy loading for non-critical components
- Break large components into smaller, focused modules
- Minimize `useEffect` dependencies

### Step 6: CI/CD Integration

**Trunk-Based Documentation Development**:
- Frequent, small commits (at least daily)
- Rapid feedback via automated checks
- Minimize merge conflicts

**Preview Deployment Workflow**:
- Integrate preview deployments into pull request workflow
- Use as quality assurance gate
- Enable stakeholder review before production merge

**Quality Assurance Gates**:
- Technical review
- Legal/compliance review (if applicable)
- Product stakeholder approval

## Transformation Rules

### API Path Resolution
1. MDX frontmatter path must exactly match OpenAPI path (character-for-character)
2. HTTP methods must be uppercase in all configurations
3. Trailing slashes must match between frontmatter and spec

### Navigation Generation
1. Either fully automatic OR fully manual - no mixing
2. Manual inclusion disables auto-generation for entire spec
3. Use `x-hidden: true` to hide from navigation while keeping page accessible

### Personalization Field Matching
1. API playground field names must exactly match user data structure
2. `apiPlaygroundInputs` object structure must match playground configuration
3. Field names are case-sensitive

## Common Patterns

### Pattern 1: OpenAPI Validation Workflow
1. Run `mint dev` locally to reveal configuration issues
2. Validate externally with Swagger Editor for structural validity
3. Two-pronged approach isolates spec issues from platform issues

### Pattern 2: Path Conflict Resolution
When MDX file conflicts with OpenAPI operation:
1. Use `x-mint` extension in OpenAPI spec
2. Set custom `href` to redirect operation
3. Resolves address collision without removing MDX file

### Pattern 3: Performance-Optimized Custom Components
1. Memoize expensive computations with `useMemo`
2. Use `useCallback` for event handlers
3. Lazy load non-critical components
4. Modular structure prevents cascading re-renders

## Anti-Patterns to Avoid

| Anti-Pattern | Issue | Resolution |
|--------------|------|------------|
| OpenAPI 2.0 Usage | Blank API pages | Convert to OpenAPI 3.x |
| Path Mismatch | Blank pages | Enforce exact string matching |
| Case Sensitivity | Pages don't generate | Uppercase HTTP methods |
| Partial Inclusion | Missing operations | Choose auto OR manual |
| Undocumented Selectors | Breaks after updates | Schedule maintenance reviews |

## Workarounds

### Workaround 1: CORS Configuration for API Playground
**When**: Direct browser requests (non-proxied mode)
**Action**: Configure CORS on target API server to allow Mintlify domain

### Workaround 2: Custom UI Element Targeting
**When**: Deep UI customization needed
**Action**: 
1. Use browser inspection to find platform identifiers
2. Apply custom CSS against selectors
3. Accept maintenance debt - schedule reviews after platform updates

### Workaround 3: File/Operation Conflict
**When**: MDX file conflicts with OpenAPI operation path
**Action**: Use `x-mint` extension to redirect operation:
```yaml
x-mint:
  href: /custom-path
```

## Error Handling

**Blank API Pages**:
1. Validate OpenAPI 3.x conversion
2. Check path matching (character-for-character)
3. Verify HTTP method case (uppercase)
4. Confirm OpenAPI filename/alias matches

**API Playground Failures**:
1. Check CORS configuration (if non-proxied)
2. Verify field name matching between playground and user data
3. Confirm `apiPlaygroundInputs` structure matches configuration

**Custom Styling Breaks**:
1. Use browser inspection to verify selector stability
2. Recalibrate custom CSS selectors
3. Accept that workaround introduces maintenance debt

**Navigation Missing Operations**:
1. Check for `x-hidden: true` flags in spec
2. Verify inclusion strategy (auto vs manual)
3. Ensure manual list includes all required endpoints

## Code Templates

### docs.json Base Template
```json
{
  "$schema": "https://mintlify.com/docs.json",
  "name": "Your Documentation",
  "theme": "maple",
  "colors": {
    "primary": "#0EA5E9"
  },
  "navigation": [
    {
      "group": "Getting Started",
      "pages": ["introduction"]
    }
  ]
}
```

### MDX Frontmatter Template
```markdown
---
openapi: path/to/openapi.yaml
api: GET /users/{id}
---
```

### Personalization Config Template
```json
{
  "apiPlaygroundInputs": {
    "headers": {
      "Authorization": "Bearer {{user.apiKey}}"
    },
    "query": {
      "api_key": "{{user.apiKey}}"
    }
  }
}
```

### Custom Component Template
```tsx
import { useMemo, useCallback } from 'react';

export function CustomComponent({ data }) {
  const processed = useMemo(() => {
    // Expensive operation
    return expensiveComputation(data);
  }, [data]);
  
  const handleClick = useCallback(() => {
    // Event handler
  }, []);
  
  return <div className="w-full">{processed}</div>;
}
```

## Real-World Examples

### Example 1: Multi-Product Documentation Setup

**Scenario**: Laravel-style multi-product documentation requiring unified navigation.

**Key Pattern**: Unified navigation structure with product grouping.

**Navigation Structure**:
```json
{
  "navigation": [
    {
      "group": "Laravel Framework",
      "pages": ["introduction", "installation"]
    },
    {
      "group": "Laravel Cashier",
      "pages": ["cashier/introduction"]
    },
    {
      "group": "API Reference",
      "pages": [
        {
          "group": "Framework API",
          "openapi": "openapi/framework.yaml"
        },
        {
          "group": "Cashier API",
          "openapi": "openapi/cashier.yaml"
        }
      ]
    }
  ]
}
```

### Example 2: API Key Prefilling Implementation

**Scenario**: Automatic API key injection into playground for authenticated requests.

**Key Pattern**: Exact field name matching between user data and playground configuration.

**User Data Structure**:
```json
{
  "firstName": "John",
  "apiPlaygroundInputs": {
    "headers": {
      "X-API-Key": "sk_live_1234567890"
    }
  }
}
```

**API Playground Configuration** (in OpenAPI spec):
```yaml
paths:
  /users:
    get:
      parameters:
        - name: X-API-Key
          in: header
          required: true
```

**Result**: `X-API-Key` header automatically prefilled from user data.

## Security and Guidelines

**CRITICAL**: Never hardcode sensitive information:
- ❌ No API keys, passwords, or tokens in code
- ❌ No credentials in SKILL.md or templates
- ✅ Use environment variables for sensitive config
- ✅ Route authentication through secure channels
- ✅ Select authentication strategy based on security requirements

**Operational Constraints**:
- Preview deployments for quality assurance
- Regular maintenance reviews for custom CSS selectors
- Validation workflows before production deployment

## Performance Considerations

- **Custom React Components**: Implement memoization and lazy loading
- **Large Documentation**: Leverage ISR (Incremental Static Regeneration) benefits
- **Preview Deployments**: Use priority build times for faster feedback
- **Component Optimization**: Break large components, minimize dependencies

## Related Resources

For extensive reference materials, see:
- `resources/ANTI_PATTERNS.md`: Detailed anti-pattern reference
- `resources/TROUBLESHOOTING.md`: Extended troubleshooting guide

## Notes

- Mintlify manages infrastructure complexity, enabling focus on content quality
- Platform stability limits deep customization - workarounds require maintenance debt
- OpenAPI stringency is non-negotiable - strict compliance prevents failures
- Personalization transforms static docs into dynamic, self-serve DX
- Governance drives scale - trunk-based development and quality gates essential

