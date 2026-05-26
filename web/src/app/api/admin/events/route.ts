import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const { name, slug, event_date } = await req.json();

  if (!name || !slug) {
    return NextResponse.json({ error: "Nome e slug são obrigatórios." }, { status: 400 });
  }

  const slugClean = slug.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("events")
    .insert({ name, slug: slugClean, event_date: event_date || null })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Já existe um evento com esse slug." }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ event: data });
}

export async function GET() {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ events: data });
}
