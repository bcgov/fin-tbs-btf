import { vi } from "vitest";

// __mocks__/InterMinistryTransferFormData.ts
export class InterMinistryTransferFormData {
  fieldsData: Record<string, string | number | Date | null> = {};

  async importFromPdf(): Promise<void> {
    this.fieldsData = {
      field1: "value1",
      field2: "value2",
    };
  }

  getMissingRequiredFields(): string[] {
    return [];
  }

  getWarnings(): Record<string, string[]> {
    return {};
  }
}

export const ImtfdTestHelpers = {
  /** Spies for testing.
   * Must call vi.restoreAllMocks(); afterEach test.  */
  getSpies() {
    const spies = {
      importFromPdf: vi.spyOn(
        InterMinistryTransferFormData.prototype,
        "importFromPdf",
      ),
      getMissingRequiredFields: vi.spyOn(
        InterMinistryTransferFormData.prototype,
        "getMissingRequiredFields",
      ),
      getWarnings: vi.spyOn(
        InterMinistryTransferFormData.prototype,
        "getWarnings",
      ),
    };

    return spies;
  },
};
