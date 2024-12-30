import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useAuth = defineStore('auth', () => {
  function auth(data) {
    return client.post('users/auth', data)
  }

  return { auth }
})
