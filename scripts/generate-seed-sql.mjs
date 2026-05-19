/**
 * Generates scripts/seed_superadmin.sql for Cloudflare D1 remote seeding.
 * Run: node scripts/generate-seed-sql.mjs
 */
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const username = (process.env.SEED_SUPER_ADMIN_USERNAME ?? "superadmin").toLowerCase();
const password = process.env.SEED_SUPER_ADMIN_PASSWORD ?? "SuperAdmin123!";
const id = "seed_superadmin_001";

const hash = bcrypt.hashSync(password, 12);
const now = new Date().toISOString();

const sql = `-- Super admin seed (run once on D1)
-- Username: ${username}
-- Password: ${password}
INSERT OR IGNORE INTO "User" (
  "id", "username", "passwordHash", "role", "canEditEntries", "createdAt", "updatedAt", "createdById"
) VALUES (
  '${id}',
  '${username}',
  '${hash}',
  'SUPER_ADMIN',
  1,
  '${now}',
  '${now}',
  NULL
);
`;

const out = join(__dirname, "seed_superadmin.sql");
writeFileSync(out, sql);
console.log(`Wrote ${out}`);
