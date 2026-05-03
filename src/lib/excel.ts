import ExcelJS from "exceljs";

export interface ExportRow {
  id: string;
  sku: string;
  siteCode: string;
  brand: string | null;
  remarks: string | null;
  status: string;
  submittedAt: Date;
  updatedAt: Date;
  userName: string;
  processedAt: Date | null;
  customFields?: Record<string, unknown> | null;
}

export async function generateExcel(
  data: ExportRow[],
  customFieldDefs?: { name: string; label: string }[]
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "NDRF Portal";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Submissions");

  const columns: Partial<ExcelJS.Column>[] = [
    { header: "Application Date", key: "submittedAt", width: 20 },
    { header: "Requested By", key: "userName", width: 20 },
    { header: "Shop Code", key: "siteCode", width: 15 },
    { header: "Brand", key: "brand", width: 15 },
    { header: "SKU", key: "sku", width: 15 },
  ];

  if (customFieldDefs) {
    for (const cf of customFieldDefs) {
      columns.push({ header: cf.label, key: `cf_${cf.name}`, width: 18 });
    }
  }

  columns.push(
    { header: "Remark", key: "remarks", width: 25 },
    { header: "Status", key: "status", width: 12 },
    { header: "Submitted At", key: "submittedAtFull", width: 20 },
    { header: "Last Updated", key: "updatedAt", width: 20 },
    { header: "Processed At", key: "processedAt", width: 20 }
  );

  sheet.columns = columns;

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF2563EB" },
  };

  for (const row of data) {
    const rowData: Record<string, unknown> = {
      submittedAt: row.submittedAt.toISOString().slice(0, 10),
      userName: row.userName,
      siteCode: row.siteCode,
      brand: row.brand || "",
      sku: row.sku,
    };

    if (customFieldDefs && row.customFields) {
      for (const cf of customFieldDefs) {
        rowData[`cf_${cf.name}`] = (row.customFields as Record<string, unknown>)[cf.name] ?? "";
      }
    }

    rowData.remarks = row.remarks || "";
    rowData.status = row.status;
    rowData.submittedAtFull = row.submittedAt.toISOString().slice(0, 19).replace("T", " ");
    rowData.updatedAt = row.updatedAt.toISOString().slice(0, 19).replace("T", " ");
    rowData.processedAt = row.processedAt
      ? row.processedAt.toISOString().slice(0, 19).replace("T", " ")
      : "";

    sheet.addRow(rowData);
  }

  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: data.length + 1, column: columns.length },
  };

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export async function generateTemplate(
  customFieldDefs: { name: string; label: string; type: string; options: string | null; required: boolean }[]
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "NDRF Portal";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet("Template");

  const columns: Partial<ExcelJS.Column>[] = [
    { header: "SKU", key: "sku", width: 15 },
    { header: "Shop Code", key: "siteCode", width: 15 },
    { header: "Brand", key: "brand", width: 15 },
  ];

  for (const cf of customFieldDefs) {
    columns.push({ header: cf.label, key: cf.name, width: 18 });
  }

  columns.push({ header: "Remark", key: "remarks", width: 25 });

  sheet.columns = columns;

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF2563EB" },
  };

  const sampleRow: Record<string, string> = {
    sku: "SKU-001",
    siteCode: "SITE-HK-01",
    brand: "",
  };
  for (const cf of customFieldDefs) {
    sampleRow[cf.name] = "";
  }
  sampleRow.remarks = "";
  sheet.addRow(sampleRow);

  for (const cf of customFieldDefs) {
    if (cf.type === "select" && cf.options) {
      const opts: string[] = JSON.parse(cf.options);
      const colIdx = columns.findIndex((c) => c.key === cf.name) + 1;
      for (let r = 2; r <= 100; r++) {
        sheet.getCell(r, colIdx).dataValidation = {
          type: "list",
          allowBlank: true,
          formulae: [`"${opts.join(",")}"`],
        };
      }
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
