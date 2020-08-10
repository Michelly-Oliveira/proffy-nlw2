import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.111.105:3333",
});

export default api;
