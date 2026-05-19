import { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth-options";
import { hasRole } from "@/lib/auth";

export async function getApiSession() {
  return getServerSession(authOptions);
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbidden(message = "Forbidden") {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function requireApiRole(allowed: Role | Role[]) {
  const session = await getApiSession();
  if (!session?.user?.id) return { error: unauthorized() } as const;
  if (!hasRole(session.user.role, allowed)) {
    return { error: forbidden() } as const;
  }
  return { session } as const;
}
