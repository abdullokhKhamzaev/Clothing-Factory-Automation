import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useWorkEntries = defineStore('work_entries', () => {
  async function list(filterProps) {
    const params = new URLSearchParams();

    params.set('page', filterProps?.page || 1);
    params.set('itemsPerPage', filterProps?.rowsPerPage || 10);
    params.set('pagination', filterProps?.rowsPerPage === '~' ? 'false' : 'true');

    if (filterProps.workerBy) {
      params.set('workerBy', filterProps.workerBy);
    }

    if (filterProps.dateFrom) {
      params.set('createdAt[after]', filterProps.dateFrom);
    }
    if (filterProps.dateTo) {
      params.set('createdAt[before]', filterProps.dateTo);
    }

    if (filterProps.unitPrice != null) {
      params.set('unitPrice[gt]', filterProps.unitPrice);
    }

    try {
      return await client.get(`work_entries?${params.toString()}`);
    } catch (e) {
      console.log(e)
    }
  }


  return { list }
})
