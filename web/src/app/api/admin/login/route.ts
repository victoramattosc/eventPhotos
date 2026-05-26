import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCredentials, setAdminSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { user, password } = await req.json();

  if (!verifyAdminCredentials(user, password)) {
    return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
  }

  await setAdminSession();
  return NextResponse.json({ ok: true });
}
