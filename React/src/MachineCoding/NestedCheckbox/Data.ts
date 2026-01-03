export const categories = [
  {
    id: "frontend",
    label: "Frontend",
    children: [
      {
        id: "react",
        label: "React",
        children: [
          { id: "hooks", label: "Hooks" },
          { id: "jsx", label: "JSX" },
        ],
      },
      {
        id: "vue",
        label: "Vue",
        children: [
          { id: "composition-api", label: "Composition API" },
          { id: "options-api", label: "Options API" },
        ],
      },
    ],
  },
  {
    id: "backend",
    label: "Backend",
    children: [
      { id: "node", label: "Node.js" },
      { id: "express", label: "Express.js" },
    ],
  },
];
