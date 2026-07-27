# Interview Notes

Each exercise’s UI lives in `src/app/practice/<slug>/_components/` next to its `page.tsx`.

Single [Next.js](https://nextjs.org) app for machine-coding practice and Next.js concepts (SSR, ISR, metadata).

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

### Home

- `/` — links to practice, learn demos, and note locations

### Practice (machine coding)

Each exercise has its own URL and sidebar nav under `/practice`:

| Path | Exercise |
|------|----------|
| `/practice/nested-checkbox` | Nested checkbox |
| `/practice/carousel` | Carousel |
| `/practice/tab` | Tabs |
| `/practice/dropdown` | Dropdown / overlay close |
| `/practice/accordion` | Accordion |
| `/practice/search-bar` | Search bar |
| `/practice/star-rating` | Star rating |
| `/practice/phone-book` | Phone book |
| `/practice/todo-list` | Todo list |
| `/practice/input-edit` | Input edit |
| `/practice/nested-comments` | Nested comments |
| `/practice/form` | Dynamic form |
| `/practice/reducer` | useReducer todo |
| `/practice/traffic` | Traffic light |
| `/practice/show-toast` | Toast notifications |
| `/practice/multi-select` | Multi select dropdown |
| `/practice/table-search` | Table with search/filter |
| `/practice/timer` | Stopwatch + countdown |

### Learn (Next.js)

| Path | Topic |
|------|--------|
| `/learn/rendering` | Static rendering (SSG) |
| `/learn/ssr-demo` | Dynamic rendering (SSR) |
| `/learn/isr-demo` | ISR (`revalidate: 60`) |
| `/learn/metadata-demo` | Metadata API |

### Markdown notes (repo)

- `content/notes/next/` — rendering paradigms, metadata, App Router routes
- `content/javascript/` — JS concept snippets (run with Node as needed)
- `content/axios-interceptors/` — reference snippets for React vs Next

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint |

## Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
