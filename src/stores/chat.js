import { ref, watch } from "vue";
import { defineStore } from "pinia";
import { client } from "boot/axios.js";
import { Notify } from "quasar";
import { i18n } from "boot/i18n.js";

// Suhbat brauzerda saqlanadi: refresh/qayta kirishda ham turadi,
// faqat «Tozalash» bosilganda o'chadi
const STORAGE_KEY = 'aiChat.messages';

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// SSE matnidan TO'LIQ kelgan hodisalarni ajratib dispatch qiladi;
// chala blok keyingi chaqiruvni kutadi. Yangi processed indeksini qaytaradi
function consumeSse(text, from, onEvent) {
  let index = from;

  for (;;) {
    const sep = text.indexOf('\n\n', index);
    if (sep === -1) return index;

    const block = text.slice(index, sep);
    index = sep + 2;

    let event = 'message';
    let data = '';
    for (const line of block.split('\n')) {
      if (line.startsWith('event:')) event = line.slice(6).trim();
      else if (line.startsWith('data:')) data += line.slice(5).trim();
      // ':' bilan boshlangan qatorlar — heartbeat, e'tiborsiz
    }
    if (!data) continue;

    try {
      onEvent(event, JSON.parse(data));
    } catch {
      // buzuq blok — o'tkazib yuboramiz
    }
  }
}

// Suhbat holati STORE'da yashaydi: foydalanuvchi savol berib boshqa
// sahifaga o'tib ketsa ham so'rov uzilmaydi — javob kelganda saqlanadi
// va qaytganda tayyor turadi. Uzish faqat ataylab («To'xtatish») bo'ladi.
export const useChat = defineStore('chat', () => {
  const messages = ref(loadSaved());
  const liveAnswer = ref('');   // oqib kelayotgan javob (jonli)
  const statusText = ref('');   // "Bazadan ma'lumot olinmoqda…" kabi bosqichlar
  const loading = ref(false);
  const errorText = ref('');

  let controller = null;

  watch(messages, (value) => {
    try {
      // Saqlashda hajmni jilovlaymiz: oxirgi 60 xabar yetarli
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value.slice(-60)));
    } catch {
      // localStorage yopiq bo'lsa — indamay o'tamiz
    }
  }, { deep: true });

  const t = (key) => i18n.global.t(key);

  async function send(text) {
    const question = (text ?? '').trim();
    if (!question || loading.value) return;

    errorText.value = '';
    messages.value.push({ role: 'user', content: question });
    loading.value = true;
    liveAnswer.value = '';
    statusText.value = t('aiChat.thinking');
    controller = new AbortController();

    let finalReply = null;
    let errMsg = null;
    let processed = 0;

    const onEvent = (event, data) => {
      if (event === 'status') {
        statusText.value = data.text || '';
      } else if (event === 'token') {
        liveAnswer.value += data.t || '';
        statusText.value = '';
      } else if (event === 'done') {
        finalReply = data.reply || liveAnswer.value;
      } else if (event === 'error') {
        errMsg = data.message || t('aiChat.failed');
      }
    };

    try {
      const res = await client.post('chat', { messages: historyPayload() }, {
        signal: controller.signal,
        responseType: 'text',
        transformResponse: [(d) => d], // xom matn kerak — JSON.parse qilinmasin
        onDownloadProgress: (progress) => {
          const text = progress?.event?.target?.responseText;
          if (typeof text === 'string') {
            processed = consumeSse(text, processed, onEvent);
          }
        },
      });

      // Oxirgi bo'laklarni ham o'qib olamiz
      if (typeof res?.data === 'string') {
        consumeSse(res.data, processed, onEvent);
      }

      if (errMsg) {
        errorText.value = errMsg;
      } else if (finalReply || liveAnswer.value) {
        messages.value.push({ role: 'assistant', content: finalReply ?? liveAnswer.value });
        notifyIfAway();
      } else {
        errorText.value = t('aiChat.emptyReply');
      }
    } catch (err) {
      if (err?.code === 'ERR_CANCELED') {
        // Foydalanuvchi o'zi to'xtatdi: kelgan qismini saqlab qo'yamiz
        if (liveAnswer.value) {
          messages.value.push({
            role: 'assistant',
            content: liveAnswer.value + '\n\n_' + t('aiChat.stopped') + '_',
          });
        }
      } else {
        // Oqim boshlanmasidan xato (403/503/tarmoq): JSON bo'lsa o'qiymiz
        let parsed = null;
        try { parsed = JSON.parse(err?.response?.data); } catch { /* matn emas */ }
        errorText.value = parsed?.error || err?.message || t('aiChat.failed');
      }
    } finally {
      loading.value = false;
      liveAnswer.value = '';
      statusText.value = '';
      controller = null;
    }
  }

  // Serverga yuboriladigan tarix (faqat role+content)
  function historyPayload() {
    return messages.value.map(m => ({ role: m.role, content: m.content }));
  }

  // Javob kelganda foydalanuvchi boshqa sahifada bo'lsa — bildiramiz
  function notifyIfAway() {
    if (window.location.pathname.includes('/ai-chat')) return;
    Notify.create({
      type: 'positive',
      position: 'top-right',
      timeout: 5000,
      message: t('aiChat.ready'),
    });
  }

  function stop() {
    controller?.abort();
  }

  function clear() {
    messages.value = [];
    errorText.value = '';
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // e'tiborsiz
    }
  }

  return { messages, liveAnswer, statusText, loading, errorText, send, stop, clear };
});
