import { defineStore } from "pinia";
import { client } from "boot/axios.js";
export const useAuthorization = defineStore('authorization', () => {
    function userAuth(data) {
        return new Promise((resolve, reject) => {
          client.post('users/auth', data)
                .then((res) => {
                    console.log('Token got');
                    localStorage.setItem('token', res.data.accessToken);
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
