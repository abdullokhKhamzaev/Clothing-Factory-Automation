import { defineStore } from 'pinia'
import { client } from 'boot/axios.js';
import { useRouter } from 'vue-router'

export const useRefreshToken = defineStore('refresh-token', () => {
    function refreshToken(data) {
        client.post('users/auth/refreshToken', data)
            .then((res) => {
                localStorage.setItem('accessToken', res.data.accessToken)
                localStorage.setItem('refreshToken', res.data.refreshToken)
            })
            .catch(() => {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                useRouter().push('/login')
            })
    }

    return { refreshToken }
})
