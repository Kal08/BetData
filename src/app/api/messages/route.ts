import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import {
  badRequest,
  forbidden,
  getApiSession,
  unauthorized,
} from "@/lib/api-auth";
import { getPrisma } from "@/lib/prisma";
import { messageSchema } from "@/lib/validations";

export async function GET() {
  const session = await getApiSession();
  if (!session?.user?.id) return unauthorized();

  const prisma = await getPrisma();
  if (session.user.role === Role.SUPER_ADMIN) {
    const messages = await prisma.message.findMany({
      include: {
        admin: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    const unreadCount = await prisma.message.count({ where: { read: false } });
    return NextResponse.json({ messages, unreadCount });
  }

  if (session.user.role === Role.ADMIN) {
    const messages = await prisma.message.findMany({
      where: { adminId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ messages, unreadCount: 0 });
  }

  return forbidden();
}

export async function POST(req: NextRequest) {
  const session = await getApiSession();
  if (!session?.user?.id) return unauthorized();
  if (session.user.role !== Role.ADMIN) {
    return forbidden("Only admins can send messages to super admin");
  }

  const prisma = await getPrisma();
  const body = await req.json();
  const parsed = messageSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.errors[0]?.message ?? "Invalid message");
  }

  const message = await prisma.message.create({
    data: {
      content: parsed.data.content.trim(),
      adminId: session.user.id,
    },
    include: {
      admin: { select: { username: true } },
    },
  });

  return NextResponse.json(message, { status: 201 });
}
