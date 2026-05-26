import { redirect } from "next/navigation";
import { getEventSession } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase/server";
import type { Event } from "@/lib/supabase/types";
import { TokenGatePage } from "./TokenGatePage";
import { PartyApp } from "./PartyApp";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ t?: string }>;
}

export default async function EventPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { t: tokenParam } = await searchParams;

  // Fetch event metadata (public)
  const supabase = createServiceClient();
  const { data: event } = await supabase
    .from("events")
    .select("id, slug, name, event_date")
    .eq("slug", slug)
    .single();

  if (!event) redirect("/");

  // Check existing session
  const session = await getEventSession();
  const hasValidSession = session?.eventSlug === slug;

  // If there's a token in the URL, let the client-side gate handle validation
  // (so we can set the cookie via the API and redirect cleanly)
  if (!hasValidSession) {
    return <TokenGatePage event={event as Event} tokenParam={tokenParam} />;
  }

  return <PartyApp event={event as Event} />;
}
