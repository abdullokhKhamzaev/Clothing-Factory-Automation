import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useMaterial = defineStore('material', () => {
  async function fetchMaterials(filterProps) {
    const params = new URLSearchParams();

    params.set('page', filterProps?.page || 1);
    params.set('itemsPerPage', filterProps?.rowsPerPage || 10);
    params.set('pagination', filterProps?.rowsPerPage === '~' ? 'false' : 'true');

    if (filterProps.name) {
      params.set('name', filterProps.name);
    }

    try {
      return await client.get(`materials?${params.toString()}`);
    } catch (e) {
      console.log(e)
    }
  }

  async function createMaterial(data) {
    try {
      return client.post('materials', data)
    } catch (e) {
      console.log(e)
    }
  }

  async function editMaterial(id, data) {
    try {
      return client.patch('materials/' + id, data)
    } catch (e) {
      console.log(e)
    }
  }

  function deleteMaterial(id) {
    try {
      return client.delete('materials/' + id)
    } catch (e) {
      console.log(e)
    }
  }

  return { fetchMaterials, createMaterial, editMaterial, deleteMaterial }
})
