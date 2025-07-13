import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useOrder = defineStore('orders', () => {
  async function fetchOrders(filterProps) {
    const params = new URLSearchParams();

    params.set('page', filterProps?.page || 1);
    params.set('itemsPerPage', filterProps?.rowsPerPage || 10);
    params.set('pagination', filterProps?.rowsPerPage === '~' ? 'false' : 'true');

    if (filterProps.customer) {
      params.set('customer.fullName', filterProps.customer);
    }

    if (filterProps.status) {
      params.set('status', filterProps.status);
    }

    try {
      return await client.get(`orders?${params.toString()}`);
    } catch (e) {
      console.log(e)
    }
  }

  async function create(data) {
    try {
      return client.post('orders', data)
    } catch (e) {
      console.log(e)
    }
  }

  async function update(id, data) {
    try {
      return client.put('sales/' + id, data)
    } catch (e) {
      console.log(e)
    }
  }

  // function deleteSale(id) {
  //   try {
  //     return client.delete('sales/' + id)
  //   } catch (e) {
  //     console.log(e)
  //   }
  // }

  return { fetchOrders, create, update }
})
