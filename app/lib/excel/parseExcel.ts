import * as XLSX from "xlsx";

export function parseExcel(buffer: Buffer) {
  const workbook = XLSX.read(buffer, { type: "buffer" });

  const result: Record<string, any[]> = {};

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });
    result[sheetName] = rows;
  }

  return result;
}
