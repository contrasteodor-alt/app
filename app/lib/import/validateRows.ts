type RowError = {
  sheet: string;
  row: number; // Excel row number (1-based)
  message: string;
};

type RowWarning = RowError;

type RowValidationResult = {
  valid: {
    Production_Log: any[];
    Downtime_Log: any[];
    Scrap_Log: any[];
  };
  rejected: RowError[];
  warnings: RowWarning[];
};

export function validateRows(data: Record<string, any[]>): RowValidationResult {
  const result: RowValidationResult = {
    valid: {
      Production_Log: [],
      Downtime_Log: [],
      Scrap_Log: []
    },
    rejected: [],
    warnings: []
  };

  // ---- Production_Log ----
  (data.Production_Log || []).forEach((row, i) => {
    const excelRow = i + 2;

    if (row.good_qty < 0 || row.total_qty < 0) {
      result.rejected.push({
        sheet: "Production_Log",
        row: excelRow,
        message: "Quantities cannot be negative"
      });
      return;
    }

    if (row.total_qty < row.good_qty) {
      result.rejected.push({
        sheet: "Production_Log",
        row: excelRow,
        message: "total_qty < good_qty"
      });
      return;
    }

    if (!row.ideal_cycle_sec) {
      result.warnings.push({
        sheet: "Production_Log",
        row: excelRow,
        message: "ideal_cycle_sec missing, default will be used"
      });
    }

    if (!row.planned_time_min) {
      result.warnings.push({
        sheet: "Production_Log",
        row: excelRow,
        message: "planned_time_min missing, shift default will be used"
      });
    }

    result.valid.Production_Log.push(row);
  });

  // ---- Downtime_Log ----
  (data.Downtime_Log || []).forEach((row, i) => {
    const excelRow = i + 2;

    if (!row.category) {
      result.rejected.push({
        sheet: "Downtime_Log",
        row: excelRow,
        message: "Missing category"
      });
      return;
    }

    if (row.duration_min <= 0) {
      result.rejected.push({
        sheet: "Downtime_Log",
        row: excelRow,
        message: "duration_min must be > 0"
      });
      return;
    }

    if (!row.start_time) {
      result.warnings.push({
        sheet: "Downtime_Log",
        row: excelRow,
        message: "start_time missing, shift start will be used"
      });
    }

    result.valid.Downtime_Log.push(row);
  });

  // ---- Scrap_Log ----
  (data.Scrap_Log || []).forEach((row, i) => {
    const excelRow = i + 2;

    if (row.scrap_qty <= 0) {
      result.rejected.push({
        sheet: "Scrap_Log",
        row: excelRow,
        message: "scrap_qty must be > 0"
      });
      return;
    }

    if (!row.reason) {
      result.rejected.push({
        sheet: "Scrap_Log",
        row: excelRow,
        message: "Missing scrap reason"
      });
      return;
    }

    result.valid.Scrap_Log.push(row);
  });

  return result;
}
