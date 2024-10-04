import * as pdfjs from 'pdfjs-dist';
import '../workers/pdfjsWorker';

const pdfService = {
  /**
   * Handle the file input and parse each PDF to extract form fields.
   * @param files - The files selected by the user (multiple PDFs).
   * @returns - Returns an array of extracted data for each PDF.
   */
  async handleFiles(files: FileList): Promise<any[]> {
    const extractedData: any[] = [];

    for (const file of Array.from(files)) {
      const arrayBuffer = await file.arrayBuffer();
      const fields = await this.parsePDF(arrayBuffer);
      extractedData.push(fields);
    }

    return extractedData;
  },

  /**
   * Parse a PDF file and extract the form fields.
   * @param arrayBuffer - The PDF file as an array buffer.
   * @returns - Returns an object containing extracted form fields.
   */
  async parsePDF(arrayBuffer: ArrayBuffer): Promise<any> {
    try {
      const pdfDoc = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const fieldsData: any = {};

      // Loop through each page in the PDF to extract form fields from annotations
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const annotations = await page.getAnnotations();
        pdfServicePrivate.extractFieldsFromAnnotations(annotations, fieldsData);
      }

      return fieldsData;
    } catch (error) {
      console.error('Error parsing PDF:', error);
      throw error;
    }
  },
};

const pdfServicePrivate = {
  /**
   * Extracts form fields from PDF annotations and adds them to fieldsData
   * @param annotations - The annotations on the PDF page.
   * @param fieldsData - The object to store the extracted form data.
   */
  extractFieldsFromAnnotations(annotations: any[], fieldsData: any): any {
    annotations.forEach((annotation) => {
      if (annotation.hasOwnProperty('fieldName')) {
        if (annotation.fieldType === 'Ch' && annotation.options) {
          // Dropdown field: Get the selected option's text
          const selectedOption = annotation.fieldValue[0];
          const dropdownText =
            annotation.options.find(
              (option: any) => option.value === selectedOption,
            )?.displayValue || selectedOption;
          fieldsData[annotation.fieldName] = dropdownText;
        } else {
          // Other fields (e.g., text inputs)
          fieldsData[annotation.fieldName] = annotation.fieldValue;
        }
      }
    });
  },
};

export default pdfService;
