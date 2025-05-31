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

    if (filterProps?.id) {
      url += '&customer.id=' + filterProps.id
      console.log(filterProps);
    }

    if (filterProps?.customer) {
      url += '&customer.fullName=' + filterProps.customer
    }

    if (typeof filterProps?.isPayed !== 'undefined' && typeof filterProps.isPayed === 'boolean') {
      url += '&isPayed=' + filterProps.isPayed
    }

    try {
      return client.get('sales' + url)
    } catch (e) {
      console.log(e)
    }
  }

  async function fetchSalesAll(filterProps) {
    let url = ''

    if (filterProps?.id) {
      url += '&customer.id=' + filterProps.id
    }

    if (filterProps?.customer) {
      url += '&customer.fullName=' + filterProps.customer
    }

    if (typeof filterProps?.isPayed !== 'undefined' && typeof filterProps.isPayed === 'boolean') {
      url += '&isPayed=' + filterProps.isPayed
    }

    try {
      return client.get('sales/all?' + url)
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

  return { fetchSales, fetchSalesAll, create }
})
