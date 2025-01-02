import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useCompletedUnripeMaterialOrders = defineStore('completed_unripe_material_orders', () => {

  async function createCompletedUnripeMaterialOrders(data) {
    try {
      return client.post('completed_unripe_material_orders', data)
    } catch (e) {
      console.log(e)
    }
  }


  return { createCompletedUnripeMaterialOrders }
})
