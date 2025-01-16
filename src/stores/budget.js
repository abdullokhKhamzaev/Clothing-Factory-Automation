import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useBudget = defineStore('budget', () => {
  async function fetchBudgets(filterProps) {
    let url = ''

    if (filterProps?.page) {
      url += '?page=' + filterProps.page
    } else {
      url += '?page=1'
    }

    try {
      return client.get('budgets' + url)
    } catch (e) {
      console.log(e)
    }
  }

  async function convert(data) {
    try {
      return client.post('/budgets/converts', data)
    } catch (e) {
      console.log(e)
    }
  }

  async function add(data) {
    try {
      return client.post('/budgets/transaction', data)
    } catch (e) {
      console.log(e)
    }
  }

  async function payDebt(data) {
    try {
      return client.post('/budgets/payDebt', data)
    } catch (e) {
      console.log(e)
    }
  }

  return { fetchBudgets, convert, add, payDebt }
})
