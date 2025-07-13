import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useCurrency = defineStore('currency', () => {
  async function fetchCurrencies(filterProps) {
    const params = new URLSearchParams();

    params.set('page', filterProps?.page || 1);
    params.set('itemsPerPage', filterProps?.rowsPerPage || 10);
    params.set('pagination', filterProps?.rowsPerPage === '~' ? 'false' : 'true');

    try {
      return await client.get(`currencies?${params.toString()}`);
    } catch (e) {
      console.log(e)
    }
  }

  return { fetchCurrencies }
})
