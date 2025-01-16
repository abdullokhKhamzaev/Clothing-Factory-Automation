import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useCurrency = defineStore('currency', () => {
  async function fetchCurrencies(filterProps) {
    let url = ''

    if (filterProps?.page) {
      url += '?page=' + filterProps.page
    } else {
      url += '?page=1'
    }

    try {
      return client.get('currencies' + url)
    } catch (e) {
      console.log(e)
    }
  }

  return { fetchCurrencies }
})
