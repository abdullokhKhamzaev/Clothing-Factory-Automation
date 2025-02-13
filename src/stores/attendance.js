import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useAttendance = defineStore('attendance', () => {
  async function accept(id, data) {
    try {
      return client.put('attendances/' + id, data)
    } catch (e) {
      console.log(e)
    }
  }

  return { accept }
})
