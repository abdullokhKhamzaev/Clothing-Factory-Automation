import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useUnripeMaterialOrder = defineStore('unripe_material_order', () => {
  async function fetchUnripeMaterialOrder(filterProps) {
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
      return client.get('unripe_material_orders' + url)
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
