import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useProductWarehouse = defineStore('product_in_warehouse_action', () => {
  async function list(filterProps) {
    const params = new URLSearchParams();

    params.set('page', filterProps?.page || 1);
    params.set('itemsPerPage', filterProps?.rowsPerPage || 10);
    params.set('pagination', filterProps?.rowsPerPage === '~' ? 'false' : 'true');

    if (filterProps.status) {
      params.set('status', filterProps.status);
    }

    if (filterProps.sentBy) {
      params.set('sentBy', filterProps.sentBy);
    }

    if (filterProps.date) {
      params.set('createdAt', filterProps.date);
    }

    if (filterProps.toWarehouse) {
      params.set('toWarehouse', filterProps.toWarehouse);
    }

    if (filterProps.toWarehouses) {
      filterProps.toWarehouses.forEach(warehouse => {
        params.append('toWarehouse[]', warehouse);
      });
    }

    if (filterProps.fromWarehouse) {
      params.set('fromWarehouse', filterProps.fromWarehouse);
    }

    if (filterProps.fromWarehouses) {
      filterProps.fromWarehouses.forEach(warehouse => {
        params.append('fromWarehouse[]', warehouse);
      });
    }

    if (filterProps.receivedAtFrom) {
      params.set('receivedAt[after]', filterProps.receivedAtFrom);
    }

    if (filterProps.receivedAtTo) {
      params.set('receivedAtTo[before]', filterProps.receivedAtTo);
    }

    if (filterProps.createdAtFrom) {
      params.set('createdAt[after]', filterProps.createdAtFrom);
    }
    if (filterProps.createdAtTo) {
      params.set('createdAt[before]', filterProps.createdAtTo);
    }

    try {
      return await client.get(`product_in_warehouse_actions?${params.toString()}`);
    } catch (e) {
      console.log(e)
    }
  }

  async function send(data) {
    try {
      return client.post('product_in_warehouse_actions', data)
    } catch (e) {
      console.log(e)
    }
  }

  async function accept(id, data) {
    try {
      return client.put('product_in_warehouse_actions/' + id + '/accept', data)
    } catch (e) {
      console.log(e)
    }
  }

  async function reject(id, data) {
    try {
      return client.put('product_in_warehouse_actions/' + id + '/accept', data)
    } catch (e) {
      console.log(e)
    }
  }

  return { list, send, accept, reject }
})
