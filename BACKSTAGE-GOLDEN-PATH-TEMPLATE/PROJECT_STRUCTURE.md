# Backstage Golden Path Template - Complete Project Structure

## 📁 Complete Folder Structure

```
backstage-golden-path-template/
│
├── 📄 template.yaml                          # Backstage template definition (UI wizard + actions)
├── 📄 .gitignore                             # Git ignore rules
├── 📄 EXECUTIVE_SUMMARY.md                   # High-level project overview
├── 📄 PHASE1_IMPLEMENTATION_SUMMARY.md       # Implementation details
│
├── 📂 skeleton/                              # Template source code (Nunjucks-templated)
│   ├── 📄 pom.xml                            # Maven POM with conditional dependencies
│   ├── 📄 catalog-info.yaml                  # Backstage component metadata & SDLC integration
│   │
│   └── 📂 src/main/
│       ├── 📂 java/com/hms/servicename/
│       │   │
│       │   ├── 📄 ServicenameApplication.java              # Spring Boot main class
│       │   │
│       │   ├── 📂 config/                                   # Configuration classes
│       │   │   ├── 📄 SecurityConfig.java                   # OAuth2 Resource Server + OIDC Client (BFF)
│       │   │   ├── 📄 ScalekitConfig.java                   # ScaleKit SDK configuration
│       │   │   ├── 📄 HibernateConfig.java                  # Multi-tenancy (schema-per-tenant)
│       │   │   └── 📄 {% if values.includeRedis %}RedisConfig.java{% endif %}  # Redis config (CQRS)
│       │   │
│       │   ├── 📂 tenancy/                                  # Multi-tenancy implementation
│       │   │   ├── 📄 TenantIdentifierResolver.java         # Extracts org_id from JWT
│       │   │   └── 📄 MultiTenantConnectionProvider.java    # Schema switching logic
│       │   │
│       │   ├── 📂 controller/                               # REST controllers
│       │   │   ├── 📄 {% if values.servicePattern == 'saas-backend-for-frontend' %}OidcCallbackController.java{% endif %}
│       │   │   │   # Handles OIDC callback for user login (BFF pattern only)
│       │   │   └── 📄 {% if values.servicePattern == 'saas-backend-for-frontend' %}ScaleKitWebhookController.java{% endif %}
│       │   │       # Public webhook endpoint for ScaleKit events (BFF pattern only)
│       │   │
│       │   ├── 📂 {% if values.includeFlowable %}workflow{% endif %}/  # Flowable workflow (conditional)
│       │   │   └── 📄 LogEventDelegate.java                 # BPMN service task delegate
│       │   │
│       │   ├── 📂 {% if values.includeOutbox %}outbox{% endif %}/  # Transactional Outbox (conditional)
│       │   │   ├── 📄 OutboxEvent.java                       # JPA entity for outbox table
│       │   │   └── 📄 OutboxEventRepository.java             # JPA repository
│       │   │
│       │   └── 📂 {% if values.includeKafkaConsumer %}projector{% endif %}/  # CQRS projector (conditional)
│       │       ├── 📄 CustomerProjectorService.java          # Kafka consumer for read models
│       │       └── 📂 dto/
│       │           └── 📄 CustomerView.java                  # Denormalized read model DTO
│       │
│       └── 📂 resources/
│           ├── 📄 application.properties                    # Spring Boot configuration (templated)
│           │
│           ├── 📂 {% if values.includeFlowable %}processes{% endif %}/  # BPMN workflows (conditional)
│           │   └── 📄 sample-workflow.bpmn20.xml            # Sample workflow triggered by Kafka
│           │
│           └── 📂 {% if values.includeFlowable %}eventregistry{% endif %}/  # Flowable Event Registry (conditional)
│               ├── 📄 inbound.channel                       # Kafka channel definition
│               └── 📄 workflow-trigger.event                # Event type definition
│
└── 📂 backstage/                             # Local Backstage instance (for testing)
    │                                           # Created with: npx @backstage/create-app
    │
    ├── 📄 package.json                        # Root package.json (Yarn workspaces)
    ├── 📄 yarn.lock                           # Yarn lockfile (1.2MB)
    ├── 📄 backstage.json                      # Backstage version metadata (v1.44.0)
    ├── 📄 tsconfig.json                       # TypeScript configuration
    ├── 📄 playwright.config.ts               # E2E test configuration
    │
    ├── 📄 app-config.yaml                     # Main Backstage configuration (116 lines)
    ├── 📄 app-config.local.yaml               # Local overrides (gitignored)
    ├── 📄 app-config.production.yaml          # Production configuration
    ├── 📄 catalog-info.yaml                   # Backstage instance metadata
    │
    ├── 📄 .gitignore                          # Git ignore rules
    ├── 📄 .eslintrc.js                        # ESLint configuration
    ├── 📄 .eslintignore                        # ESLint ignore patterns
    ├── 📄 .prettierignore                     # Prettier ignore patterns
    ├── 📄 .yarnrc.yml                         # Yarn configuration
    ├── 📄 .dockerignore                       # Docker ignore patterns
    │
    ├── 📂 packages/                            # Yarn workspaces
    │   │
    │   ├── 📂 app/                            # Frontend React application
    │   │   ├── 📄 package.json                # Frontend dependencies
    │   │   ├── 📄 .eslintrc.js                # Frontend ESLint config
    │   │   │
    │   │   ├── 📂 src/                        # React source code
    │   │   │   ├── 📄 index.tsx               # React entry point
    │   │   │   ├── 📄 App.tsx                 # Main App component
    │   │   │   ├── 📄 App.test.tsx            # App tests
    │   │   │   ├── 📄 apis.ts                 # API client setup
    │   │   │   ├── 📄 setupTests.ts           # Test setup
    │   │   │   │
    │   │   │   └── 📂 components/
    │   │   │       ├── 📂 Root/               # Root layout components
    │   │   │       │   ├── 📄 Root.tsx
    │   │   │       │   ├── 📄 LogoFull.tsx
    │   │   │       │   ├── 📄 LogoIcon.tsx
    │   │   │       │   └── 📄 index.ts
    │   │   │       ├── 📂 catalog/
    │   │   │       │   └── 📄 EntityPage.tsx  # Entity detail page
    │   │   │       └── 📂 search/
    │   │   │           └── 📄 SearchPage.tsx  # Search page
    │   │   │
    │   │   ├── 📂 public/                     # Static assets
    │   │   │   ├── 📄 index.html
    │   │   │   ├── 📄 manifest.json
    │   │   │   ├── 📄 robots.txt
    │   │   │   ├── 📄 favicon.ico
    │   │   │   ├── 📄 favicon-16x16.png
    │   │   │   ├── 📄 favicon-32x32.png
    │   │   │   ├── 📄 apple-touch-icon.png
    │   │   │   ├── 📄 android-chrome-192x192.png
    │   │   │   └── 📄 safari-pinned-tab.svg
    │   │   │
    │   │   └── 📂 e2e-tests/                  # End-to-end tests
    │   │       └── 📄 app.test.ts
    │   │
    │   ├── 📂 backend/                        # Backend Node.js server
    │   │   ├── 📄 package.json                # Backend dependencies
    │   │   ├── 📄 README.md                   # Backend documentation
    │   │   ├── 📄 Dockerfile                  # Docker build file
    │   │   ├── 📄 .eslintrc.js                # Backend ESLint config
    │   │   │
    │   │   └── 📂 src/
    │   │       └── 📄 index.ts                # Backend entry point
    │   │
    │   └── 📄 README.md                         # Packages documentation
    │
    ├── 📂 examples/                           # Example files
    │   ├── 📄 entities.yaml                  # Sample catalog entities
    │   ├── 📄 org.yaml                        # Sample organization data
    │   │
    │   └── 📂 template/                       # Example template
    │       ├── 📄 template.yaml               # Example template definition
    │       └── 📂 content/
    │           ├── 📄 catalog-info.yaml       # Example catalog-info
    │           ├── 📄 index.js                # Example content file
    │           └── 📄 package.json            # Example package.json
    │
    ├── 📂 plugins/                            # Custom plugins directory
    │   └── 📄 README.md                       # Plugins documentation
    │
    ├── 📂 node_modules/                       # Root node_modules (Yarn workspace)
    └── 📂 .yarn/                              # Yarn cache and releases
        └── 📂 releases/
            └── 📄 yarn-4.4.1.cjs              # Yarn binary
```

