import { defineStore } from "pinia";
import { client } from "boot/axios.js";
import { reactive } from "vue";

export const useFetchCurrencies = defineStore('fetchCurrencies', () => {
    const state = reactive({
        currencies: [],
        totalItems: 0,
        pageCount: 0
    })

    const currenciesGet = async (url = '') => {
        try {
            const { data } = await client.get('currencies' + url)
            state.currencies = data["hydra:member"]
            state.totalItems = data["hydra:totalItems"]
            state.pageCount = Math.ceil(state.totalItems / 10)
        } catch (e) {
            console.log(e)
        }
    }

    return { currenciesGet, state }
})
