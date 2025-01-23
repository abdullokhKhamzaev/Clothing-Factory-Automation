import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useCutterRipeMaterialWarehouse = defineStore('cutter_ripe_material_warehouse', () => {
  async function getAll(filterProps) {
    let url = ''

    if (filterProps?.page) {
      url += '?page=' + filterProps.page
    } else {
      url += '?page=1'
    }

    try {
      return client.get('cutter_ripe_material_warehouses' + url)
    } catch (e) {
      console.log(e)
    }
  }

  return { getAll }
})
