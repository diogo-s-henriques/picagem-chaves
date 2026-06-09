import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { numero } = await req.json();

  const funcionario = await prisma.funcionario.findUnique({
    where: { numero, ativo: true },
  });

  if (!funcionario) {
    return NextResponse.json({ erro: "Número não reconhecido" }, { status: 404 });
  }

  await prisma.picagem.create({
    data: { funcionarioId: funcionario.id },
  });

  return NextResponse.json({ nome: funcionario.nome });
}