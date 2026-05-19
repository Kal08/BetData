import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(d1?: D1Database) {
  if (d1) {
    return new PrismaClient({ adapter: new PrismaD1(d1) });
  }
  return new PrismaClient();
}

/**
 * Returns Prisma client — uses Cloudflare D1 on Workers, file SQLite locally.
 */
export async function getPrisma(): Promise<PrismaClient> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const { env } = await getCloudflareContext({ async: true });
    const db = (env as { DB?: D1Database }).DB;
    if (db) {
      return createPrismaClient(db);
    }
  } catch {
    // Not on Cloudflare (local next dev / node)
  }

  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}
