/**
 * Reusable timing middleware for tRPC procedures.
 * Adds artificial delay in development and logs execution time.
 *
 * @param t - tRPC instance created with initTRPC
 * @returns Timing middleware that can be used with procedures
 */
export function createTimingMiddleware(t: any) {
  return t.middleware(async ({ next, path }: { next: any; path: string }) => {
    const start = Date.now();

    if (t._config.isDev) {
      // artificial delay in dev
      const waitMs = Math.floor(Math.random() * 400) + 100;
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }

    const result = await next();

    const end = Date.now();
    console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

    return result;
  });
}
