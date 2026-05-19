/** Edge-safe helpers (no Prisma / NextAuth imports) */

export type AppRole = "SUPER_ADMIN" | "ADMIN" | "USER";

export function dashboardPathForRole(role: string) {
  switch (role) {
    case "SUPER_ADMIN":
      return "/dashboard/super-admin";
    case "ADMIN":
      return "/dashboard/admin";
    case "USER":
      return "/dashboard/user";
    default:
      return "/login";
  }
}
