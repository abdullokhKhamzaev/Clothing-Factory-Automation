import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useEmbroidery = defineStore('embroidery', () => {
  async function fetchEmbroideries(filterProps) {
    const params = new URLSearchParams();

    params.set('page', filterProps?.page || 1);
    params.set('itemsPerPage', filterProps?.rowsPerPage || 10);
    params.set('pagination', filterProps?.rowsPerPage === '~' ? 'false' : 'true');

    try {
      return await client.get(`embroideries?${params.toString()}`);
    } catch (e) {
      console.log(e)
    }
  }

  async function create(data) {
    try {
      return client.post('embroideries', data)
    } catch (e) {
      console.log(e)
    }
  }

  async function update(id, data) {
    try {
      return client.put('embroideries/' + id, data)
    } catch (e) {
      console.log(e)
    }
  }

  function deleteEmbroidery(id) {
    try {
      return client.delete('embroideries/' + id)
    } catch (e) {
      console.log(e)
    }
  }

  return { fetchEmbroideries, create, update, deleteEmbroidery }
})
