import { defineStore } from "pinia";
import { v4 as uuidv4 } from "uuid";
import { ref } from "vue";

type UploadedFile = {
  uploadedFileId: string;
  file: File;
  parsedData?: any;
  validationErrors: Error[];
};

export const useUploadedFilesStore = defineStore("uploadedFiles", () => {
  const uploadedFiles = ref<UploadedFile[]>([]);

  const addFile = (file: File): void => {
    console.log("parse and validate file");
    const uploadedFile: UploadedFile = {
      uploadedFileId: uuidv4(),
      file: file,
      parsedData: undefined,
      validationErrors: [],
    };
    uploadedFiles.value.push(uploadedFile);
  };

  const removeUploadedFile = (uploadedFile: UploadedFile): void => {
    uploadedFiles.value = uploadedFiles.value.filter(
      (uf: UploadedFile) => uf?.uploadedFileId != uploadedFile?.uploadedFileId
    );
  };

  // Return the public interface for the store
  return {
    //refs
    uploadedFiles,
    //methods
    addFile,
    removeUploadedFile,
  };
});
