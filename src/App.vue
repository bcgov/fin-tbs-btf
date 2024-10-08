<template>
  <v-app>
    <MsieBanner v-if="isIE" />
    <Header />
    <SnackBar />
    <v-main fluid class="mx-4 my-4">
      <v-container class="h-100">
        <RouterView />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { RouterView } from "vue-router";
import { computed } from "vue";
import Header from "./components/Header.vue";
import MsieBanner from "./components/MsieBanner.vue";
import SnackBar from "./components/SnackBar.vue";

const isIE = computed(() => {
  return /Trident\/|MSIE/.test(window.navigator.userAgent);
});
</script>

<style>
@import "@bcgov/bc-sans/css/BCSans.css";

#app {
  max-width: 100% !important;
  width: 100% !important;
  padding: 0px !important;
  margin: 0px !important;
}

a {
  color: #255a90;
}

.v-container {
  width: 85%;
  margin-left: auto;
  margin-right: auto;
}

a:hover {
  cursor: pointer;
}

.envBanner {
  font-size: 0.8rem;
}

.v-application {
  font-family: "BCSans", "Noto Sans", Verdana, Arial, sans-serif !important;
}

.v-card--flat {
  background-color: transparent !important;
}

.theme--light.application {
  background: #f1f1f1;
}

h1 {
  font-size: 1.25rem;
}

.v-toolbar__title {
  font-size: 1rem;
}

.v-btn {
  text-transform: none !important;
}

.v-btn.btn-icon {
  min-width: 0px !important;
  padding: 4px !important;
}

.v-btn.btn-primary {
  background-color: #053662 !important;
  color: #ffffff !important;
  border: none !important;
}

.v-btn.btn-primary:hover {
  background-color: #1e5189 !important;
}

.v-btn.btn-secondary {
  background-color: #ffffff !important;
  color: #2d2d2d !important;
  border: 1px solid #323130 !important;
}

.v-btn.btn-secondary:hover {
  background-color: #edebe9 !important;
}
.v-btn.btn-secondary:disabled {
  background-color: #edebe9 !important;
  color: #aaaaaa !important;
  border: none !important;
}

.v-alert .v-icon {
  padding-left: 0;
}

.v-alert {
  color: #2d2d2d;
}
.v-alert.alert-success {
  background-color: #f6fff8 !important;
  border-color: #42814a !important;
}

.v-alert.alert-info {
  background-color: #f7f9fc !important;
  border-color: #053662 !important;
}

.v-alert.alert-warning {
  background-color: #fef1d8 !important;
  border-color: #f8bb47 !important;
}

.v-alert.alert-error {
  background-color: #f4e1e2 !important;
  border-color: #ce3e39 !important;
}

@media screen and (max-width: 370px) {
  .v-toolbar__title {
    font-size: 0.9rem;
    line-height: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  h1 {
    font-size: 0.9rem;
  }

  .v-application {
    line-height: 1.3;
  }
}

@media screen and (min-width: 371px) and (max-width: 600px) {
  .v-toolbar__title {
    font-size: 0.9rem;
    line-height: 1.5;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  h1 {
    font-size: 1rem;
  }

  .v-application {
    line-height: 1.3;
  }
}

@media screen and (min-width: 601px) and (max-width: 700px) {
  .v-toolbar__title {
    font-size: 1rem;
    line-height: 1.5;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  h1 {
    font-size: 1.2rem;
  }
}

.theme--light.v-btn.v-btn--disabled:not(.v-btn--text):not(.v-btn--outlined) {
  background-color: rgba(0, 0, 0, 0.12) !important;
}
</style>
