type RefError = {
  sheet: string;
  row: number;
  message: string;
};

export function validateMasterRefs(
  data: Record<string, any[]>,
  lineMap: Map<string, string>,
  shiftMap: Map<string, any>
): RefError[] {
  const errors: RefError[] = [];

  const checkSheet = (sheetName: string) => {
    if (!data[sheetName]) return;

    data[sheetName].forEach((row, index) => {
      if (row.line_code && !lineMap.has(row.line_code)) {
        errors.push({
          sheet: sheetName,
          row: index + 2,
          message: `Unknown line_code '${row.line_code}'`
        });
      }

      if (row.shift && !shiftMap.has(row.shift)) {
        errors.push({
          sheet: sheetName,
          row: index + 2,
          message: `Unknown shift '${row.shift}'`
        });
      }
    });
  };

  checkSheet("Production_Log");
  checkSheet("Downtime_Log");
  checkSheet("Scrap_Log");

  return errors;
}
