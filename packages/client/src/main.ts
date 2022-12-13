import { createApp } from "vue";
import { createPinia } from "pinia";
import ArcoVueIcon from "@arco-design/web-vue/es/icon";
import "@arco-design/web-vue/es/message/style/css.js";
import "@arco-design/web-vue/es/notification/style/css.js";

import App from "./App.vue";
import router from "./router";

import "./assets/main.css";

const app = createApp(App);

app.use(ArcoVueIcon);
app.use(createPinia());
app.use(router);

app.mount("#app");
