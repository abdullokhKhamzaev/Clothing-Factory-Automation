import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useAddFile = defineStore('add-file', () => {
    function addFile(data) {
        let file = new FormData()
        file.append('file', data)

        return new Promise((resolve, reject) => {
            client.post('media_object', file)
                .then((response) => {
                    console.log('File yuklandi.')
                    resolve(response)
                })
                .catch(() => {
                    console.log("Fayl yuklashda xatolik!!")
                    reject()
                })
        })
    }

    return { addFile }
})
