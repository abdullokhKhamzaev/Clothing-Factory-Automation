import { defineStore } from "pinia";
import { client } from "boot/axios.js";

export const useChat = defineStore('chat', () => {
  // AI yordamchi: savol-javob tarixini yuborib, javob olamiz (faqat admin)
  async function ask(messages) {
    return client.post('chat', { messages });
  }

  return { ask };
});
