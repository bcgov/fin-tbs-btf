import { createTestingPinia } from "@pinia/testing";
import { render } from "@testing-library/vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { UploadedFile } from "../../stores/uploaded-files-store";
import UploadedFileItem from "../UploadedFileItem.vue";

// Parts of the pdfjs library used by PdfService are not supported in
// node.js (they expect to be run in a web browser).  Mock parts of the
// pdfjs library to work around this issue.
vi.mock("../../workers/pdfjsWorker", () => ({}));
vi.mock("pdfjs-dist", () => ({
  getDocument: vi.fn(),
}));

global.ResizeObserver = require("resize-observer-polyfill");

const mockLoadingUploadedFile: UploadedFile = {
  uploadedFileId: "234ert35",
  file: new File([""], "mockLoading.pdf", { type: "application/pdf" }),
  parsedData: {},
  validationErrors: [],
  isLoading: true,
};

const mockValidUploadedFile: UploadedFile = {
  uploadedFileId: "12334345456",
  file: new File([""], "mockValid.pdf", { type: "application/pdf" }),
  parsedData: {},
  validationErrors: [],
  isLoading: false,
};

const mockInvalidUploadedFile: UploadedFile = {
  uploadedFileId: "ghuk567rs",
  file: new File([""], "mockInvalid.pdf", { type: "application/pdf" }),
  parsedData: {},
  validationErrors: [new Error("mock error")],
  isLoading: false,
};

describe("UploadedFileItem", () => {
  let component: any;

  const vuetify = createVuetify({ components, directives });
  const setupComponent = (uploadedFile: UploadedFile) => {
    const pinia = createTestingPinia({
      stubActions: false,
      fakeApp: true,
      createSpy: vi.fn,
    });
    return render(UploadedFileItem, {
      props: { uploadedFile: uploadedFile },
      global: {
        plugins: [pinia, vuetify],
      },
    });
  };

  beforeEach(async () => {});

  afterEach(() => {
    vi.resetAllMocks();
    if (component) {
      component.unmount();
    }
  });

  describe("When the uploaded file is loading", () => {
    it("A loading spinner is displayed", async () => {
      component = await setupComponent(mockLoadingUploadedFile);
      const uploadedFile = await component.getByText(
        mockLoadingUploadedFile.file.name,
      );
      expect(uploadedFile.outerHTML).toContain("loading");
    });
  });

  describe("When the uploaded file has finished loading", () => {
    describe("The file is valid", () => {
      it("A checkmark icon is displayed", async () => {
        component = await setupComponent(mockValidUploadedFile);
        const uploadedFile = await component.getByText(
          mockValidUploadedFile.file.name,
        );
        expect(uploadedFile.outerHTML).toContain("mdi-check");
      });
    });

    describe("The file is invalid", () => {
      it("A checkmark icon is displayed", async () => {
        component = await setupComponent(mockInvalidUploadedFile);
        const uploadedFile = await component.getByText(
          mockInvalidUploadedFile.file.name,
        );
        expect(uploadedFile.outerHTML).toContain("mdi-alert-circle");
      });
    });
  });
});
