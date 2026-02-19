export const dynamic = "force-dynamic";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getLineForecast } from "@/lib/data/forecast-engine";
import { TargetInput } from "@/components/forecast/TargetInput";


function toPercent(value: number | null) {
  if (value === null || value === undefined) return "-";
  return `${(value * 100).toFixed(1)}%`;
}

function StatusBadge({ status }: { status: string }) {
  const base = "px-3 py-1 rounded-full text-xs font-medium";

  if (status === "On track")
    return <span className={`${base} bg-green-100 text-green-700`}>On track</span>;

  if (status === "Recovering")
    return <span className={`${base} bg-yellow-100 text-yellow-700`}>Recovering</span>;

  return <span className={`${base} bg-red-100 text-red-700`}>At risk</span>;
}

export default async function OeePage({
  params,
}: {
  params: { orgId: string };
}) {
  const supabase = createSupabaseServerClient();

  // 1️⃣ Load lines with area
  const { data: lines } = await supabase
    .from("lines")
    .select("id, name, area_id")
    .eq("org_id", params.orgId);

  if (!lines || lines.length === 0) {
    return <div>No lines found</div>;
  }

  // 2️⃣ Load areas
  const areaIds = [...new Set(lines.map(l => l.area_id).filter(Boolean))];

  const { data: areas } = await supabase
    .from("areas")
    .select("id, name")
    .in("id", areaIds);

  const areaMap = new Map(
    areas?.map(a => [a.id, a.name])
  );

  // 3️⃣ Load forecasts
  const forecasts = await Promise.all(
    lines.map((line) =>
      getLineForecast(supabase, params.orgId, line.id, "oee")
    )
  );

  // 4️⃣ Sort by status + gap
  const statusPriority: Record<string, number> = {
    "At risk": 0,
    "Recovering": 1,
    "On track": 2,
  };

  const sorted = forecasts
    .map((f, i) => ({
      ...f,
      line: lines[i],
      areaName: areaMap.get(lines[i].area_id) || "Unassigned"
    }))
    .sort((a, b) => {
      const statusDiff =
        statusPriority[a.status] - statusPriority[b.status];

      if (statusDiff !== 0) return statusDiff;

      return (b.gap ?? 0) - (a.gap ?? 0);
    });

  // 5️⃣ Group by area
  const grouped = sorted.reduce((acc: any, item) => {
    if (!acc[item.areaName]) {
      acc[item.areaName] = [];
    }
    acc[item.areaName].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold tracking-tight">
        OEE Forecast
      </h1>

      {Object.entries(grouped).map(([areaName, items]: any) => (
        <div key={areaName} className="space-y-4">

          <h2 className="text-xl font-semibold border-b pb-2">
            Area: {areaName}
          </h2>

          {items.map((f: any, index: number) => (
            <div
              key={index}
              className="border rounded-xl p-5 bg-white shadow-sm"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium">
                  {f.line.name}
                </h3>
                <StatusBadge status={f.status} />
              </div>

              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Current</div>
                  <div className="text-lg font-semibold">
                    {toPercent(f.current)}
                  </div>
                </div>

                <div>
  <div className="text-gray-500">Target</div>
  <TargetInput
    orgId={params.orgId}
    lineId={f.line.id}
    metric="oee"
    initialValue={f.target}
  />
</div>


                <div>
                  <div className="text-gray-500">Gap</div>
                  <div className="text-lg font-semibold">
                    {toPercent(f.gap)}
                  </div>
                </div>

                <div>
                  <div className="text-gray-500">Open Actions</div>
                  <div className="text-lg font-semibold">
                    {f.forecast_steps.length}
                  </div>
                </div>
              </div>

              
              <div className="mt-4">
  <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">

    {/* Current (Red) */}
    <div
      className="absolute h-3 bg-red-500"
      style={{ width: `${(f.current ?? 0) * 100}%` }}
    />

     {/* Forecast improvement (Yellow) */}
     {f.forecast_steps.length > 0 && (
      <div
        className="absolute h-3 bg-yellow-400"
        style={{
          width: `${
            ((f.forecast_steps[f.forecast_steps.length - 1].value_after ?? 0) -
              (f.current ?? 0)) *
            100
          }%`,
          left: `${(f.current ?? 0) * 100}%`,
        }}
      />
    )}
  {/* Green zone after target */}
  {f.target && (
      <div
        className="absolute h-3 bg-green-500 opacity-40"
        style={{
          width: `${100 - f.target * 100}%`,
          left: `${f.target * 100}%`,
        }}
      />
    )}


    {/* Target marker */}
    {f.target && (
      <div
        className="absolute top-0 h-3 w-1 bg-black"
        style={{ left: `${f.target * 100}%` }}
      />
    )}
  </div>

  <div className="flex justify-between text-xs mt-1 text-gray-500">
    <span>0%</span>
    <span>Target</span>
    <span>100%</span>
  </div>
</div>



              {f.projected_recovery_date && (
                <div className="mt-3 text-sm text-gray-600">
                  Expected recovery by:{" "}
                  <span className="font-medium">
                    {f.projected_recovery_date}
                  </span>
                </div>
              )}

{f.forecast_steps.length > 0 && (
  <div className="mt-4 border-t pt-3 space-y-2">
    <div className="text-sm font-medium text-gray-700">
      Open Actions Contributing
    </div>

    {[...f.forecast_steps]
  .sort((a, b) => {
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  })
  .map((step: any) => (

      <div
        key={step.action_id}
        className="flex justify-between items-center text-sm bg-gray-50 rounded px-3 py-2"
      >
        <div>
          <div className="font-medium">{step.action_title}</div>
          <div className="text-xs text-gray-500">
          {(() => {
  const today = new Date();
  const due = step.due_date ? new Date(step.due_date) : null;
  const isOverdue = due && due < today;

  return (
    <span>
      Owner: {step.owner || "-"} |{" "}
      <span
        className={
          isOverdue
            ? "text-red-600 font-semibold"
            : "text-gray-500"
        }
      >
        Due: {step.due_date || "-"}
      </span>
    </span>
  );
})()}

          </div>
        </div>

        <div className="text-right">
          <div className="text-xs text-gray-500">
            Impact: {(step.impact_percent * 100).toFixed(0)}% of gap
          </div>
          <div className="font-semibold text-green-600">
            +{toPercent(step.contribution)}
          </div>
        </div>
      </div>
    ))}
  </div>
)}



            </div>
          ))}
        </div>
      ))}
    </div>





  );
}
