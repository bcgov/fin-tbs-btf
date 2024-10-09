import * as pdfjs from "pdfjs-dist";
import pdfjsWorkerUrl from "pdfjs-dist/build/pdf.worker?worker&url"; // Import vite worker URL
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?worker"; // Import vite worker itself

declare global {
  interface Window {
    pdfjsWorker: any;
  }
}
/* USAGE: simply add this to the imports, that's all
    import '../workers/pdfjsWorker'
*/

/**
 * Initializes the PDF.js worker for Vite, setting the workerSrc to the correct URL.
 * This is necessary because Vite doesn't support Webpack's worker handling by default which
 * is how pdfjs would normally operate.
 */
export const initPdfJsWorker = () => {
  if (typeof window === "undefined" || !("Worker" in window)) {
    throw new Error("Web Workers are not supported in this environment.");
  }

  window.pdfjsWorker = pdfjsWorker; // Assign the worker instance to the global window object
  pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl; // Set the worker source for PDF.js
};

// Immediately initialize the PDF.js worker when this module is imported
initPdfJsWorker();
