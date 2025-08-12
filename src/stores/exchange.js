import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useExchange = defineStore('exchange', () => {
  async function list(filterProps) {
    const params = new URLSearchParams();

    params.set('page', filterProps?.page || 1);
    params.set('itemsPerPage', filterProps?.rowsPerPage || 10);
    params.set('pagination', filterProps?.rowsPerPage === '~' ? 'false' : 'true');

    if (filterProps.createdAtFrom) {
      params.set('createdAt[after]', filterProps.createdAtFrom);
    }

    if (filterProps.createdAtTo) {
      params.set('createdAt[before]', filterProps.createdAtTo);
    }

    try {
      return await client.get(`budget_sends?${params.toString()}`);
    } catch (e) {
      console.log(e)
    }
  }

  async function accept(id) {
    try {
      return client.put('budget_sends/' + id, {status: 'accepted'})
    } catch (e) {
      console.log(e)
    }
  }

  async function reject(id) {
    try {
      return client.put('budget_sends/' + id, {status: 'rejected'})
    } catch (e) {
      console.log(e)
    }
  }

  return { list, accept, reject }
})
