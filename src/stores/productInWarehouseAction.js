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

    console.log(filterProps);
    console.log(url);

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

  // async function confirmUnripeMaterialOrder(id) {
  //   try {
  //     return client.put('unripe_material_orders/' + id, {status: 'confirmed'})
  //   } catch (e) {
  //     console.log(e)
  //   }
  // }


  return { getAll, send }
})
