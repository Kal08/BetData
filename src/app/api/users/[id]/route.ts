import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import {
  badRequest,
  forbidden,
  getApiSession,
  unauthorized,
} from "@/lib/api-auth";
import { getPrisma } from "@/lib/prisma";
import { patchUserSchema } from "@/lib/validations";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getApiSession();
  if (!session?.user?.id) return unauthorized();

  const prisma = await getPrisma();
  const { id } = await params;
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const parsed = patchUserSchema.safeParse(await req.json());
  if (!parsed.success) {
    return badRequest(parsed.error.errors[0]?.message ?? "Invalid data");
  }
  const body = parsed.data;

  if (body.canEditEntries !== undefined) {
    if (session.user.role === Role.ADMIN) {
      if (target.createdById !== session.user.id || target.role !== Role.USER) {
        return forbidden();
      }
    } else if (session.user.role !== Role.SUPER_ADMIN) {
      return forbidden();
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { canEditEntries: body.canEditEntries },
      select: {
        id: true,
        username: true,
        canEditEntries: true,
      },
    });
    return NextResponse.json(updated);
  }

  if (body.password) {
    const canReset =
      session.user.role === Role.SUPER_ADMIN ||
      (session.user.role === Role.ADMIN &&
        target.createdById === session.user.id);
    if (!canReset) return forbidden();

    const passwordHash = await bcrypt.hash(body.password, 12);
    await prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
    return NextResponse.json({ success: true });
  }

  return badRequest("No valid fields to update");
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getApiSession();
  if (!session?.user?.id) return unauthorized();

  const prisma = await getPrisma();
  const { id } = await params;
  if (id === session.user.id) {
    return badRequest("Cannot delete your own account");
  }

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (session.user.role === Role.SUPER_ADMIN) {
    if (target.role === Role.SUPER_ADMIN) {
      return forbidden("Cannot delete super admin");
    }
  } else if (session.user.role === Role.ADMIN) {
    if (target.createdById !== session.user.id || target.role !== Role.USER) {
      return forbidden();
    }
  } else {
    return forbidden();
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
