| Type               | Folder                   | Matches        |
| ------------------ | ------------------------ | -------------- |
| Route              | `app/blog/page.tsx`      | `/blog`        |
| Nested             | `app/blog/post/page.tsx` | `/blog/post`   |
| Dynamic            | `[id]`                   | `/blog/1`      |
| Nested Dynamic     | `[user]/[post]`          | `/john/10`     |
| Catch-All          | `[...slug]`              | `/a/b/c`       |
| Optional Catch-All | `[[...slug]]`            | `/` and `/a/b` |
