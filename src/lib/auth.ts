import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { dashboardPathForRole as dashboardPath } from "@/lib/dashboard-path";

export { authOptions };
export { dashboardPath as dashboardPathForRole };

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireSession() {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session;
}

export function hasRole(
  role: Role | undefined,
  allowed: Role | Role[]
): boolean {
  if (!role) return false;
  const roles = Array.isArray(allowed) ? allowed : [allowed];
  return roles.includes(role);
}
