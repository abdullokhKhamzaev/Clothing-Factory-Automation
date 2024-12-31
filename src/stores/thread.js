import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useThread = defineStore('thread', () => {
  async function fetchThreads(url) {
    try {
      return client.get('threads' + url)
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
