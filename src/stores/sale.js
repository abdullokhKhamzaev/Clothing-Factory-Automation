import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useSale = defineStore('sales', () => {
  async function fetchSales(filterProps) {
    let url = ''

    if (filterProps?.page) {
      url += '?page=' + filterProps.page
    } else {
      url += '?page=1'
    }

    if (filterProps?.customer) {
      url += '&customer.fullName=' + filterProps.customer
    }

    try {
      return client.get('sales' + url)
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
