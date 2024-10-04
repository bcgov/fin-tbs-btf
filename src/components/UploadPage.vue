<template>
 <v-row dense >
    <v-col class="d-flex justify-start">
      <h5>Upload Page</h5>      
    </v-col>
  </v-row>
  <v-row dense >
    <v-col class="d-flex flex-column align-start justify-start">
      <p>Todo: show controls for uploading PDFs</p>
      <v-btn class="btn-secondary" @click="download">Download audit</v-btn>  
    </v-col>
  </v-row>
  
    
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/auth-store';
import { storeToRefs } from 'pinia';

const authStore = useAuthStore();
const {
  user
} = storeToRefs(authStore);

const download = () => {
  // Extract and format the relevant data
  const auditDetails = {
      idir: user.value?.idir_username,
      login: user.value?.iat ? new Date(user.value?.iat * 1000).toISOString() : new Date().toISOString(),
      created: new Date().toISOString()
    }

  // Create text content from the object
  const textContent = `
    IDIR: ${auditDetails.idir}
    Logged in: ${auditDetails.login}
    File created: ${auditDetails.created}
  `;

  // Create a text file
  const textBlob = new Blob([textContent], { type: 'text/plain' });
  const url = URL.createObjectURL(textBlob);
  
  // Create an anchor element to trigger the download
  const link = document.createElement('a');
  link.href = url;
  link.download = 'user-info.txt';
  link.click();
  URL.revokeObjectURL(url); // Clean up the URL object  
};

</script>