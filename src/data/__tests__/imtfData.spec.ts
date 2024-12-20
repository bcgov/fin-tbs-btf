import { afterEach, describe, expect, it, vi } from "vitest";
import { InterMinistryTransferFormData } from "../imtfData.ts";
import { PdfjsTestHelpers } from "../../../__mocks__/pdfjs-dist.ts";

// Mock the web worker because "Web Workers are not supported in this environment."
vi.mock("../../workers/pdfjsWorker", () => ({}));
vi.mock("pdfjs-dist");

vi.mock("../../data/imtfMetadata.ts");

const mockPdfFile = new File([""], "filename.pdf", {
  type: "application/pdf",
  lastModified: 1728505460209, //"2024-10-09T00:00:00.000Z"
});
mockPdfFile.arrayBuffer = async () => new ArrayBuffer(0);

describe("InterMinistryTransferFormData", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });
  describe("importFromPDF", () => {
    it("should ignore annotations not present in the metadata and still include the default", async () => {
      // create two fields not in the metadata
      PdfjsTestHelpers.setMockAnnotations([
        { fieldName: "field1", fieldValue: "value1", fieldType: "Tx" },
        { fieldName: "field2", fieldValue: "value2", fieldType: "Tx" },
      ]);

      // Run the service
      const imtd = new InterMinistryTransferFormData();
      await imtd.importFromPdf(mockPdfFile);

      // Assert that those two fields were not in the output
      expect(imtd.fieldsData).toEqual({
        LAST_ACTED_ON_AUDIT_TS: new Date("2024-10-09T00:00:00.000Z"), // pdf timestamp is always included
        field_overrideValue: "test override", // field_overrideValue from metadata is always set
      });
    });

    it("should ignore a field with override info in metadata", async () => {
      PdfjsTestHelpers.setMockAnnotations([
        {
          fieldName: "field_overrideValue",
          fieldValue: "value1",
          fieldType: "Tx",
        },
      ]);

      const imtd = new InterMinistryTransferFormData();
      await imtd.importFromPdf(mockPdfFile);

      expect(imtd.fieldsData).toEqual({
        LAST_ACTED_ON_AUDIT_TS: new Date("2024-10-09T00:00:00.000Z"),
        field_overrideValue: "test override", // override field should be from metadata, not from pdf
      });
    });

    it("should get data from multiple pages in a pdf", async () => {
      PdfjsTestHelpers.setPagesOfMockAnnotations([
        [{ fieldName: "field_text", fieldValue: "value1", fieldType: "Tx" }], // first page
        [{ fieldName: "field_number", fieldValue: "10", fieldType: "Tx" }], // second page
      ]);

      const imtd = new InterMinistryTransferFormData();
      await imtd.importFromPdf(mockPdfFile);

      expect(imtd.fieldsData).toEqual({
        LAST_ACTED_ON_AUDIT_TS: new Date("2024-10-09T00:00:00.000Z"),
        field_overrideValue: "test override",
        field_text: "value1", // first page
        field_number: 10, // second page
      });
    });

    it("should suport number and date types", async () => {
      PdfjsTestHelpers.setMockAnnotations([
        { fieldName: "field_date", fieldValue: "10-Nov-24", fieldType: "Tx" },
        { fieldName: "field_number", fieldValue: "10", fieldType: "Tx" },
      ]);

      const imtd = new InterMinistryTransferFormData();
      await imtd.importFromPdf(mockPdfFile);

      expect(imtd.fieldsData).toEqual({
        LAST_ACTED_ON_AUDIT_TS: new Date("2024-10-09T00:00:00.000Z"),
        field_overrideValue: "test override",
        field_date: new Date("2024-11-10T00:00:00.000Z"),
        field_number: 10,
      });
    });

    it("should parse choice fields that have no dropDownKey in metadata", async () => {
      PdfjsTestHelpers.setMockAnnotations([
        {
          fieldName: "field_text", // field_text does not have a "key" set, so it will not save the key
          fieldValue: ["key2"], // one option selected in the dropdown
          fieldType: "Ch",
          options: [
            { exportValue: "key1", displayValue: "Option 1" },
            { exportValue: "key2", displayValue: "Option 2" },
          ],
        },
      ]);

      const imtd = new InterMinistryTransferFormData();
      await imtd.importFromPdf(mockPdfFile);

      expect(imtd.fieldsData).toEqual({
        LAST_ACTED_ON_AUDIT_TS: new Date("2024-10-09T00:00:00.000Z"),
        field_overrideValue: "test override",
        field_text: "Option 2", // display value is used
      });
    });

    it("should parse choice fields with a dropDownKey in metadata", async () => {
      PdfjsTestHelpers.setMockAnnotations([
        {
          fieldName: "field_dropDown",
          fieldValue: ["key2"], // one option selected in the dropdown
          fieldType: "Ch",
          options: [
            { exportValue: "key1", displayValue: "Option 1" },
            { exportValue: "key2", displayValue: "Option 2" },
          ],
        },
      ]);

      const imtd = new InterMinistryTransferFormData();
      await imtd.importFromPdf(mockPdfFile);

      expect(imtd.fieldsData).toEqual({
        LAST_ACTED_ON_AUDIT_TS: new Date("2024-10-09T00:00:00.000Z"),
        field_overrideValue: "test override",
        field_dropDown: "Option 2",
        field_text: "key2",
      });
    });

    it("should parse choice fields where the key and displayed value are the same", async () => {
      PdfjsTestHelpers.setMockAnnotations([
        {
          fieldName: "field_dropDown",
          fieldValue: ["Option 2"], // one option selected in the dropdown
          fieldType: "Ch",
          options: [
            { exportValue: "Option 1", displayValue: "Option 1" }, //When the value and displayValue are the same, there is no key
            { exportValue: "Option 2", displayValue: "Option 2" },
          ],
        },
      ]);

      const imtd = new InterMinistryTransferFormData();
      await imtd.importFromPdf(mockPdfFile);

      expect(imtd.fieldsData).toEqual({
        LAST_ACTED_ON_AUDIT_TS: new Date("2024-10-09T00:00:00.000Z"),
        field_overrideValue: "test override",
        field_dropDown: "Option 2",
        // since the key is the same as the displayed value, don't export the key even though the metadata says to do so. This is to support older pdfs.
      });
    });

    it("should parse choice fields where no choice was selected", async () => {
      PdfjsTestHelpers.setMockAnnotations([
        {
          fieldName: "field_dropDown",
          fieldValue: [""], // nothing selected
          fieldType: "Ch",
          options: [
            { exportValue: "key1", displayValue: "Option 1" }, //When the value and displayValue are the same, there is no key
            { exportValue: "key2", displayValue: "Option 2" },
          ],
        },
      ]);

      const imtd = new InterMinistryTransferFormData();
      await imtd.importFromPdf(mockPdfFile);

      expect(imtd.fieldsData).toEqual({
        LAST_ACTED_ON_AUDIT_TS: new Date("2024-10-09T00:00:00.000Z"),
        field_overrideValue: "test override",
        field_dropDown: "",
      });
    });

    it("should parse display value instead of user input if needed", async () => {
      PdfjsTestHelpers.setMockAnnotations([
        {
          fieldName: "field_useDisplayedValue",
          fieldValue: "zero", // user entered
          fieldType: "Tx",
          textContent: ["0"],
        },
      ]);

      const imtd = new InterMinistryTransferFormData();
      await imtd.importFromPdf(mockPdfFile);

      expect(imtd.fieldsData).toEqual({
        LAST_ACTED_ON_AUDIT_TS: new Date("2024-10-09T00:00:00.000Z"),
        field_overrideValue: "test override",
        field_useDisplayedValue: "0",
      });
    });

    it("should handle error during PDF parsing", async () => {
      PdfjsTestHelpers.mock.getDocument.mockReturnValue({
        promise: Promise.reject(new Error("PDF parsing error")),
      });

      const imtd = new InterMinistryTransferFormData();
      await expect(imtd.importFromPdf(mockPdfFile)).rejects.toThrow(
        "Cannot read PDF",
      );
    });
  });

  describe("getMissingRequiredFields", () => {
    it("should find all required fields are set", () => {
      const imtd = new InterMinistryTransferFormData();
      imtd.fieldsData = {
        LAST_ACTED_ON_AUDIT_TS: new Date("2024-10-09T00:00:00.000Z"),
        field_text: "test1",
        field_number: 10,
      };

      const missing = imtd.getMissingRequiredFields();
      expect(missing).toEqual([]);
    });
    it("should find any missing required fields", () => {
      const imtd = new InterMinistryTransferFormData();
      imtd.fieldsData = {
        LAST_ACTED_ON_AUDIT_TS: new Date("2024-10-09T00:00:00.000Z"),
      };

      const missing = imtd.getMissingRequiredFields();
      expect(missing).toEqual(["field_text"]);
    });
  });

  describe("getMissingOptionalFields", () => {
    it("should find all optional fields are set", () => {
      const imtd = new InterMinistryTransferFormData();
      imtd.fieldsData = {
        LAST_ACTED_ON_AUDIT_TS: new Date("2024-10-09T00:00:00.000Z"),
        field_text: "test1",
        field_number: 10,
      };

      const missing = imtd.getMissingOptionalFields();
      expect(missing).toEqual([]);
    });
    it("should find any missing optional fields", () => {
      const imtd = new InterMinistryTransferFormData();
      imtd.fieldsData = {
        LAST_ACTED_ON_AUDIT_TS: new Date("2024-10-09T00:00:00.000Z"),
      };

      const missing = imtd.getMissingOptionalFields();
      expect(missing).toEqual(["field_number"]);
    });
  });
});
