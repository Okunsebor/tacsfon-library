/**
 * pdfUtils.ts
 * -----------
 * Utility for extracting clean text from a PDF stored in Supabase Storage.
 *
 * pdfjs-dist is already installed: "pdfjs-dist": "^5.7.284"
 *
 * CORS requirement:
 *   Your Supabase Storage bucket must allow requests from your app's origin.
 *   In the Supabase dashboard: Storage → Policies, and add a CORS rule like:
 *
 *   [{ "origin": ["*"], "methods": ["GET"], "maxAgeSeconds": 3600 }]
 *
 *   For production, replace "*" with your exact domain (e.g. "https://yourapp.com").
 */

import * as pdfjsLib from 'pdfjs-dist';
import type { TextItem, TextMarkedContent } from 'pdfjs-dist/types/src/display/api';

// ─── Worker Setup ────────────────────────────────────────────────────────────
// We point at the matching worker from the SAME pdfjs-dist package version to
// guarantee compatibility. The CDN URL is version-locked at build time.
function ensureWorker(): void {
  if (typeof window === 'undefined') return;
  if (pdfjsLib.GlobalWorkerOptions.workerSrc) return; // already configured

  // Use the exact installed version — no version mismatch surprises.
  const version = pdfjsLib.version;
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

/** Called periodically so the UI can show a progress bar or status message. */
export type ProgressCallback = (status: string, percentage: number) => void;

export interface ExtractOptions {
  /**
   * Preserve paragraph breaks by inserting "\n\n" when pdfjs detects a line
   * break in the layout (hasEOL flag on a TextItem). Defaults to true.
   */
  preserveParagraphs?: boolean;

  /**
   * An AbortController signal so the caller can cancel a long extraction.
   */
  signal?: AbortSignal;

  /** Optional progress callback (status message, 0–100). */
  onProgress?: ProgressCallback;
}

export interface ExtractResult {
  text: string;
  /** Total number of pages in the PDF. */
  pageCount: number;
  /** How long the extraction took, in milliseconds. */
  durationMs: number;
}

// ─── Type guard ───────────────────────────────────────────────────────────────
function isTextItem(item: TextItem | TextMarkedContent): item is TextItem {
  return 'str' in item;
}

// ─── Core Helper: fetch the PDF bytes ────────────────────────────────────────
async function fetchPdfBytes(url: string, signal?: AbortSignal): Promise<ArrayBuffer> {
  // First attempt with explicit CORS mode.
  const response = await fetch(url, {
    method: 'GET',
    mode: 'cors',
    cache: 'force-cache',  // cache repeated reads of the same PDF
    signal,
  });

  if (!response.ok) {
    throw new Error(
      `PDF fetch failed — HTTP ${response.status} ${response.statusText} (URL: ${url})`
    );
  }

  return response.arrayBuffer();
}

// ─── Page text extraction ─────────────────────────────────────────────────────
async function extractPageText(
  pdfDoc: pdfjsLib.PDFDocumentProxy,
  pageNum: number,
  preserveParagraphs: boolean
): Promise<string> {
  const page = await pdfDoc.getPage(pageNum);
  const content = await page.getTextContent();

  const parts: string[] = [];

  for (const item of content.items) {
    if (!isTextItem(item)) continue;

    const str = item.str;
    if (!str) continue;

    parts.push(str);

    // pdfjs sets hasEOL = true when a line ends in the PDF layout.
    // We use this to insert paragraph breaks instead of collapsing everything.
    if (preserveParagraphs && item.hasEOL) {
      parts.push('\n');
    }
  }

  return parts.join(' ');
}

// ─── Main exported function ───────────────────────────────────────────────────

/**
 * Fetches a PDF from a Supabase Storage URL, extracts all text from every page,
 * and returns a clean concatenated string.
 *
 * @example
 * ```ts
 * const { text, pageCount } = await extractTextFromPDF(
 *   'https://xxxx.supabase.co/storage/v1/object/public/books/sample.pdf',
 *   {
 *     preserveParagraphs: true,
 *     onProgress: (msg, pct) => console.log(`${pct}% — ${msg}`),
 *   }
 * );
 * ```
 */
export async function extractTextFromPDF(
  pdfUrl: string,
  options: ExtractOptions = {}
): Promise<ExtractResult> {
  const {
    preserveParagraphs = true,
    signal,
    onProgress,
  } = options;

  const startTime = Date.now();
  const report = (status: string, pct: number) => onProgress?.(status, pct);

  // ── 1. Validate URL ────────────────────────────────────────────────────────
  if (!pdfUrl || typeof pdfUrl !== 'string' || !pdfUrl.trim()) {
    throw new TypeError('extractTextFromPDF: pdfUrl must be a non-empty string.');
  }

  // ── 2. Set up the pdfjs worker ────────────────────────────────────────────
  ensureWorker();

  // ── 3. Fetch the file ─────────────────────────────────────────────────────
  report('Fetching PDF from storage…', 5);

  let arrayBuffer: ArrayBuffer;
  try {
    arrayBuffer = await fetchPdfBytes(pdfUrl, signal);
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      report('Cancelled.', 0);
      throw err;
    }
    throw new Error(
      `Could not fetch PDF.\n` +
      `Cause: ${(err as Error).message}\n` +
      `Tip: Check that your Supabase bucket has CORS configured for this origin.`
    );
  }

  // ── 4. Load document ──────────────────────────────────────────────────────
  report('Parsing PDF structure…', 20);

  const loadingTask = pdfjsLib.getDocument({
    data: arrayBuffer,
    // Disable font downloading — we only need text, not rendering.
    disableFontFace: true,
    // Keeps RAM usage low for large PDFs.
    useWorkerFetch: false,
  });

  // Wire up pdfjs's own progress for the loading phase (0–20%).
  loadingTask.onProgress = ({ loaded, total }: { loaded: number; total: number }) => {
    if (total > 0) {
      const pct = Math.min(20, Math.round((loaded / total) * 20));
      report('Loading PDF…', pct);
    }
  };

  const pdfDoc = await loadingTask.promise;
  const totalPages = pdfDoc.numPages;

  if (signal?.aborted) {
    await pdfDoc.destroy();
    throw new DOMException('Aborted', 'AbortError');
  }

  // ── 5. Extract text page by page ─────────────────────────────────────────
  report(`Extracting text from ${totalPages} page${totalPages !== 1 ? 's' : ''}…`, 25);

  const pageTexts: string[] = [];

  for (let i = 1; i <= totalPages; i++) {
    if (signal?.aborted) {
      await pdfDoc.destroy();
      throw new DOMException('Aborted', 'AbortError');
    }

    const pageText = await extractPageText(pdfDoc, i, preserveParagraphs);
    pageTexts.push(pageText);

    // Progress from 25% → 95% across all pages
    const pct = 25 + Math.round(((i) / totalPages) * 70);
    report(`Page ${i} of ${totalPages}`, pct);
  }

  await pdfDoc.destroy(); // Free WASM memory

  // ── 6. Clean and concatenate ──────────────────────────────────────────────
  report('Cleaning text…', 97);

  let fullText = pageTexts.join(preserveParagraphs ? '\n\n' : ' ');

  if (preserveParagraphs) {
    // Collapse excessive blank lines (more than 2) but preserve paragraph breaks
    fullText = fullText
      .replace(/[ \t]+/g, ' ')          // multiple spaces → single space
      .replace(/\n{3,}/g, '\n\n')       // 3+ newlines → paragraph break
      .trim();
  } else {
    // Flatten completely to a single space-separated string
    fullText = fullText.replace(/\s+/g, ' ').trim();
  }

  report('Done!', 100);

  return {
    text: fullText,
    pageCount: totalPages,
    durationMs: Date.now() - startTime,
  };
}
