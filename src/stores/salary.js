import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useSalary = defineStore('salaries', () => {
  async function fetchSalaries(filterProps) {
    let url = ''

    if (filterProps?.page) {
      url += '?page=' + filterProps.page
    } else {
      url += '?page=1'
    }

    try {
      return client.get('salaries' + url)
    } catch (e) {
      console.log(e)
    }
  }

  async function payAdvance(id, data) {
    try {
      return client.put('salaries/' + id + '/advancePayment', data)
    } catch (e) {
      console.log(e)
    }
  }

  return { fetchSalaries, payAdvance }
})
