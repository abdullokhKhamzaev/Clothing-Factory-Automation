import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useColor = defineStore('paint_fabric_colors', () => {
  async function fetchColors(filterProps) {
    let url = ''

    if (filterProps?.page) {
      url += '?page=' + filterProps.page
    } else {
      url += '?page=1'
    }

    try {
      return client.get('paint_fabric_colors' + url)
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
