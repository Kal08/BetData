import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import {
  badRequest,
  forbidden,
  getApiSession,
  unauthorized,
} from "@/lib/api-auth";
import { getPrisma } from "@/lib/prisma";
import { endOfDay, startOfDay } from "@/lib/utils";
import { entrySchema } from "@/lib/validations";

/** GET entries with optional filters */
export async function GET(req: NextRequest) {
  const session = await getApiSession();
  if (!session?.user?.id) return unauthorized();

  const prisma = await getPrisma();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const date = searchParams.get("date");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  const where: {
    userId?: string | { in: string[] };
    date?: { gte?: Date; lte?: Date };
  } = {};

  if (session.user.role === Role.USER) {
    where.userId = session.user.id;
  } else if (session.user.role === Role.ADMIN) {
    const myUsers = await prisma.user.findMany({
      where: { createdById: session.user.id, role: Role.USER },
      select: { id: true },
    });
    const ids = myUsers.map((u) => u.id);
    if (userId) {
      if (!ids.includes(userId)) return forbidden();
      where.userId = userId;
    } else {
      where.userId = { in: ids };
    }
  } else if (session.user.role === Role.SUPER_ADMIN) {
    if (userId) where.userId = userId;
  }

  if (date) {
    const d = new Date(date);
    where.date = { gte: startOfDay(d), lte: endOfDay(d) };
  } else if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) where.date.gte = startOfDay(new Date(dateFrom));
    if (dateTo) where.date.lte = endOfDay(new Date(dateTo));
  }

  const entries = await prisma.entry.findMany({
    where,
    include: {
      user: { select: { id: true, username: true } },
    },
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(entries);
}

/** POST new entry (users only) */
export async function POST(req: NextRequest) {
  const session = await getApiSession();
  if (!session?.user?.id) return unauthorized();
  if (session.user.role !== Role.USER) {
    return forbidden("Only users can submit entries");
  }

  const prisma = await getPrisma();
  const body = await req.json();
  const parsed = entrySchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.errors[0]?.message ?? "Invalid data");
  }

  const data = parsed.data;
  const entry = await prisma.entry.create({
    data: {
      userId: session.user.id,
      date: new Date(data.date),
      system: data.system,
      online: data.online,
      number: data.number ?? 0,
      bonus: data.bonus,
      win: data.win,
      cash: data.cash,
      note: data.note || null,
    },
  });

  return NextResponse.json(entry, { status: 201 });
}
