import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useCurrency = defineStore('currency', () => {
  async function fetchCurrencies(url) {
    try {
      return client.get('currencies' + url)
    } catch (e) {
      console.log(e)
    }
  }

  return { fetchCurrencies }
})
