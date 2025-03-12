import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useCustomer = defineStore('customers', () => {
  async function fetchCustomers(filterProps) {
    let url = ''

    if (filterProps?.page) {
      url += '?page=' + filterProps.page
    } else {
      url += '?page=1'
    }

    if (filterProps?.fullName) {
      url += '&fullName=' + filterProps.fullName
    }

    try {
      return client.get('customers' + url)
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

  return { fetchCustomers, create, update, deleteCustomer }
})
