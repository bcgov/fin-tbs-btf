import { beforeEach, describe, expect, it, vi } from "vitest";
import pdfService from "../pdf-service";

// Mock the web worker because "Web Workers are not supported in this environment."
vi.mock("../../workers/pdfjsWorker", () => ({}));

// Mock the necessary parts of pdfjs
const mockGetDocument = vi.fn();
vi.mock("pdfjs-dist", () => ({
  getDocument: (...args: any) => mockGetDocument(...args),
}));

const mockPdfFile = new File([""], "filename.pdf", {
  type: "application/pdf",
});
mockPdfFile.arrayBuffer = async () => new ArrayBuffer(0);

describe("pdfService", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should handle parsing PDF and extracting form fields", async () => {
    // Mock getDocument and PDF document
    const mockPdfDoc = {
      numPages: 2,
      getPage: vi.fn().mockResolvedValue({
        getAnnotations: vi.fn().mockResolvedValue([
          { fieldName: "field1", fieldValue: "value1", fieldType: "Tx" },
          { fieldName: "field2", fieldValue: "value2", fieldType: "Tx" },
        ]),
      }),
    };
    mockGetDocument.mockReturnValue({
      promise: Promise.resolve(mockPdfDoc),
    });

    // Run the service
    const fields = await pdfService.parsePDF(mockPdfFile);

    // Assertions
    expect(fields).toEqual({
      field1: "value1",
      field2: "value2",
    });

    const arrayBuffer = await mockPdfFile.arrayBuffer();
    expect(mockGetDocument).toHaveBeenCalledWith({
      data: arrayBuffer,
    });
    expect(mockPdfDoc.getPage).toHaveBeenCalledWith(1);
    expect(mockPdfDoc.getPage).toHaveBeenCalledWith(2);
  });

  it('should handle parsing choice fields (fieldType: "Ch")', async () => {
    // Mock choice field annotation with options
    const mockPdfDoc = {
      numPages: 1,
      getPage: vi.fn().mockResolvedValue({
        getAnnotations: vi.fn().mockResolvedValue([
          {
            fieldName: "dropdownField",
            fieldValue: ["option2"], // The selected option's value
            fieldType: "Ch",
            options: [
              { value: "option1", displayValue: "Option 1" },
              { value: "option2", displayValue: "Option 2" },
            ],
          },
        ]),
      }),
    };
    mockGetDocument.mockReturnValue({
      promise: Promise.resolve(mockPdfDoc),
    });

    // Run the service
    const fields = await pdfService.parsePDF(mockPdfFile);

    // Assertions: Ensure the correct option is selected
    expect(fields).toEqual({
      dropdownField: "option2", // This should match the displayValue of the selected option
    });

    const arrayBuffer = await mockPdfFile.arrayBuffer();
    expect(mockGetDocument).toHaveBeenCalledWith({ data: arrayBuffer });
    expect(mockPdfDoc.getPage).toHaveBeenCalledWith(1);
  });

  it("should handle empty choice", async () => {
    // Mock choice field annotation with options
    const mockPdfDoc = {
      numPages: 1,
      getPage: vi.fn().mockResolvedValue({
        getAnnotations: vi.fn().mockResolvedValue([
          {
            fieldName: "dropdownField",
            fieldValue: [""], // The selected option's value
            fieldType: "Ch",
            options: [
              { value: "option1", displayValue: "Option 1" },
              { value: "option2", displayValue: "Option 2" },
            ],
          },
        ]),
      }),
    };
    mockGetDocument.mockReturnValue({
      promise: Promise.resolve(mockPdfDoc),
    });

    // Run the service
    const fields = await pdfService.parsePDF(mockPdfFile);

    // Assertions: Ensure the correct option is selected
    expect(fields).toEqual({
      dropdownField: "", // This should match the fieldValue and not any of the options
    });

    const arrayBuffer = await mockPdfFile.arrayBuffer();
    expect(mockGetDocument).toHaveBeenCalledWith({ data: arrayBuffer });
    expect(mockPdfDoc.getPage).toHaveBeenCalledWith(1);
  });

  it("should handle error during PDF parsing", async () => {
    // Mock getDocument to throw an error
    mockGetDocument.mockReturnValue({
      promise: Promise.reject(new Error("PDF parsing error")),
    });

    // Catch the error
    await expect(pdfService.parsePDF(mockPdfFile)).rejects.toThrow(
      "Cannot read PDF",
    );
  });
});
