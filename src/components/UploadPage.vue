<template>
  <v-row>
    <v-col class="d-flex justify-start">
      <h5>Upload Page</h5>
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
import { storeToRefs } from "pinia";
import { ref } from "vue";
import pdfService from "../services/pdf-service";
import excelService from "../services/excel-service";
import { excelColumnDefaults, excelColumnOrder } from "../constants";

const authStore = useAuthStore();
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
