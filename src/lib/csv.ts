import ExcelJS from "exceljs";

export interface ParsedSkuRow {
  sku: string;
  description?: string;
  category?: string;
  unit?: string;
}

export interface ParsedSiteRow {
  siteCode: string;
  siteName?: string;
  region?: string;
  address?: string;
  contact?: string;
}

export async function parseCsvToSkuRows(text: string): Promise<ParsedSkuRow[]> {
  const lines = text.trim().split("\n");
  const startRow = lines[0].toLowerCase().includes("sku") ? 1 : 0;

  return lines.slice(startRow)
    .map((line) => {
      const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      return {
        sku: cols[0] || "",
        description: cols[1] || undefined,
        category: cols[2] || undefined,
        unit: cols[3] || undefined,
      };
    })
    .filter((row) => row.sku);
}

export async function parseCsvToSiteRows(text: string): Promise<ParsedSiteRow[]> {
  const lines = text.trim().split("\n");
  const startRow = lines[0].toLowerCase().includes("site") ? 1 : 0;

  return lines.slice(startRow)
    .map((line) => {
      const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      return {
        siteCode: cols[0] || "",
        siteName: cols[1] || undefined,
        region: cols[2] || undefined,
        address: cols[3] || undefined,
        contact: cols[4] || undefined,
      };
    })
    .filter((row) => row.siteCode);
}

export async function parseExcelToSkuRows(buffer: Buffer): Promise<ParsedSkuRow[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as any);
  const sheet = workbook.worksheets[0];
  if (!sheet) return [];

  const rows: ParsedSkuRow[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const sku = String(row.getCell(1).value || "").trim();
    if (!sku) return;
    rows.push({
      sku,
      description: String(row.getCell(2).value || "").trim() || undefined,
      category: String(row.getCell(3).value || "").trim() || undefined,
      unit: String(row.getCell(4).value || "").trim() || undefined,
    });
  });
  return rows;
}

export async function parseExcelToSiteRows(buffer: Buffer): Promise<ParsedSiteRow[]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as any);
  const sheet = workbook.worksheets[0];
  if (!sheet) return [];

  const rows: ParsedSiteRow[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const siteCode = String(row.getCell(1).value || "").trim();
    if (!siteCode) return;
    rows.push({
      siteCode,
      siteName: String(row.getCell(2).value || "").trim() || undefined,
      region: String(row.getCell(3).value || "").trim() || undefined,
      address: String(row.getCell(4).value || "").trim() || undefined,
      contact: String(row.getCell(5).value || "").trim() || undefined,
    });
  });
  return rows;
}
