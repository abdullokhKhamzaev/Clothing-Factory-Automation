import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useAttendance = defineStore('attendance', () => {
  async function fetchAttendances(filterProps) {
    const params = new URLSearchParams();

    params.set('page', filterProps?.page || 1);
    params.set('itemsPerPage', filterProps?.rowsPerPage || 10);
    params.set('pagination', filterProps?.rowsPerPage === '~' ? 'false' : 'true');

    if (filterProps.date) {
      params.set('date[after]', filterProps.date);
    }

    try {
      return await client.get(`attendances?${params.toString()}`);
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
