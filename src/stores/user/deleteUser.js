import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useDeleteUser = defineStore('deleteUser', () => {
  function userDelete(id) {
    return new Promise((resolve, reject) => {
      client.delete('users/' + id)
        .then(() => {
          console.log('The user deleted successfully');
          resolve()
        })
        .catch(() => {
          console.log('Error while deleting the user');
          reject()
        })
    })
  }

  return { userDelete }
})
