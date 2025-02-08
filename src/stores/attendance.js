import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useAttendance = defineStore('attendance', () => {
  async function create(data) {
    try {
      return client.post('attendances', data)
    } catch (e) {
      console.log(e)
    }
  }

  return { create }
})
