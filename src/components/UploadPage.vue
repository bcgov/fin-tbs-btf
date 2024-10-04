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
import { useAuthStore } from '../stores/auth-store';
import { storeToRefs } from 'pinia';
import { ref } from 'vue';
import pdfService from '../services/pdf-service';
import excelService from '../services/excel-service';

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
    const columnOrder = [
      'submissionId',
      'CONTROL_NUM',
      'STATUS_DESCR',
      'EFFECTIVE_DT',
      'LAST_ACTED_ON_AUDIT_TS',
      'NEXT_TO_ACT_LAST_NAME',
      'NEXT_TO_ACT_FIRST_NAME',
      'FROM_CLIENT_CD',
      'FROM_CLIENT_NAME',
      'TO_CLIENT_CD',
      'TO_CLIENT_NAME',
      'FISCAL_YEAR',
      'TRANSFER_REASON',
      'BUDGETR_GROSS_OPERATING_AMT',
      'BUDGET_GROSS_OPERATING_AMT',
      'BUDGET1_GROSS_OPERATING_AMT',
      'BUDGET2_GROSS_OPERATING_AMT',
      'BUDGETR_RECOV_OPERATING_AMT',
      'BUDGET_RECOV_OPERATING_AMT',
      'BUDGET1_RECOV_OPERATING_AMT',
      'BUDGET2_RECOV_OPERATING_AMT',
      'BUDGETR_CAPITAL_AMT',
      'BUDGET_CAPITAL_AMT',
      'BUDGET1_CAPITAL_AMT',
      'BUDGET2_CAPITAL_AMT',
      'BUDGETR_FTE_CNT',
      'BUDGET_FTE_CNT',
      'BUDGET1_FTE_CNT',
      'BUDGET2_FTE_CNT',
      'BUDGETR_RECEIPT_FIN_AMT',
      'BUDGET_RECEIPT_FIN_AMT',
      'BUDGET1_RECEIPT_FIN_AMT',
      'BUDGET2_RECEIPT_FIN_AMT',
      'BUDGETR_DISBURSE_FIN_AMT',
      'BUDGET_DISBURSE_FIN_AMT',
      'BUDGET1_DISBURSE_FIN_AMT',
      'BUDGET2_DISBURSE_FIN_AMT',
      'BUDGETR_STOBS_REV_AMT',
      'BUDGET_STOBS_REV_AMT',
      'BUDGET1_STOBS_REV_AMT',
      'BUDGET2_STOBS_REV_AMT',
      'BUDGETR_COMMISSION_AMT',
      'BUDGET_COMMISSION_AMT',
      'BUDGET1_COMMISSION_AMT',
      'BUDGET2_COMMISSION_AMT',
      'BUDGETR_DOUBTFUL_ACCT_AMT',
      'BUDGET_DOUBTFUL_ACCT_AMT',
      'BUDGET1_DOUBTFUL_ACCT_AMT',
      'BUDGET2_DOUBTFUL_ACCT_AMT',
    ];
    const auditDetails = {
      idir: user.value?.idir_username,
      loginDate: user.value?.iat
        ? new Date(user.value?.iat * 1000).toISOString()
        : new Date().toISOString(),
      createdDate: new Date().toISOString(),
    };
    await excelService.exportToExcel(
      extractedData.value,
      columnOrder,
      auditDetails,
    );
    console.log('Excel file has been created successfully!');
  } catch (error) {
    console.error('Error exporting to Excel:', error);
  }
};
</script>
