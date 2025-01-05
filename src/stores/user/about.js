import { defineStore } from "pinia";
import { client } from "boot/axios.js";
import { ref } from "vue";
import {useRouter} from "vue-router";

export const useAbout = defineStore('about', () => {
  let about = ref([]);

  async function fetchAbout() {
    try {
      const { data } = await client.get('users/about_me')
      about.value = data
    } catch (e) {
      await useRouter().push('/login')
      console.log(e.status)
    }
  }

  return { fetchAbout, about }
})
