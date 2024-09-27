import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import * as process from 'node:process';

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.BASE ||'',
  plugins: [vue()],
})
