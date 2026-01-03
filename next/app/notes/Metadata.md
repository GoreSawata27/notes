What is Metadata in Next.js

Metadata controls SEO and browser-level info like:

<title>
<meta description>
Open Graph tags
Twitter cards
Icons, robots, viewport

In App Router, metadata is defined per route using:

```ts
export const metadata = {}
or generateMetadata() for dynamic values
```

Basic Static Metadata
Used when values are known at build time.

```ts
export const metadata = {
  title: "Home",
  description: "Welcome to my app",
};
```

Generates:

<title>Home</title>
<meta name="description" content="Welcome to my app" />

Title Templates and %s

%s replacement
%s is replaced by the child route title.

```ts
export const metadata = {
  title: {
    template: "%s | MyApp",
    default: "MyApp",
  },
};

// Child route
export const metadata = {
  title: "Dashboard",
};
```

Final output

<title>Dashboard | MyApp</title>
If child title is missing => <title>MyApp</title>

Absolute Title

If you want to skip the template, use absolute.

```ts
export const metadata = {
  title: {
    absolute: "Login",
  },
};
```

Result: => <title>Login</title>

Dynamic Metadata with generateMetadata
Used when metadata depends on params or API data.

```ts
export async function generateMetadata({ params }) {
  return {
    title: `User ${params.id}`,
    description: `Profile of user ${params.id}`,
  };
}
```

Folder:

app/users/[id]/page.tsx

URL: /users/10

Open Graph Metadata

Used for link previews on WhatsApp, LinkedIn, etc.

```ts
export const metadata = {
  openGraph: {
    title: "My Blog",
    description: "React and Next.js articles",
    url: "https://example.com",
    siteName: "My Blog",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
};
```

<!-- Twitter Metadata -->

```ts
export const metadata = {
  twitter: {
    card: "summary_large_image",
    title: "My Blog",
    description: "Frontend articles",
    images: ["/og.png"],
  },
};

// Icons and Favicons
export const metadata = {
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

// Robots Metadata
export const metadata = {
  robots: {
    index: true,
    follow: true,
  },
};
```

Metadata Inheritance Rules

Layout metadata applies to all child routes
Page metadata overrides layout
template wraps child titles
absolute ignores templates

When to Use What

Static metadata → normal pages
generateMetadata → dynamic routes, SEO pages
template + %s → consistent app branding
OpenGraph → social sharing
