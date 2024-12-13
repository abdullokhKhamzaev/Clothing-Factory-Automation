import { defineStore } from "pinia";
import { client } from "boot/axios.js";
import { reactive } from "vue";

export const useFetchUsers = defineStore('fetchUsers', () => {
    const state = reactive({
        users: [],
        totalItems: 0,
        pageCount: 0
    })

    const usersGet = async (url = '') => {
        try {
            const { data } = await client.get('users' + url)
            state.users = data["hydra:member"]
            state.totalItems = data["hydra:totalItems"]
            state.pageCount = Math.ceil(state.totalItems / 10)
        } catch (e) {
            console.log(e)
        }
    }

    return { usersGet, state }
})
