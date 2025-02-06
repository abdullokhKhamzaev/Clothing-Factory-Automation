import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useProductWarehouse = defineStore('product_in_warehouse_action', () => {
  async function getAll(filterProps) {
    let url = ''

    if (filterProps?.page) {
      url += '?page=' + filterProps.page
    } else {
      url += '?page=1'
    }

    if ( filterProps?.toWarehouse ) {
      url += '&toWarehouse=' + filterProps.toWarehouse
    }

    if ( filterProps?.toWarehouses ) {
      filterProps.toWarehouses.forEach((warehouse) => {
        url += '&toWarehouse[]=' + warehouse
      })
    }

    if ( filterProps?.fromWarehouse ) {
      url += '&fromWarehouse=' + filterProps.fromWarehouse
    }

    if ( filterProps?.fromWarehouses ) {
      filterProps.fromWarehouses.forEach((warehouse) => {
        url += '&fromWarehouse[]=' + warehouse
      })
    }

    try {
      return await client.get('product_in_warehouse_actions' + url);
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

  async function accept(id) {
    try {
      return client.put('product_in_warehouse_actions/' + id + '/accept', {status: 'accepted'})
    } catch (e) {
      console.log(e)
    }
  }

  async function reject(id) {
    try {
      return client.put('product_in_warehouse_actions/' + id + '/accept', {status: 'rejected'})
    } catch (e) {
      console.log(e)
    }
  }


  return { getAll, send, accept, reject }
})
