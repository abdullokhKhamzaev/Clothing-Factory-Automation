import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useAccessory = defineStore('accessory', () => {
  async function fetchAccessories(filterProps) {
    let url = ''

    if (filterProps?.page) {
      url += '?page=' + filterProps.page
    } else {
      url += '?page=1'
    }

    try {
      return client.get('accessories' + url)
    } catch (e) {
      console.log(e)
    }
  }

  async function create(data) {
    try {
      return client.post('accessories', data)
    } catch (e) {
      console.log(e)
    }
  }

  async function update(id, data) {
    try {
      return client.put('accessories/' + id, data)
    } catch (e) {
      console.log(e)
    }
  }

  function deleteAccessory(id) {
    try {
      return client.delete('accessories/' + id)
    } catch (e) {
      console.log(e)
    }
  }

  return { fetchAccessories, create, update, deleteAccessory }
})
