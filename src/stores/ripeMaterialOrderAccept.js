import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useRipeMaterialOrderAccept = defineStore('ripe_material_order_accepts', () => {
  async function fetchPurchases(filterProps) {
    const params = new URLSearchParams();

    params.set('page', filterProps?.page || 1);
    params.set('itemsPerPage', filterProps?.rowsPerPage || 10);
    params.set('pagination', filterProps?.rowsPerPage === '~' ? 'false' : 'true');

    try {
      return await client.get(`ripe_material_order_accepteds?${params.toString()}`);
    } catch (e) {
      console.log(e)
    }
  }
  async function accept(data) {
    try {
      return client.post('ripe_material_order_accepteds', data)
    } catch (e) {
      console.log(e)
    }
  }

  return { fetchPurchases, accept }
})
