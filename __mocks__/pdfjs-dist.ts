import { vi } from "vitest";

const mockGetAnnotations = vi.fn(() => [
  { fieldName: "field3", fieldValue: "value3", fieldType: "Tx" },
  { fieldName: "field4", fieldValue: "value4", fieldType: "Tx" },
]);

const mockGetPage = vi.fn((pageIndex) => ({
  getAnnotations: mockGetAnnotations,
}));

const mockGetDocument = vi.fn(() => ({
  promise: Promise.resolve({
    numPages: 1,
    getPage: mockGetPage,
  }),
}));

export const getDocument = mockGetDocument;

export const PdfjsTestHelpers = {
  /** Spies for testing.
   * Must call vi.restoreAllMocks(); afterEach test. */
  mock: {
    getDocument: mockGetDocument,
    getPage: mockGetPage,
    getAnnotations: mockGetAnnotations,
  },

  /** Mock the annotations of a single page pdf document. */
  setMockAnnotations: (annotations: any[]) => {
    mockGetAnnotations.mockResolvedValue(annotations);
  },

  /** Mock the annotations of a multi-page pdf document. */
  setPagesOfMockAnnotations: (annotations: any[][]) => {
    mockGetPage.mockImplementation((pageIndex) => ({
      getAnnotations: mockGetAnnotations.mockResolvedValue(
        annotations[pageIndex - 1] || [],
      ),
    }));

    mockGetDocument.mockReturnValue({
      promise: Promise.resolve({
        get numPages() {
          return annotations.length;
        },
        getPage: mockGetPage,
      }),
    });
  },
};
