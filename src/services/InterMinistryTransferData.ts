import * as pdfjs from "pdfjs-dist";
import "../workers/pdfjsWorker";
import "@js-joda/core";
import { DateTimeFormatter, Instant, LocalDate, ZoneId } from "@js-joda/core";
import "@js-joda/timezone";
import {
  fieldsMetadata,
  fieldsMetadataLookupByName,
  pdfOptionalFields,
  pdfRequiredFields,
} from "../constants";
import { Locale } from "@js-joda/locale_en";
import { Annotation } from "../types/pdfjs";

export class PdfParseError extends Error {}

export class InterMinistryTransferData {
  fieldsData: Record<string, string | number | Date | null> = {};

  /**
   * Parse a PDF file and extract the form fields.
   * @param file - The PDF file
   * @returns - Returns an object containing extracted form fields
   */
  async importFromPDF(file: File): Promise<void> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfjs.getDocument({ data: arrayBuffer }).promise;

      // Loop through each page in the PDF to extract form fields from annotations
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const annotations = (await page.getAnnotations()) as Annotation[];
        this.extractFieldsFromAnnotations(annotations);
      }

      this.setField(
        "LAST_ACTED_ON_AUDIT_TS",
        this.epocMilliToPdfDateStr(file.lastModified),
      );

      this.enforceOverrideValues();
    } catch (error) {
      throw new PdfParseError("Cannot read PDF");
    }
  }

  /** Get the names of the required fields that are missing. */
  getMissingRequiredFields(): string[] {
    const missing = pdfRequiredFields.filter(
      (k) => !this.fieldsData.hasOwnProperty(k),
    );
    return missing;
  }

  /** Get the names of the optional fields that are missing. */
  getMissingOptionalFields(): string[] {
    const missing = pdfOptionalFields.filter(
      (k) => !this.fieldsData.hasOwnProperty(k),
    );
    return missing;
  }

  /** Set the value of the field while adhering to the rules. */
  private setField(name: string, value: string) {
    const meta = fieldsMetadataLookupByName.get(name);
    if (!meta) return;

    // change the type(string/number/date) to the correct one
    if (meta.overrideValue != null) this.fieldsData[name] = meta.overrideValue;
    else if (value == null) this.fieldsData[name] = value;
    else if (meta.type == "number")
      this.fieldsData[name] = Number.parseInt(value);
    else if (meta.type == "date") {
      const date = LocalDate.parse(
        value,
        DateTimeFormatter.ofPattern("dd'-'MMM'-'yy").withLocale(Locale.US),
      ).format(DateTimeFormatter.ISO_LOCAL_DATE);
      this.fieldsData[name] = new Date(date);
    } else this.fieldsData[name] = value;
  }

  /** Ensure all the properties (and any missing properties) have
   * the correct overridden value as required by the metadata.  */
  private enforceOverrideValues() {
    fieldsMetadata.forEach((meta) => {
      if (meta.overrideValue != null)
        this.fieldsData[meta.name] = meta.overrideValue;
    });
  }

  /**
   * Extracts form fields from PDF annotations and adds them to fieldsData.
   * @param annotations - The annotations on the PDF page
   * @param fieldsData - The object to store the extracted form data
   */
  private extractFieldsFromAnnotations(annotations: Annotation[]) {
    annotations.forEach((annotation) => {
      if (!annotation.hasOwnProperty("fieldName")) return;
      if (!fieldsMetadataLookupByName.has(annotation.fieldName)) return;

      if (annotation.fieldType === "Ch" && annotation.options) {
        // Dropdowns (ie Choices) have two values, the 'key' of the selected value, and the value 'displayed' to the user
        const key = annotation.fieldValue[0];
        const displayed =
          annotation.options.find((option: any) => option.exportValue === key)
            ?.displayValue || key;
        this.setField(annotation.fieldName, displayed);

        // If the key and the displayed value are different, then we may want to keep both values
        const keyName = fieldsMetadataLookupByName.get(
          annotation.fieldName,
        )?.dropDownKey;
        if (key != displayed && keyName) {
          this.setField(keyName, key);
        }
      } else {
        // Other fields (e.g., text inputs)
        if (
          fieldsMetadataLookupByName.get(annotation.fieldName)
            ?.useDisplayedValue
        )
          this.setField(annotation.fieldName, annotation?.textContent?.[0]);
        else this.setField(annotation.fieldName, annotation.fieldValue);
      }
    });
  }

  /** Convert epocMilli (eg. from a file modified time) to the common document format. */
  private epocMilliToPdfDateStr(epocMilli: number): string {
    const date = Instant.ofEpochMilli(epocMilli)
      .atZone(ZoneId.UTC)
      .format(DateTimeFormatter.ofPattern("dd-MMM-yy").withLocale(Locale.US));

    return date;
  }
}
