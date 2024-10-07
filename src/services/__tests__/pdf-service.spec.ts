import { describe, it, expect, vi, beforeEach } from 'vitest';
import pdfService from '../pdf-service';

// Mock the web worker because "Web Workers are not supported in this environment."
vi.mock('../../workers/pdfjsWorker', () => ({}));

// Mock the necessary parts of pdfjs
const mockGetDocument = vi.fn();
vi.mock('pdfjs-dist', () => ({
  getDocument: (...args: any) => mockGetDocument(...args),
}));

describe('pdfService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should handle parsing PDF and extracting form fields', async () => {
    const mockArrayBuffer = new ArrayBuffer(8);

    // Mock getDocument and PDF document
    const mockPdfDoc = {
      numPages: 2,
      getPage: vi.fn().mockResolvedValue({
        getAnnotations: vi.fn().mockResolvedValue([
          { fieldName: 'field1', fieldValue: 'value1', fieldType: 'Tx' },
          { fieldName: 'field2', fieldValue: 'value2', fieldType: 'Tx' },
        ]),
      }),
    };
    mockGetDocument.mockReturnValue({
      promise: Promise.resolve(mockPdfDoc),
    });

    // Run the service
    const fields = await pdfService.parsePDF(mockArrayBuffer);

    // Assertions
    expect(fields).toEqual({
      field1: 'value1',
      field2: 'value2',
    });

    expect(mockGetDocument).toHaveBeenCalledWith({ data: mockArrayBuffer });
    expect(mockPdfDoc.getPage).toHaveBeenCalledWith(1);
    expect(mockPdfDoc.getPage).toHaveBeenCalledWith(2);
  });

  it('should handle multiple files', async () => {
    // Mock FileList and File
    const mockFile = new File(['%PDF'], 'mock.pdf', {
      type: 'application/pdf',
    });
    const mockFiles = {
      length: 1,
      item: (index: number) => mockFile,
      0: mockFile,
    } as unknown as FileList;

    // Mock arrayBuffer
    const mockArrayBuffer = new ArrayBuffer(8);
    mockFile.arrayBuffer = vi.fn().mockResolvedValue(mockArrayBuffer);

    // Mock getDocument and PDF document
    const mockPdfDoc = {
      numPages: 1,
      getPage: vi.fn().mockResolvedValue({
        getAnnotations: vi
          .fn()
          .mockResolvedValue([
            { fieldName: 'field1', fieldValue: 'value1', fieldType: 'Tx' },
          ]),
      }),
    };
    mockGetDocument.mockReturnValue({
      promise: Promise.resolve(mockPdfDoc),
    });

    // Run the service
    const result = await pdfService.handleFiles(mockFiles);

    // Assertions
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      field1: 'value1',
    });

    expect(mockFile.arrayBuffer).toHaveBeenCalledTimes(1);
    expect(mockGetDocument).toHaveBeenCalledWith({ data: mockArrayBuffer });
    expect(mockPdfDoc.getPage).toHaveBeenCalledWith(1);
  });

  it('should handle parsing choice fields (fieldType: "Ch")', async () => {
    const mockArrayBuffer = new ArrayBuffer(8);

    // Mock choice field annotation with options
    const mockPdfDoc = {
      numPages: 1,
      getPage: vi.fn().mockResolvedValue({
        getAnnotations: vi.fn().mockResolvedValue([
          {
            fieldName: 'dropdownField',
            fieldValue: ['option2'], // The selected option's value
            fieldType: 'Ch',
            options: [
              { value: 'option1', displayValue: 'Option 1' },
              { value: 'option2', displayValue: 'Option 2' },
            ],
          },
        ]),
      }),
    };
    mockGetDocument.mockReturnValue({
      promise: Promise.resolve(mockPdfDoc),
    });

    // Run the service
    const fields = await pdfService.parsePDF(mockArrayBuffer);

    // Assertions: Ensure the correct option is selected
    expect(fields).toEqual({
      dropdownField: 'Option 2', // This should match the displayValue of the selected option
    });

    expect(mockGetDocument).toHaveBeenCalledWith({ data: mockArrayBuffer });
    expect(mockPdfDoc.getPage).toHaveBeenCalledWith(1);
  });

  it('should handle empty choice', async () => {
    const mockArrayBuffer = new ArrayBuffer(8);

    // Mock choice field annotation with options
    const mockPdfDoc = {
      numPages: 1,
      getPage: vi.fn().mockResolvedValue({
        getAnnotations: vi.fn().mockResolvedValue([
          {
            fieldName: 'dropdownField',
            fieldValue: '', // The selected option's value
            fieldType: 'Ch',
            options: [
              { value: 'option1', displayValue: 'Option 1' },
              { value: 'option2', displayValue: 'Option 2' },
            ],
          },
        ]),
      }),
    };
    mockGetDocument.mockReturnValue({
      promise: Promise.resolve(mockPdfDoc),
    });

    // Run the service
    const fields = await pdfService.parsePDF(mockArrayBuffer);

    // Assertions: Ensure the correct option is selected
    expect(fields).toEqual({
      dropdownField: undefined, // This should match the displayValue of the selected option
    });

    expect(mockGetDocument).toHaveBeenCalledWith({ data: mockArrayBuffer });
    expect(mockPdfDoc.getPage).toHaveBeenCalledWith(1);
  });

  it('should handle error during PDF parsing', async () => {
    const mockArrayBuffer = new ArrayBuffer(8);

    // Mock getDocument to throw an error
    mockGetDocument.mockReturnValue({
      promise: Promise.reject(new Error('PDF parsing error')),
    });

    // Catch the error
    await expect(pdfService.parsePDF(mockArrayBuffer)).rejects.toThrow(
      'PDF parsing error',
    );
  });
});
