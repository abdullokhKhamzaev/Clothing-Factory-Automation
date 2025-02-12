import { defineStore } from "pinia";
import { client } from "boot/axios.js";

// For updating warehouse after revision
export const useProductInWarehouse = defineStore('product_in_warehouse', () => {
  async function update(id, data) {
    try {
      return client.put('product_in_warehouses/' + id, data)
    } catch (e) {
      console.log(e)
    }
  }

  return { update }
})
