import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useCompletedUnripeMaterialOrders = defineStore('completed_unripe_material_orders', () => {
  async function fetchOrders(filterProps) {
    const params = new URLSearchParams();

    params.set('page', filterProps?.page || 1);
    params.set('itemsPerPage', filterProps?.rowsPerPage || 10);
    params.set('pagination', filterProps?.rowsPerPage === '~' ? 'false' : 'true');

    if (filterProps.status) {
      params.set('status', filterProps.status);
    }

    try {
      return await client.get(`completed_unripe_material_orders?${params.toString()}`);
    } catch (e) {
      console.log(e)
    }
  }
  async function createCompletedUnripeMaterialOrders(data) {
    try {
      return client.post('completed_unripe_material_orders', data)
    } catch (e) {
      console.log(e)
    }
  }

  async function acceptOrder(id, data) {
    try {
      return client.put('completed-unripe-material-orders/' + id + '/acceptance', data)
    } catch (e) {
      console.log(e)
    }
  }

  async function rejectOrder(id, data) {
    try {
      return client.put('completed_unripe_material_orders/' + id, data)
    } catch (e) {
      console.log(e)
    }
  }


  return { fetchOrders, createCompletedUnripeMaterialOrders, acceptOrder, rejectOrder }
})