---

## 🎯 Key Components Explained

### 1. **Template Definition** (`template.yaml`)
- **Purpose**: Defines the Backstage UI wizard and scaffolding actions
- **Features**:
  - 4-step wizard (Service Details → Pattern Selection → Pattern Config → Repository)
  - Conditional field visibility based on selected pattern
  - Actions: `fetch:template`, `publish:github`, `catalog:register`

### 2. **Skeleton Directory** (`skeleton/`)
- **Purpose**: Source code template with Nunjucks conditionals
- **Pattern**: "Composable-Monolithic Hybrid"
  - Single skeleton with all patterns
  - Files/directories conditionally included via Nunjucks `{% if %}`
  - Dependencies conditionally added in `pom.xml`

### 3. **Backstage Instance** (`backstage/`)
- **Purpose**: Local Backstage instance for testing the template
- **Created with**: `npx @backstage/create-app`
- **Structure**: Standard Backstage monorepo
  - **Frontend** (`packages/app`): React application with Material-UI
  - **Backend** (`packages/backend`): Node.js server with plugins
  - **Examples**: Sample templates and catalog entities
  - **Plugins**: Directory for custom plugins (currently empty)

### 4. **Supported Patterns**

#### 🏗️ **B2B Backend-for-Frontend (BFF)**
- **Files**: `OidcCallbackController.java`, `ScaleKitWebhookController.java`
- **Config**: OAuth2 Client + Resource Server in `SecurityConfig.java`
- **Dependencies**: `spring-boot-starter-oauth2-client`, `scalekit-java-sdk`

