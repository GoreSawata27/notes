export type LearnConcept = {
  slug: string;
  href: string;
  title: string;
  seo: string;
  speed: string;
  freshness: string;
  implemented: boolean;
};

export const LEARN_CONCEPTS: LearnConcept[] = [
  {
    slug: "csr",
    href: "/learn/csr-demo",
    title: "CSR",
    seo: "Poor",
    speed: "Slow first load",
    freshness: "Always fresh",
    implemented: true,
  },
  {
    slug: "ssr",
    href: "/learn/ssr-demo",
    title: "SSR",
    seo: "Excellent",
    speed: "Medium",
    freshness: "Always fresh",
    implemented: true,
  },
  {
    slug: "ssg",
    href: "/learn/rendering",
    title: "SSG",
    seo: "Excellent",
    speed: "Fastest",
    freshness: "Stale until rebuild",
    implemented: true,
  },
  {
    slug: "isr",
    href: "/learn/isr-demo",
    title: "ISR",
    seo: "Excellent",
    speed: "Very fast",
    freshness: "Fresh after revalidation",
    implemented: true,
  },
  {
    slug: "ppr",
    href: "/learn/ppr-demo",
    title: "PPR",
    seo: "Excellent",
    speed: "Very fast",
    freshness: "Static + dynamic mix",
    implemented: true,
  },
  {
    slug: "streaming",
    href: "/learn/streaming-demo",
    title: "Streaming",
    seo: "Excellent",
    speed: "Better perceived speed",
    freshness: "Depends on data source",
    implemented: true,
  },
];

export const LEARN_EXTRA = [
  {
    href: "/learn/metadata-demo",
    title: "Metadata API",
    description: "SEO tags, Open Graph, title templates",
  },
  {
    href: "/learn/redux",
    title: "Redux & RTK",
    description: "Six examples: counter → login flow → RTK Query",
  },
] as const;
