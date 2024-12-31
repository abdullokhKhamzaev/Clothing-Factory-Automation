import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useBudget = defineStore('budget', () => {
  async function fetchBudgets(url) {
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

  return { fetchBudgets, convert, add }
})
