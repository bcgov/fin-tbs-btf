<template>
  <v-row dense class="w-100 h-100">
    <v-col class="d-flex justify-center align-center w-100 h-100">
      <v-card class="login-card bg-grey-lighten-5">
        <v-card-text
          class="h-100 d-flex flex-column justify-center align-center"
        >
          <div>
            <h2 class="mb-2">Log in</h2>
            <v-btn class="btn-primary" @click="login()" v-if="!isAuthenticated"
              >Login with IDIR MFA</v-btn
            >
            <v-btn class="btn-primary" to="upload" v-if="isAuthenticated"
              >Upload files</v-btn
            >
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { useAuthStore } from "../stores/auth-store";
import { storeToRefs } from "pinia";

const authStore = useAuthStore();
const { isAuthenticated } = storeToRefs(authStore);

const login = () => {
  authStore.init(true);
};
</script>

<style>
.login-card {
  min-width: 50%;
  height: 200px;
}
</style>
