import ExcelJS from "exceljs";

export interface ExportRow {
  id: string;
  sku: string;
  siteCode: string;
  quantity: number | null;
  unitPrice: number | null;
  remarks: string | null;
  status: string;
  submittedAt: Date;
  updatedAt: Date;
  userName: string;
  processedAt: Date | null;
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
    { header: "ID", key: "id", width: 12 },
    { header: "SKU", key: "sku", width: 15 },
    { header: "Site Code", key: "siteCode", width: 15 },
    { header: "Quantity", key: "quantity", width: 12 },
    { header: "Unit Price", key: "unitPrice", width: 12 },
    { header: "Total", key: "total", width: 14 },
    { header: "Remarks", key: "remarks", width: 25 },
    { header: "Status", key: "status", width: 12 },
    { header: "Submitted By", key: "userName", width: 20 },
    { header: "Submitted At", key: "submittedAt", width: 20 },
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
    sheet.addRow({
      id: row.id.slice(0, 8),
      sku: row.sku,
      siteCode: row.siteCode,
      quantity: row.quantity,
      unitPrice: row.unitPrice,
      total: row.quantity && row.unitPrice ? row.quantity * row.unitPrice : null,
      remarks: row.remarks,
      status: row.status,
      userName: row.userName,
      submittedAt: row.submittedAt.toISOString().slice(0, 19).replace("T", " "),
      updatedAt: row.updatedAt.toISOString().slice(0, 19).replace("T", " "),
      processedAt: row.processedAt
        ? row.processedAt.toISOString().slice(0, 19).replace("T", " ")
        : "",
    });
  }

  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: data.length + 1, column: columns.length },
  };

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
