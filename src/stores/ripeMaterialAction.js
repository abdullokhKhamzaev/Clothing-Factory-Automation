import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useRipeMaterialAction = defineStore('ripe_material_action', () => {
  async function getAll(filterProps) {
    let url = ''

    if (filterProps?.page) {
      url += '?page=' + filterProps.page
    } else {
      url += '?page=1'
    }

    try {
      return client.get('ripe_material_actions' + url)
    } catch (e) {
      console.log(e)
    }
  }

  async function create(data) {
    try {
      return client.post('ripe_material_actions', data)
    } catch (e) {
      console.log(e)
    }
  }

  return { getAll, create }
})
