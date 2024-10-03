<template>
  
  <h1>Welcome {{ _kc.tokenParsed?.display_name }}, roles you have are {{ _kc.tokenParsed?.client_roles }}</h1>
  
  <button @click="logout">logout</button>
  <button @click="download">download</button>

</template>

<script setup lang="ts">
import { logout, _kc } from '../services/keycloak'

const download = () => {
  // Extract and format the relevant data
  const auditDetails = {
      idir: _kc.tokenParsed?.idir_username,
      login: _kc.tokenParsed?.iat ? new Date(_kc.tokenParsed?.iat * 1000).toISOString() : new Date().toISOString(),
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