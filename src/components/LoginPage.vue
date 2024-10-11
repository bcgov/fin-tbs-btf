<template>
  <v-row dense class="w-100 h-100">
    <v-col class="d-flex justify-center align-center w-100 h-100">
      <v-card class="login-card bg-grey-lighten-5">
        <v-card-text
          class="h-100 d-flex flex-column justify-center align-center"
        >
          <div>
            <h2 class="mb-2">Log In</h2>
            <v-btn class="btn-primary" @click="login()"
              >Login with IDIR MFA</v-btn
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
import { useRouter } from "vue-router";

const router = useRouter();
const authStore = useAuthStore();
const { isAuthenticated } = storeToRefs(authStore);

const login = () => {
  if (!isAuthenticated.value) {
    authStore.init(true);
  } else {
    //already logged in, so bypass authentication and go directly into the app
    router.push("/");
  }
};
</script>

<style>
.login-card {
  min-width: 50%;
  height: 200px;
}
</style>
