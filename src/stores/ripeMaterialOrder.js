import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useRipeMaterialOrder = defineStore('ripe_material_order', () => {
  async function fetchRipeMaterialOrder(filterProps) {
    const params = new URLSearchParams();

    params.set('page', filterProps?.page || 1);
    params.set('itemsPerPage', filterProps?.rowsPerPage || 10);
    params.set('pagination', filterProps?.rowsPerPage === '~' ? 'false' : 'true');

    if (filterProps.status) {
      params.set('status', filterProps.status);
    }
    try {
      return await client.get(`ripe_material_orders?${params.toString()}`);
    } catch (e) {
      console.log(e)
    }
  }

  async function createRipeMaterialOrder(data) {
    try {
      return client.post('ripe_material_orders', data)
    } catch (e) {
      console.log(e)
    }
  }

  function completeRipeMaterialOrder(id, data) {
    try {
      return client.put('ripe_material_orders/' + id, data)
    } catch (e) {
      console.log(e)
    }
  }

  function deleteRipeMaterialOrder(id) {
    try {
      return client.delete('ripe_material_orders/' + id)
    } catch (e) {
      console.log(e)
    }
  }

  return { fetchRipeMaterialOrder, createRipeMaterialOrder, completeRipeMaterialOrder, deleteRipeMaterialOrder }
})
