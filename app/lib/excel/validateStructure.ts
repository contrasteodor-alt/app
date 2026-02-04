type ValidationError = {
  sheet: string;
  message: string;
};

const REQUIRED_SHEETS: Record<string, string[]> = {
  Production_Log: [
    "date",
    "shift",
    "line_code",
    "good_qty",
    "total_qty"
  ],
  Downtime_Log: [
    "date",
    "shift",
    "line_code",
    "category",
    "duration_min"
  ],
  Scrap_Log: [
    "date",
    "shift",
    "line_code",
    "scrap_qty",
    "reason"
  ]
};

export function validateStructure(data: Record<string, any[]>): ValidationError[] {
  const errors: ValidationError[] = [];

  // Production_Log is mandatory
  if (!data["Production_Log"]) {
    errors.push({
      sheet: "Production_Log",
      message: "Missing required sheet Production_Log"
    });
    return errors;
  }

  for (const [sheetName, requiredColumns] of Object.entries(REQUIRED_SHEETS)) {
    if (!data[sheetName]) continue; // optional sheets

    const rows = data[sheetName];
    if (!rows.length) continue;

    const columns = Object.keys(rows[0]);

    for (const col of requiredColumns) {
      if (!columns.includes(col)) {
        errors.push({
          sheet: sheetName,
          message: `Missing required column '${col}'`
        });
      }
    }
  }

  return errors;
}
