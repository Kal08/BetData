import { redirect } from "next/navigation";
import { getSession, dashboardPathForRole } from "@/lib/auth";

export default async function HomePage() {
  const session = await getSession();
  if (session?.user?.role) {
    redirect(dashboardPathForRole(session.user.role));
  }
  redirect("/login");
}
