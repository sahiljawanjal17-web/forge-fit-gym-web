export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { ensureDatabase } = await import("./server/db/setup");
    await ensureDatabase();
  }
}
