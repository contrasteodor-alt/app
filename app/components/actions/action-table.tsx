export function ActionTable({
  actions,
  lineMap,
}: {
  actions: any[];
  lineMap: Map<string, string>;
}) {
  const today = new Date();

  function getSeverity(impact?: number) {
    if (!impact) return { label: "Low", style: "bg-slate-100 text-slate-700" };

    if (impact >= 0.4)
      return { label: "Critical", style: "bg-red-100 text-red-700" };

    if (impact >= 0.2)
      return { label: "Major", style: "bg-yellow-100 text-yellow-700" };

    return { label: "Moderate", style: "bg-green-100 text-green-700" };
  }

  const sorted = [...actions].sort((a, b) => {
    const aImpact = a.impact_percent ?? 0;
    const bImpact = b.impact_percent ?? 0;

    if (bImpact !== aImpact) return bImpact - aImpact;

    if (!a.due_date) return 1;
    if (!b.due_date) return -1;

    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });

  return (
    <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-muted/40">
          <tr>
            <th className="px-4 py-3 text-left">Line</th>
            <th className="px-4 py-3 text-left">Metric</th>
            <th className="px-4 py-3 text-left">Action</th>
            <th className="px-4 py-3 text-left">Owner</th>
            <th className="px-4 py-3 text-left">Due</th>
            <th className="px-4 py-3 text-left">Severity</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Source</th>
          </tr>
        </thead>

        <tbody>
          {sorted.map((a) => {
            const isOverdue =
              a.due_date && new Date(a.due_date) < today;

            const severity = getSeverity(a.impact_percent);

            return (
              <tr key={a.id} className="border-t hover:bg-gray-50">
                {/* Line */}
                <td className="px-4 py-3">
                  {lineMap.get(a.line_id) ?? "—"}
                </td>

                {/* Metric */}
                <td className="px-4 py-3">
                  <span className="text-xs font-medium uppercase">
                    {a.metric_type ?? "-"}
                  </span>
                </td>

                {/* Action */}
                <td
                  className="px-4 py-3 font-medium"
                  title={a.root_cause ?? ""}
                >
                  {a.action}
                  {a.expected_impact && (
                    <div className="text-xs text-gray-500">
                      {a.expected_impact}
                    </div>
                  )}
                </td>

                {/* Owner */}
                <td className="px-4 py-3">
                  {a.owner ?? "-"}
                </td>

                {/* Due */}
                <td
                  className={`px-4 py-3 ${
                    isOverdue
                      ? "text-red-600 font-semibold"
                      : ""
                  }`}
                >
                  {a.due_date ?? "-"}
                </td>

                {/* Severity */}
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${severity.style}`}
                  >
                    {severity.label}
                  </span>
                  {a.impact_percent && (
                    <div className="text-xs text-gray-500">
                      {(a.impact_percent * 100).toFixed(0)}% impact
                    </div>
                  )}
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
                      ${
                        a.status === "Open"
                          ? "bg-blue-100 text-blue-700"
                          : a.status === "Closed"
                          ? "bg-green-100 text-green-700"
                          : a.status === "Delayed"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                  >
                    {a.status}
                  </span>
                </td>

                {/* Source */}
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
                      ${
                        a.source === "ai"
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                  >
                    {a.source === "ai"
                      ? "AI Engine"
                      : "Manual"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
