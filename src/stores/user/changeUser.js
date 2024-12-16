import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useChangeUser = defineStore('changeUser', () => {
  function userChange(id, data) {
    return new Promise((resolve, reject) => {
      client.patch('users/' + id, data)
        .then(() => {
          console.log('User changed successfully');
          resolve()
        })
        .catch(() => {
          console.log('Error while changing the user');
          reject()
        })
    })
  }

  return { userChange }
})
