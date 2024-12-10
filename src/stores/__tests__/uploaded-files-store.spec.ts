import { createTestingPinia } from "@pinia/testing";
import { setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PdfService, {
  PdfParseError,
} from "../../services/InterMinistryTransferData";
import { useUploadedFilesStore } from "../uploaded-files-store";

// Parts of the pdfjs library used by PdfService are not supported in
// node.js (they expect to be run in a web browser).  Mock parts of the
// pdfjs library to work around this issue.
vi.mock("../../workers/pdfjsWorker", () => ({}));
vi.mock("pdfjs-dist", () => ({
  getDocument: vi.fn(),
}));

const mockPdfFile = new File([""], "filename.pdf", {
  type: "application/pdf",
});

describe("UploadedFilesStore", () => {
  let uploadedFilesStore: any;
  let pinia;

  beforeEach(() => {
    pinia = createTestingPinia({
      stubActions: false,
      fakeApp: true,
      createSpy: vi.fn,
    });
    setActivePinia(pinia);

    uploadedFilesStore = useUploadedFilesStore(pinia);
  });
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("addFile", () => {
    describe("when the file is valid", () => {
      it("adds a file to the 'uploadedFiles' list, and marks the file as valid", async () => {
        vi.spyOn(PdfService, "parsePDF").mockResolvedValue({});
        await uploadedFilesStore.addFile(mockPdfFile);
        expect(uploadedFilesStore.uploadedFiles[0].validationErrors.value).toBe(
          undefined,
        );
      });
    });
    describe("when the file already exists in the store", () => {
      it("doesn't add the file again", async () => {
        vi.spyOn(PdfService, "parsePDF").mockResolvedValue({});
        await uploadedFilesStore.addFile(mockPdfFile);
        expect(uploadedFilesStore.uploadedFiles.length).toBe(1);
        await uploadedFilesStore.addFile(mockPdfFile);
        expect(uploadedFilesStore.uploadedFiles.length).toBe(1);
      });
    });
    describe("when the file is invalid", () => {
      it("adds a file to the 'uploadedFiles' list, and marks the file as invalid", async () => {
        vi.spyOn(PdfService, "parsePDF").mockImplementation(async () => {
          throw new PdfParseError("parse failed");
        });
        await uploadedFilesStore.addFile(mockPdfFile);
        expect(
          uploadedFilesStore.uploadedFiles[0].validationErrors.length,
        ).toBeGreaterThan(0);
      });
    });
  });

  describe("addFileList", () => {
    describe("when the fileList includes multiple files", () => {
      it('adds all files to the "uploadedFiles" array', async () => {
        vi.spyOn(PdfService, "parsePDF").mockResolvedValue({});
        const fileList: File[] = [
          new File([""], "filename1.pdf", { type: "application/pdf" }),
          new File([""], "filename2.pdf", { type: "application/pdf" }),
        ];
        await uploadedFilesStore.addFileList(fileList);
        expect(uploadedFilesStore.uploadedFiles.length).toBe(fileList.length);
      });
    });
  });

  describe("removeUploadedFile", () => {
    describe("when the given uploadedFile matches one in the store", () => {
      it("the matching record from the store is removed", async () => {
        const previouslyUploadedFile = {
          uploadedFileId: "123",
          file: mockPdfFile,
          parsedData: {},
          validationErrors: [],
          isLoading: false,
        };
        uploadedFilesStore.uploadedFiles.push(previouslyUploadedFile);
        await uploadedFilesStore.removeUploadedFile(previouslyUploadedFile);
        expect(uploadedFilesStore.uploadedFiles.length).toBe(0);
      });
    });
  });

  describe("reset", () => {
    it("removes all previously uploaded files from the store", async () => {
      vi.spyOn(PdfService, "parsePDF").mockResolvedValue({});
      await uploadedFilesStore.addFile(mockPdfFile);
      expect(uploadedFilesStore.uploadedFiles.length).toBe(1);
      await uploadedFilesStore.reset();
      expect(uploadedFilesStore.uploadedFiles.length).toBe(0);
    });
  });
});
