import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useProductModelOrderCompleted = defineStore('product_model_order_completed', () => {
  async function getOrders(filterProps) {
    const params = new URLSearchParams();

    params.set('page', filterProps?.page || 1);
    params.set('itemsPerPage', filterProps?.rowsPerPage || 10);
    params.set('pagination', filterProps?.rowsPerPage === '~' ? 'false' : 'true');

    if (filterProps.status) {
      params.set('status', filterProps.status);
    }

    if (filterProps.createdAtFrom) {
      params.set('createdAt[after]', filterProps.createdAtFrom);
    }
    if (filterProps.createdAtTo) {
      params.set('createdAt[before]', filterProps.createdAtTo);
    }

    try {
      return await client.get(`product_model_order_completeds?${params.toString()}`);
    } catch (e) {
      console.log(e)
    }
  }
  function createReport(data) {
    try {
      return client.post('product_model_order_completeds', data)
    } catch (e) {
      console.log(e)
    }
  }

  async function accept(id, data) {
    try {
      return client.put('product_model_order_completeds/' + id + '/accept', data)
    } catch (e) {
      console.log(e)
    }
  }
  async function reject(id, data) {
    try {
      return client.put('product_model_order_completeds/' + id, data)
    } catch (e) {
      console.log(e)
    }
  }

  return { getOrders, createReport, accept, reject }
})
