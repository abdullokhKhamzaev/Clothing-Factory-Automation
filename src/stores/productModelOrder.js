import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useProductModelOrder = defineStore('product_model_order', () => {
  async function fetchOrders(filterProps = {}) {
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
      return await client.get(`product_model_orders?${params.toString()}`);
    } catch (e) {
      console.log(e)
    }
  }

  async function createOrder(data) {
    try {
      return client.post('product_model_orders', data)
    } catch (e) {
      console.log(e)
    }
  }

  function confirm(id, data) {
    try {
      return client.put('product_model_orders/' + id, data)
    } catch (e) {
      console.log(e)
    }
  }

  function complete(id) {
    try {
      return client.put('product_model_orders/' + id, { status: 'completed' })
    } catch (e) {
      console.log(e)
    }
  }

  function updateOrder(id, data) {
    try {
      return client.put('product_model_orders/' + id, data)
    } catch (e) {
      console.log(e)
    }
  }


  return { fetchOrders, createOrder, updateOrder, confirm, complete }
})
