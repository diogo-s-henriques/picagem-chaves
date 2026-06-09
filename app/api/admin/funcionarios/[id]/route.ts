import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function autenticado(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } 
) {
  if (!autenticado(req)) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  
  const { id } = await params;  // 👈 await aqui
  
  await prisma.funcionario.update({
    where: { id: Number(id) },
    data: { ativo: false },
  });
  return NextResponse.json({ ok: true });
}