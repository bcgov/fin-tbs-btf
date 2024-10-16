<template>
  <v-row dense class="h-50">
    <v-col class="d-inline-block h-100">
      <h3>
        Files
        <span v-if="uploadedFiles.length">({{ uploadedFiles.length }})</span>
      </h3>
      <div id="dropzone" class="w-100 h-100">
        <v-card class="w-100 h-100 bg-grey-lighten-4 overflow-y-auto">
          <v-card-text class="w-100 h-100">
            <div
              class="w-100 h-100 d-flex flex-column justify-center align-center"
              v-if="!uploadedFiles.length"
            >
              <div id="drop-instructions" class="d-flex align-center">
                <v-icon
                  icon="mdi-file-pdf-box"
                  color="grey-darken-2"
                  size="x-large"
                ></v-icon>
                <h3 class="text-grey-darken-3">Drop PDF files here</h3>
              </div>
              <div class="text-grey mt-4">
                .. or use the <i>Upload PDF</i> button below
              </div>
            </div>
            <v-list
              class="w-100"
              bg-color="#00000000"
              v-if="uploadedFiles?.length"
            >
              <UploadedFileItem
                v-for="uploadedFile in uploadedFiles"
                :key="uploadedFile.uploadedFileId"
                :uploadedFile="uploadedFile"
              >
              </UploadedFileItem>
            </v-list>
          </v-card-text>
        </v-card>
        <v-alert
          v-if="hasValidationErrors"
          title="Invalid files"
          text="Please remove the invalid files"
          color="error"
          icon="mdi-alert-circle"
          class="mt-2"
        ></v-alert>

        <div class="d-flex justify-space-between mt-2">
          <v-btn
            class="btn-primary"
            for="fileChooser"
            @click="$refs.fileChooser?.click()"
            >Upload PDF</v-btn
          >
          <v-btn
            class="btn-secondary ms-2"
            @click="reset()"
            :disabled="!uploadedFiles.length"
            >Clear</v-btn
          >
          <v-file-input
            id="fileChooser"
            ref="fileChooser"
            multiple
            label="File input"
            :hide-input="true"
            :hide-detail="true"
            prepend-icon="none"
            accept="application/pdf"
            @change="onFilesSelected"
          />
          <v-btn
            class="btn-primary"
            @click="saveExcel"
            :disabled="uploadedFiles.length == 0 || hasValidationErrors"
            >Download Excel</v-btn
          >
        </div>
      </div>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import UploadedFileItem from "./UploadedFileItem.vue";
import { useAuthStore } from "../stores/auth-store";
import { useUploadedFilesStore } from "../stores/uploaded-files-store";
import { storeToRefs } from "pinia";
import { ref, computed, onMounted } from "vue";
import excelService from "../services/excel-service";
import { excelColumnDefaults, excelColumnOrder } from "../constants";

const uploadedFilesStore = useUploadedFilesStore();
const authStore = useAuthStore();

const { uploadedFiles } = storeToRefs(uploadedFilesStore);
const { user } = storeToRefs(authStore);
const fileChooser = ref<any>(null);

onMounted(() => {
  initFileDropzone();
});

/* Initializes drag and drop related event handling for an area that 
will receive dropped files from the user's operating system */
const initFileDropzone = () => {
  const dropArea = document.getElementById("dropzone");

  /* Disable browser default behavior for files dropped into the 'dropzone'
  element. (The default handling is to try to open the file and display it 
  in the browser.) */
  const preventDefaultEventHandling = (e: any) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDrop = (e: any) => {
    preventDefaultEventHandling(e);
    if (e?.dataTransfer.files) {
      ingestFiles(e?.dataTransfer.files);
    }
  };

  dropArea?.addEventListener("dragover", preventDefaultEventHandling);
  dropArea?.addEventListener("dragenter", preventDefaultEventHandling);
  dropArea?.addEventListener("dragleave", preventDefaultEventHandling);
  dropArea?.addEventListener("drop", onDrop);
};

/* event handler for files uploaded via the "Upload File(s)" button*/
const onFilesSelected = async (event: Event) => {
  const files: FileList | null = (event.target as HTMLInputElement).files;
  await ingestFiles(files);

  //clear all previously uploaded files from the v-file-input
  fileChooser.value?.reset();
};

const ingestFiles = async (files: FileList | null) => {
  if (files) {
    await uploadedFilesStore.addFileList(files);
  }
};

/* Returns true if any one or more files in the uploadedFilesStore
has a validation error. Returns false otherwise. */
const hasValidationErrors = computed<boolean>(() => {
  return (
    uploadedFiles.value.filter((f) => f.validationErrors?.length).length > 0
  );
});

const reset = () => {
  uploadedFilesStore.reset();
};

/** Event handler to save the extracted data to Excel */
const saveExcel = async () => {
  try {
    // combined the parsed data from all valid PDFs
    // into one array
    const extractedData = uploadedFiles.value
      .filter((f) => f.parsedData && !f.validationErrors.length)
      .map((f) => f.parsedData);

    const auditDetails = {
      IDIR: user.value?.idir_username,
      Email: user.value?.email,
      Name: user.value?.name,
      "Login Date": user.value?.iat
        ? new Date(user.value?.iat * 1000).toISOString()
        : new Date().toISOString(),
      "File Created": new Date().toISOString(),
      "# PDFs": extractedData.length.toString(),
    };
    await excelService.exportToExcel(
      extractedData,
      excelColumnOrder,
      excelColumnDefaults,
      auditDetails,
    );
    console.log("Excel file has been created successfully!");
  } catch (error) {
    console.error("Error exporting to Excel:", error);
  }
};
</script>
