import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useThreadPurchase = defineStore('thread_purchase', () => {
  async function fetchPurchases(filterProps) {
    let url = '?page=1';

    if (filterProps?.thread) {
      url += '&thread=' + filterProps.thread
    }
    try {
      return client.get('thread_purchases' + url)
    } catch (e) {
      console.log(e)
    }
  }

  async function createPurchase(data) {
    try {
      return client.post('thread_purchases', data)
    } catch (e) {
      console.log(e)
    }
  }

  return { createPurchase, fetchPurchases }
})
