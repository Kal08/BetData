import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import {
  badRequest,
  forbidden,
  getApiSession,
  requireApiRole,
  unauthorized,
} from "@/lib/api-auth";
import { getPrisma } from "@/lib/prisma";
import { entrySchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getApiSession();
  if (!session?.user?.id) return unauthorized();

  const prisma = await getPrisma();
  const { id } = await params;
  const entry = await prisma.entry.findUnique({
    where: { id },
    include: { user: { select: { id: true, username: true, createdById: true } } },
  });
  if (!entry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (session.user.role === Role.USER && entry.userId !== session.user.id) {
    return forbidden();
  }
  if (
    session.user.role === Role.ADMIN &&
    entry.user.createdById !== session.user.id
  ) {
    return forbidden();
  }

  return NextResponse.json(entry);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getApiSession();
  if (!session?.user?.id) return unauthorized();

  const prisma = await getPrisma();
  const { id } = await params;
  const entry = await prisma.entry.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!entry) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (session.user.role === Role.USER) {
    if (entry.userId !== session.user.id) return forbidden();
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    if (!user?.canEditEntries) {
      return forbidden("Editing is disabled by your admin");
    }
  } else if (session.user.role === Role.ADMIN) {
    if (entry.user.createdById !== session.user.id) return forbidden();
  } else if (session.user.role !== Role.SUPER_ADMIN) {
    return forbidden();
  }

  const body = await req.json();
  const parsed = entrySchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.errors[0]?.message ?? "Invalid data");
  }

  const data = parsed.data;
  const updated = await prisma.entry.update({
    where: { id },
    data: {
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

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const check = await requireApiRole(Role.SUPER_ADMIN);
  if ("error" in check) return check.error;

  const prisma = await getPrisma();
  const { id } = await params;
  await prisma.entry.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
