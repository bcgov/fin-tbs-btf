<template>
  <v-row dense >
    <v-col class="d-flex justify-start">
      <h5>Dashboard</h5>
    </v-col>
  </v-row>
  
  <v-row dense>
    <v-col class="d-flex justify-start">
      <v-btn class="btn-primary" to="upload" v-if="!isAuthenticated">Login</v-btn>
      <v-btn class="btn-primary" to="upload" v-if="isAuthenticated">Upload files</v-btn>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import router from '../routes';
import { useAuthStore } from '../stores/auth-store';
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';

const authStore = useAuthStore();
const {
  isAuthenticated
} = storeToRefs(authStore);

onMounted(() => {
  console.log(`authStore.isAuthorized: ${authStore.isAuthorized}`)
  //if (authStore.isAuthorized) {
  //  router.push('/upload')
  //}
});

function login() {
  authStore.init()
}

</script>
