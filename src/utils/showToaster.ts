export function showError(message: unknown) {
  const text = typeof message === "string" ? message : "Something went wrong";
  if (typeof window !== "undefined") {
    console.error(text, message);
  }
}
