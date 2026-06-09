import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function autenticado(req: NextRequest) {
  return req.headers.get("x-admin-password") === process.env.ADMIN_PASSWORD;
}

export async function GET(req: NextRequest) {
  if (!autenticado(req)) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  const lista = await prisma.funcionario.findMany({ orderBy: { numero: "asc" } });
  return NextResponse.json(lista);
}

export async function POST(req: NextRequest) {
  if (!autenticado(req)) return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  const { numero, nome } = await req.json();
  const f = await prisma.funcionario.create({ data: { numero, nome } });
  return NextResponse.json(f);
}