<template>
  <v-app-bar absolute class="d-flex justify-center ps-4 pe-4">
    <RouterLink to="/"
      ><img
        src="../assets/images/bc-gov-logo-light.png"
        height="60"
        class="mr-2"
    /></RouterLink>
    <RouterLink to="/upload" class="text-primary"
      ><h3>Treasury Board Staff - Budget Transfer Form</h3></RouterLink
    >

    <v-spacer />

    <div v-if="user">
      <v-icon icon="mdi-account" size="small" />
      {{ user?.display_name }}
    </div>

    <v-btn
      class="btn-link ms-2"
      v-if="isAuthenticated"
      @click="authStore.logout()"
    >
      Logout
    </v-btn>

    <!-- Navbar content -->
  </v-app-bar>
</template>

<script setup lang="ts">
import { useAuthStore } from "../stores/auth-store";
import { watch } from "vue";
import { storeToRefs } from "pinia";

const authStore = useAuthStore();
const { user, isAuthenticated } = storeToRefs(authStore);

watch(
  isAuthenticated,
  () => {
    console.log(`isAuthenticated ${isAuthenticated.value}`);
  },
  { immediate: true },
);
</script>

<style lang="css">
.gov-header .v-icon {
  padding-left: 10px;
}

.mainTitle {
  font-size: 1.2rem;
}

.display-name {
  color: white;
}

a {
  text-decoration: none;
}

.logo {
  padding-right: 30px;
}

.gov-header .title {
  color: #fff;
  text-decoration: none;
}

.sysBar {
  border-bottom: 2px solid rgb(252, 186, 25) !important;
}

.gov-header .v-btn,
.v-btn--active.title:before,
.v-btn.title:focus:before,
.v-btn.title:hover:before {
  color: #fff;
  background: none;
}

.v-input__slot {
  padding-top: 10px;
}

.top-down {
  padding-top: 20px;
  height: 80%;
}

.v-list-item-title.styles-override {
  font-weight: 600;
  padding-bottom: 5px;
}

.v-list-item-subtitle.styles-override {
  line-height: 1.2rem;
}

@media screen and (max-width: 801px) {
  .logo {
    width: 100px;
  }

  .mainTitle {
    font-size: 1rem;
  }

  .display-name {
    display: none;
  }
}
</style>
