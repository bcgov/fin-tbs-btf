<template>
  <v-row>
    <v-col class="d-flex justify-start">
      <h5>Upload Page</h5>
    </v-col>
  </v-row>
  <v-row dense class="h-50">
    <v-col class="d-flex justify-start"> drop zone here </v-col>
    <v-col class="d-inline-block h-100">
      <h3>Uploaded Files</h3>
      <v-card class="w-100 h-100">
        <v-card-text>
          <v-list class="w-100">
            <v-list-item
              v-for="uploadedFile in uploadedFiles"
              :key="uploadedFile.uploadedFileId"
              class="d-flex justify-start"
            >
              <template v-slot:default>
                <v-icon
                  :icon="
                    uploadedFile.validationErrors.length
                      ? 'mdi-alert'
                      : 'mdi-check'
                  "
                  :color="
                    uploadedFile.validationErrors.length ? 'error' : 'success'
                  "
                ></v-icon>
                {{ uploadedFile.file.name }}
              </template>
              <template v-slot:append>
                <div class="ms-6">
                  <v-btn
                    icon="mdi-delete"
                    size="x-small"
                    @click="uploadedFilesStore.removeUploadedFile(uploadedFile)"
                  ></v-btn>
                </div>
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
  <v-row>
    <v-col>
      <v-file-input
        multiple
        label="File input"
        accept="application/pdf"
        @change="onFilesSelected"
      />
      <v-btn class="btn-secondary" @click="saveExcel">Download excel</v-btn>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { useAuthStore } from "../stores/auth-store";
import { useUploadedFilesStore } from "../stores/uploaded-files-store";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import pdfService from "../services/pdf-service";
import excelService from "../services/excel-service";
import { excelColumnDefaults, excelColumnOrder } from "../constants";

const uploadedFilesStore = useUploadedFilesStore();
const authStore = useAuthStore();

const { uploadedFiles } = storeToRefs(uploadedFilesStore);
const { user } = storeToRefs(authStore);

// Store extracted form data from PDFs
const extractedData = ref<any[]>([]);

/** Event handler for file input */
const onFilesSelected = async (event: Event) => {
  const files = (event.target as HTMLInputElement).files;
  if (files) {
    const data = await pdfService.handleFiles(files);
    for (const d of data) extractedData.value.push(d);
  }
};

/** Event handler to save the extracted data to Excel */
const saveExcel = async () => {
  try {
    const auditDetails = {
      idir: user.value?.idir_username,
      loginDate: user.value?.iat
        ? new Date(user.value?.iat * 1000).toISOString()
        : new Date().toISOString(),
      createdDate: new Date().toISOString(),
    };
    await excelService.exportToExcel(
      extractedData.value,
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
