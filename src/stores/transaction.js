import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useTransaction = defineStore('transaction', () => {
  async function fetchTransactions(filterProps) {
    let url = ''

    if (filterProps?.page) {
      url += '?page=' + filterProps.page
    } else {
      url += '?page=1'
    }

    try {
      return client.get('transactions' + url)
    } catch (e) {
      console.log(e)
    }
  }

  return { fetchTransactions }
})
