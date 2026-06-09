import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function autenticado(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!autenticado(req)) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  const picagens = await prisma.picagem.findMany({
    include: { funcionario: { select: { numero: true, nome: true } } },
    orderBy: { timestamp: "desc" },
    take: 200,
  });
  return NextResponse.json(picagens);
}