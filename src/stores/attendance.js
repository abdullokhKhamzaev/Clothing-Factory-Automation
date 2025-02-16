import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useAttendance = defineStore('attendance', () => {
  async function fetchAttendances(filterProps) {
    let url = ''

    if (filterProps?.page) {
      url += '?page=' + filterProps.page
    } else {
      url += '?page=1'
    }

    if (filterProps?.date) {
      url += '&date=' + filterProps.date
    }

    try {
      return client.get('attendances' + url)
    } catch (e) {
      console.log(e)
    }
  }
  async function accept(id, data) {
    try {
      return client.put('attendances/' + id, data)
    } catch (e) {
      console.log(e)
    }
  }

  return { fetchAttendances, accept }
})
