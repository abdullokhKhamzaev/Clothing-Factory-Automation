import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useUser = defineStore('user', () => {
  async function fetchUsers(filterProps) {
    let url = ''

    if (filterProps?.page) {
      url += '?page=' + filterProps.page
    } else {
      url += '?page=1'
    }

    if (filterProps?.fullName) {
      url += '&fullName=' + filterProps.fullName
    }

    try {
      return client.get('users' + url)
    } catch (e) {
      console.log(e)
    }
  }

  async function createUser(data) {
    try {
      return client.post('users', data)
    } catch (e) {
      console.log(e)
    }
  }

  async function editUser(id, data) {
    try {
      return client.patch('users/' + id, data)
    } catch (e) {
      console.log(e)
    }
  }

  async function editPassword(id, data) {
    try {
      return client.patch('users/' + id + '/change_password', data)
    } catch (e) {
      console.log(e)
    }
  }

  function deleteUser(id) {
    try {
      return client.delete('users/' + id )
    } catch (e) {
      console.log(e)
    }
  }

  return { fetchUsers, createUser, editUser, editPassword, deleteUser }
})
