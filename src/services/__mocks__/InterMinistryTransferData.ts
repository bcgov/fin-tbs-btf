import { vi } from "vitest";

// __mocks__/InterMinistryTransferData.ts
export class InterMinistryTransferData {
  fieldsData: Record<string, string | number | Date | null> = {};

  async importFromPDF(): Promise<void> {
    this.fieldsData = {
      field1: "value1",
      field2: "value2",
    };
  }

  getMissingRequiredFields(): string[] {
    return [];
  }

  getMissingOptionalFields(): string[] {
    return [];
  }
}

export const ImtdTestHelpers = {
  /** Spies for testing.
   * Must call vi.restoreAllMocks(); afterEach test.  */
  getSpies() {
    const spies = {
      importFromPdfSpy: vi.spyOn(
        InterMinistryTransferData.prototype,
        "importFromPDF",
      ),
      getMissingRequiredFieldsSpy: vi.spyOn(
        InterMinistryTransferData.prototype,
        "getMissingRequiredFields",
      ),
      getMissingOptionalFieldsSpy: vi.spyOn(
        InterMinistryTransferData.prototype,
        "getMissingOptionalFields",
      ),
    };

    return spies;
  },

  createSamplePdf(
    mockGetDocument: any,
    values: {
      fieldName: string;
      fieldValue: string;
      fieldType: string;
    }[],
  ) {
    // Mock getDocument and PDF document
    const mockPdfDoc = {
      numPages: 1,
      getPage: vi.fn().mockResolvedValue({
        getAnnotations: vi.fn().mockResolvedValue(values),
      }),
    };
    mockGetDocument.mockReturnValue({
      promise: Promise.resolve(mockPdfDoc),
    });
  },
};
