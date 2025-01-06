import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const usePaintFabric = defineStore('paint_fabric', () => {
  async function fetchFabrics(filterProps) {
    let url = ''

    if (filterProps?.page) {
      url += '?page=' + filterProps.page
    } else {
      url += '?page=1'
    }

    try {
      return client.get('paint_fabrics' + url)
    } catch (e) {
      console.log(e)
    }
  }

  async function createFabric(data) {
    try {
      return client.post('paint_fabrics', data)
    } catch (e) {
      console.log(e)
    }
  }

  async function editFabric(id, data) {
    try {
      return client.patch('paint_fabrics/' + id, data)
    } catch (e) {
      console.log(e)
    }
  }

  function deleteFabric(id) {
    try {
      return client.delete('paint_fabrics/' + id)
    } catch (e) {
      console.log(e)
    }
  }

  return { fetchFabrics, createFabric, editFabric, deleteFabric }
})
