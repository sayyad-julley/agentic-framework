# Linear Demo

A real-world demonstration of Linear API integration using Next.js 16, TypeScript, and Ant Design.

## Features

- **Issues Management**: View, filter, and browse issues with team filtering
- **Projects Tracking**: Monitor project progress with visual indicators
- **Cycles Management**: Track time-boxed work periods
- **Server-Side Authentication**: Secure API key handling (never exposed to client)
- **Error Handling**: Comprehensive error handling with typed Linear error classes
- **Pagination Support**: Automatic pagination for large datasets
- **Type Safety**: Full TypeScript implementation

## Setup

### Prerequisites

- Node.js 18+ and npm
- A Linear account with API access
- A Linear API key

### Installation

1. **Get your Linear API key**:
   - Go to [Linear Settings > API](https://linear.app/settings/api)
   - Create a new API key
   - Copy the key (starts with `lin_api_`)

2. **Create environment file**:
   ```bash
   cp .env.example .env.local
   ```

3. **Add your API key**:
   ```env
   LINEAR_API_KEY=lin_api_xxxxxxxxxxxxx
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. **Open your browser**:
   Navigate to [http://localhost:4004](http://localhost:4004)

## Project Structure

```
linear-demo/
├── app/
│   ├── api/
│   │   └── linear/          # Server-side API routes
│   │       ├── issues/
│   │       ├── projects/
│   │       ├── cycles/
│   │       └── teams/
│   ├── components/          # React components
│   │   ├── issue-card.tsx
│   │   ├── issues-list.tsx
│   │   ├── projects-list.tsx
│   │   └── cycles-list.tsx
│   ├── types.ts             # TypeScript type definitions
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Main page
│   └── globals.css          # Global styles
├── lib/
│   └── linear.ts            # Linear client utilities
└── package.json
```

## Best Practices Applied

### Security
- ✅ API key stored server-side only (never exposed to client)
- ✅ Server-side API routes for all Linear operations
- ✅ Environment variable for API key (never hardcoded)

### Error Handling
- ✅ Typed error classes (AuthenticationLinearError, RatelimitedLinearError, etc.)
- ✅ Proper HTTP status codes
- ✅ User-friendly error messages

### Performance
- ✅ Pagination support for large datasets
- ✅ Efficient data fetching with proper async/await
- ✅ Loading states for better UX

### Type Safety
- ✅ Full TypeScript implementation
- ✅ Type definitions for all Linear entities
- ✅ Type-safe API responses

## API Routes

### GET /api/linear/issues
Fetch issues with optional filtering.

**Query Parameters:**
- `teamId` (optional): Filter by team ID
- `assigneeId` (optional): Filter by assignee ID
- `stateId` (optional): Filter by state ID
- `first` (optional): Number of issues to fetch (default: 50)

### GET /api/linear/projects
Fetch all projects.

### GET /api/linear/cycles
Fetch cycles with optional team filtering.

**Query Parameters:**
- `teamId` (optional): Filter by team ID

### GET /api/linear/teams
Fetch all teams.

## Technologies Used

- **Next.js 16**: React framework with App Router
- **TypeScript**: Type-safe development
- **Ant Design**: UI component library
- **Tailwind CSS**: Utility-first CSS framework
- **@linear/sdk**: Official Linear TypeScript SDK

## License

MIT

