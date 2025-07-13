import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useWarehouse = defineStore('warehouse', () => {
  async function fetchWarehouses(filterProps) {
    const params = new URLSearchParams();

    params.set('page', filterProps?.page || 1);
    params.set('itemsPerPage', filterProps?.rowsPerPage || 10);
    params.set('pagination', filterProps?.rowsPerPage === '~' ? 'false' : 'true');

    if (filterProps.name) {
      params.set('name', filterProps.name);
    }

    try {
      return await client.get(`warehouses?${params.toString()}`);
    } catch (e) {
      console.log(e)
    }
  }


  return { fetchWarehouses }
})
