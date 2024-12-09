import type { Locator, Page } from "@playwright/test";
import { readFile } from "node:fs/promises";

export type FileDropInfo = {
  path: string;
  fileName: string;
  mimeType: string;
};

type Base64FileData = {
  base64EncodedFile: string;
  fileName: string;
  mimeType: string;
};

/** Drag and drop one or more files onto the page */
export const dragAndDropFile = async (
  page: Page,
  dropDiv: Locator,
  files: FileDropInfo[],
) => {
  const buffers: Base64FileData[] = await Promise.all(
    files.map(async (file) => {
      const base64 = (await readFile(file.path)).toString("base64");
      return {
        base64EncodedFile: base64,
        fileName: file.fileName,
        mimeType: file.mimeType,
      };
    }),
  );

  const dataTransfer = await page.evaluateHandle(async (buffers) => {
    const dt = new DataTransfer();

    for (const file of buffers) {
      const res = await fetch(
        `data:application/octet-stream;base64,${file.base64EncodedFile}`,
      );
      const blobData = await res.blob();
      dt.items.add(
        new File([blobData], file.fileName, {
          type: file.mimeType,
        }),
      );
    }
    return dt;
  }, buffers);

  await dropDiv.dispatchEvent("drop", { dataTransfer });
};
