const MOCK_DELAY_MS = 400;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET(request: Request) {
  await delay(MOCK_DELAY_MS);

  const auth = request.headers.get("authorization");
  if (!auth?.startsWith("Bearer mock-jwt-")) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  return Response.json({
    id: "u-1",
    email: "demo@notes.local",
    name: "Demo User",
  });
}
