import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useColor = defineStore('paint_fabric_colors', () => {
  async function fetchColors(filterProps) {
    const params = new URLSearchParams();

    params.set('page', filterProps?.page || 1);
    params.set('itemsPerPage', filterProps?.rowsPerPage || 10);
    params.set('pagination', filterProps?.rowsPerPage === '~' ? 'false' : 'true');

    try {
      return await client.get(`paint_fabric_colors?${params.toString()}`);
    } catch (e) {
      console.log(e)
    }
  }

  async function createColor(data) {
    try {
      return client.post('paint_fabric_colors', data)
    } catch (e) {
      console.log(e)
    }
  }

  async function editColor(id, data) {
    try {
      return client.patch('paint_fabric_colors/' + id, data)
    } catch (e) {
      console.log(e)
    }
  }

  function deleteColor(id) {
    try {
      return client.delete('paint_fabric_colors/' + id)
    } catch (e) {
      console.log(e)
    }
  }

  return { fetchColors, createColor, editColor, deleteColor }
})
