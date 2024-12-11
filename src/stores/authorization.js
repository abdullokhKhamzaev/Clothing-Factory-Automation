import { defineStore } from "pinia";
import { client } from "src/boot/axios.js";
export const useAuthorization = defineStore('authorization', () => {
    function userAuth(data) {
        return new Promise((resolve, reject) => {
          client.post('users/auth', data)
                .then((res) => {
                    console.log('Token got');
                    localStorage.setItem('token', res.data.token);
                    resolve();
                })
                .catch((e) => {
                    console.log(e, "Error while getting Token");
                    reject();
                })
        })
    }

    return { userAuth };
});
