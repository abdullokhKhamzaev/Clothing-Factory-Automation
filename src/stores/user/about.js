import { defineStore } from "pinia";
import { client } from "boot/axios.js";
import { ref } from "vue";

export const useAbout = defineStore('about', () => {
  let about = ref([]);

  async function fetchAbout() {
    try {
      const { data } = await client.get('users/about_me')
      about.value = data
    } catch (e) {
      console.error(e)
      if (e.message === 'Request failed with status code 401') {
        localStorage.removeItem('accessToken')
      }
    }
  }

  return { fetchAbout, about }
})
