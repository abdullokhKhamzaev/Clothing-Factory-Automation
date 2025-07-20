import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useThread = defineStore('thread', () => {
  async function fetchThreads(filterProps) {
    const params = new URLSearchParams();

    params.set('page', filterProps?.page || 1);
    params.set('itemsPerPage', filterProps?.rowsPerPage || 10);
    params.set('pagination', filterProps?.rowsPerPage === '~' ? 'false' : 'true');

    if (filterProps.name) {
      params.set('name', filterProps.name);
    }

    try {
      return await client.get(`threads?${params.toString()}`);
    } catch (e) {
      console.log(e)
    }
  }

  async function createThread(data) {
    try {
      return client.post('threads', data)
    } catch (e) {
      console.log(e)
    }
  }

  async function editThread(id, data) {
    try {
      return client.patch('threads/' + id, data)
    } catch (e) {
      console.log(e)
    }
  }

  function deleteThread(id) {
    try {
      return client.delete('threads/' + id)
    } catch (e) {
      console.log(e)
    }
  }

  return { fetchThreads, createThread, editThread, deleteThread }
})
