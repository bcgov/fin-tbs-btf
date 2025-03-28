import { defineStore } from "pinia";
import { v4 as uuidv4 } from "uuid";
import { ref } from "vue";
import { InterMinistryTransferFormData } from "../data/imtfData";

export type UploadedFile = {
  uploadedFileId: string;
  file: File;
  parsedData: Record<string, string | number | Date | null>;
  validationErrors: any;
  validationWarnings: any;
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
      validationWarnings: ref<string[]>([]),
      isLoading: ref<boolean>(true),
    };
    uploadedFiles.value.push(uploadedFile);

    try {
      const data = new InterMinistryTransferFormData();
      await data.importFromPdf(file);
      uploadedFile.parsedData = data.fieldsData;
      const errors = data.getMissingRequiredFields();
      if (errors.length)
        uploadedFile.validationErrors.value = [
          new Error("Missing required fields"),
        ];
      //uploadedFile.validationWarnings.value = data.getMissingOptionalFields();
      uploadedFile.validationWarnings.value = data.getWarnings();
    } catch (e) {
      uploadedFile.validationErrors.value = [new Error("Invalid PDF")];
    } finally {
      uploadedFile.isLoading.value = false;
    }
  };

  const addFileList = async (fileList: FileList): Promise<void> => {
    for (var i = 0; i < fileList.length; i++) {
      await addFile(fileList[i]);
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
          u.file?.lastModified == file?.lastModified &&
          u.file?.size == file?.size &&
          u.file?.name == file?.name,
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
