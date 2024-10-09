import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import excelService from "../excel-service";

// Mock the XLSX library methods
const mockXlsxJsonToSheet = vi.fn();
const mockXlsxBookNew = vi.fn();
const mockXlsxBookAppendSheet = vi.fn();
const mockXlsxWriteFile = vi.fn();
vi.mock("xlsx", () => ({
  utils: {
    json_to_sheet: (...args: any) => mockXlsxJsonToSheet(...args),
    book_new: (...args: any) => mockXlsxBookNew(...args),
    book_append_sheet: (...args: any) => mockXlsxBookAppendSheet(...args),
  },
  writeFile: (...args: any) => mockXlsxWriteFile(...args),
}));

describe("excelService", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    // restoring date after each test run
    vi.useRealTimers();
  });

  it("should format extracted data correctly and write to an Excel file", async () => {
    const date = new Date(2024, 1, 2, 3, 4, 5);
    vi.setSystemTime(date);

    const extractedData = [
      { submissionId: "123", BUDGET2_DOUBTFUL_ACCT_AMT: 500 },
      { submissionId: "124", BUDGET2_DOUBTFUL_ACCT_AMT: 600 },
    ];

    const columnOrder = ["submissionId", "BUDGET2_DOUBTFUL_ACCT_AMT"];
    const columnDefaults = { submissionId: "N/A", STATUS: "Pending" };

    const audit = {
      createdDate: "2024-10-01T12:34:56Z",
      loginDate: "2024-10-01T08:00:00Z",
      idir: "JDoe123",
    };

    const mockWorksheet = {};
    const mockAuditWorksheet = {};
    const mockWorkbook = {};

    // Mock XLSX library functions
    mockXlsxJsonToSheet
      .mockReturnValueOnce(mockWorksheet) // First call for form data
      .mockReturnValueOnce(mockAuditWorksheet); // Second call for audit data
    mockXlsxBookNew.mockReturnValue(mockWorkbook);

    // Run the service
    await excelService.exportToExcel(
      extractedData,
      columnOrder,
      columnDefaults,
      audit,
    );

    // Assert the json_to_sheet function was called with correct data
    expect(mockXlsxJsonToSheet).toHaveBeenCalledTimes(2); //DATA sheet, and again for AUDIT sheet
    expect(mockXlsxJsonToSheet).toHaveBeenNthCalledWith(
      1,
      [
        {
          submissionId: "N/A", // test defualt to N/A
          BUDGET2_DOUBTFUL_ACCT_AMT: 500,
          STATUS: "Pending", //test default
        },
        {
          submissionId: "N/A",
          BUDGET2_DOUBTFUL_ACCT_AMT: 600,
          STATUS: "Pending",
        },
      ],
      { header: columnOrder },
    );
    expect(mockXlsxJsonToSheet).toHaveBeenNthCalledWith(2, [
      {
        "Created/Modified Date": "2024-10-01T12:34:56Z",
        IDIR: "JDoe123",
        "Login Date": "2024-10-01T08:00:00Z",
      },
    ]);

    // Verify that the book_append_sheet method is called twice
    expect(mockXlsxBookAppendSheet).toHaveBeenCalledTimes(2); //DATA sheet, and again for AUDIT sheet
    expect(mockXlsxBookAppendSheet).toHaveBeenNthCalledWith(
      1,
      mockWorkbook,
      mockWorksheet,
      "DATA",
    );
    expect(mockXlsxBookAppendSheet).toHaveBeenNthCalledWith(
      2,
      mockWorkbook,
      mockAuditWorksheet,
      "METADATA",
    );

    // Verify that the writeFile method was called with correct filename and compression options
    expect(mockXlsxWriteFile).toHaveBeenCalledWith(
      mockWorkbook,
      "TBS_BTF_output_2024-02-02_03-04-05.xlsx",
      {
        compression: true,
      },
    );
  });

  it("should throw an error if something goes wrong during Excel file creation", async () => {
    const extractedData: any[] = [];
    const columnOrder: string[] = [];
    const audit = { createdDate: "", loginDate: "", idir: "" };
    const columnDefaults = { submissionId: "N/A", STATUS: "Pending" };

    // Expect the function to throw when an error occurs
    await expect(
      excelService.exportToExcel(
        extractedData,
        columnOrder,
        columnDefaults,
        audit,
      ),
    ).rejects.toThrow("Failed to create Excel file");

    // Ensure writeFile was not called
    expect(mockXlsxWriteFile).not.toHaveBeenCalled();
  });
});
