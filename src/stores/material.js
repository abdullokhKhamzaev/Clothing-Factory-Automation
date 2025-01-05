import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useMaterial = defineStore('material', () => {
  async function fetchMaterials(filterProps) {
    let url = ''

    if (filterProps?.page) {
      url += '?page=' + filterProps.page
    } else {
      url += '?page=1'
    }

    try {
      return client.get('materials' + url)
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
