import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useRipeMaterialRepaint = defineStore('ripe_material_repaint', () => {
  async function fetchRepaintOrders(filterProps) {
    const params = new URLSearchParams();

    params.set('page', filterProps?.page || 1);
    params.set('itemsPerPage', filterProps?.rowsPerPage || 10);
    params.set('pagination', filterProps?.rowsPerPage === '~' ? 'false' : 'true');

    if (filterProps.status) {
      params.set('status', filterProps.status);
    }
    try {
      return await client.get(`ripe_material_repaints?${params.toString()}`);
    } catch (e) {
      console.log(e)
    }
  }
  async function createOrder(data) {
    try {
      return client.post('ripe_material_repaints', data)
    } catch (e) {
      console.log(e)
    }
  }

  function receive(id, data) {
    try {
      return client.put('ripe_material_repaints/' + id, data)
    } catch (e) {
      console.log(e)
    }
  }

  return { fetchRepaintOrders, receive, createOrder }
})
