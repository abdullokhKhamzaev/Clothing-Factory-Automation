import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useAttendance = defineStore('attendance', () => {
  async function fetchAttendances(filterProps) {
    const params = new URLSearchParams();

    params.set('page', filterProps?.page || 1);
    params.set('itemsPerPage', filterProps?.rowsPerPage || 10);
    params.set('pagination', filterProps?.rowsPerPage === '~' ? 'false' : 'true');

    if (filterProps.date) {
      // Aynan BITTA kun: faqat after yuborilsa keyingi kunlar ham kirib qolardi
      params.set('date[after]', filterProps.date);
      params.set('date[before]', filterProps.date);
    }
    if (filterProps.worker) {
      params.set('worker', filterProps.worker);
    }
    if (filterProps.salaryType) {
      params.set('worker.salaryType', filterProps.salaryType);
    }
    if (filterProps.workerName) {
      params.set('worker.fullName', filterProps.workerName);
    }
    if (filterProps.dateFrom) {
      params.set('date[after]', filterProps.dateFrom);
    }
    if (filterProps.dateTo) {
      params.set('date[before]', filterProps.dateTo);
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
