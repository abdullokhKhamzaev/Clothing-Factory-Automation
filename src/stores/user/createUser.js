import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useUser = defineStore('book', () => {
    function userCreate(data) {
        return new Promise((resolve, reject) => {
            client.post('users', data)
                .then(() => {
                    console.log('User created.')
                    resolve()
                })
                .catch((e) => {
                    console.log(e, "Error while creating user")
                    reject()
                })
        })
    }

    return { userCreate }
})
