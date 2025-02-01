import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useEmbroidery = defineStore('embroidery', () => {
  async function fetchEmbroideries(filterProps) {
    let url = ''

    if (filterProps?.page) {
      url += '?page=' + filterProps.page
    } else {
      url += '?page=1'
    }

    try {
      return client.get('embroideries' + url)
    } catch (e) {
      console.log(e)
    }
  }

  async function create(data) {
    try {
      return client.post('embroideries', data)
    } catch (e) {
      console.log(e)
    }
  }

  async function update(id, data) {
    try {
      return client.put('embroideries/' + id, data)
    } catch (e) {
      console.log(e)
    }
  }

  function deleteEmbroidery(id) {
    try {
      return client.delete('embroideries/' + id)
    } catch (e) {
      console.log(e)
    }
  }

  return { fetchEmbroideries, create, update, deleteEmbroidery }
})
