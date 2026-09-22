import * as pdfjsLib from 'pdfjs-dist';

export async function renderPdfPageToDataUrl(
  pdfData: Uint8Array | ArrayBuffer,
  pageNumber: number,
  scale: number = 0.35
): Promise<string> {
  const loadingTask = pdfjsLib.getDocument({
    data: pdfData instanceof Uint8Array ? pdfData : new Uint8Array(pdfData),
  });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Could not get canvas context');

  // @ts-ignore
  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas.toDataURL('image/jpeg', 0.85);
}

export async function renderPdfAllThumbnails(
  file: File,
  maxPages: number = 20,
  scale: number = 0.3
): Promise<{ pageNumber: number; dataUrl: string }[]> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;
  const total = Math.min(pdf.numPages, maxPages);
  const thumbnails: { pageNumber: number; dataUrl: string }[] = [];

  for (let i = 1; i <= total; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // @ts-ignore
      await page.render({ canvasContext: ctx, viewport }).promise;
      thumbnails.push({
        pageNumber: i,
        dataUrl: canvas.toDataURL('image/jpeg', 0.8),
      });
    }
  }

  return thumbnails;
}

export async function renderPdfPageToBlob(
  file: File,
  pageNumber: number,
  format: 'image/jpeg' | 'image/png' = 'image/jpeg',
  scale: number = 1.5
): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  // @ts-ignore
  await page.render({ canvasContext: ctx, viewport }).promise;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas to blob failed'));
      },
      format,
      0.92
    );
  });
}
