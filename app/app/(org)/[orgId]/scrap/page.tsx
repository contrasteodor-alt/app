export const dynamic = "force-dynamic";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getLineForecast } from "@/lib/data/forecast-engine";
import { TargetInput } from "@/components/forecast/TargetInput";

function toPercent(value: number | null) {
  if (value === null || value === undefined) return "-";
  return `${(value * 100).toFixed(2)}%`;
}

function StatusBadge({ status }: { status: string }) {
  const base = "px-3 py-1 rounded-full text-xs font-medium";

  if (status === "On track")
    return <span className={`${base} bg-green-100 text-green-700`}>On track</span>;

  if (status === "Recovering")
    return <span className={`${base} bg-yellow-100 text-yellow-700`}>Recovering</span>;

  return <span className={`${base} bg-red-100 text-red-700`}>At risk</span>;
}

export default async function ScrapPage({
  params,
}: {
  params: { orgId: string };
}) {
  const supabase = createSupabaseServerClient();

  const { data: lines } = await supabase
    .from("lines")
    .select("id, name, area_id")
    .eq("org_id", params.orgId);

  if (!lines || lines.length === 0) {
    return <div>No lines found</div>;
  }

  const areaIds = [...new Set(lines.map(l => l.area_id).filter(Boolean))];

  const { data: areas } = await supabase
    .from("areas")
    .select("id, name")
    .in("id", areaIds);

  const areaMap = new Map(
    areas?.map(a => [a.id, a.name])
  );

  const forecasts = await Promise.all(
    lines.map((line) =>
      getLineForecast(supabase, params.orgId, line.id, "scrap")
    )
  );

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

  const grouped = sorted.reduce((acc: any, item) => {
    if (!acc[item.areaName]) acc[item.areaName] = [];
    acc[item.areaName].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold tracking-tight">
        Scrap Forecast
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
                  <div className="text-gray-500">Current Scrap</div>
                  <div className="text-lg font-semibold">
                    {toPercent(f.current)}
                  </div>
                </div>

                <div>
                  <div className="text-gray-500">Target</div>
                  <TargetInput
                    orgId={params.orgId}
                    lineId={f.line.id}
                    metric="scrap"
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

              {/* Dynamic Scrap Bar */}
<div className="mt-4">

{(() => {
  const current = f.current ?? 0;
  const target = f.target ?? 0;

  // Dynamic scale (avoid zero)
  const maxScale =
    Math.max(current, target) > 0
      ? Math.max(current, target) * 1.5
      : 0.05; // fallback 5%

  const currentWidth = (current / maxScale) * 100;
  const targetPosition = (target / maxScale) * 100;

  const finalValue =
    f.forecast_steps.length > 0
      ? f.forecast_steps[f.forecast_steps.length - 1].value_after ?? current
      : current;

  const forecastWidth =
    f.forecast_steps.length > 0
      ? ((current - finalValue) / maxScale) * 100
      : 0;

  const forecastLeft = (finalValue / maxScale) * 100;

  return (
    <>
      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">

        {/* Safe zone below target */}
        <div
          className="absolute h-3 bg-green-500 opacity-30"
          style={{
            width: `${targetPosition}%`,
          }}
        />

        {/* Current Scrap (Red) */}
        <div
          className="absolute h-3 bg-red-500"
          style={{
            width: `${currentWidth}%`,
          }}
        />

        {/* Forecast improvement (Yellow) */}
        {f.forecast_steps.length > 0 && (
          <div
            className="absolute h-3 bg-yellow-400"
            style={{
              width: `${forecastWidth}%`,
              left: `${forecastLeft}%`,
            }}
          />
        )}

        {/* Target marker */}
        <div
          className="absolute top-0 h-3 w-1 bg-black"
          style={{
            left: `${targetPosition}%`,
          }}
        />
      </div>

      <div className="flex justify-between text-xs mt-1 text-gray-500">
        <span>0%</span>
        <span>Target</span>
        <span>{(maxScale * 100).toFixed(1)}%</span>
      </div>
    </>
  );
})()}

</div>


              {/* Actions Display */}
              {f.forecast_steps.length > 0 && (
                <div className="mt-4 border-t pt-3 space-y-2">
                  <div className="text-sm font-medium text-gray-700">
                    Scrap Reduction Actions
                  </div>

                  {[...f.forecast_steps]
                    .sort((a, b) => {
                      if (!a.due_date) return 1;
                      if (!b.due_date) return -1;
                      return new Date(a.due_date).getTime() -
                             new Date(b.due_date).getTime();
                    })
                    .map((step: any) => {
                      const today = new Date();
                      const due = step.due_date
                        ? new Date(step.due_date)
                        : null;
                      const isOverdue = due && due < today;

                      return (
                        <div
                          key={step.action_id}
                          className="flex justify-between items-center text-sm bg-gray-50 rounded px-3 py-2"
                        >
                          <div>
                            <div className="font-medium">
                              {step.action_title}
                            </div>
                            <div className="text-xs text-gray-500">
                              Owner: {step.owner || "-"} |{" "}
                              <span
                                className={
                                  isOverdue
                                    ? "text-red-600 font-semibold"
                                    : ""
                                }
                              >
                                Due: {step.due_date || "-"}
                              </span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-xs text-gray-500">
                              Impact: {(step.impact_percent * 100).toFixed(0)}% of gap
                            </div>
                            <div className="font-semibold text-green-600">
                              -{toPercent(step.contribution)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
