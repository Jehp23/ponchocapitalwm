import ExcelJS from "exceljs";
import { z } from "zod";

const rowSchema = z.object({
  assetName: z.string().min(1),
  ticker: z.string().optional(),
  quantity: z.coerce.number(),
  price: z.coerce.number().optional(),
  marketValue: z.coerce.number(),
  currency: z.string().default("USD"),
  assetClass: z.string().default("OTHER")
});

export type ImportColumnMapping = {
  assetName: string;
  ticker?: string;
  quantity: string;
  price?: string;
  marketValue: string;
  currency?: string;
  assetClass?: string;
};

export function normalizeAssetName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeCellValue(value: ExcelJS.CellValue | undefined | null): unknown {
  if (value === null || value === undefined) return null;
  if (typeof value === "object") {
    if ("text" in value && typeof value.text === "string") return value.text;
    if ("result" in value) return value.result ?? null;
    if ("richText" in value && Array.isArray(value.richText)) return value.richText.map((chunk) => chunk.text).join("");
    if ("hyperlink" in value && typeof value.hyperlink === "string") return value.text ?? value.hyperlink;
  }

  return value;
}

async function worksheetToObjects(buffer: Buffer) {
  const workbook = new ExcelJS.Workbook();
  const loadableBuffer = buffer as unknown as Parameters<ExcelJS.Workbook["xlsx"]["load"]>[0];
  await workbook.xlsx.load(loadableBuffer);

  const worksheet = workbook.worksheets[0];

  if (!worksheet) {
    return [];
  }

  const headerRow = worksheet.getRow(1);
  const headerValues = Array.isArray(headerRow.values) ? headerRow.values.slice(1) : [];
  const headers = headerValues.map((value: unknown) => String(normalizeCellValue(value as ExcelJS.CellValue) ?? "").trim());

  const rows: Record<string, unknown>[] = [];

  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    const record: Record<string, unknown> = {};

    headers.forEach((header: string, index: number) => {
      if (!header) return;
      record[header] = normalizeCellValue(row.getCell(index + 1).value);
    });

    rows.push(record);
  }

  return rows;
}

export async function parseInitialPortfolioWorkbook(buffer: Buffer, mapping: ImportColumnMapping) {
  const rawRows = await worksheetToObjects(buffer);

  return rawRows.map((row, index) => {
    const parsed = rowSchema.safeParse({
      assetName: String(row[mapping.assetName] ?? ""),
      ticker: mapping.ticker ? String(row[mapping.ticker] ?? "") : undefined,
      quantity: row[mapping.quantity] ?? 0,
      price: mapping.price ? row[mapping.price] ?? undefined : undefined,
      marketValue: row[mapping.marketValue] ?? 0,
      currency: mapping.currency ? String(row[mapping.currency] ?? "USD") : "USD",
      assetClass: mapping.assetClass ? String(row[mapping.assetClass] ?? "OTHER") : "OTHER"
    });

    if (!parsed.success) {
      return {
        rowNumber: index + 2,
        success: false as const,
        rawPayload: row,
        errors: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      };
    }

    return {
      rowNumber: index + 2,
      success: true as const,
      rawPayload: row,
      normalized: {
        ...parsed.data,
        normalizedAssetName: normalizeAssetName(parsed.data.assetName)
      }
    };
  });
}
