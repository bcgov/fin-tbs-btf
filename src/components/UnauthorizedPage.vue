<template>
  <v-row dense class="w-100 h-100">
    <v-col class="d-flex justify-center align-center w-100 h-100">
      <v-card class="login-card bg-grey-lighten-5">
        <v-card-text
          class="h-100 d-flex flex-column justify-center align-center"
        >
          <div>
            <h2 class="mb-2">
              You are not authorized to access the application.
            </h2>
            <p class="mb-2">If you require access, please contact Admin.</p>
            <v-btn class="btn-primary" @click="authStore.logout()">
              Logout
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { useAuthStore } from "../stores/auth-store";

const authStore = useAuthStore();
</script>
