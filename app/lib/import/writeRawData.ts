import { createSupabaseServerClient } from "@/lib/supabase/server";

type WriteInput = {
  orgId: string;
  lineMap: Map<string, string>;
  shiftMap: Map<string, { id: string; started_at: string }>;
  rows: {
    Production_Log: any[];
    Downtime_Log: any[];
    Scrap_Log: any[];
  };
};

export async function writeRawData(input: WriteInput) {
  const supabase = createSupabaseServerClient();

  // ---------- Production ----------
  const productionRows = input.rows.Production_Log.map((r) => {
    const line_id = input.lineMap.get(r.line_code)!;
    const shift = input.shiftMap.get(r.shift)!;

    const shiftTime = new Date(shift.started_at)
      .toISOString()
      .slice(11, 19); // HH:MM:SS

    return {
      line_id,
      ts: `${r.date}T${shiftTime}`,
      good_qty: r.good_qty,
      total_qty: r.total_qty,
      ideal_cycle_sec: r.ideal_cycle_sec ?? null,
    };
  });

  if (productionRows.length > 0) {
    const { error } = await supabase
      .from("output_readings")
      .insert(productionRows);

    if (error) throw error;
  }

  // ---------- Downtime ----------
  const downtimeRows = (input.rows.Downtime_Log || []).map((r) => {
    const line_id = input.lineMap.get(r.line_code)!;
    const shift = input.shiftMap.get(r.shift)!;

    const shiftTime = new Date(shift.started_at)
      .toISOString()
      .slice(11, 19);

    return {
      line_id,
      shift_id: shift.id,
      event_type: "downtime",
      category: r.category,
      occurred_at: r.start_time
        ? `${r.date}T${r.start_time}`
        : `${r.date}T${shiftTime}`,
      duration_min: r.duration_min,
      comment: r.reason ?? null,
    };
  });

  if (downtimeRows.length > 0) {
    const { error } = await supabase.from("events").insert(downtimeRows);
    if (error) throw error;
  }

  // ---------- Scrap ----------
  const scrapRows = (input.rows.Scrap_Log || []).map((r) => {
    const line_id = input.lineMap.get(r.line_code)!;
    const shift = input.shiftMap.get(r.shift)!;

    const shiftTime = new Date(shift.started_at)
      .toISOString()
      .slice(11, 19);

    return {
      line_id,
      ts: `${r.date}T${shiftTime}`,
      scrap_qty: r.scrap_qty,
      reason: r.reason,
    };
  });

  if (scrapRows.length > 0) {
    const { error } = await supabase.from("scrap_events").insert(scrapRows);
    if (error) throw error;
  }
}
