import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    // 🔧 env vars (injected by Supabase)
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: "Server not configured" }),
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // 🔐 Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401 }
      );
    }

    const accessToken = authHeader.replace("Bearer ", "");

    // 👤 Validate user
    const { data: userData, error: userErr } =
      await supabase.auth.getUser(accessToken);

    if (userErr || !userData.user) {
      return new Response(
        JSON.stringify({ error: "Invalid user" }),
        { status: 401 }
      );
    }

    const userId = userData.user.id;

    // 🔗 user → org (1:1 model)
    const { data: userOrg, error: uoErr } = await supabase
      .from("user_orgs")
      .select("org_id")
      .eq("user_id", userId)
      .single();

    if (uoErr || !userOrg?.org_id) {
      return new Response(
        JSON.stringify({ error: "User has no organization" }),
        { status: 404 }
      );
    }

    // 🏭 load org
    const { data: org, error: orgErr } = await supabase
      .from("orgs")
      .select("id, name")
      .eq("id", userOrg.org_id)
      .single();

    if (orgErr || !org) {
      return new Response(
        JSON.stringify({ error: "Organization not found" }),
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ org }),
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500 }
    );
  }
});
