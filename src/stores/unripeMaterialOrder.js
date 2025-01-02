import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useUnripeMaterialOrder = defineStore('unripe_material_order', () => {
  async function fetchUnripeMaterialOrder(url) {
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

  async function confirmUnripeMaterialOrder(id, data) {
    try {
      return client.put('unripe_material_orders/' + id, data)
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


  return { fetchUnripeMaterialOrder, createUnripeMaterialOrder, confirmUnripeMaterialOrder, deleteUnripeMaterialOrder }
})
