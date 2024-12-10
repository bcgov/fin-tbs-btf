import { createTestingPinia } from "@pinia/testing";
import { fireEvent, render, waitFor } from "@testing-library/vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import PdfService, {
  PdfParseError,
} from "../../services/InterMinistryTransferData";
import { useUploadedFilesStore } from "../../stores/uploaded-files-store";
import UploadPage from "../UploadPage.vue";

// Parts of the pdfjs library used by PdfService are not supported in
// node.js (they expect to be run in a web browser).  Mock parts of the
// pdfjs library to work around this issue.
vi.mock("../../workers/pdfjsWorker", () => ({}));
vi.mock("pdfjs-dist", () => ({
  getDocument: vi.fn(),
}));

global.ResizeObserver = require("resize-observer-polyfill");

const mockPdfFile = new File([""], "filename.pdf", {
  type: "application/pdf",
});
mockPdfFile.arrayBuffer = async () => new ArrayBuffer(0);

describe("UploadPage", () => {
  let component: any;
  let uploadedFilesStore: any;

  const vuetify = createVuetify({ components, directives });
  const setupComponent = (props?: {}) => {
    const pinia = createTestingPinia({
      stubActions: false,
      fakeApp: true,
      createSpy: vi.fn,
    });
    uploadedFilesStore = useUploadedFilesStore(pinia);
    return render(UploadPage, {
      props,
      global: {
        plugins: [pinia, vuetify],
      },
    });
  };

  beforeEach(async () => {
    component = await setupComponent();
  });

  afterEach(() => {
    vi.resetAllMocks();
    component.unmount();
  });

  describe("When a valid PDF file is added with the (hidden) input element", () => {
    it("The file is uploaded, parsed and shown on the page", async () => {
      const parsePdfSpy = vi
        .spyOn(PdfService, "parsePDF")
        .mockResolvedValue({});
      const getMissingFieldsSpy = vi
        .spyOn(PdfService, "getMissingFields")
        .mockReturnValue([]);
      const fileInput: any = component.getByLabelText("File input");
      expect(uploadedFilesStore.uploadedFiles.length).toBe(0);
      await fireEvent.change(fileInput, { target: { files: [mockPdfFile] } });

      //the file was parsed (no errors were found)
      expect(parsePdfSpy).toHaveBeenCalledTimes(1);
      expect(getMissingFieldsSpy).toHaveBeenCalledTimes(2);

      //the file is added to the store
      expect(uploadedFilesStore.uploadedFiles.length).toBe(1);
      expect(uploadedFilesStore.uploadedFiles[0].validationErrors.length).toBe(
        0,
      );
      expect(
        uploadedFilesStore.uploadedFiles[0].validationWarnings.length,
      ).toBe(0);

      //the file appears in the list on the screen
      const uploadedFile = await component.getByText(mockPdfFile.name);
      expect(uploadedFile).toBeInTheDocument();
      expect(uploadedFile.outerHTML).toContain("mdi-check"); //checkmark icon appears

      //download button is enabled
      const downloadButton = await component.getByRole("button", {
        name: "Download Excel",
      });
      expect(downloadButton).toBeEnabled();
    });
  });

  describe("When a valid PDF file is dragged-and-dropped onto the 'dropzone'", () => {
    it("The file is uploaded, parsed and shown on the page", async () => {
      const parsePdfSpy = vi
        .spyOn(PdfService, "parsePDF")
        .mockResolvedValue({});
      const getMissingFieldsSpy = vi
        .spyOn(PdfService, "getMissingFields")
        .mockReturnValue([]);
      const dropZone = component.getByText("Drop PDF files here");

      expect(uploadedFilesStore.uploadedFiles.length).toBe(0);
      await fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [mockPdfFile],
        },
      });

      //the file was parsed (no errors were found)
      expect(parsePdfSpy).toHaveBeenCalledTimes(1);
      expect(getMissingFieldsSpy).toHaveBeenCalledTimes(2);

      //the file is added to the store
      expect(uploadedFilesStore.uploadedFiles.length).toBe(1);
      expect(uploadedFilesStore.uploadedFiles[0].validationErrors.length).toBe(
        0,
      );
      expect(
        uploadedFilesStore.uploadedFiles[0].validationWarnings.length,
      ).toBe(0);
      expect(uploadedFilesStore.uploadedFiles[0].isLoading).toBe(false);

      //the file appears in the list on the screen
      const uploadedFile = await component.getByText(mockPdfFile.name);
      expect(uploadedFile).toBeInTheDocument();
      expect(uploadedFile?.outerHTML).toContain("mdi-check"); //checkmark icon appears

      //download button is enabled
      const downloadButton = await component.getByRole("button", {
        name: "Download Excel",
      });
      expect(downloadButton).toBeEnabled();
    });
  });

  describe("When an invalid PDF file is dragged-and-dropped onto the 'dropzone'", () => {
    describe("If it's not a pdf", () => {
      it("The file is uploaded, and error shown on the page", async () => {
        const parsePdfSpy = vi
          .spyOn(PdfService, "parsePDF")
          .mockImplementation(() => {
            throw new PdfParseError("");
          });
        const dropZone = component.getByText("Drop PDF files here");

        expect(uploadedFilesStore.uploadedFiles.length).toBe(0);
        await fireEvent.drop(dropZone, {
          dataTransfer: {
            files: [mockPdfFile],
          },
        });

        //the file was parsed (no errors were found)
        expect(parsePdfSpy).toHaveBeenCalledTimes(1);

        //the file is added to the store
        expect(uploadedFilesStore.uploadedFiles.length).toBe(1);
        expect(
          uploadedFilesStore.uploadedFiles[0].validationErrors.length,
        ).toBe(1);
        expect(
          uploadedFilesStore.uploadedFiles[0].validationWarnings.length,
        ).toBe(0);
        expect(uploadedFilesStore.uploadedFiles[0].isLoading).toBe(false);

        //the file appears in the list on the screen
        const uploadedFile = await component.getByText(mockPdfFile.name);
        expect(uploadedFile).toBeInTheDocument();
        await waitFor(() => {
          expect(uploadedFile?.outerHTML).toContain("mdi-alert-circle"); //alert icon appears
        });

        //alert indicating the uploaded file is invalid is visible on the screen
        const invalidFilesAlert = await component.getByText(
          "Please remove the invalid files",
        );
        expect(invalidFilesAlert).toBeInTheDocument();

        //download button is disabled
        const downloadButton = await component.getByRole("button", {
          name: "Download Excel",
        });
        expect(downloadButton).toBeDisabled();
      });
    });
    describe("If it doesn't have the required fields", () => {
      it("The file is uploaded, and error shown on the page", async () => {
        const parsePdfSpy = vi
          .spyOn(PdfService, "parsePDF")
          .mockResolvedValue({});
        const getMissingFieldsSpy = vi
          .spyOn(PdfService, "getMissingFields")
          .mockReturnValueOnce(["field1"]) //errors
          .mockReturnValueOnce([]); //warnings
        const dropZone = component.getByText("Drop PDF files here");

        expect(uploadedFilesStore.uploadedFiles.length).toBe(0);
        await fireEvent.drop(dropZone, {
          dataTransfer: {
            files: [mockPdfFile],
          },
        });

        //the file was parsed (no errors were found)
        expect(parsePdfSpy).toHaveBeenCalledTimes(1);
        expect(getMissingFieldsSpy).toHaveBeenCalledTimes(2);

        //the file is added to the store
        expect(uploadedFilesStore.uploadedFiles.length).toBe(1);
        expect(
          uploadedFilesStore.uploadedFiles[0].validationErrors.length,
        ).toBe(1);
        expect(
          uploadedFilesStore.uploadedFiles[0].validationWarnings.length,
        ).toBe(0);
        expect(uploadedFilesStore.uploadedFiles[0].isLoading).toBe(false);

        //the file appears in the list on the screen
        const uploadedFile = await component.getByText(mockPdfFile.name);
        expect(uploadedFile).toBeInTheDocument();
        await waitFor(() => {
          expect(uploadedFile?.outerHTML).toContain("mdi-alert-circle"); //alert icon appears
        });

        //alert indicating the uploaded file is invalid is visible on the screen
        const invalidFilesAlert = await component.getByText(
          "Please remove the invalid files",
        );
        expect(invalidFilesAlert).toBeInTheDocument();

        //download button is disabled
        const downloadButton = await component.getByRole("button", {
          name: "Download Excel",
        });
        expect(downloadButton).toBeDisabled();
      });
    });
    describe("If it doesn't have the optional fields", () => {
      it("The file is uploaded, and error shown on the page", async () => {
        const parsePdfSpy = vi
          .spyOn(PdfService, "parsePDF")
          .mockResolvedValue({});
        const getMissingFieldsSpy = vi
          .spyOn(PdfService, "getMissingFields")
          .mockReturnValueOnce([]) //errors
          .mockReturnValueOnce(["field1"]); //warnings
        const dropZone = component.getByText("Drop PDF files here");

        expect(uploadedFilesStore.uploadedFiles.length).toBe(0);
        await fireEvent.drop(dropZone, {
          dataTransfer: {
            files: [mockPdfFile],
          },
        });

        //the file was parsed (no errors were found)
        expect(parsePdfSpy).toHaveBeenCalledTimes(1);
        expect(getMissingFieldsSpy).toHaveBeenCalledTimes(2);

        //the file is added to the store
        expect(uploadedFilesStore.uploadedFiles.length).toBe(1);
        expect(
          uploadedFilesStore.uploadedFiles[0].validationErrors.length,
        ).toBe(0);
        expect(
          uploadedFilesStore.uploadedFiles[0].validationWarnings.length,
        ).toBe(1);
        expect(uploadedFilesStore.uploadedFiles[0].isLoading).toBe(false);

        //the file appears in the list on the screen
        const uploadedFile = await component.getByText(mockPdfFile.name);
        expect(uploadedFile).toBeInTheDocument();
        await waitFor(() => {
          expect(uploadedFile?.outerHTML).toContain("mdi-alert"); //warning icon appears
        });

        //alert indicating the uploaded file is invalid is visible on the screen
        const invalidFilesAlert = await component.getByText(
          "The remaining data from those files will be included in your download",
        );
        expect(invalidFilesAlert).toBeInTheDocument();

        //download button is not disabled
        const downloadButton = await component.getByRole("button", {
          name: "Download Excel",
        });
        expect(downloadButton).not.toBeDisabled();
      });
    });
  });

  describe("When the 'clear' button is clicked", () => {
    it("Removes all previously-added files", async () => {
      vi.spyOn(PdfService, "parsePDF").mockImplementation(() => {
        throw new PdfParseError("");
      });

      // Add a file via the dropzone
      await fireEvent.drop(await component.getByText("Drop PDF files here"), {
        dataTransfer: {
          files: [mockPdfFile],
        },
      });

      // Confirm that the file was uploaded
      expect(await component.queryByText(mockPdfFile.name)).toBeInTheDocument();

      // Click the 'Clear' button
      const clearButton = await component.getByRole("button", {
        name: "Clear",
      });
      await fireEvent.click(clearButton);

      // Confirm that the clear button removes all files
      expect(uploadedFilesStore.uploadedFiles.length).toBe(0);
      expect(
        await component.queryByText(mockPdfFile.name),
      ).not.toBeInTheDocument();

      // Confirm that the dropzone title is visible
      expect(
        await component.getByText("Drop PDF files here"),
      ).toBeInTheDocument();
    });
  });
});
