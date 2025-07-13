import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useProductModels = defineStore('product_model', () => {
  async function fetchProductModels(filterProps) {
    const params = new URLSearchParams();

    params.set('page', filterProps?.page || 1);
    params.set('itemsPerPage', filterProps?.rowsPerPage || 10);
    params.set('pagination', filterProps?.rowsPerPage === '~' ? 'false' : 'true');

    try {
      return await client.get(`product_models?${params.toString()}`);
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
