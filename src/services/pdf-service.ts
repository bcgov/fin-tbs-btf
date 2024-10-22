import * as pdfjs from "pdfjs-dist";
import "../workers/pdfjsWorker";
import "@js-joda/core";
import {
  DateTimeFormatter,
  Instant,
  ZonedDateTime,
  ZoneId,
} from "@js-joda/core";
import { Locale } from "@js-joda/locale_en";
import "@js-joda/timezone";

export class PdfParseError extends Error {}

const pdfService = {
  /**
   * Parse a PDF file and extract the form fields.
   * @param file - The PDF file
   * @returns - Returns an object containing extracted form fields
   */
  async parsePDF(file: File): Promise<Record<string, string>> {
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

      fieldsData.LAST_ACTED_ON_AUDIT_TS =
        pdfServicePrivate.epocMilliToAccessDateStr(file.lastModified);
    } catch (error) {
      throw new PdfParseError("Cannot read PDF");
    }
    return fieldsData;
  },

  /**
   * Get the fields that are missing from a PDF.
   * @param fieldsData - The output from parsePDF
   * @param expectedFields - List of fields to check for existence
   * @returns - A list of missing fields
   */
  getMissingFields(
    fieldsData: Record<string, string>,
    expectedFields: string[],
  ): string[] {
    const missing = expectedFields.filter((k) => !fieldsData.hasOwnProperty(k));
    return missing;
  },
};

const pdfServicePrivate = {
  /**
   * Extracts form fields from PDF annotations and adds them to fieldsData.
   * @param annotations - The annotations on the PDF page
   * @param fieldsData - The object to store the extracted form data
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

  /** Convert epocMilli (eg. from a file modified time) to a format for Microsoft Access. */
  epocMilliToAccessDateStr(epocMilli: number): string {
    return ZonedDateTime.ofInstant(
      Instant.ofEpochMilli(epocMilli),
      ZoneId.of("America/Vancouver"),
    )
      .format(
        DateTimeFormatter.ofPattern("yyyy-MM-dd hh:mm:ss a").withLocale(
          Locale.CANADA,
        ),
      )
      .replace("a.m.", "AM")
      .replace("p.m.", "PM");
  },
};

export default pdfService;
