import { defineStore } from "pinia";
import axios from "axios";
export const useAuthorization = defineStore('authorization', () => {
    function userAuth(data) {
        return new Promise((resolve, reject) => {
            axios.post('http://localhost:8888/api/users/auth', data)
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
