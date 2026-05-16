import * as pdfjsLib from 'pdfjs-dist';

/**
 * Utility function to extract clean text from a PDF file via its URL (e.g., Supabase storage).
 * 
 * @param pdfUrl - The public URL of the PDF file (must have CORS enabled on the bucket).
 * @param onProgress - Optional callback to track the loading and extraction progress.
 * @returns A promise that resolves to the concatenated clean text of the PDF.
 */
export async function extractTextFromPDF(
  pdfUrl: string,
  onProgress?: (status: string, percentage: number) => void
): Promise<string> {
  try {
    // Configure worker for pdfjs-dist in the browser environment.
    // Using CDN ensures we don't have to manually copy worker files into the public directory.
    if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    }

    onProgress?.('Fetching PDF...', 0);

    // Fetch the PDF as an ArrayBuffer to cleanly handle CORS.
    // (Ensure your Supabase Storage bucket has CORS enabled for your domain).
    const response = await fetch(pdfUrl, {
      method: 'GET',
      mode: 'cors', 
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();

    onProgress?.('Loading PDF document...', 20);

    // Load the document via pdf.js
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDocument = await loadingTask.promise;

    const totalPages = pdfDocument.numPages;
    let fullText = '';

    onProgress?.('Extracting text...', 40);

    // Iterate through every page
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Extract text items from the page
      const pageText = textContent.items
        .map((item) => {
          // Ensure the item is a TextItem (which has the 'str' property)
          if ('str' in item) {
            return item.str;
          }
          return '';
        })
        .join(' '); // Join line items with a space

      fullText += pageText + ' ';

      // Report progress for text extraction (from 40% to 100%)
      const progress = 40 + Math.round((pageNum / totalPages) * 60);
      onProgress?.(`Processing page ${pageNum} of ${totalPages}`, progress);
    }

    onProgress?.('Completed', 100);

    // Clean up the text: replace multiple whitespaces/newlines with a single space and trim
    const cleanText = fullText.replace(/\s+/g, ' ').trim();

    return cleanText;
  } catch (error) {
    console.error('Error in extractTextFromPDF:', error);
    onProgress?.('Error extracting PDF', 0);
    throw error;
  }
}
