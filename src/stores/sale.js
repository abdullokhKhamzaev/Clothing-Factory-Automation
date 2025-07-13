import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useSale = defineStore('sales', () => {
  async function fetchSales(filterProps) {
    const params = new URLSearchParams();

    params.set('page', filterProps?.page || 1);
    params.set('itemsPerPage', filterProps?.rowsPerPage || 10);
    params.set('pagination', filterProps?.rowsPerPage === '~' ? 'false' : 'true');

    if (filterProps.id) {
      params.set('customer.id', filterProps.id);
    }

    if (filterProps.customer) {
      params.set('customer.fullName', filterProps.customer);
    }

    if (typeof filterProps?.isPayed !== 'undefined' && typeof filterProps.isPayed === 'boolean') {
      params.set('isPayed', filterProps.isPayed);
    }

    if (filterProps.createdAtFrom) {
      params.set('createdAt[after]', filterProps.createdAtFrom);
    }

    if (filterProps.createdAtTo) {
      params.set('createdAt[before]', filterProps.createdAtTo);
    }

    try {
      return await client.get(`sales?${params.toString()}`);
    } catch (e) {
      console.log(e)
    }
  }

  async function create(data) {
    try {
      return client.post('sales', data)
    } catch (e) {
      console.log(e)
    }
  }

  // async function update(id, data) {
  //   try {
  //     return client.put('sales/' + id, data)
  //   } catch (e) {
  //     console.log(e)
  //   }
  // }

  // function deleteSale(id) {
  //   try {
  //     return client.delete('sales/' + id)
  //   } catch (e) {
  //     console.log(e)
  //   }
  // }

  return { fetchSales, create }
})
