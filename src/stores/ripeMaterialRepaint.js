import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useRipeMaterialRepaint = defineStore('ripe_material_repaint', () => {
  async function fetchRepaintOrders(filterProps) {
    let url = ''

    if (filterProps?.page) {
      url += '?page=' + filterProps.page
    } else {
      url += '?page=1'
    }

    if ( filterProps?.status ) {
      url += '&status=' + filterProps.status
    }
    try {
      return await client.get('ripe_material_repaints' + url);
    } catch (e) {
      console.log(e)
    }
  }
  async function createOrder(data) {
    try {
      return client.post('ripe_material_repaints', data)
    } catch (e) {
      console.log(e)
    }
  }

  function receive(id, data) {
    try {
      return client.put('ripe_material_repaints/' + id, data)
    } catch (e) {
      console.log(e)
    }
  }

  function deleteOrder(id) {
    try {
      return client.delete('ripe_material_repaints/' + id)
    } catch (e) {
      console.log(e)
    }
  }

  return { fetchRepaintOrders, receive, createOrder, deleteOrder }
})
