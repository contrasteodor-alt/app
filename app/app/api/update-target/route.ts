import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {

 // console.log("ENV CHECK", process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { orgId, lineId, metric, target } = await req.json();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
  .from("line_targets")
  .update({ target_value: target })
  .eq("org_id", orgId)
  .eq("line_id", lineId)
  .eq("metric_type", metric)
  .select();

if (error) {
  console.error("UPDATE ERROR:", error);
  return NextResponse.json(
    { error: error.message },
    { status: 500 }
  );
}

//console.log("UPDATE RESULT:", data);

  

  return NextResponse.json({ success: true });
}
