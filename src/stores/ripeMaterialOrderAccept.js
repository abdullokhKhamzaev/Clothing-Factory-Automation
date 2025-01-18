import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useRipeMaterialOrderAccept = defineStore('ripe_material_order_accepts', () => {
  async function fetchPurchases(filterProps) {
    let url = ''

    if (filterProps?.page) {
      url += '?page=' + filterProps.page
    } else {
      url += '?page=1'
    }

    try {
      return client.get('ripe_material_order_accepteds' + url)
    } catch (e) {
      console.log(e)
    }
  }
  async function accept(data) {
    try {
      return client.post('ripe_material_order_accepteds', data)
    } catch (e) {
      console.log(e)
    }
  }

  return { fetchPurchases, accept }
})
