import * as pdfjs from "pdfjs-dist";
import "../workers/pdfjsWorker";

export class PdfParseError extends Error {}

const pdfService = {
  /**
   * Parse a PDF file and extract the form fields.
   * @param file - The PDF file
   * @param expectedFields - (optional) The minimum expected fields to be considered valid
   * @returns - Returns an object containing extracted form fields.
   */
  async parsePDF(
    file: File,
    expectedFields: string[] = [],
  ): Promise<Record<string, string>> {
    const fieldsData: Record<string, string> = {};

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfjs.getDocument({ data: arrayBuffer }).promise;

      // Loop through each page in the PDF to extract form fields from annotations
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const annotations = await page.getAnnotations();
        pdfServicePrivate.extractFieldsFromAnnotations(annotations, fieldsData);
      }
    } catch (error) {
      throw new PdfParseError("Cannot read PDF");
    }

    //check if pdf has all the expected fields
    const hasAllFields = expectedFields.every((v) =>
      fieldsData.hasOwnProperty(v),
    );
    if (!hasAllFields) {
      throw new PdfParseError("PDF missing required fields");
    }

    return fieldsData;
  },
};

const pdfServicePrivate = {
  /**
   * Extracts form fields from PDF annotations and adds them to fieldsData
   * @param annotations - The annotations on the PDF page.
   * @param fieldsData - The object to store the extracted form data.
   */
  extractFieldsFromAnnotations(
    annotations: any[],
    fieldsData: Record<string, string>,
  ) {
    annotations.forEach((annotation) => {
      if (annotation.hasOwnProperty("fieldName")) {
        if (annotation.fieldType === "Ch" && annotation.options) {
          // Dropdowns (ie Choices) have two values, the 'key' of the selected value, and the value 'displayed' to the user
          const key = annotation.fieldValue[0];
          const displayed =
            annotation.options.find((option: any) => option.exportValue === key)
              ?.displayValue || key;
          fieldsData[annotation.fieldName] = displayed;

          // If the key and the displayed value are different, then we may want to keep both values
          if (key != displayed) {
            if (annotation.fieldName == "FROM_CLIENT_NAME")
              fieldsData["FROM_CLIENT_CD"] = key;
            if (annotation.fieldName == "TO_CLIENT_NAME")
              fieldsData["TO_CLIENT_CD"] = key;
          }
        } else {
          // Other fields (e.g., text inputs)
          fieldsData[annotation.fieldName] = annotation.fieldValue;
        }
      }
    });
  },
};

export default pdfService;
