// shared.js

// 1. Global Config
const CONFIG = {
  API_BASE: "https://jsonplaceholder.typicode.com",
  TIMEOUT: 60000,
};

// 2. Axios Instance
const api = axios.create({
  baseURL: CONFIG.API_BASE,
  timeout: CONFIG.TIMEOUT,
});

// 3. API Definitions
const postApi = {
  getList: (params) => api.get("/posts", { params }),
  getById: (id) => api.get(`/posts/${id}`),
  create: (data) => api.post("/posts", data),
  update: (id, data) => api.put(`/posts/${id}`, data),
  remove: (id) => api.delete(`/posts/${id}`),
};

const commentApi = {
  getByPost: (postId) => api.get(`/posts/${postId}/comments`),
};

const userApi = {
  getList: (params) => api.get("/users", { params }),
  getById: (id) => api.get(`/users/${id}`),
};

// 4. Alpine Store (Inline Alert)
let _alertTimer = null;

document.addEventListener("alpine:init", () => {
  Alpine.store("alert", {
    message: "",
    type: "success",
    visible: false,
    show(msg, type = "success") {
      clearTimeout(_alertTimer);
      this.message = msg;
      this.type = type;
      this.visible = true;
      _alertTimer = setTimeout(() => {
        this.visible = false;
      }, 3000);
    },
    dismiss() {
      clearTimeout(_alertTimer);
      this.visible = false;
    },
  });
});

// 5. Global Utils
const toast = (msg, type) => Alpine.store("alert").show(msg, type);
const formatDate = (date) => dayjs(date).format("YYYY-MM-DD");
