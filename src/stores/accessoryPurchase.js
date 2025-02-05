import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useAccessoryPurchase = defineStore('accessory_purchase', () => {
  async function fetchPurchases(filterProps) {
    let url = ''

    if (filterProps?.page) {
      url += '?page=' + filterProps.page
    } else {
      url += '?page=1'
    }

    try {
      return client.get('accessory_purchases' + url)
    } catch (e) {
      console.log(e)
    }
  }

  async function createPurchase(data) {
    try {
      return client.post('accessory_purchases', data)
    } catch (e) {
      console.log(e)
    }
  }

  return { createPurchase, fetchPurchases }
})
