import "@mdi/font/css/materialdesignicons.css";
import { createPinia } from "pinia";
import { createApp } from "vue";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import { fa } from "vuetify/iconsets/fa";
import { aliases, mdi } from "vuetify/iconsets/mdi";
import * as labs from "vuetify/labs/components";
import "vuetify/styles";
import colors from "vuetify/util/colors";
import App from "./App.vue";
import router from "./routes";
import "./style.css";

const theme = {
  dark: false,
  colors: {
    primary: "#003366",
    secondary: "#385a8a",
    error: "#ce3e39",
    warning: "#F8BB47",
    success: "#00A54F",
    link: "#255A90",
    tab: "#1E5189",
    white: "#ffffff",
  },
  variables: {
    "border-opacity": 0.24, //default 0.12
    "medium-emphasis-opacity": 0.8, //default 0.6
    "theme-error": "#ce3e39",
  },
};

const vuetify = createVuetify({
  icons: {
    defaultSet: "mdi",
    aliases,
    sets: {
      fa,
      mdi,
    },
  },
  theme: {
    defaultTheme: "theme",
    themes: {
      theme,
    },
  },
  components: {
    ...labs,
    ...components,
    ...directives,
    ...colors,
  },
});

export const app = createApp(App);
const pinia = createPinia();

app.use(pinia).use(router).use(vuetify).mount("#app");
