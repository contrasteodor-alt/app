import { NextResponse } from "next/server";

import { parseExcel } from "@/lib/excel/parseExcel";
import { validateStructure } from "@/lib/excel/validateStructure";
import { resolveMasterData } from "@/lib/import/resolveMasterData";
import { validateMasterRefs } from "@/lib/import/validateMasterRefs";
import { validateRows } from "@/lib/import/validateRows";
import { writeRawData } from "@/lib/import/writeRawData";

export async function POST(req: Request) {
  try {
    // 1. Read multipart form
const formData = await req.formData();
const file = formData.get("file");

if (!file || typeof file === "string") {
  return NextResponse.json(
    { success: false, error: "No file uploaded" },
    { status: 400 }
  );
}

// TypeScript now knows this is a file-like object
const filename = file.name;

if (!filename.endsWith(".xlsx")) {
  return NextResponse.json(
    { success: false, error: "Only .xlsx files are allowed" },
    { status: 400 }
  );
}





    // 2. File type check
    if (!file.name.endsWith(".xlsx")) {
      return NextResponse.json(
        { success: false, error: "Only .xlsx files are allowed" },
        { status: 400 }
      );
    }

    // 3. Read file into buffer
    const buffer = Buffer.from(await (file as any).arrayBuffer());


    // 4. Parse Excel
    const data = parseExcel(buffer);

    // 5. Structural validation
    const structureErrors = validateStructure(data);
    if (structureErrors.length > 0) {
      return NextResponse.json(
        { success: false, errors: structureErrors },
        { status: 400 }
      );
    }

    // 6. Resolve orgId 
    const { searchParams } = new URL(req.url);
const orgId = searchParams.get("orgId");

if (!orgId) {
  return NextResponse.json(
    { success: false, error: "Missing orgId" },
    { status: 400 }
  );
}


    // 7. Resolve master data
    const { lineMap, shiftMap } = await resolveMasterData(orgId);

    // 8. Validate master references
    const refErrors = validateMasterRefs(data, lineMap, shiftMap);
    if (refErrors.length > 0) {
      return NextResponse.json(
        { success: false, errors: refErrors },
        { status: 400 }
      );
    }

    // 9. Row-level validation
    const rowResult = validateRows(data);

    if (rowResult.valid.Production_Log.length === 0) {
      return NextResponse.json(
        { success: false, errors: rowResult.rejected },
        { status: 400 }
      );
    }

    // 10. SAFE DELETE (Step 7B)
    await writeRawData({
      orgId,
      lineMap,
      shiftMap,
      rows: rowResult.valid
    });
    

    // 11. Temporary success (inserts come next step)
    return NextResponse.json({
      success: true,
      message: "Raw data inserted successfully"
    });
    

  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Excel import failed"
      },
      { status: 500 }
    );
  }
}
