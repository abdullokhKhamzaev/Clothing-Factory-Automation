import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useProductModelOrderCompleted = defineStore('product_model_order_completed', () => {
  function getOrders(filterProps) {
    let url = ''

    if (filterProps?.page) {
      url += '?page=' + filterProps.page
    } else {
      url += '?page=1'
    }

    if ( filterProps?.status ) {
      url += '&status=' + filterProps.status
    }
    try {
      return client.get('product_model_order_completeds' + url)
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
