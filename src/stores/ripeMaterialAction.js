import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useRipeMaterialAction = defineStore('ripe_material_action', () => {
  async function create(data) {
    try {
      return client.post('ripe_material_actions', data)
    } catch (e) {
      console.log(e)
    }
  }

  return { create }
})
