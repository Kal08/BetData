import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import {
  badRequest,
  forbidden,
  getApiSession,
  requireApiRole,
  unauthorized,
} from "@/lib/api-auth";
import { getPrisma } from "@/lib/prisma";
import { createUserSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const session = await getApiSession();
  if (!session?.user?.id) return unauthorized();

  const prisma = await getPrisma();
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.toLowerCase();
  const roleFilter = searchParams.get("role") as Role | null;

  let where: {
    role?: Role | { in: Role[] };
    createdById?: string | null;
    username?: { contains: string };
  } = {};

  if (session.user.role === Role.SUPER_ADMIN) {
    const roles = roleFilter
      ? [roleFilter]
      : [Role.ADMIN, Role.USER];
    where.role = { in: roles };
    if (search) {
      where = { ...where, username: { contains: search } };
    }
  } else if (session.user.role === Role.ADMIN) {
    where = {
      role: Role.USER,
      createdById: session.user.id,
    };
    if (search) {
      where.username = { contains: search };
    }
  } else {
    return forbidden();
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      username: true,
      role: true,
      canEditEntries: true,
      createdAt: true,
      createdById: true,
      _count: { select: { entries: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const session = await getApiSession();
  if (!session?.user?.id) return unauthorized();

  const prisma = await getPrisma();
  const body = await req.json();
  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.errors[0]?.message ?? "Invalid data");
  }

  const { username, password, role } = parsed.data;

  if (session.user.role === Role.ADMIN && role !== Role.USER) {
    return forbidden("Admins can only create users");
  }
  if (session.user.role !== Role.SUPER_ADMIN && session.user.role !== Role.ADMIN) {
    return forbidden();
  }
  if (session.user.role === Role.ADMIN && role === Role.ADMIN) {
    return forbidden();
  }
  if (role === Role.ADMIN && session.user.role !== Role.SUPER_ADMIN) {
    return forbidden("Only super admin can create admins");
  }

  const normalizedUsername = username.toLowerCase();
  const exists = await prisma.user.findUnique({
    where: { username: normalizedUsername },
  });
  if (exists) return badRequest("Username already exists");

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: {
      username: normalizedUsername,
      passwordHash,
      role: role as Role,
      createdById:
        session.user.role === Role.SUPER_ADMIN && role === Role.ADMIN
          ? null
          : session.user.id,
      canEditEntries: false,
    },
    select: {
      id: true,
      username: true,
      role: true,
      canEditEntries: true,
      createdAt: true,
    },
  });

  return NextResponse.json(user, { status: 201 });
}
