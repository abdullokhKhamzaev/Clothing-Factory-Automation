import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useRipeMaterialPurchase = defineStore('ripe_material_purchase', () => {
  async function fetchPurchases(filterProps) {
    let url = ''

    if (filterProps?.page) {
      url += '?page=' + filterProps.page
    } else {
      url += '?page=1'
    }

    try {
      return client.get('ripe_material_purchases' + url)
    } catch (e) {
      console.log(e)
    }
  }

  async function createPurchase(data) {
    try {
      return client.post('ripe_material_purchases', data)
    } catch (e) {
      console.log(e)
    }
  }

  return { createPurchase, fetchPurchases }
})
