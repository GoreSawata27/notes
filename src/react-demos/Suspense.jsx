// Suspense

// Suspense is designed for components that can “pause rendering” while something async happens.

// Good use cases

// Code splitting / lazy loading

const AgentCards = React.lazy(() => import("./AgentCards"));

// Data fetching via frameworks that support it

// Next.js Server Components
// use() in React 18+
// Libraries like React Query (experimental suspense mode)

// Not ideal for

// Manual useEffect + useState fetching
// Contexts that expose status, data, error
// Client components that already manage loading state
