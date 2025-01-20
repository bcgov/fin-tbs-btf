<template>
  <v-list-item class="d-flex justify-start">
    <template v-slot:default>
      <v-btn
        v-if="uploadedFile.isLoading"
        :loading="true"
        variant="text"
        class="px-0"
        style="min-width: 20px"
      ></v-btn>
      <v-icon
        v-if="!uploadedFile.isLoading"
        :icon="
          Object.keys(uploadedFile.validationErrors).length
            ? 'mdi-alert-circle'
            : Object.keys(uploadedFile.validationWarnings).length
              ? 'mdi-alert'
              : 'mdi-check'
        "
        :color="
          Object.keys(uploadedFile.validationErrors).length
            ? 'error'
            : Object.keys(uploadedFile.validationWarnings).length
              ? 'orange'
              : 'success'
        "
      ></v-icon>
      {{ uploadedFile.file.name }}<br />
      <div
        v-if="
          Object.keys(uploadedFile.validationWarnings).length &&
          !Object.keys(uploadedFile.validationErrors).length
        "
        class="ml-10 text-orange"
      >
        <div
          v-for="(warnings, name) in uploadedFile.validationWarnings"
          :key="name"
        >
          <span class="font-weight-bold">{{ name }}:</span>
          {{ warnings.join(", ") }}
        </div>
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
