import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useCustomer = defineStore('customers', () => {
  async function fetchCustomers(filterProps = {}) {
    const params = new URLSearchParams();

    params.set('page', filterProps?.page || 1);
    params.set('itemsPerPage', filterProps?.rowsPerPage || 10);
    params.set('pagination', filterProps?.rowsPerPage === '~' ? 'false' : 'true');

    if (filterProps.fullName) {
      params.set('fullName', filterProps.fullName);
    }

    try {
      return await client.get(`customers?${params.toString()}`);
    } catch (e) {
      console.log(e);
    }
  }

  async function fetchCustomer(id) {
    try {
      return client.get('customers/' + id)
    } catch (e) {
      console.log(e)
    }
  }

  async function create(data) {
    try {
      return client.post('customers', data)
    } catch (e) {
      console.log(e)
    }
  }

  async function update(id, data) {
    try {
      return client.put('customers/' + id, data)
    } catch (e) {
      console.log(e)
    }
  }

  function deleteCustomer(id) {
    try {
      return client.delete('customers/' + id)
    } catch (e) {
      console.log(e)
    }
  }

  return { fetchCustomers, fetchCustomer, create, update, deleteCustomer }
})
