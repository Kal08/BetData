import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { forbidden, getApiSession, unauthorized } from "@/lib/api-auth";
import { getPrisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(_req: NextRequest, { params }: Params) {
  const session = await getApiSession();
  if (!session?.user?.id) return unauthorized();
  if (session.user.role !== Role.SUPER_ADMIN) return forbidden();

  const prisma = await getPrisma();
  const { id } = await params;
  const message = await prisma.message.update({
    where: { id },
    data: { read: true },
  });

  return NextResponse.json(message);
}
