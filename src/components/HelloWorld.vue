<script setup lang="ts">
import { logout, _kc } from '../services/keycloak'

</script>

<template>
  
  <h1>Welcome {{ _kc.tokenParsed?.display_name }}, roles you have are {{ _kc.tokenParsed?.client_roles }}</h1><button @click="logout">logout</button>

</template>