#### 🔄 **Event-Driven Workflow (Flowable)**
- **Files**: `workflow/LogEventDelegate.java`, `processes/*.bpmn20.xml`, `eventregistry/*`
- **Dependencies**: `flowable-spring-boot-starter`, `spring-kafka`

#### 📦 **Transactional Outbox Producer (Debezium)**
- **Files**: `outbox/OutboxEvent.java`, `outbox/OutboxEventRepository.java`
- **Purpose**: Atomic database + Kafka event publishing

#### 📊 **CQRS Read-Side Projector**
- **Files**: `projector/CustomerProjectorService.java`, `projector/dto/CustomerView.java`
- **Dependencies**: `spring-kafka`, `spring-boot-starter-data-redis`
- **Config**: `RedisConfig.java`

### 5. **Core Infrastructure** (Always Included)
- **Multi-Tenancy**: `TenantIdentifierResolver.java`, `MultiTenantConnectionProvider.java`, `HibernateConfig.java`
- **Security**: `SecurityConfig.java` (Resource Server always on, OIDC Client for BFF only)
- **ScaleKit Integration**: `ScalekitConfig.java` (always included)

### 6. **SDLC Integration** (`skeleton/catalog-info.yaml`)
- **Annotations**: GitHub, SonarQube, ArgoCD, Kubernetes, PagerDuty, Grafana
- **Dependencies**: ScaleKit API, Postgres, conditional Kafka/Redis resources
- **Purpose**: Automatic "Single Pane of Glass" integration

---

## 🔧 Conditional File Naming

Files and directories use Nunjucks conditionals in their names:
- `{% if values.servicePattern == 'saas-backend-for-frontend' %}OidcCallbackController.java{% endif %}`
- `{% if values.includeFlowable %}workflow{% endif %}/`
- `{% if values.includeRedis %}RedisConfig.java{% endif %}`

**Result**: When template is executed, only files matching the selected pattern are created.

---

## 📊 Template Execution Flow

1. **User selects pattern** in Backstage UI (`template.yaml` wizard)
2. **Backstage processes skeleton/** with Nunjucks
3. **Conditional files** are included/excluded based on `values.*`
4. **Repository created** with pattern-specific code
5. **Component registered** in Backstage catalog (`catalog-info.yaml`)

---

## 🎨 Architecture Pattern

**"Composable-Monolithic Hybrid"**
- ✅ Single `template.yaml` (composable UI)
- ✅ Single `skeleton/` directory (monolithic source)
- ✅ Nunjucks conditionals for file inclusion
- ✅ Pattern-specific dependencies in `pom.xml`
- ✅ Pattern-specific configuration in `application.properties`

---

## 📈 Next Steps (Validation Plan)

1. **Test Run 1**: Scaffold `hms-auth-bff` (BFF pattern)
2. **Test Run 2**: Scaffold `hms-onboarding-workflow` (Flowable pattern)
3. **Test Run 3**: Scaffold `hms-payment-service` (Outbox pattern)
4. **Test Run 4**: Scaffold `hms-dashboard-projector` (CQRS pattern)

**Validation**: Day 1 (compile/run) + Day 2 (SDLC integration checks)

---

## 📝 Backstage Instance Details

### Configuration Files
- **`app-config.yaml`**: Main configuration (116 lines)
  - Catalog locations
  - Scaffolder configuration (with `unsafe: true` for local dev)
  - Backend plugins configuration
- **`app-config.local.yaml`**: Local overrides (gitignored)
- **`app-config.production.yaml`**: Production settings

### Frontend (`packages/app`)
- **Framework**: React 18 with Material-UI 4
- **Plugins**: Catalog, Scaffolder, Search, TechDocs, Kubernetes, Notifications
- **Entry**: `src/index.tsx` → `App.tsx`
- **Components**: Root layout, Entity pages, Search pages

### Backend (`packages/backend`)
- **Runtime**: Node.js 20
- **Plugins**: 
  - Catalog Backend
  - Scaffolder Backend (with GitHub integration)
  - Auth Backend (GitHub + Guest providers)
  - Search Backend (PostgreSQL)
  - TechDocs Backend
  - Kubernetes Backend
- **Entry**: `src/index.ts`

### Examples
- **`entities.yaml`**: Sample catalog entities
- **`org.yaml`**: Sample organization structure
- **`template/`**: Example Backstage template (reference)

---

*Generated: 2024*
*Project: Backstage Golden Path Template for Spring Boot 3.2.x SaaS Architecture*

