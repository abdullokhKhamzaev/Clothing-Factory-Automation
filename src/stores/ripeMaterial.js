import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useRipeMaterial = defineStore('ripe_material', () => {
  async function fetchRipeMaterials(filterProps) {
    let url = ''

    if (filterProps?.pagination === false) {
      url = ''
    } else if (filterProps?.page) {
      url += '?page=' + filterProps.page
    } else {
      url += '?page=1'
    }

    try {
      return client.get('ripe_materials' + url)
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
