import { defineStore } from 'pinia'
import { client } from 'boot/axios.js';

export const useRefreshToken = defineStore('refresh-token', () => {
    function refreshToken(data) {
        return client.post('users/auth/refreshToken', data)
            .then((res) => {
                localStorage.setItem('accessToken', res.data.accessToken)
                localStorage.setItem('refreshToken', res.data.refreshToken)
            })
            .catch(() => {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                // Store setup kontekstida useRouter ishlamaydi, shu sabab to'g'ridan-to'g'ri yo'naltiramiz
                window.location.href = '/login';
            })
    }

    return { refreshToken }
})
