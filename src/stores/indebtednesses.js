import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useIndebtedness = defineStore('indebtedness', () => {
  async function list(filterProps) {
    const params = new URLSearchParams();

    params.set('page', filterProps?.page || 1);
    params.set('itemsPerPage', filterProps?.rowsPerPage || 10);
    params.set('pagination', filterProps?.rowsPerPage === '~' ? 'false' : 'true');

    try {
      return await client.get(`indebtednesses?${params.toString()}`);
    } catch (e) {
      console.log(e)
    }
  }

  async function create(data) {
    try {
      return client.post('indebtednesses', data)
    } catch (e) {
      console.log(e)
    }
  }

  return { list, create }
})
