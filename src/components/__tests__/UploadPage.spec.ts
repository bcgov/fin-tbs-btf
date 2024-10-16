import { createTestingPinia } from "@pinia/testing";
import { fireEvent, render, screen } from "@testing-library/vue";
import { setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import PdfService from "../../services/pdf-service";
import { useUploadedFilesStore } from "../../stores/uploaded-files-store";
import UploadPage from "../UploadPage.vue";

// Parts of the pdfjs library used by PdfService are not supported in
// node.js (they expect to be run in a web browser).  Mock parts of the
// pdfjs library to work around this issue.
vi.mock("../../workers/pdfjsWorker", () => ({}));
vi.mock("pdfjs-dist", () => ({
  getDocument: vi.fn(),
}));

// Mock the ResizeObserver
const ResizeObserverMock = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Stub global objects needed for testing
vi.stubGlobal("ResizeObserver", ResizeObserverMock);

const mockPdfFile = new File([""], "filename.pdf", {
  type: "application/pdf",
});
mockPdfFile.arrayBuffer = async () => new ArrayBuffer(0);

describe("UploadPage", () => {
  let setupComponent: any;
  let uploadedFilesStore: any;
  let pinia: any;

  beforeEach(async () => {
    pinia = createTestingPinia({
      stubActions: false,
      fakeApp: true,
      createSpy: vi.fn,
    });
    setActivePinia(pinia);
    uploadedFilesStore = useUploadedFilesStore(pinia);
    const vuetify = createVuetify({ components, directives });

    setupComponent = (props: {}) => {
      return render(UploadPage, {
        props,
        global: {
          plugins: [pinia, vuetify],
        },
      });
    };
  });

  it("Files can be added with the (hidden) file input element", async () => {
    const component = await setupComponent();
    const parsePdfSpy = vi.spyOn(PdfService, "parsePDF").mockResolvedValue({});
    const fileInput: any = component.getByLabelText("File input");
    expect(uploadedFilesStore.uploadedFiles.length).toBe(0);
    await fireEvent.change(fileInput, { target: { files: [mockPdfFile] } });

    //the file was parsed
    expect(parsePdfSpy).toHaveBeenCalledTimes(1);

    //the file is added to the store
    expect(uploadedFilesStore.uploadedFiles.length).toBe(1);
    expect(uploadedFilesStore.uploadedFiles[0].validationErrors.length).toBe(0);

    //the file appears in the list on the screen
    const uploadedFile = await screen.getByText(mockPdfFile.name);
    expect(uploadedFile).toBeInTheDocument();
    expect(uploadedFile.outerHTML).toContain("mdi-check"); //checkmark icon appears
  });
});
