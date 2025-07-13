import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useTransaction = defineStore('transaction', () => {
  async function list(filterProps = {}) {
    const params = new URLSearchParams();

    params.set('page', filterProps?.page || 1);
    params.set('itemsPerPage', filterProps?.rowsPerPage || 10);
    params.set('pagination', filterProps?.rowsPerPage === '~' ? 'false' : 'true');

    // if (filterProps.status) {
    //   params.set('status', filterProps.status);
    // }

    try {
      return await client.get(`transactions?${params.toString()}`);
    } catch (e) {
      console.log(e)
    }
  }

  return { list }
})
