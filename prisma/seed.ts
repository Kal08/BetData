import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const username = (
    process.env.SEED_SUPER_ADMIN_USERNAME ?? "superadmin"
  ).toLowerCase();
  const password = process.env.SEED_SUPER_ADMIN_PASSWORD ?? "SuperAdmin123!";

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    console.log(`Super admin "${username}" already exists. Skipping seed.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: {
      username,
      passwordHash,
      role: Role.SUPER_ADMIN,
      canEditEntries: true,
    },
  });

  console.log("Seed complete.");
  console.log(`Super Admin username: ${username}`);
  console.log(`Super Admin password: ${password}`);
  console.log("Change the password after first login in production.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
