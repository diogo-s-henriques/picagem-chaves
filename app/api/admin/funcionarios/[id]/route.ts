import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function autenticado(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (!autenticado(request)) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  await prisma.funcionario.update({
    where: { id: Number(id) },
    data: { ativo: false },
  });

  return NextResponse.json({ ok: true });
}