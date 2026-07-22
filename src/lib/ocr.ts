import { createWorker } from "tesseract.js";

/**
 * Runs OCR on an image entirely in the browser (Tesseract's WASM build --
 * no server-side native binary, no API key). Returns the raw recognized
 * text; callers parse it into whatever structured fields they need and
 * always show the result to staff for review before saving.
 */
export async function recognizeText(file: File): Promise<string> {
  const worker = await createWorker("eng");
  try {
    const {
      data: { text },
    } = await worker.recognize(file);
    return text;
  } finally {
    await worker.terminate();
  }
}

/** Splits OCR'd text into trimmed, non-empty lines. */
export function ocrLines(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

const NUMERIC = /^-?\d+(\.\d+)?$/;

/**
 * Best-effort parse of a scanned measurement table into size-chart rows.
 * Expects one row per line: a label followed by one number per size column
 * (e.g. "Chest  33  35  37  39  41"), and — if present — a header line of
 * size names (e.g. "XS S M L XL") used to prefill the Sizes field. Always
 * shown to staff for review/correction before saving, since OCR on
 * handwritten or skewed photos is unreliable.
 */
export function parseSizeChartTable(text: string): {
  sizesText: string;
  rows: { label: string; values: number[] }[];
} {
  const lines = ocrLines(text);
  let sizesText = "";
  const rows: { label: string; values: number[] }[] = [];

  for (const line of lines) {
    const tokens = line.split(/\s+/).filter(Boolean);
    if (tokens.length < 2) continue;

    const numericTokens = tokens.filter((t) => NUMERIC.test(t));
    const labelTokens = tokens.filter((t) => !NUMERIC.test(t));

    // A line that's entirely short alpha tokens (no numbers) and comes
    // before we've seen any data row is probably the size header.
    if (numericTokens.length === 0 && !rows.length && !sizesText) {
      sizesText = tokens.join(", ");
      continue;
    }

    if (numericTokens.length > 0 && labelTokens.length > 0) {
      rows.push({
        label: labelTokens.join(" "),
        values: numericTokens.map(Number),
      });
    }
  }

  return { sizesText, rows };
}

const PHONE = /(\+?\d[\d\s-]{7,14}\d)/;

/**
 * Best-effort parse of a scanned customer list into rows, one per line:
 * whatever's left after pulling out a phone number becomes the name. Lines
 * without a recognizable phone number are skipped, since phone is the only
 * required/dedup field downstream. Always shown to staff for review before
 * import.
 */
export function parseCustomerList(text: string): { phone: string; name: string }[] {
  const rows: { phone: string; name: string }[] = [];
  for (const line of ocrLines(text)) {
    const match = line.match(PHONE);
    if (!match) continue;
    const phone = match[1].replace(/[\s-]/g, "");
    const name = (line.slice(0, match.index) + line.slice((match.index || 0) + match[0].length))
      .replace(/[,|]/g, " ")
      .trim();
    rows.push({ phone, name });
  }
  return rows;
}

const PRICE = /(?:₹|rs\.?|inr)\s*([\d,]+(?:\.\d+)?)/i;

/**
 * Best-effort extraction of a product name/price from a scanned tag, spec
 * sheet, or packaging photo. Only meant to prefill blank fields in the
 * product editor for staff to confirm — never overwrites what's already
 * there.
 */
export function parseProductInfo(text: string): { name?: string; price?: number } {
  const lines = ocrLines(text);
  const result: { name?: string; price?: number } = {};

  for (const line of lines) {
    const match = line.match(PRICE);
    if (match) {
      const n = Number(match[1].replace(/,/g, ""));
      if (!Number.isNaN(n)) {
        result.price = n;
        break;
      }
    }
  }

  // First reasonably short line without a price on it is the best guess
  // for a product name/title printed on the tag.
  const nameLine = lines.find((l) => l.length >= 3 && l.length <= 60 && !PRICE.test(l));
  if (nameLine) result.name = nameLine;

  return result;
}
