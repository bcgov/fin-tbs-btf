<template>
  <v-row dense class="h-50">
    <v-col class="d-inline-block h-100">
      <h3>Files</h3>
      <v-card class="w-100 h-100">
        <v-card-text>
          <v-list class="w-100">
            <UploadedFileItem
              v-for="uploadedFile in uploadedFiles"
              :key="uploadedFile.uploadedFileId"
              :uploadedFile="uploadedFile"
            >
            </UploadedFileItem>
          </v-list>
        </v-card-text>
      </v-card>
      <div class="d-flex justify-space-between mt-2">
        <v-btn
          class="btn-primary"
          for="file-chooser"
          @click="$refs.fileChooser?.click()"
          >Upload a file</v-btn
        >
        <v-btn class="btn-secondary ms-2" @click="reset()">Clear</v-btn>
        <v-file-input
          id="file-chooser"
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
          >Download excel</v-btn
        >
      </div>
    </v-col>
    <v-col> </v-col>
  </v-row>
</template>

<script setup lang="ts">
import UploadedFileItem from "./UploadedFileItem.vue";
import { useAuthStore } from "../stores/auth-store";
import { useUploadedFilesStore } from "../stores/uploaded-files-store";
import { storeToRefs } from "pinia";
import { computed } from "vue";
import excelService from "../services/excel-service";
import { excelColumnDefaults, excelColumnOrder } from "../constants";

const uploadedFilesStore = useUploadedFilesStore();
const authStore = useAuthStore();

const { uploadedFiles } = storeToRefs(uploadedFilesStore);
const { user } = storeToRefs(authStore);

const hasValidationErrors = computed<boolean>(() => {
  return (
    uploadedFiles.value.filter((f) => f.validationErrors?.length).length > 0
  );
});

function reset() {
  uploadedFilesStore.reset();
}

const onFilesSelected = async (event: Event) => {
  const files = (event.target as HTMLInputElement).files;
  if (files) {
    uploadedFilesStore.addFileList(files);
  }
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
      idir: user.value?.idir_username,
      loginDate: user.value?.iat
        ? new Date(user.value?.iat * 1000).toISOString()
        : new Date().toISOString(),
      createdDate: new Date().toISOString(),
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
