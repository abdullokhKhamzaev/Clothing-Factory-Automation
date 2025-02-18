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

    if (filterProps?.month) {
      url += '&month=' + filterProps.month
    }

    try {
      return client.get('salaries' + url)
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
