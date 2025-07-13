import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useUnripeMaterialOrder = defineStore('unripe_material_order', () => {
  async function fetchUnripeMaterialOrder(filterProps) {
    const params = new URLSearchParams();

    params.set('page', filterProps?.page || 1);
    params.set('itemsPerPage', filterProps?.rowsPerPage || 10);
    params.set('pagination', filterProps?.rowsPerPage === '~' ? 'false' : 'true');

    if (filterProps.status) {
      params.set('status', filterProps.status);
    }

    if (filterProps.statuses) {
      filterProps.statuses.forEach(status => {
        params.append('status[]', status);
      });
    }
    try {
      return await client.get(`unripe_material_orders?${params.toString()}`);
    } catch (e) {
      console.log(e)
    }
  }

  async function createUnripeMaterialOrder(data) {
    try {
      return client.post('unripe_material_orders', data)
    } catch (e) {
      console.log(e)
    }
  }

  async function confirmUnripeMaterialOrder(id) {
    try {
      return client.put('unripe_material_orders/' + id, {status: 'confirmed'})
    } catch (e) {
      console.log(e)
    }
  }

  async function finishUnripeMaterialOrder(id) {
    try {
      return client.put('unripe_material_orders/' + id, {status: 'completed'})
    } catch (e) {
      console.log(e)
    }
  }

  function deleteUnripeMaterialOrder(id) {
    try {
      return client.delete('unripe_material_orders/' + id)
    } catch (e) {
      console.log(e)
    }
  }


  return { fetchUnripeMaterialOrder, createUnripeMaterialOrder, confirmUnripeMaterialOrder, finishUnripeMaterialOrder, deleteUnripeMaterialOrder }
})
