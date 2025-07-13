import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useAccessoryPurchase = defineStore('accessory_purchase', () => {
  async function fetchPurchases(filterProps) {
    const params = new URLSearchParams();

    params.set('page', filterProps?.page || 1);
    params.set('itemsPerPage', filterProps?.rowsPerPage || 10);
    params.set('pagination', filterProps?.rowsPerPage === '~' ? 'false' : 'true');

    try {
      return await client.get(`accessory_purchases?${params.toString()}`);
    } catch (e) {
      console.log(e)
    }
  }

  async function createPurchase(data) {
    try {
      return client.post('accessory_purchases', data)
    } catch (e) {
      console.log(e)
    }
  }

  return { createPurchase, fetchPurchases }
})
