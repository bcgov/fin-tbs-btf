import { defineStore } from "pinia";
import { v4 as uuidv4 } from "uuid";
import { ref } from "vue";
import PdfService from "../services/pdf-service";
import { pdfFields } from "../constants";

export type UploadedFile = {
  uploadedFileId: string;
  file: File;
  parsedData: Record<string, string>;
  validationErrors: any;
  isLoading: any;
};

export const useUploadedFilesStore = defineStore("uploadedFiles", () => {
  const uploadedFiles = ref<UploadedFile[]>([]);

  const addFile = async (file: File): Promise<void> => {
    if (fileExists(file)) {
      //ignore duplicate files
      return;
    }
    const uploadedFile: UploadedFile = {
      uploadedFileId: uuidv4(),
      file: file,
      parsedData: {},
      validationErrors: ref<Error[]>([]),
      isLoading: ref<boolean>(true),
    };
    uploadedFiles.value.push(uploadedFile);
    try {
      //Todo: PdfService.parsePDF should throw PdfParseError (a new custom
      //error class yet-to - be defined) if any problems occur.
      //Until the method behaves this way, try to detect an a failed parse
      //right here and throw an error.
      uploadedFile.parsedData = await PdfService.parsePDF(file, pdfFields);
      if (!Object.keys(uploadedFile.parsedData).length) {
        throw new Error("Invalid PDF");
      }
    } catch (e) {
      uploadedFile.validationErrors.value = [new Error("invalid pdf")];
    } finally {
      uploadedFile.isLoading.value = false;
    }
  };

  const addFileList = (fileList: FileList): void => {
    for (var i = 0; i < fileList.length; i++) {
      addFile(fileList[i]);
    }
  };

  const removeUploadedFile = (uploadedFile: UploadedFile): void => {
    uploadedFiles.value = uploadedFiles.value.filter(
      (uf: UploadedFile) => uf?.uploadedFileId != uploadedFile?.uploadedFileId,
    );
  };

  const fileExists = (file: File): boolean => {
    return (
      uploadedFiles.value.filter(
        (u) =>
          u.file.lastModified == file.lastModified &&
          u.file.size == file.size &&
          u.file.name == file.name,
      ).length > 0
    );
  };

  const reset = () => {
    uploadedFiles.value = [];
  };

  // Return the public interface for the store
  return {
    //refs
    uploadedFiles,
    //methods
    addFile,
    addFileList,
    removeUploadedFile,
    reset,
  };
});
