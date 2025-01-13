import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useRipeMaterialOrder = defineStore('ripe_material_order', () => {
  async function fetchRipeMaterialOrder(filterProps) {
    let url = ''

    if (filterProps?.page) {
      url += '?page=' + filterProps.page
    } else {
      url += '?page=1'
    }

    if ( filterProps?.status ) {
      url += '&status=' + filterProps.status
    }
    //
    // if ( filterProps?.statuses ) {
    //   filterProps.statuses.forEach((status) => {
    //     url += '&status[]=' + status
    //   })
    // }
    try {
      return await client.get('ripe_material_orders' + url);
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

  return { fetchRipeMaterialOrder, createRipeMaterialOrder }
})
