import { describe, it, expect, vi, beforeEach } from 'vitest';
import excelService from '../excel-service';

// Mock the XLSX library methods
const mockXlsxJsonToSheet = vi.fn();
const mockXlsxBookNew = vi.fn();
const mockXlsxBookAppendSheet = vi.fn();
const mockXlsxWriteFile = vi.fn();
vi.mock('xlsx', () => ({
  utils: {
    json_to_sheet: (...args: any) => mockXlsxJsonToSheet(...args),
    book_new: (...args: any) => mockXlsxBookNew(...args),
    book_append_sheet: (...args: any) => mockXlsxBookAppendSheet(...args),
  },
  writeFile: (...args: any) => mockXlsxWriteFile(...args),
}));

describe('excelService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should format extracted data correctly and write to an Excel file', async () => {
    const extractedData = [
      { submissionId: '123', BUDGET2_DOUBTFUL_ACCT_AMT: 500 },
      { submissionId: '124', BUDGET2_DOUBTFUL_ACCT_AMT: 600 },
    ];

    const columnOrder = ['submissionId', 'BUDGET2_DOUBTFUL_ACCT_AMT'];

    const audit = {
      createdDate: '2024-10-01T12:34:56Z',
      loginDate: '2024-10-01T08:00:00Z',
      idir: 'JDoe123',
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
    await excelService.exportToExcel(extractedData, columnOrder, audit);

    // Assert the json_to_sheet function was called with correct data
    expect(mockXlsxJsonToSheet).toHaveBeenCalledTimes(2);

    // Verify the form data is passed in the right format
    expect(mockXlsxJsonToSheet).toHaveBeenNthCalledWith(
      1,
      [
        { submissionId: '123', BUDGET2_DOUBTFUL_ACCT_AMT: 500 },
        { submissionId: '124', BUDGET2_DOUBTFUL_ACCT_AMT: 600 },
      ],
      { header: columnOrder },
    );

    // Verify the audit data sheet is created with the correct structure
    expect(mockXlsxJsonToSheet).toHaveBeenNthCalledWith(2, [
      {
        'Created/Modified Date': '2024-10-01T12:34:56Z',
        IDIR: 'JDoe123',
        'Login Date': '2024-10-01T08:00:00Z',
      },
    ]);

    // Verify that the book_append_sheet method is called twice
    expect(mockXlsxBookAppendSheet).toHaveBeenCalledTimes(2);
    expect(mockXlsxBookAppendSheet).toHaveBeenNthCalledWith(
      1,
      mockWorkbook,
      mockWorksheet,
      'form_data_cd_merge2',
    );
    expect(mockXlsxBookAppendSheet).toHaveBeenNthCalledWith(
      2,
      mockWorkbook,
      mockAuditWorksheet,
      'Audit',
    );

    // Verify that the writeFile method was called to create the Excel file
    expect(mockXlsxWriteFile).toHaveBeenCalledWith(
      mockWorkbook,
      'report.xlsx',
      {
        compression: true,
      },
    );
  });

  it('should set the correct column widths for form and audit sheets', async () => {
    const extractedData = [
      { submissionId: '123', BUDGET2_DOUBTFUL_ACCT_AMT: 500 },
    ];

    const columnOrder = ['submissionId', 'BUDGET2_DOUBTFUL_ACCT_AMT'];

    const audit = {
      createdDate: '2024-10-01T12:34:56Z',
      loginDate: '2024-10-01T08:00:00Z',
      idir: 'JDoe123',
    };

    const mockWorksheet = { '!cols': [] };
    const mockAuditWorksheet = { '!cols': [] };
    const mockWorkbook = {};

    // Mock XLSX library functions
    mockXlsxJsonToSheet
      .mockReturnValueOnce(mockWorksheet) // Form data sheet
      .mockReturnValueOnce(mockAuditWorksheet); // Audit sheet
    mockXlsxBookNew.mockReturnValue(mockWorkbook);

    // Run the service
    await excelService.exportToExcel(extractedData, columnOrder, audit);

    // Check that the form data worksheet has column widths set
    expect(mockWorksheet['!cols']).toEqual([
      { wch: expect.any(Number) }, // Width for 'submissionId'
      { wch: expect.any(Number) }, // Width for 'BUDGET2_DOUBTFUL_ACCT_AMT'
    ]);

    // Check that the audit worksheet has predefined static column widths
    expect(mockAuditWorksheet['!cols']).toEqual([
      { wch: 25 }, // Static width for Created/Modified Date
      { wch: 15 }, // Static width for IDIR
      { wch: 25 }, // Static width for Login Date
    ]);
  });

  it('should throw an error if something goes wrong during Excel file creation', async () => {
    const extractedData: any[] = [];
    const columnOrder: string[] = [];
    const audit = { createdDate: '', loginDate: '', idir: '' };

    // Expect the function to throw when an error occurs
    await expect(
      excelService.exportToExcel(extractedData, columnOrder, audit),
    ).rejects.toThrow('Failed to create Excel file');

    // Ensure writeFile was called before the error occurred
    expect(mockXlsxWriteFile).not.toHaveBeenCalled();
  });
});
