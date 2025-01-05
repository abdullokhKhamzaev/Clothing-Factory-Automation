import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useCompletedUnripeMaterialOrders = defineStore('completed_unripe_material_orders', () => {
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
    try {
      return client.get('completed_unripe_material_orders' + url)
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
