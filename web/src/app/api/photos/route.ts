import { NextRequest, NextResponse } from "next/server";
import { getEventSession } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const session = await getEventSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("photo") as File | null;

  if (!file) {
    return NextResponse.json({ error: "Foto ausente." }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Resolve event id from slug
  const { data: event, error: evErr } = await supabase
    .from("events")
    .select("id")
    .eq("slug", session.eventSlug)
    .single();

  if (evErr || !event) {
    return NextResponse.json({ error: "Evento não encontrado." }, { status: 404 });
  }

  const ext = file.type === "image/png" ? "png" : "jpg";
  const path = `${session.eventSlug}/${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadError } = await supabase.storage
    .from("Photos")
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: photo, error: dbError } = await supabase
    .from("photos")
    .insert({
      event_id: event.id,
      storage_path: path,
      author_session: session.token.slice(0, 8),
    })
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage.from("Photos").getPublicUrl(path);
  return NextResponse.json({ photo: { ...photo, url: urlData.publicUrl } });
}

export async function GET(req: NextRequest) {
  const session = await getEventSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data: event } = await supabase
    .from("events")
    .select("id")
    .eq("slug", session.eventSlug)
    .single();

  if (!event) return NextResponse.json({ photos: [] });

  const { data: photos } = await supabase
    .from("photos")
    .select("*")
    .eq("event_id", event.id)
    .order("created_at", { ascending: false });

  const withUrls = (photos || []).map((p: { storage_path: string; [key: string]: unknown }) => {
    const { data } = supabase.storage.from("Photos").getPublicUrl(p.storage_path);
    return { ...p, url: data.publicUrl };
  });

  return NextResponse.json({ photos: withUrls });
}

export async function DELETE(req: NextRequest) {
  const session = await getEventSession();
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { photoId } = await req.json();
  const supabase = createServiceClient();

  const { data: photo } = await supabase
    .from("photos")
    .select("storage_path, event_id")
    .eq("id", photoId)
    .single();

  if (!photo) return NextResponse.json({ error: "Foto não encontrada." }, { status: 404 });

  await supabase.storage.from("Photos").remove([photo.storage_path]);
  await supabase.from("photos").delete().eq("id", photoId);

  return NextResponse.json({ ok: true });
}
