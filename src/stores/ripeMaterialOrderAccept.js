import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useRipeMaterialOrderAccept = defineStore('ripe_material_order_accepts', () => {
  async function accept(data) {
    try {
      return client.post('ripe_material_order_accepteds', data)
    } catch (e) {
      console.log(e)
    }
  }

  return { accept }
})
