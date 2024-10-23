<template>
  <v-list-item class="d-flex justify-start">
    <template v-slot:default>
      <v-btn
        :loading="true"
        variant="text"
        v-if="uploadedFile.isLoading"
        class="px-0"
        style="min-width: 20px"
      ></v-btn>
      <v-icon
        v-if="!uploadedFile.isLoading"
        :icon="
          uploadedFile.validationErrors.length
            ? 'mdi-alert-circle'
            : uploadedFile.validationWarnings.length
              ? 'mdi-alert'
              : 'mdi-check'
        "
        :color="
          uploadedFile.validationErrors.length
            ? 'error'
            : uploadedFile.validationWarnings.length
              ? 'orange'
              : 'success'
        "
      ></v-icon>
      {{ uploadedFile.file.name }}<br />
      <div
        v-if="
          uploadedFile.validationWarnings.length &&
          !uploadedFile.validationErrors.length
        "
        class="ml-10 text-orange"
      >
        PDF Missing fields: {{ uploadedFile.validationWarnings.join(", ") }}
      </div>
    </template>
    <template v-slot:append>
      <div class="ms-2">
        <v-btn
          variant="plain"
          class="btn-icon"
          @click="uploadedFilesStore.removeUploadedFile(uploadedFile)"
        >
          <v-icon
            icon="mdi-close-thick"
            class="px-0"
            style="min-width: 0px"
            size="large"
          ></v-icon>
        </v-btn>
      </div>
    </template>
  </v-list-item>
</template>

<script lang="ts">
export default {
  name: "UploadedFileItem",
};
</script>

<script setup lang="ts">
import {
  UploadedFile,
  useUploadedFilesStore,
} from "../stores/uploaded-files-store";

const uploadedFilesStore = useUploadedFilesStore();

defineProps<{
  uploadedFile: UploadedFile;
}>();
</script>

<style>
.v-list-item {
  min-height: 0px !important;
}
</style>
