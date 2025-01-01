import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useAbout = defineStore('about', () => {
  async function fetchAbout(url) {
    try {
      return client.get('users/about_me' + url)
    } catch (e) {
      console.log(e)
    }
  }

  return { fetchAbout }
})
