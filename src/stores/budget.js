import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useBudget = defineStore('budget', () => {
  async function fetchBudgets(filterProps) {
    const params = new URLSearchParams();

    params.set('page', filterProps?.page || 1);
    params.set('itemsPerPage', filterProps?.rowsPerPage || 10);
    params.set('pagination', filterProps?.rowsPerPage === '~' ? 'false' : 'true');

    try {
      return await client.get(`budgets?${params.toString()}`);
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
