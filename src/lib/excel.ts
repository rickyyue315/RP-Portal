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
  data: ExportRow[]
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
    { header: "RP Type", key: "cf_rpType", width: 15 },
    { header: "Supply source", key: "cf_supplySource", width: 18 },
    { header: "Safety stock", key: "cf_safetyStock", width: 15 },
    { header: "ND Code", key: "cf_ndCode", width: 40 },
    { header: "RP Parameters Change Request", key: "cf_rpParamsChange", width: 30 },
    { header: "Remark", key: "remarks", width: 25 },
    { header: "Status", key: "status", width: 12 },
    { header: "Submitted At", key: "submittedAtFull", width: 20 },
    { header: "Last Updated", key: "updatedAt", width: 20 },
    { header: "Processed At", key: "processedAt", width: 20 },
  ];

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

    const cf = row.customFields as Record<string, unknown> | null;
    rowData.cf_rpType = cf?.rpType ?? "";
    rowData.cf_supplySource = cf?.supplySource ?? "";
    rowData.cf_safetyStock = cf?.safetyStock ?? "";
    rowData.cf_ndCode = cf?.ndCode ?? "";
    rowData.cf_rpParamsChange = cf?.rpParamsChange ?? "";
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
    { header: "Application Date", key: "applicationDate", width: 20 },
    { header: "Requested by", key: "requestedBy", width: 20 },
    { header: "Shop Code", key: "siteCode", width: 15 },
    { header: "Brand", key: "brand", width: 15 },
    { header: "SKU", key: "sku", width: 15 },
    { header: "RP Type", key: "rpType", width: 15 },
    { header: "Supply source", key: "supplySource", width: 18 },
    { header: "Safety stock", key: "safetyStock", width: 15 },
    { header: "ND Code", key: "ndCode", width: 40 },
    { header: "RP Parameters Change Request", key: "rpParamsChange", width: 30 },
    { header: "Remark", key: "remarks", width: 25 },
  ];

  sheet.columns = columns;

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF2563EB" },
  };

  sheet.addRow({
    applicationDate: new Date().toISOString().slice(0, 10),
    requestedBy: "",
    siteCode: "SITE-HK-01",
    brand: "",
    sku: "SKU-001",
    rpType: "",
    supplySource: "",
    safetyStock: "",
    ndCode: "",
    rpParamsChange: "",
    remarks: "",
  });

  const rpTypeDef = customFieldDefs.find((f) => f.name === "rpType");
  if (rpTypeDef?.type === "select" && rpTypeDef.options) {
    const opts: string[] = JSON.parse(rpTypeDef.options);
    const colIdx = columns.findIndex((c) => c.key === "rpType") + 1;
    for (let r = 2; r <= 100; r++) {
      sheet.getCell(r, colIdx).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [`"${opts.join(",")}"`],
      };
    }
  }

  const ndCodeDef = customFieldDefs.find((f) => f.name === "ndCode");
  if (ndCodeDef?.type === "select" && ndCodeDef.options) {
    const opts: string[] = JSON.parse(ndCodeDef.options);
    const colIdx = columns.findIndex((c) => c.key === "ndCode") + 1;
    const refSheet = workbook.addWorksheet("ND Code Options");
    opts.forEach((opt, i) => {
      refSheet.getCell(i + 1, 1).value = opt;
    });
    for (let r = 2; r <= 100; r++) {
      sheet.getCell(r, colIdx).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [`'ND Code Options'!$A$1:$A$${opts.length}`],
      };
    }
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
