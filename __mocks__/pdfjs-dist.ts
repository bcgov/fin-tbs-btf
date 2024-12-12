import { vi } from "vitest";

// let mockAnnotations = [
//   { id: 1, type: "annotation", content: "Default Annotation 1" },
//   { id: 2, type: "annotation", content: "Default Annotation 2" },
// ];

// export const setMockAnnotations = (annotations) => {
//   mockAnnotations = annotations;
// };

// __mocks__/pdfjs-dist.ts
export const getDocument = vi.fn(() => ({
  getPage: vi.fn(() =>
    Promise.resolve({
      getAnnotations: vi.fn(() =>
        Promise.resolve([
          { id: 1, type: "annotation", content: "Default Annotation 1" },
          { id: 2, type: "annotation", content: "Default Annotation 2" },
        ]),
      ),
    }),
  ),
}));
