import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useCutterRipeMaterialWarehouse = defineStore('cutter_ripe_material_warehouse', () => {
  async function list(filterProps = {}) {
    const params = new URLSearchParams();

    params.set('page', filterProps?.page || 1);
    params.set('itemsPerPage', filterProps?.rowsPerPage || 10);
    params.set('pagination', filterProps?.rowsPerPage === '~' ? 'false' : 'true');

    try {
      return await client.get(`cutter_ripe_material_warehouses?${params.toString()}`);
    } catch (e) {
      console.log(e)
    }
  }

  return { list }
})
