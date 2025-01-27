import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useWarehouse = defineStore('warehouse', () => {
  async function fetchWarehouses(filterProps) {
    let url = ''

    if (filterProps?.page) {
      url += '?page=' + filterProps.page
    } else {
      url += '?page=1'
    }

    if ( filterProps?.name ) {
      url += '&name=' + filterProps.name
    }

    try {
      return await client.get('warehouses' + url);
    } catch (e) {
      console.log(e)
    }
  }


  return { fetchWarehouses }
})
