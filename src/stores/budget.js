import {defineStore} from "pinia";
import {client} from "boot/axios.js";
import {isSuperAdmin} from "src/router/routes.js";

export const useBudget = defineStore('budget', () => {
  async function fetchBudgets(filterProps) {
    const params = new URLSearchParams();

    params.set('page', filterProps?.page || 1);
    params.set('itemsPerPage', filterProps?.rowsPerPage || 10);
    params.set('pagination', filterProps?.rowsPerPage === '~' ? 'false' : 'true');

    try {
      const res = await client.get(`budgets?${params.toString()}`);

      if(!isSuperAdmin()) {
        res.data['hydra:member'] = res.data['hydra:member'].filter(item => item.name !== 'Main USD')
      }

      return res
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

  async function send(data) {
    try {
      return client.post('/budgets/send', data)
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

  return { fetchBudgets, convert, add, send, payDebt }
})
