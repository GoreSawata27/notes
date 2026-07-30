async function slowFetch(label: string, ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
  return `${label} ready at ${new Date().toISOString()}`;
}

async function FastSection() {
  const text = await slowFetch("Fast section", 300);
  return <p className="text-sm">{text}</p>;
}

async function SlowSection() {
  const text = await slowFetch("Slow section", 2500);
  return <p className="text-sm">{text}</p>;
}

export { FastSection, SlowSection };
