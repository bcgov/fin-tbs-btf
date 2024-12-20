import { describe, it, expect, vi, beforeEach } from "vitest";
import excelService from "../excel-service";
import { saveAs } from "file-saver";
import ExcelJS from "exceljs";
import { workbookToJson } from "../../../e2e/utils/excelUtils";

vi.mock("file-saver", () => ({ saveAs: vi.fn() }));
const mockSaveAs = vi.mocked(saveAs);
vi.mock("../../data/imtfMetadata.ts");

// Mock the `xlsx` property on `ExcelJS.Workbook.prototype`
const xlsxMock = {
  writeBuffer: vi.fn(),
  load: vi.fn(),
  readFile: vi.fn(),
  read: vi.fn(),
  writeFile: vi.fn(),
  write: vi.fn(),
};

// helper function
function stringToDate(date: string, match: RegExp) {
  const x = date!.match(match);
  const y = x?.slice(1).map((a) => parseInt(a)) || [];
  return new Date(y[0], y[1] - 1, y[2], y[3], y[4], y[5]);
}

describe("excelService", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should format extracted data correctly and write to an Excel file", async () => {
    const inputData: Record<string, string | number | Date | null>[] = [
      {
        LAST_ACTED_ON_AUDIT_TS: new Date(2024, 1, 2, 3, 4, 5),
        field_text: "row1",
        field_number: 1,
        field_date: new Date(2024, 1, 2, 3, 4, 5),
        field_dropDown: "dd",
        field_horizontalAlign: "ha",
        field_overrideValue: "ov",
        field_useDisplayedValue: "dv",
      },
      {
        LAST_ACTED_ON_AUDIT_TS: new Date(2024, 1, 2, 3, 4, 5),
        field_text: "row2",
        field_number: 2,
        field_date: new Date(2024, 1, 2, 3, 4, 5),
        field_dropDown: "dd",
        field_horizontalAlign: "ha",
        field_overrideValue: "ov",
        field_useDisplayedValue: "dv",
      },
    ];

    const audit = {
      createdDate: "2024-10-01T12:34:56Z",
      loginDate: "2024-10-01T08:00:00Z",
      idir: "JDoe123",
    };

    const xlsxWriteBufferSpy = vi.spyOn(
      ExcelJS.Workbook.prototype,
      "xlsx",
      "get",
    );

    // Run the service
    await excelService.exportToExcel(inputData, audit);

    // Get the workbook and make sure it's right
    const workbook = xlsxWriteBufferSpy.mock.contexts[0] as ExcelJS.Workbook;
    const book = workbookToJson(workbook);
    expect(book).toEqual([
      [
        [
          "LAST_ACTED_ON_AUDIT_TS",
          "field_text",
          "field_number",
          "field_date",
          "field_dropDown",
          "field_horizontalAlign",
          "field_overrideValue",
          "field_useDisplayedValue",
        ],
        [
          new Date(2024, 1, 2, 3, 4, 5),
          "row1",
          1,
          new Date(2024, 1, 2, 3, 4, 5),
          "dd",
          "ha",
          "ov",
          "dv",
        ],
        [
          new Date(2024, 1, 2, 3, 4, 5),
          "row2",
          2,
          new Date(2024, 1, 2, 3, 4, 5),
          "dd",
          "ha",
          "ov",
          "dv",
        ],
      ],
      [
        ["Label", "Value"],
        ["createdDate", "2024-10-01T12:34:56Z"],
        ["loginDate", "2024-10-01T08:00:00Z"],
        ["idir", "JDoe123"],
      ],
    ]);

    // Make sure the horizontal alignment is correct
    expect(
      workbook.getWorksheet(1)?.getColumnKey("field_horizontalAlign").alignment
        ?.horizontal,
    ).toBe("right");

    // Get the file name and make sure it's right
    const date = stringToDate(
      mockSaveAs.mock.calls[0][1]!,
      /TBS_BTF_output_(\d{4})-(\d{2})-(\d{2})_(\d{2})-(\d{2})-(\d{2})\.xlsx/,
    );
    expect(date.getTime() / 10000).toBeCloseTo(new Date().getTime() / 10000, 0); // to be within 10 seconds
  });

  it("should throw an error if something goes wrong during Excel file creation", async () => {
    xlsxMock.writeBuffer.mockRejectedValue(new Error("excel failure"));
    vi.spyOn(ExcelJS.Workbook.prototype, "xlsx", "get").mockReturnValue(
      xlsxMock,
    );

    const inputData: Record<string, string | number | Date | null>[] = [];
    const audit = {};

    // Expect the function to throw when an error occurs
    await expect(excelService.exportToExcel(inputData, audit)).rejects.toThrow(
      "Failed to create Excel file",
    );

    // Ensure SaveAs was not called
    expect(mockSaveAs).not.toHaveBeenCalled();
  });
});
