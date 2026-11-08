import { PrismaClient } from "@prisma/client";

// Single shared Prisma instance — avoids exhausting the connection pool
// under hot-reload in development or concurrent serverless invocations.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function getPrisma(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  });

  globalForPrisma.prisma = client;
  return client;
}

// Preserve the existing service API while deferring Prisma construction until
// a database-backed request is actually made.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, property: keyof PrismaClient) {
    return Reflect.get(getPrisma(), property);
  },
});
