import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const usePaintFabric = defineStore('paint_fabric', () => {
  async function fetchFabrics(filterProps) {
    const params = new URLSearchParams();

    params.set('page', filterProps?.page || 1);
    params.set('itemsPerPage', filterProps?.rowsPerPage || 10);
    params.set('pagination', filterProps?.rowsPerPage === '~' ? 'false' : 'true');

    try {
      return await client.get(`paint_fabrics?${params.toString()}`);
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
