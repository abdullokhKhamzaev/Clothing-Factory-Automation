import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useRipeMaterial = defineStore('ripe_material', () => {
  async function fetchRipeMaterials(filterProps) {
    const params = new URLSearchParams();

    params.set('page', filterProps?.page || 1);
    params.set('itemsPerPage', filterProps?.rowsPerPage || 10);
    params.set('pagination', filterProps?.rowsPerPage === '~' ? 'false' : 'true');

    try {
      return await client.get(`ripe_materials?${params.toString()}`);
    } catch (e) {
      console.log(e)
    }
  }

  async function createRipeMaterial(data) {
    try {
      return client.post('ripe_materials', data)
    } catch (e) {
      console.log(e)
    }
  }

  async function editRipeMaterial(id, data) {
    try {
      return client.put('ripe_materials/' + id, data)
    } catch (e) {
      console.log(e)
    }
  }

  function deleteRipeMaterial(id) {
    try {
      return client.delete('ripe_materials/' + id)
    } catch (e) {
      console.log(e)
    }
  }

  return { fetchRipeMaterials, createRipeMaterial, editRipeMaterial, deleteRipeMaterial }
})
