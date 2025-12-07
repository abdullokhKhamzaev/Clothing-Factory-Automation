import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useUser = defineStore('user', () => {
  async function fetchUsers(filterProps) {
    const params = new URLSearchParams();

    params.set('page', filterProps?.page || 1);
    params.set('itemsPerPage', filterProps?.rowsPerPage || 10);
    params.set('pagination', filterProps?.rowsPerPage === '~' ? 'false' : 'true');

    if (filterProps.fullName) {
      params.set('fullName', filterProps.fullName);
    }

    if (filterProps.roles) {
      params.set('roles', filterProps.roles);
    }

    try {
      return await client.get(`users?${params.toString()}`);
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
