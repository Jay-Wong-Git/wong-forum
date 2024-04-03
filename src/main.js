import { createApp } from "vue";
import App from "./App.vue";
import router from "@/router";
import axios from "axios";
import { createPinia } from "pinia";
import "element-plus/theme-chalk/dark/css-vars.css";
import "./assets/quill.css";

axios.defaults.baseURL = "http://wongblog.icu:81";

const app = createApp(App);
app.use(router);
app.use(createPinia());

app.mount("#app");
