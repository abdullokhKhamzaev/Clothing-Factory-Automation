import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useProductModels = defineStore('product_model', () => {
  async function fetchProductModels(filterProps) {
    let url = ''

    if (filterProps?.page) {
      url += '?page=' + filterProps.page
    } else {
      url += '?page=1'
    }

    try {
      return client.get('product_models' + url)
    } catch (e) {
      console.log(e)
    }
  }

  async function create(data) {
    try {
      return client.post('product_models', data)
    } catch (e) {
      console.log(e)
    }
  }

  async function update(id, data) {
    try {
      return client.put('product_models/' + id, data)
    } catch (e) {
      console.log(e)
    }
  }

  function deleteModel(id) {
    try {
      return client.delete('product_models/' + id)
    } catch (e) {
      console.log(e)
    }
  }

  return { fetchProductModels, create, update, deleteModel }
})
