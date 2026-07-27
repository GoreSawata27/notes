// 👤 Basic user type
interface User {
  readonly id: number; // Immutable ID
  name: string;
  email?: string; // Optional email
  role: "admin" | "user" | "editor"; // Union literal
  isActive: boolean;
  tags: string[]; // Array of strings
  location: [number, number]; // Tuple: [lat, long]
  profile?: Profile; // Nested object
  permissions: Permission[]; // Array of objects
  settings: Record<string, boolean>; // Dynamic keys (Record)
  getDisplayName: () => string; // Function returning string
}

// 📦 Profile nested object
interface Profile {
  avatarUrl?: string;
  bio?: string;
  address?: Address; // Nested object with optional chaining
}

// 🏠 Address structure
interface Address {
  street: string;
  city: string;
  zip: string;
}

// 🔐 Permission object with union inside array
interface Permission {
  module: string;
  access: ("read" | "write" | "none")[]; // Union inside array
}

// 🔁 Generic API Response type
interface ApiResponse<T> {
  status: number;
  data: T;
  error?: string;
}

// 💬 Discriminated Union for Notifications
type Notification =
  | { type: "success"; message: string }
  | { type: "error"; errorCode: number }
  | { type: "info"; hint?: string };

// 🧱 Mapped type: Form field errors
type FormErrors<T> = {
  [K in keyof T]?: string;
};

// Usage of mapped type
type UserFormErrors = FormErrors<User>;

// Example instance
const user: User = {
  id: 1,
  name: "Gore",
  role: "admin",
  isActive: true,
  tags: ["frontend", "typescript"],
  location: [18.52, 73.85],
  permissions: [
    { module: "dashboard", access: ["read", "write"] },
    { module: "settings", access: ["none"] },
  ],
  settings: {
    darkMode: true,
    emailNotifications: false,
  },
  getDisplayName: () => "Gore",
};
