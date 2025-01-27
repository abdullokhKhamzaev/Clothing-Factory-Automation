import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useProductModelOrder = defineStore('product_model_order', () => {
  async function fetchOrders(filterProps) {
    let url = ''

    if (filterProps?.page) {
      url += '?page=' + filterProps.page
    } else {
      url += '?page=1'
    }

    if ( filterProps?.status ) {
      url += '&status=' + filterProps.status
    }

    if ( filterProps?.statuses ) {
      filterProps.statuses.forEach((status) => {
        url += '&status[]=' + status
      })
    }

    try {
      return await client.get('product_model_orders' + url);
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
