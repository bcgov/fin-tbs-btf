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
            : 'mdi-check'
        "
        :color="uploadedFile.validationErrors.length ? 'error' : 'success'"
      ></v-icon>
      {{ uploadedFile.file.name }}
    </template>
    <template v-slot:append>
      <div class="ms-2">
        <v-btn
          icon="mdi-delete"
          size="x-small"
          @click="uploadedFilesStore.removeUploadedFile(uploadedFile)"
        ></v-btn>
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
