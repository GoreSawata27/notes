const DEMO_EMAIL = "demo@notes.local";
const DEMO_PASSWORD = "password123";
const MOCK_DELAY_MS = 800;

export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

export type LoginSuccess = {
  token: string;
  user: AuthUser;
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
  await delay(MOCK_DELAY_MS);

  let body: { email?: string; password?: string };
  try {
    body = (await request.json()) as { email?: string; password?: string };
  } catch {
    return Response.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const email = body.email?.trim() ?? "";
  const password = body.password ?? "";

  if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
    const payload: LoginSuccess = {
      token: "mock-jwt-" + crypto.randomUUID(),
      user: { id: "u-1", email: DEMO_EMAIL, name: "Demo User" },
    };
    return Response.json(payload);
  }

  return Response.json({ message: "Invalid email or password" }, { status: 401 });
}

export const MOCK_AUTH_HINT = { email: DEMO_EMAIL, password: DEMO_PASSWORD };
