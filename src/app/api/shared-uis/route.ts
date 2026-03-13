import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * GET /api/shared-uis?id=xxx - Fetch a shared UI by ID (public)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("shared_uis")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Increment view count in background
  supabase.rpc("increment_view_count", { p_share_id: id }).then(() => {});

  return NextResponse.json(data);
}

/**
 * POST /api/shared-uis - Create a shared UI link
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const body = await request.json();
  const { toolName, toolData, title } = body;

  if (!toolName || !toolData) {
    return NextResponse.json(
      { error: "toolName, toolData are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("shared_uis")
    .insert({
      user_id: user?.id || null,
      tool_name: toolName,
      tool_data: toolData,
      title: title || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
