<script setup lang="ts">
import { logout, _kc } from '../services/keycloak'
</script>

<template>
  
  <h1>Welcome {{ _kc.tokenParsed?.display_name }} {{ _kc.tokenParsed?.resource_access }}</h1><button @click="logout">logout</button>

</template>
