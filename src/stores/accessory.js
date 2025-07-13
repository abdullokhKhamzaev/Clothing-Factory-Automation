import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useAccessory = defineStore('accessory', () => {
  async function fetchAccessories(filterProps) {
    const params = new URLSearchParams();

    params.set('page', filterProps?.page || 1);
    params.set('itemsPerPage', filterProps?.rowsPerPage || 10);
    params.set('pagination', filterProps?.rowsPerPage === '~' ? 'false' : 'true');

    if (filterProps.types) {
      filterProps.types.forEach(status => {
        params.append('type[]', status);
      });
    }

    try {
      return await client.get(`accessories?${params.toString()}`);
    } catch (e) {
      console.log(e)
    }
  }

  async function create(data) {
    try {
      return client.post('accessories', data)
    } catch (e) {
      console.log(e)
    }
  }

  async function update(id, data) {
    try {
      return client.put('accessories/' + id, data)
    } catch (e) {
      console.log(e)
    }
  }

  function deleteAccessory(id) {
    try {
      return client.delete('accessories/' + id)
    } catch (e) {
      console.log(e)
    }
  }

  return { fetchAccessories, create, update, deleteAccessory }
})
