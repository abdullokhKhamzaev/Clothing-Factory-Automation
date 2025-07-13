import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useSalary = defineStore('salaries', () => {
  async function fetchSalaries(filterProps) {
    const params = new URLSearchParams();

    params.set('page', filterProps?.page || 1);
    params.set('itemsPerPage', filterProps?.rowsPerPage || 10);
    params.set('pagination', filterProps?.rowsPerPage === '~' ? 'false' : 'true');

    if (filterProps.month) {
      params.set('month', filterProps.month);
    }

    try {
      return await client.get(`salaries?${params.toString()}`);
    } catch (e) {
      console.log(e)
    }
  }

  async function payAdvance(id, data) {
    try {
      return client.put('salary/' + id + '/advancePayment', data)
    } catch (e) {
      console.log(e)
    }
  }

  async function paySalary(id, data) {
    try {
      return client.put('salary/' + id + '/payment', data)
    } catch (e) {
      console.log(e)
    }
  }

  return { fetchSalaries, payAdvance, paySalary }
})
