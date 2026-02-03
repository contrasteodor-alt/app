export function ActionTable({
  actions,
  lineMap,
}: {
  actions: any[];
  lineMap: Map<string, string>;
}) {

  return (
    <div className="border rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/40">
          <tr>
            <th className="px-4 py-3 text-left">Line</th>
            <th className="px-4 py-3 text-left">Action</th>
            <th className="px-4 py-3 text-left">Owner</th>
            <th className="px-4 py-3 text-left">Due</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Source</th>
          </tr>
        </thead>
        <tbody>
          {actions.map((a) => (
            <tr key={a.id} className="border-t">
              <td className="px-4 py-3">
              {lineMap.get(a.line_id) ?? "—"}
              </td>
              <td className="px-4 py-3 font-medium">
                {a.action}
              </td>
              <td className="px-4 py-3">
                {a.owner}
              </td>
              <td className="px-4 py-3">
                {a.due_date}
              </td>
              <td className="px-4 py-3">
                {a.status}
              </td>
              <td className="px-4 py-3">
                {a.source === "ai" ? "AI" : "Manual"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
