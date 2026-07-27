export const PRACTICE_ROUTES = [
  { slug: "nested-checkbox", label: "Nested Checkbox" },
  { slug: "carousel", label: "Carousel" },
  { slug: "tab", label: "Tab" },
  { slug: "dropdown", label: "Dropdown" },
  { slug: "accordion", label: "Accordion" },
  { slug: "search-bar", label: "Search Bar" },
  { slug: "star-rating", label: "Star Rating" },
  { slug: "phone-book", label: "Phone Book" },
  { slug: "todo-list", label: "Todo List" },
  { slug: "input-edit", label: "Input Edit" },
  { slug: "nested-comments", label: "Nested Comments" },
  { slug: "form", label: "Form" },
  { slug: "reducer", label: "Reducer" },
  { slug: "traffic", label: "Traffic" },
  { slug: "show-toast", label: "Show Toast" },
  { slug: "multi-select", label: "Multi Select" },
  { slug: "table-search", label: "Table Search" },
  { slug: "timer", label: "Timer" },
] as const;

export type PracticeSlug = (typeof PRACTICE_ROUTES)[number]["slug"];
