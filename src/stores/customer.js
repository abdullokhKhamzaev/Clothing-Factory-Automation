import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useCustomer = defineStore('customers', () => {
  async function fetchCustomers(filterProps = {}) {
    let url = '?page=' + (filterProps.page || 1);

    for (const key in filterProps) {
      if (key !== 'page' && filterProps[key] != null && filterProps[key] !== '') {
        url += `&${key}=${encodeURIComponent(filterProps[key])}`;
      }
    }

    try {
      return client.get('customers' + url);
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
