import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { forbidden, getApiSession, unauthorized } from "@/lib/api-auth";
import { getPrisma } from "@/lib/prisma";
import { endOfDay, startOfDay } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await getApiSession();
  if (!session?.user?.id) return unauthorized();

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");

  const entryWhere: {
    userId?: string | { in: string[] };
    date?: { gte?: Date; lte?: Date };
  } = {};

  const prisma = await getPrisma();

  if (session.user.role === Role.USER) {
    entryWhere.userId = session.user.id;
  } else if (session.user.role === Role.ADMIN) {
    const myUsers = await prisma.user.findMany({
      where: { createdById: session.user.id, role: Role.USER },
      select: { id: true },
    });
    const ids = myUsers.map((u) => u.id);
    entryWhere.userId = userId && ids.includes(userId) ? userId : { in: ids };
  } else if (session.user.role === Role.SUPER_ADMIN) {
    if (userId) entryWhere.userId = userId;
  } else {
    return forbidden();
  }

  if (dateFrom || dateTo) {
    entryWhere.date = {};
    if (dateFrom) entryWhere.date.gte = startOfDay(new Date(dateFrom));
    if (dateTo) entryWhere.date.lte = endOfDay(new Date(dateTo));
  }

  const [aggregate, entryCount, userCount, unreadMessages] = await Promise.all([
    prisma.entry.aggregate({
      where: entryWhere,
      _sum: {
        system: true,
        online: true,
        number: true,
        bonus: true,
        win: true,
        cash: true,
      },
    }),
    prisma.entry.count({ where: entryWhere }),
    session.user.role === Role.SUPER_ADMIN
      ? prisma.user.count({ where: { role: { in: [Role.ADMIN, Role.USER] } } })
      : session.user.role === Role.ADMIN
        ? prisma.user.count({
            where: { createdById: session.user.id, role: Role.USER },
          })
        : Promise.resolve(1),
    session.user.role === Role.SUPER_ADMIN
      ? prisma.message.count({ where: { read: false } })
      : Promise.resolve(0),
  ]);

  return NextResponse.json({
    entryCount,
    userCount,
    unreadMessages,
    totals: {
      system: aggregate._sum.system ?? 0,
      online: aggregate._sum.online ?? 0,
      number: aggregate._sum.number ?? 0,
      bonus: aggregate._sum.bonus ?? 0,
      win: aggregate._sum.win ?? 0,
      cash: aggregate._sum.cash ?? 0,
    },
  });
}
