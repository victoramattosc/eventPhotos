import { NextRequest, NextResponse } from "next/server";
import { setEventSession } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const { token } = await req.json();

  if (!token) {
    return NextResponse.json({ error: "Token ausente." }, { status: 400 });
  }

  const supabase = createServiceClient();
  const { data: event, error } = await supabase
    .from("events")
    .select("id, slug, name, event_date")
    .eq("access_token", token)
    .single();

  if (error || !event) {
    return NextResponse.json({ error: "QR Code inválido ou expirado." }, { status: 401 });
  }

  await setEventSession(event.slug, token);
  return NextResponse.json({ ok: true, slug: event.slug, event });
}
